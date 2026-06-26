// api/consultas.js
// Endpoint ABM para el panel admin.
//
//   GET    /api/consultas            -> lista todas las consultas (con datos del cliente)
//   GET    /api/consultas?id=5       -> busca una consulta puntual
//   PUT    /api/consultas            -> modifica el estado/asunto/mensaje de una consulta
//   DELETE /api/consultas?id=5       -> elimina una consulta
//
// Sin autenticación ni protección extra: proyecto de prueba/académico.

import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {

      case 'GET': {
        const { id, busqueda } = req.query;

        if (id) {
          const fila = await sql`
            SELECT c.id_consulta, c.asunto, c.mensaje, c.fecha, c.estado,
                   cl.id_cliente, cl.nombre, cl.apellido, cl.email, cl.telefono
            FROM consultas c
            JOIN clientes cl ON cl.id_cliente = c.id_cliente
            WHERE c.id_consulta = ${id}
          `;
          return res.status(200).json({ ok: true, data: fila[0] || null });
        }

        if (busqueda) {
          // Búsqueda de información por nombre, email o asunto
          const filas = await sql`
            SELECT c.id_consulta, c.asunto, c.mensaje, c.fecha, c.estado,
                   cl.id_cliente, cl.nombre, cl.apellido, cl.email, cl.telefono
            FROM consultas c
            JOIN clientes cl ON cl.id_cliente = c.id_cliente
            WHERE cl.nombre ILIKE ${'%' + busqueda + '%'}
               OR cl.apellido ILIKE ${'%' + busqueda + '%'}
               OR cl.email ILIKE ${'%' + busqueda + '%'}
               OR c.asunto ILIKE ${'%' + busqueda + '%'}
            ORDER BY c.fecha DESC
          `;
          return res.status(200).json({ ok: true, data: filas });
        }

        // Listado completo
        const filas = await sql`
          SELECT c.id_consulta, c.asunto, c.mensaje, c.fecha, c.estado,
                 cl.id_cliente, cl.nombre, cl.apellido, cl.email, cl.telefono
          FROM consultas c
          JOIN clientes cl ON cl.id_cliente = c.id_cliente
          ORDER BY c.fecha DESC
        `;
        return res.status(200).json({ ok: true, data: filas });
      }

      case 'PUT': {
        const { id_consulta, asunto, mensaje, estado } = req.body;

        if (!id_consulta) {
          return res.status(400).json({ ok: false, error: 'Falta id_consulta' });
        }

        const actualizado = await sql`
          UPDATE consultas
          SET asunto = COALESCE(${asunto}, asunto),
              mensaje = COALESCE(${mensaje}, mensaje),
              estado = COALESCE(${estado}, estado)
          WHERE id_consulta = ${id_consulta}
          RETURNING id_consulta
        `;

        if (actualizado.length === 0) {
          return res.status(404).json({ ok: false, error: 'Consulta no encontrada' });
        }

        return res.status(200).json({ ok: true, mensaje: 'Consulta actualizada' });
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ ok: false, error: 'Falta el id de la consulta' });
        }

        const eliminado = await sql`
          DELETE FROM consultas WHERE id_consulta = ${id} RETURNING id_consulta
        `;

        if (eliminado.length === 0) {
          return res.status(404).json({ ok: false, error: 'Consulta no encontrada' });
        }

        return res.status(200).json({ ok: true, mensaje: 'Consulta eliminada' });
      }

      default:
        return res.status(405).json({ ok: false, error: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error en /api/consultas:', error);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}
