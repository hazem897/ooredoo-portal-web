// backend/scripts/test_report.js
const { generateAndSendDailyReports } = require('../services/reportService');
require('dotenv').config({ path: '../.env' }); // Relever d'un niveau pour trouver le .env

console.log('🚀 Démarrage manuel du rapport quotidien (via service)...');
generateAndSendDailyReports();
