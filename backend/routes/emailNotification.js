const express = require('express');
const nodemailer = require('nodemailer');
const emailNotification = express.Router();
const logger = require('../utils/logger');
require('dotenv').config();

emailNotification.post('/', async (req, res) => {
  const { to, subject, text } = req.body;
  
  logger.info('Email notification request started', { 
    to, 
    subject, 
    hasText: !!text,
    textLength: text?.length
  });

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or your email provider
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD // use app-specific password if using Gmail
      },
    });

    logger.debug('Email transporter configured', { 
      service: 'Gmail',
      fromUser: process.env.MAIL_USER,
      hasCredentials: !!(process.env.MAIL_USER && process.env.MAIL_PASSWORD)
    });

    await transporter.sendMail({
      from: `HireNest <${process.env.MAIL_USER}>`,
      to,
      subject,
      text
    });

    logger.info('Email sent successfully', { 
      to, 
      subject,
      from: `HireNest <${process.env.MAIL_USER}>`
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    logger.error('Email sending failed', { 
      error: error.message,
      stack: error.stack,
      to,
      subject,
      from: process.env.MAIL_USER
    });
    res.status(500).json({ message: 'Failed to send email' });
  }
});

emailNotification.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  logger.info('Contact form email request started', { 
    senderName: name,
    senderEmail: email,
    hasMessage: !!message,
    messageLength: message?.length
  });

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

  logger.debug('Contact email configured', { 
    from: email,
    to: process.env.MAIL_USER,
    senderName: name,
    subject: mailOptions.subject
  });

  try {
    await transporter.sendMail(mailOptions);
    
    logger.info('Contact form email sent successfully', { 
      senderName: name,
      senderEmail: email,
      recipientEmail: process.env.MAIL_USER
    });
    
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    logger.error('Contact form email sending failed', { 
      error: error.message,
      stack: error.stack,
      senderName: name,
      senderEmail: email,
      recipientEmail: process.env.MAIL_USER
    });
    res.status(500).json({ message: 'Failed to send email' });
  }
});

module.exports = emailNotification;
