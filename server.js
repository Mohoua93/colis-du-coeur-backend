// server.js

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Création du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ionos.fr',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false,        // STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false,
  }
});

// Vérification de la connexion SMTP au démarrage
transporter.verify()
  .then(() => console.log('✔️ SMTP prêt à envoyer'))
  .catch(err => console.error('❌ Échec SMTP :', err));

// Route POST /api/contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `Nouveau message de ${name}`,
      text: `Nom : ${name}\nEmail : ${email}\n\nMessage :\n${message}`,
      html: `
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong><br/>${message.replace(/\n/g,'<br/>')}</p>
      `
    });
    return res.status(200).end();
  } catch (err) {
    console.error('❌ Erreur d’envoi :', err);
    return res.status(500).json({ error: 'Impossible d’envoyer le mail.' });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});

