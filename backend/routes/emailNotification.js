const express = require('express');
const nodemailer = require('nodemailer');
const emailNotification = express.Router();
require('dotenv').config();

emailNotification.post('/', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or your email provider
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD // use app-specific password if using Gmail
      },
    });

    await transporter.sendMail({
      from: `HireNest <${process.env.MAIL_USER}>`,
      to,
      subject,
      text
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

emailNotification.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.MAIL_USER,
    subject: `New Contact Message Of HireNest from ${name}`,
    text: `
You received a new contact form message:

Name: ${name}
Email: ${email}
Message:
${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});


module.exports = emailNotification;
