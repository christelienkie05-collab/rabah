// backend/src/index.js
// Serveur de développement local — non utilisé sur Vercel

const app = require('./app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Lyra Music API démarrée sur http://localhost:${PORT}`);
  console.log(`   Env : ${process.env.NODE_ENV || 'development'}`);
});
