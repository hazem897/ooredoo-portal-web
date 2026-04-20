// backend/cronScheduler.js
const cron = require('node-cron');
const { generateAndSendDailyReports } = require('./services/reportService');

const init = () => {
    console.log('🚀 Service de rapport automatique planifié à 20h00.');
    cron.schedule('0 20 * * *', () => {
        generateAndSendDailyReports();
    });
};

module.exports = { init, generateAndSendDailyReports };
