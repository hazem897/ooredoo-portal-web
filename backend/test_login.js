// Test login endpoint
const http = require('http');

const data = JSON.stringify({
  email: 'hazemhazem9089@gmail.com',
  mot_de_passe: 'Hazoum1234#'
});

console.log('📤 Envoi de la requête de connexion...');
console.log('Email: hazemhazem9089@gmail.com');
console.log('Password: Hazoum1234#\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('📥 Réponse du serveur:');
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
