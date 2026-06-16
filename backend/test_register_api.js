const fetchJson = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
};

async function test() {
  const result = await fetchJson('http://localhost:5000/api/auth/register', {
    nom: 'Durand',
    prenom: 'Jean',
    email: 'jeandurand@ooredoo.tn',
    mot_de_passe: 'Jean123456!',
    role: 'manager',
    zone: ''
  });
  console.log('API RESPONSE:', result);
  process.exit(0);
}
test();
