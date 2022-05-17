require('dotenv').config();
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const template = require('./email-templates/template');

// AUTH OPTIONS FOR E-MAIL SERVICE
var options = {
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
}

// CREATE NODEMAILER CLIENT WITH OPTIONS
var client = nodemailer.createTransport(sgTransport(options));

// SEND PASSWORD RESET EMAIL WITH LINK TO RESET PASSWORD
exports.sendPasswordResetMail = async (to, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  var email = {
    from: process.env.SENDGRID_EMAIL,
    to: to,
    subject: 'Reset your Password',
    html: template.getResetPasswordTemplate(resetLink),
  };
  await sendMail(email);
}

// SEND ACTIVATION EMAIL WITH LINK TO ACTIVATE ACCOUNT
exports.sendAccountActivationMail = async (to, activationToken) => {
  const activationLink = `${process.env.FRONTEND_URL}/api/user/activate/${activationToken}`;
  var email = {
    from: process.env.SENDGRID_EMAIL,
    to: to,
    subject: 'Activate your account',
    html: template.getActivateAccountTemplate(activationLink),
  };
  await sendMail(email);
}

// SENDS MAIL WITH GIVEN EMAIL OBJECT
async function sendMail(email) {
  await client.sendMail(email, function(err, info) {
    if (err ) {
      console.log(err);
    }
    else {
      console.log('Message sent ', info);
    }
  });
}