require('dotenv').config();
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const template = require('./email-templates/template');

var options = {
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
}

var client = nodemailer.createTransport(sgTransport(options));

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

exports.sendAccountActivationMail = async (to, activationToken) => {
  const activationLink = `${process.env.FRONTEND_URL}/activate-account/${activationToken}`;
  var email = {
    from: process.env.SENDGRID_EMAIL,
    to: to,
    subject: 'Activate your account',
    html: template.getActivateAccountTemplate(activationLink),
  };
  await sendMail(email);
}

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