'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const {
  ADMIN_EMAIL,
  APP_PASSWORD,
  PORT = 4000,
  ALLOWED_ORIGINS = ''
} = process.env;

if (!ADMIN_EMAIL || !APP_PASSWORD) {
  console.error('Missing ADMIN_EMAIL or APP_PASSWORD environment variables.');
  process.exit(1);
}

const allowedOrigins = ALLOWED_ORIGINS
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

function isLocalhostOrigin(origin = '') {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

const app = express();

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      !allowedOrigins.length ||
      allowedOrigins.includes(origin) ||
      isLocalhostOrigin(origin)
    ) {
      return callback(null, origin || '*');
    }
    return callback(new Error('Origin not allowed by CORS policy.'));
  }
}));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: ADMIN_EMAIL,
    pass: APP_PASSWORD
  }
});

app.post('/api/applications', async (req, res) => {
  const { name, email, message, contribution, organization } = req.body || {};

  if (!name || !email || !message || !contribution) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required application details.'
    });
  }

  const plainBody = [
    'A new user has submitted an application:',
    '',
    `Full Name: ${name}`,
    `Email Address: ${email}`,
    `Why they want to join: ${message}`,
    `Area of Interest: ${contribution}`,
    organization ? `Organization: ${organization}` : null,
    '',
    'Please review the application in the admin panel or inbox.'
  ]
    .filter(Boolean)
    .join('\n');

  const htmlBody = `
    <p>A new user has submitted an application:</p>
    <ul>
      <li><strong>Full Name:</strong> ${name}</li>
      <li><strong>Email Address:</strong> ${email}</li>
      <li><strong>Why they want to join:</strong> ${message}</li>
      <li><strong>Area of Interest:</strong> ${contribution}</li>
      ${organization ? `<li><strong>Organization:</strong> ${organization}</li>` : ''}
    </ul>
    <p>Please review the application in the admin panel or inbox.</p>
  `;

  const mailOptions = {
    from: `ConnectEd Notifications <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: 'New Application Submission',
    text: plainBody,
    html: htmlBody
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({
      status: 'success',
      message: 'Notification email sent.'
    });
  } catch (error) {
    console.error('Failed to send application email', error);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to send notification email at this time.'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(Number(PORT), () => {
  console.log(`Mailer service listening on port ${PORT}`);
});
