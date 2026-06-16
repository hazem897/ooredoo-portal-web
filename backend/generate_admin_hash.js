const bcrypt = require('bcryptjs');

// Données admin
const adminData = {
  nom: 'Admin',
  prenom: 'HAZEM',
  email: 'hazemhazem9089@gmail.com',
  password: 'Hazoum1234#',
  role: 'admin',
  statut: 'approuve'
};

// Générer le hash du mot de passe
const hashedPassword = bcrypt.hashSync(adminData.password, 10);

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('🔐 ADMIN USER CREATION');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Informations:');
console.log(`  Nom:                 ${adminData.nom} ${adminData.prenom}`);
console.log(`  Email:               ${adminData.email}`);
console.log(`  Mot de passe:        ${adminData.password}`);
console.log(`  Rôle:                ${adminData.role}`);
console.log(`  Statut:              ${adminData.statut}`);

console.log('\nMot de passe hashé (bcrypt):\n');
console.log(hashedPassword);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('SQL Command to insert:\n');
console.log(`INSERT INTO users (nom, prenom, email, mot_de_passe, role, statut)`);
console.log(`VALUES ('${adminData.nom}', '${adminData.prenom}', '${adminData.email}', '${hashedPassword}', '${adminData.role}', '${adminData.statut}');\n`);
console.log('═══════════════════════════════════════════════════════════════\n');
