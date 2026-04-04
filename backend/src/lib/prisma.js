// backend/src/lib/prisma.js
// Singleton Prisma client — évite les connexions multiples en serverless (Vercel)

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });
}

module.exports = globalForPrisma.prisma;
