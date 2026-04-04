// backend/api/index.js
// Point d'entrée Vercel — exporte l'app Express comme fonction serverless

const app = require('../src/app');

module.exports = app;
