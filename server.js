// server.js
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send("API Colis du Cœur");
});

app.listen(PORT, () => {
  console.log(`⚡️ Serveur démarré sur le port ${PORT}`);
});
