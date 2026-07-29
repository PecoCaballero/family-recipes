#!/bin/bash
set -e
API="http://localhost:4001"

echo "=== 8.1: E2E TEST ==="

# 1. Register user A
echo "--- Register user A ---"
REG_A=$(curl -s -X POST "$API/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"test1234"}')
USER_A_ID=$(echo "$REG_A" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('id',''))")
TOKEN_A=$(echo "$REG_A" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken',''))")
echo "userA id: $USER_A_ID"

# 2. Register user B  
echo "--- Register user B ---"
REG_B=$(curl -s -X POST "$API/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test.com","password":"test1234"}')
USER_B_ID=$(echo "$REG_B" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('id',''))")
TOKEN_B=$(echo "$REG_B" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken',''))")
echo "userB id: $USER_B_ID"

# 3. User A creates a group
echo "--- Create group (A) ---"
GROUP=$(curl -s -X POST "$API/v1/groups" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"name":"E2E Test Group","description":"E2E test group"}')
GROUP_ID=$(echo "$GROUP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))")
echo "group id: $GROUP_ID"

# 4. User B tries to see group (should be 404 — not a member)
echo "--- Non-member B tries to GET group (expect 404) ---"
HTTP1=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_B" \
  "$API/v1/groups/$GROUP_ID")
echo "HTTP $HTTP1"
[ "$HTTP1" = "404" ] && echo "✓ PASS" || echo "✗ FAIL: expected 404"

# 5. User A adds B as member
echo "--- A adds B as member ---"
ADD_M=$(curl -s -X POST "$API/v1/groups/$GROUP_ID/members/$USER_B_ID" \
  -H "Authorization: Bearer $TOKEN_A")
echo "$ADD_M"

# 6. B can now see group
echo "--- B sees group (expect 200) ---"
HTTP2=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_B" \
  "$API/v1/groups/$GROUP_ID")
echo "HTTP $HTTP2"
[ "$HTTP2" = "200" ] && echo "✓ PASS" || echo "✗ FAIL: expected 200"

# 7. A creates a recipe
echo "--- A creates recipe ---"
RECIPE=$(curl -s -X POST "$API/v1/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"name":"E2E Test Recipe","description":"E2E test","instructions":"Mix and bake","ingredients":[{"name":"flour","quantity":"2 cups"}]}')
RECIPE_ID=$(echo "$RECIPE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('recipe',{}).get('id',''))")
echo "recipe id: $RECIPE_ID"

# 8. A sends recipe to group
echo "--- A sends recipe to group ---"
SEND=$(curl -s -X POST "$API/v1/groups/$GROUP_ID/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d "{\"recipeId\":\"$RECIPE_ID\"}")
echo "$SEND"

# 9. B sees the recipe in their feed
echo "--- B lists recipes (should include group-shared) ---"
B_RECIPES=$(curl -s -H "Authorization: Bearer $TOKEN_B" "$API/v1/recipes")
B_COUNT=$(echo "$B_RECIPES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('recipes',[])))")
echo "B sees $B_COUNT recipes"
[ "$B_COUNT" -gt 0 ] && echo "✓ PASS" || echo "✗ FAIL: expected > 0 recipes"

# 10. A removes recipe from group
echo "--- A removes recipe from group ---"
REM_R=$(curl -s -X POST "$API/v1/groups/$GROUP_ID/remove-recipe" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d "{\"recipeId\":\"$RECIPE_ID\"}")
echo "$REM_R"

# 11. A removes B from group
echo "--- A removes B from group ---"
HTTP3=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer $TOKEN_A" \
  "$API/v1/groups/$GROUP_ID/members/$USER_B_ID")
echo "HTTP $HTTP3"
[ "$HTTP3" = "200" ] && echo "✓ PASS" || echo "✗ FAIL: expected 200"

# 12. B can't see group anymore (404)
echo "--- B tries group again (expect 404) ---"
HTTP4=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_B" \
  "$API/v1/groups/$GROUP_ID")
echo "HTTP $HTTP4"
[ "$HTTP4" = "404" ] && echo "✓ PASS" || echo "✗ FAIL: expected 404"

# 13. A deletes group
echo "--- A deletes group ---"
HTTP5=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer $TOKEN_A" \
  "$API/v1/groups/$GROUP_ID")
echo "HTTP $HTTP5"
[ "$HTTP5" = "204" ] && echo "✓ PASS" || echo "✗ FAIL: expected 204"

# 14. Verify group gone
echo "--- Verify group deleted (expect 404) ---"
HTTP6=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_A" \
  "$API/v1/groups/$GROUP_ID")
echo "HTTP $HTTP6"
[ "$HTTP6" = "404" ] && echo "✓ PASS" || echo "✗ FAIL: expected 404"

echo ""
echo "=== 8.1 COMPLETE ==="
