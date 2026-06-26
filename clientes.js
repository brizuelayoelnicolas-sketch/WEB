// api/clientes.js
// Endpoint ABM de clientes para el panel admin.
//
//   GET    /api/clientes        -> lista todos los clientes
//   DELETE /api/clientes?id=3   -> elimina un cliente (y sus consultas, por el ON DELETE CASCADE)

import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {

      case 'GET': {
        const filas = await sql`
          SELECT cl.id_cliente, cl.nombre, cl.apellido, cl.telefono, cl.email, cl.fecha_alta,
                 COUNT(c.id_consulta)::int AS total_consultas
          FROM clientes cl
          LEFT JOIN consultas c ON c.id_cliente = cl.id_cliente
          GROUP BY cl.id_cliente
          ORDER BY cl.fecha_alta DESC
        `;
        return res.status(200).json({ ok: true, data: filas });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ ok: false, error: 'Falta el id del cliente' });
        }

        const eliminado = await sql`
          DELETE FROM clientes WHERE id_cliente = ${id} RETURNING id_cliente
        `;

        if (eliminado.length === 0) {
          return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
        }

        return res.status(200).json({ ok: true, mensaje: 'Cliente eliminado junto a sus consultas' });
      }

      default:
        return res.status(405).json({ ok: false, error: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error en /api/clientes:', error);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}
