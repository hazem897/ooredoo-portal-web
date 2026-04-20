// backend/utils/otp.js
const genererOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { genererOTP };
