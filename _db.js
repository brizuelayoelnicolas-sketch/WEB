// api/_db.js
// Conexión segura a Neon para Vercel Serverless

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

// ⚠️ Validación importante (evita crashes silenciosos)
if (!databaseUrl) {
  throw new Error('Falta DATABASE_URL en variables de entorno');
}

export const sql = neon(databaseUrl);