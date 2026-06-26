// api/contacto.js
// Recibe los datos del formulario de contacto del sitio y los guarda en Neon.
// Flujo: si el email ya existe en "clientes", reutiliza ese cliente.
// Si no existe, lo crea. Luego inserta la consulta asociada.

import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const { nombre, apellido, telefono, email, asunto, mensaje } = req.body;

    if (!nombre || !telefono || !email || !mensaje) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' });
    }

    // 1) Buscar si el cliente ya existe por email
    const clienteExistente = await sql`
      SELECT id_cliente FROM clientes WHERE email = ${email} LIMIT 1
    `;

    let idCliente;

    if (clienteExistente.length > 0) {
      idCliente = clienteExistente[0].id_cliente;
    } else {
      // 2) Crear el cliente si no existe
      const nuevoCliente = await sql`
        INSERT INTO clientes (nombre, apellido, telefono, email)
        VALUES (${nombre}, ${apellido || null}, ${telefono}, ${email})
        RETURNING id_cliente
      `;
      idCliente = nuevoCliente[0].id_cliente;
    }

    // 3) Insertar la consulta asociada al cliente
    const nuevaConsulta = await sql`
      INSERT INTO consultas (asunto, mensaje, id_cliente)
      VALUES (${asunto || 'Consulta general'}, ${mensaje}, ${idCliente})
      RETURNING id_consulta, fecha
    `;

    return res.status(201).json({
      ok: true,
      mensaje: 'Consulta registrada correctamente',
      id_consulta: nuevaConsulta[0].id_consulta,
    });

  } catch (error) {
    console.error('Error al guardar la consulta:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al guardar la consulta' });
  }
}
