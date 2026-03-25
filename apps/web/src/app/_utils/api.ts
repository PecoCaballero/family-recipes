export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4001').replace(
  /\/+$/,
  '',
);

export async function fetchHealth() {
  const res = await fetch(`${apiBaseUrl}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as { status?: string };
}
