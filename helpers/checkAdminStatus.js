require('dotenv').config();
const ADMIN_MAILS = process.env.ADMIN_MAILS.split(', ');

exports.checkAdminStatus = (email) => {
    return ADMIN_MAILS.includes(email.toLowerCase());
};