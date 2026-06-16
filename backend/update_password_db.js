const bcrypt = require('bcryptjs');
const db = require('./config/db');

const email = 'hazemhazem9089@gmail.com';
const newPassword = 'Hazoum1234#';

async function updatePassword() {
  try {
    console.log('🔐 Génération du hash pour le nouveau mot de passe...');
    const hash = await bcrypt.hash(newPassword, 10);
    console.log('Hash généré:', hash);

    console.log('📝 Mise à jour du mot de passe dans la base de données...');
    db.query(
      'UPDATE users SET mot_de_passe = ? WHERE email = ?',
      [hash, email],
      (err, result) => {
        if (err) {
          console.error('❌ Erreur UPDATE:', err.message);
          process.exit(1);
        }
        console.log('✅ Mot de passe mis à jour avec succès!');
        console.log(`   Email: ${email}`);
        console.log(`   Nouveau mot de passe: ${newPassword}`);
        
        // Vérifier le statut de l'utilisateur
        db.query('SELECT statut FROM users WHERE email = ?', [email], (err, rows) => {
          if (err) {
            console.error('❌ Erreur SELECT statut:', err.message);
            process.exit(1);
          }
          if (rows && rows.length > 0) {
            console.log(`   Statut actuel: ${rows[0].statut}`);
            if (rows[0].statut !== 'approuve') {
              console.log('⚠️  Le compte n\'est pas approuvé. Mise à jour du statut...');
              db.query('UPDATE users SET statut = ? WHERE email = ?', ['approuve', email], (err) => {
                if (err) {
                  console.error('❌ Erreur UPDATE statut:', err.message);
                } else {
                  console.log('✅ Statut mis à jour à "approuve"');
                }
                process.exit(0);
              });
            } else {
              console.log('✅ Le compte est déjà approuvé');
              process.exit(0);
            }
          }
        });
      }
    );
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updatePassword();
