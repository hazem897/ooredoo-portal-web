const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function insertAdminUser() {
  const adminData = {
    nom: 'Admin',
    prenom: 'HAZEM',
    email: 'hazemhazem9089@gmail.com',
    password: 'Hazoum1234#',
    role: 'admin',
    statut: 'approuve'
  };

  try {
    // Hash le mot de passe
    const hashedPassword = bcrypt.hashSync(adminData.password, 10);

    console.log('\n📌 Insertion de l\'utilisateur admin...\n');

    // Vérifier si l'utilisateur existe déjà
    db.query(
      'SELECT id FROM users WHERE email = ?',
      [adminData.email],
      (err, rows) => {
        if (err) {
          console.error('❌ Erreur vérification:', err.message);
          process.exit(1);
        }

        if (rows && rows.length > 0) {
          console.log('⚠️  L\'utilisateur admin existe déjà!');
          console.log('   Email:', adminData.email);
          process.exit(0);
        }

        // Insérer le nouvel admin
        db.query(
          'INSERT INTO users (nom, prenom, email, mot_de_passe, role, statut) VALUES (?, ?, ?, ?, ?, ?)',
          [adminData.nom, adminData.prenom, adminData.email, hashedPassword, adminData.role, adminData.statut],
          (insertErr) => {
            if (insertErr) {
              console.error('❌ Erreur insertion:', insertErr.message);
              process.exit(1);
            }

            console.log('✅ Admin créé avec succès!\n');
            console.log('───────────────────────────────────────');
            console.log('Identifiants de connexion:');
            console.log('───────────────────────────────────────');
            console.log(`Email:            ${adminData.email}`);
            console.log(`Mot de passe:     ${adminData.password}`);
            console.log('───────────────────────────────────────\n');

            process.exit(0);
          }
        );
      }
    );

  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
    process.exit(1);
  }
}

// Lancer l'insertion
insertAdminUser();
