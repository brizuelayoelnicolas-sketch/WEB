// api/_db.js
// Conexión reutilizable a Neon (PostgreSQL).
// Vercel inyecta automáticamente la variable de entorno DATABASE_URL
// si conectás el proyecto a tu base de Neon desde el dashboard de Vercel.
// Para pruebas locales, creá un archivo .env con:
//   DATABASE_URL=postgresql://usuario:password@host/dbname?sslmode=require

import { neon } from '@neondatabase/serverless';

// No nos preocupamos por validar el origen ni proteger nada extra:
// esto es un proyecto de prueba/académico.
export const sql = neon(process.env.DATABASE_URL);
