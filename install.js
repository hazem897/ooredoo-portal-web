#!/usr/bin/env node

/**
 * SCRIPT D'INSTALLATION COMPLÈTE
 * Ooredoo Portal - Installation automatisée
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function run(command, cwd = null) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║  OOREDOO PORTAL - INSTALLATION COMPLÈTE   ║', 'blue');
  log('╚════════════════════════════════════════════╝\n', 'blue');

  const projectRoot = path.join(__dirname, '..');
  const backendDir = path.join(projectRoot, 'backend');
  const frontendDir = path.join(projectRoot, 'frontend');

  // ✅ Vérifier les répertoires
  log('\n📂 Vérification de la structure...', 'yellow');
  if (!fs.existsSync(backendDir)) {
    log('❌ Le répertoire backend n\'existe pas', 'red');
    process.exit(1);
  }
  if (!fs.existsSync(frontendDir)) {
    log('❌ Le répertoire frontend n\'existe pas', 'red');
    process.exit(1);
  }
  log('✅ Structure OK', 'green');

  // ✅ Vérifier .env backend
  log('\n⚙️  Vérification du fichier .env backend...', 'yellow');
  const envPath = path.join(backendDir, '.env');
  if (!fs.existsSync(envPath)) {
    log('⚠️  Fichier .env non trouvé - création...', 'yellow');
    const envContent = `DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1920
DB_NAME=ooredoo_portal
JWT_SECRET=ooredoo_secret_key_2025
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
EMAIL_FROM="Ooredoo Portal" <noreply@ooredoo.tn>
PORT=5000
DEV_MODE=true
ADMIN_EMAIL=admin@ooredoo.tn
BASE_URL=http://localhost:5000
`;
    fs.writeFileSync(envPath, envContent);
    log('✅ Fichier .env créé - Veuillez vérifier les valeurs!', 'green');
  }

  // ✅ Installer npm dependencies - Backend
  log('\n📦 Installation des dépendances backend...', 'yellow');
  if (!run('npm install', backendDir)) {
    log('❌ Erreur lors de l\'installation backend', 'red');
    process.exit(1);
  }
  log('✅ Dependencies backend OK', 'green');

  // ✅ Installer npm dependencies - Frontend
  log('\n📦 Installation des dépendances frontend...', 'yellow');
  if (!run('npm install', frontendDir)) {
    log('❌ Erreur lors de l\'installation frontend', 'red');
    process.exit(1);
  }
  log('✅ Dependencies frontend OK', 'green');

  // ✅ Résumé
  log('\n╔════════════════════════════════════════════╗', 'green');
  log('║  ✅ INSTALLATION COMPLÈTEMENT RÉUSSIE!   ║', 'green');
  log('╚════════════════════════════════════════════╝\n', 'green');

  log('📋 PROCHAINES ÉTAPES:', 'blue');
  log('\n1️⃣  BACKEND - Ouvrir Terminal 1:', 'yellow');
  log('   cd backend');
  log('   node server.js');
  log('   (Résultat: 🚀 Serveur démarré sur le port 5000)\n');

  log('2️⃣  FRONTEND - Ouvrir Terminal 2:', 'yellow');
  log('   cd frontend');
  log('   npm run dev');
  log('   (Résultat: ➜ Local: http://localhost:5173)\n');

  log('3️⃣  NAVIGATEUR:', 'yellow');
  log('   http://localhost:5173/login\n');

  log('4️⃣  IDENTIFIANTS DE TEST:', 'yellow');
  log('   Email: hazemhazem@gmail.com');
  log('   Password: Admin123456');
  log('   OTP: Affiché sur la page (mode DEV)\n');

  log('⚠️  IMPORTANT:', 'red');
  log('  - Vérifiez que PostgreSQL est en cours d\'exécution');
  log('  - Vérifiez les valeurs dans backend/.env');
  log('  - Assurez-vous que les ports 5000 et 5173 sont libres\n');
}

main().catch(err => {
  log(`\n❌ Erreur: ${err.message}`, 'red');
  process.exit(1);
});
