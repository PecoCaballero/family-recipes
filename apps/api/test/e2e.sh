#!/usr/bin/env bash
#
# Hermetic API end-to-end test.
#
# Boots the API against a dedicated test database on an isolated port, seeds it,
# drives a full group-sharing flow, then tears everything down. Safe to re-run:
# a fresh test DB is dropped and recreated on every invocation.
#
# Env overrides:
#   E2E_DB_CONTAINER  docker container running postgres (default: family-recipes-db)
#   E2E_DB_NAME       test database name               (default: family_recipes_test)
#   E2E_PORT          API port                         (default: 4002)
#   E2E_DB_HOST       postgres host                    (default: localhost)
#   E2E_DB_PORT       postgres port                    (default: 5432)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CONTAINER="${E2E_DB_CONTAINER:-family-recipes-db}"
DB_NAME="${E2E_DB_NAME:-family_recipes_test}"
DB_HOST="${E2E_DB_HOST:-localhost}"
DB_PORT="${E2E_DB_PORT:-5432}"
PORT="${E2E_PORT:-4002}"
BASE="http://localhost:${PORT}"

export DATABASE_URL="postgresql://postgres:postgres@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"
export JWT_SECRET="${JWT_SECRET:-e2e-test-secret}"
export PORT

API_PID=""
cleanup() {
  if [[ -n "${API_PID}" ]]; then
    kill "${API_PID}" 2>/dev/null || true
  fi
  # npx/tsx may leave a child holding the port; sweep by port too.
  local pids
  pids="$(lsof -ti "tcp:${PORT}" 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    kill ${pids} 2>/dev/null || true
  fi
  wait 2>/dev/null || true
}
trap cleanup EXIT

psql_admin() {
  docker exec -i "${CONTAINER}" psql -U postgres -v ON_ERROR_STOP=1 "$@"
}

json() { python3 -c "import sys,json;print(json.load(sys.stdin)$1)"; }

fail() { echo "✗ FAIL: $1"; exit 1; }

echo "=== e2e: provisioning test database '${DB_NAME}' in ${CONTAINER} ==="
psql_admin -c "DROP DATABASE IF EXISTS ${DB_NAME};" >/dev/null
psql_admin -c "CREATE DATABASE ${DB_NAME};" >/dev/null

echo "=== e2e: applying migrations + seed ==="
(cd "${ROOT}/apps/api" && npx prisma migrate deploy >/dev/null && npx prisma db seed >/dev/null)

echo "=== e2e: starting API on :${PORT} ==="
(cd "${ROOT}/apps/api" && exec npx tsx src/index.ts) >/tmp/family-recipes-e2e-api.log 2>&1 &
API_PID=$!

for _ in $(seq 1 60); do
  if curl -sf "${BASE}/health" >/dev/null 2>&1; then break; fi
  if ! kill -0 "${API_PID}" 2>/dev/null; then
    echo "--- api log ---"; cat /tmp/family-recipes-e2e-api.log; fail "API process exited early"
  fi
  sleep 0.5
done
curl -sf "${BASE}/health" >/dev/null || { cat /tmp/family-recipes-e2e-api.log; fail "API never became healthy"; }

TS="$(date +%s)"
EMAIL_A="e2e-a-${TS}@test.com"
EMAIL_B="e2e-b-${TS}@test.com"

echo "--- register users ---"
REG_A=$(curl -sf -X POST "${BASE}/v1/auth/register" -H 'Content-Type: application/json' \
  -d "{\"name\":\"E2E A\",\"email\":\"${EMAIL_A}\",\"password\":\"test1234\"}")
TOKEN_A=$(echo "${REG_A}" | json "['accessToken']")
USER_B=$(curl -sf -X POST "${BASE}/v1/auth/register" -H 'Content-Type: application/json' \
  -d "{\"name\":\"E2E B\",\"email\":\"${EMAIL_B}\",\"password\":\"test1234\"}")
TOKEN_B=$(echo "${USER_B}" | json "['accessToken']")
USER_B_ID=$(echo "${USER_B}" | json "['user']['id']")

echo "--- Google OAuth: missing token rejected (expect 400) ---"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "${BASE}/v1/auth/google" \
  -H 'Content-Type: application/json' -d '{}')
[[ "${CODE}" == "400" ]] || fail "expected 400 for missing google token, got ${CODE}"
echo "✓ missing token rejected"

