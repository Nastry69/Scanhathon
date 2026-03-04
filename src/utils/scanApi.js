export async function scanRepo(githubUrl) {
  const response = await fetch('http://localhost:3000/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ githubUrl }),
  });

 const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}