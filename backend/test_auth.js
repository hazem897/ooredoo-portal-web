/**
 * Script de test d'authentification
 * Usage: npm run test-auth
 */

const API_BASE = 'http://localhost:5000/api';

// Utiliser fetch natif (Node 18+) pour éviter d'installer axios
const fetchJson = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error('HTTP Error');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

// Données de test
const testAdmin = {
  email: 'hazemhazem9089@gmail.com',
  mot_de_passe: 'Hazoum1234#'
};

async function testAuth() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TEST D\'AUTHENTIFICATION');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // ÉTAPE 1: Login (envoyer email + mot de passe)
    console.log('📌 ÉTAPE 1: Envoi email + mot de passe');
    console.log(`   Email: ${testAdmin.email}`);
    console.log(`   Mot de passe: ${testAdmin.mot_de_passe}\n`);

    const loginData = await fetchJson(`${API_BASE}/auth/login`, testAdmin);
    console.log('✅ Réponse Login:');
    console.log(JSON.stringify(loginData, null, 2));

    const { userId, devOtp } = loginData;

    if (!userId) {
      console.error('\n❌ ERREUR: userId non reçu!');
      process.exit(1);
    }

    console.log(`\n📌 userId reçu: ${userId}`);

    // ÉTAPE 2: Vérifier OTP (si en mode DEV)
    if (devOtp) {
      console.log(`\n📌 ÉTAPE 2: Vérification OTP (Mode DEV)`);
      console.log(`   userId: ${userId}`);
      console.log(`   OTP: ${devOtp}\n`);

      const otpData = await fetchJson(`${API_BASE}/auth/verify-otp`, {
        userId: userId,
        otp: devOtp
      });

      console.log('✅ Réponse OTP Verify:');
      console.log(JSON.stringify(otpData, null, 2));

      const { token, user } = otpData;

      console.log('\n═══════════════════════════════════════════════════');
      console.log('✅ CONNEXION RÉUSSIE!');
      console.log('═══════════════════════════════════════════════════');
      console.log(`\nUtilisateur: ${user.nom} ${user.prenom}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rôle: ${user.role}`);
      console.log(`Token: ${token.substring(0, 50)}...`);
      console.log('\n═══════════════════════════════════════════════════\n');

    } else {
      console.log('\n⏳ Mode Production: OTP envoyé par email');
      console.log('   Vérifiez votre email pour le code OTP');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR D\'AUTHENTIFICATION:');
    console.error('─────────────────────────────────────────────────');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Impossible de se connecter au backend!');
      console.error('   Vérifiez que:');
      console.error('   1. Le backend est démarré (npm run dev)');
      console.error('   2. Le port 5000 est utilisable');
      console.error('   3. PostgreSQL est en cours d\'exécution');
    } else {
      console.error(error.message);
    }

    console.error('─────────────────────────────────────────────────\n');
    process.exit(1);
  }
}

// Lancer le test
testAuth();
