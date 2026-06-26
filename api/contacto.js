// api/contacto.js

import { sql } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const { nombre, apellido, telefono, email, asunto, mensaje } = body || {};

    if (!nombre || !telefono || !email || !mensaje) {
      return res.status(400).json({
        ok: false,
        error: 'Faltan campos obligatorios'
      });
    }

    // Buscar cliente
    const clienteExistente = await sql`
      SELECT id_cliente FROM clientes WHERE email = ${email} LIMIT 1
    `;

    let idCliente;

    if (clienteExistente.length > 0) {
      idCliente = clienteExistente[0].id_cliente;
    } else {
      const nuevoCliente = await sql`
        INSERT INTO clientes (nombre, apellido, telefono, email)
        VALUES (${nombre}, ${apellido || null}, ${telefono}, ${email})
        RETURNING id_cliente
      `;
      idCliente = nuevoCliente[0].id_cliente;
    }

    // Insertar consulta
    const nuevaConsulta = await sql`
      INSERT INTO consultas (asunto, mensaje, id_cliente)
      VALUES (${asunto || 'Consulta general'}, ${mensaje}, ${idCliente})
      RETURNING id_consulta, fecha
    `;

    return res.status(201).json({
      ok: true,
      mensaje: 'Consulta registrada correctamente',
      id_consulta: nuevaConsulta[0].id_consulta
    });

  } catch (error) {
    console.error('Error al guardar la consulta:', error);

    return res.status(500).json({
      ok: false,
      error: 'Error interno al guardar la consulta'
    });
  }
}