echo "--- Google OAuth: invalid token rejected (expect 401) ---"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "${BASE}/v1/auth/google" \
  -H 'Content-Type: application/json' -d '{"idToken":"not-a-real-google-token"}')
[[ "${CODE}" == "401" ]] || fail "expected 401 for invalid google token, got ${CODE}"
echo "✓ invalid token rejected"

echo "--- Google-only (passwordless) account cannot password-login (expect 401) ---"
GOOGLE_EMAIL="e2e-google-${TS}@test.com"
psql_admin -d "${DB_NAME}" -c "INSERT INTO \"User\" (\"id\",\"name\",\"email\",\"passwordHash\",\"provider\",\"providerId\",\"createdAt\",\"updatedAt\") VALUES ('google-only-${TS}','Google Only','${GOOGLE_EMAIL}',NULL,'google','google-sub-${TS}',now(),now());" >/dev/null
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "${BASE}/v1/auth/login" \
  -H 'Content-Type: application/json' -d "{\"email\":\"${GOOGLE_EMAIL}\",\"password\":\"test1234\"}")
[[ "${CODE}" == "401" ]] || fail "expected 401 for passwordless login, got ${CODE}"
echo "✓ passwordless login blocked"

echo "--- A creates a group ---"
GROUP=$(curl -sf -X POST "${BASE}/v1/groups" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${TOKEN_A}" -d '{"name":"E2E Group","description":"e2e"}')
GROUP_ID=$(echo "${GROUP}" | json "['id']")

echo "--- non-member B cannot see the group (expect 404) ---"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer ${TOKEN_B}" "${BASE}/v1/groups/${GROUP_ID}")
[[ "${CODE}" == "404" ]] || fail "expected 404 for non-member, got ${CODE}"
echo "✓ non-member blocked"

echo "--- A adds B, B can see the group (expect 200) ---"
curl -sf -X POST "${BASE}/v1/groups/${GROUP_ID}/members/${USER_B_ID}" -H "Authorization: Bearer ${TOKEN_A}" >/dev/null
CODE=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer ${TOKEN_B}" "${BASE}/v1/groups/${GROUP_ID}")
[[ "${CODE}" == "200" ]] || fail "expected 200 for member, got ${CODE}"
echo "✓ member granted access"

echo "--- A creates a recipe and shares it to the group ---"
RECIPE=$(curl -sf -X POST "${BASE}/v1/recipes" -H 'Content-Type: application/json' -H "Authorization: Bearer ${TOKEN_A}" \
  -d '{"name":"E2E Recipe","description":"e2e","instructions":"mix and bake","ingredients":[{"name":"flour","quantity":"2 cups"}]}')
RECIPE_ID=$(echo "${RECIPE}" | json "['recipe']['id']")
curl -sf -X POST "${BASE}/v1/groups/${GROUP_ID}/recipes" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${TOKEN_A}" -d "{\"recipeId\":\"${RECIPE_ID}\"}" >/dev/null

echo "--- B's feed includes the shared recipe ---"
COUNT=$(curl -sf -H "Authorization: Bearer ${TOKEN_B}" "${BASE}/v1/recipes" | json "['recipes'].__len__()")
[[ "${COUNT}" -gt 0 ]] || fail "expected B to see shared recipes"
echo "✓ shared recipe visible (${COUNT})"

echo "--- A removes B, B loses access (expect 404) ---"
curl -sf -X DELETE "${BASE}/v1/groups/${GROUP_ID}/members/${USER_B_ID}" -H "Authorization: Bearer ${TOKEN_A}" >/dev/null
CODE=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer ${TOKEN_B}" "${BASE}/v1/groups/${GROUP_ID}")
[[ "${CODE}" == "404" ]] || fail "expected 404 after removal, got ${CODE}"
echo "✓ access revoked"

echo "--- A deletes the group (expect 204, then 404) ---"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "${BASE}/v1/groups/${GROUP_ID}" -H "Authorization: Bearer ${TOKEN_A}")
[[ "${CODE}" == "204" ]] || fail "expected 204 on group delete, got ${CODE}"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer ${TOKEN_A}" "${BASE}/v1/groups/${GROUP_ID}")
[[ "${CODE}" == "404" ]] || fail "expected 404 for deleted group, got ${CODE}"
echo "✓ group deleted"

echo ""
echo "=== e2e PASSED ==="
