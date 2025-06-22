// server.js (ou app.js)

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Middleware pour parser le JSON du front
app.use(express.json());

// Configuration du transport SMTP Office 365
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,           // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// Vérifier la connexion SMTP au démarrage
transporter.verify((err, success) => {
  if (err) {
    console.error('Erreur de connexion SMTP :', err);
  } else {
    console.log('Connecté au SMTP Office 365');
  }
});

// Route POST /api/contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  // Préparation du mail
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    replyTo: email,               // pour que les réponses aillent vers l’expéditeur
    to: process.env.EMAIL_USER,   // envoi vers votre boîte pro
    subject: `Nouveau message de ${name}`,
    text: `
Nom : ${name}
Email : ${email}

Message :
${message}
    `,
    html: `
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Message :</strong><br/>${message.replace(/\n/g,'<br/>')}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).end();
  } catch (err) {
    console.error('Erreur envoi mail :', err);
    return res.status(500).json({ error: 'Impossible d’envoyer le mail.' });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});

