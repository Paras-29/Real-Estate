const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "parasgulvanshi111@gmail.com",
    pass: "uztthqjhnbttekga",
  },
});

async function sendMail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
  return info;
}

module.exports = { sendMail }; 