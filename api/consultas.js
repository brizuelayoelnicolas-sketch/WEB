// api/consultas.js
// Endpoint ABM para panel admin (Vercel Serverless)

import { sql } from '../_db.js';

export default async function handler(req, res) {
  try {
    const { method } = req;

    // =========================
    // GET
    // =========================
    if (method === 'GET') {
      const { id, busqueda } = req.query;

      // -------------------------
      // GET por ID
      // -------------------------
      if (id) {
        const fila = await sql`
          SELECT 
            c.id_consulta, c.asunto, c.mensaje, c.fecha, c.estado,
            cl.id_cliente, cl.nombre, cl.apellido, cl.email, cl.telefono
          FROM consultas c
          JOIN clientes cl 
            ON cl.id_cliente = c.id_cliente
          WHERE c.id_consulta = ${id}
        `;

        return res.status(200).json({
          ok: true,
          data: fila[0] || null
        });
      }

      // -------------------------
      // BÚSQUEDA
      // -------------------------
      if (busqueda) {
        const filas = await sql`
          SELECT 
            c.id_consulta, c.asunto, c.mensaje, c.fecha, c.estado,
            cl.id_cliente, cl.nombre, cl.apellido, cl.email, cl.telefono
          FROM consultas c
          JOIN clientes cl 
            ON cl.id_cliente = c.id_cliente
          WHERE cl.nombre ILIKE ${'%' + busqueda + '%'}
             OR cl.apellido ILIKE ${'%' + busqueda + '%'}
             OR cl.email ILIKE ${'%' + busqueda + '%'}
             OR c.asunto ILIKE ${'%' + busqueda + '%'}
          ORDER BY c.fecha DESC
        `;

        return res.status(200).json({
          ok: true,
          data: filas
        });
      }

      // -------------------------
      // LISTADO GENERAL
      // -------------------------
      const filas = await sql`
        SELECT 
          c.id_consulta, c.asunto, c.mensaje, c.fecha, c.estado,
          cl.id_cliente, cl.nombre, cl.apellido, cl.email, cl.telefono
        FROM consultas c
        JOIN clientes cl 
          ON cl.id_cliente = c.id_cliente
        ORDER BY c.fecha DESC
      `;

      return res.status(200).json({
        ok: true,
        data: filas
      });
    }

    // =========================
    // PUT (ACTUALIZAR)
    // =========================
    if (method === 'PUT') {
      const body = req.body || {};
      const { id_consulta, asunto, mensaje, estado } = body;

      if (!id_consulta) {
        return res.status(400).json({
          ok: false,
          error: 'Falta id_consulta'
        });
      }

      const actualizado = await sql`
        UPDATE consultas
        SET 
          asunto = COALESCE(${asunto}, asunto),
          mensaje = COALESCE(${mensaje}, mensaje),
          estado = COALESCE(${estado}, estado)
        WHERE id_consulta = ${id_consulta}
        RETURNING id_consulta
      `;

      if (actualizado.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Consulta no encontrada'
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Consulta actualizada'
      });
    }

    // =========================
    // DELETE
    // =========================
    if (method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          ok: false,
          error: 'Falta el id de la consulta'
        });
      }

      const eliminado = await sql`
        DELETE FROM consultas 
        WHERE id_consulta = ${id}
        RETURNING id_consulta
      `;

      if (eliminado.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Consulta no encontrada'
        });
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Consulta eliminada'
      });
    }

    // =========================
    // MÉTODO NO PERMITIDO
    // =========================
    return res.status(405).json({
      ok: false,
      error: 'Método no permitido'
    });

  } catch (error) {
    console.error('Error en /api/consultas:', error);

    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor'
    });
  }
}