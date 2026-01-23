(async () => {
  const res = await fetch('http://127.0.0.1:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@test.com', password: 'Password123' })
  });
  console.log('login status', res.status);
  const data = await res.json();
  const token = data.token;
  console.log('token prefix', token ? token.slice(0, 16) + '...' : null);

  const labsRes = await fetch('http://127.0.0.1:3001/labs?course_id=1', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('labs status', labsRes.status);
  console.log(await labsRes.text());
})();
