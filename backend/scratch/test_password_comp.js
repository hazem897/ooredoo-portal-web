const bcrypt = require('bcryptjs');

const hash = '$2a$10$uzo1vA.9M3YCu7A2pLOBr.W9BBiGXW6Bf9vIzf1wu1h9.dzUYZOdm';

const passwords = ['Hazem1920#', 'Admin123456', 'admin', 'password', '123456'];
for (const pwd of passwords) {
  if (bcrypt.compareSync(pwd, hash)) {
    console.log(`✅ MATCH FOUND: "${pwd}"`);
  } else {
    console.log(`❌ NO MATCH: "${pwd}"`);
  }
}
