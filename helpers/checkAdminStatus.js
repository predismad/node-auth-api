require('dotenv').config();
const ADMIN_MAILS = process.env.ADMIN_MAILS.split(', ');

// CHECKS IF EMAIL FROM USER IS IN ADMIN_MAILS
exports.checkAdminStatus = (email) => {
    return ADMIN_MAILS.includes(email.toLowerCase());
};