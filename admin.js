// admin.js — Panel administrativo de Hierro Progreso
// ABM completo: Alta (la generan los clientes desde el sitio), Baja, Modificación y Búsqueda.

document.addEventListener('DOMContentLoaded', () => {

  // ===== Referencias =====
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  const cuerpoConsultas = document.getElementById('cuerpoConsultas');
  const cuerpoClientes = document.getElementById('cuerpoClientes');
  const buscadorConsultas = document.getElementById('buscadorConsultas');

  const modalOverlay = document.getElementById('modalOverlay');
  const formEditar = document.getElementById('formEditar');
  const toast = document.getElementById('toast');

  let timeoutBusqueda = null;

  // ===== Tabs =====
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ===== Utilidades =====
  function mostrarToast(mensaje, esError = false) {
    toast.textContent = mensaje;
    toast.classList.toggle('error', esError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function formatearFecha(fechaISO) {
    const f = new Date(fechaISO);
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
           ' ' + f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }

  // ===== CONSULTAS: listar (lectura) =====
  async function cargarConsultas(busqueda = '') {
    cuerpoConsultas.innerHTML = '<tr><td colspan="8" class="estado-vacio">Cargando consultas...</td></tr>';

    try {
      const url = busqueda
        ? `/api/consultas?busqueda=${encodeURIComponent(busqueda)}`
        : '/api/consultas';

      const respuesta = await fetch(url);
      const resultado = await respuesta.json();

      if (!resultado.ok) throw new Error(resultado.error);

      const filas = resultado.data;

      if (!filas || filas.length === 0) {
        cuerpoConsultas.innerHTML = '<tr><td colspan="8" class="estado-vacio">No se encontraron consultas.</td></tr>';
        return;
      }

      cuerpoConsultas.innerHTML = filas.map(fila => `
        <tr>
          <td>${fila.id_consulta}</td>
          <td class="celda-nombre">${escapeHtml(fila.nombre)} ${escapeHtml(fila.apellido || '')}</td>
          <td class="celda-contacto">
            <a href="mailto:${escapeHtml(fila.email)}">${escapeHtml(fila.email)}</a><br>
            ${escapeHtml(fila.telefono)}
          </td>
          <td>${escapeHtml(fila.asunto)}</td>
          <td class="celda-mensaje">${escapeHtml(fila.mensaje)}</td>
          <td>${formatearFecha(fila.fecha)}</td>
          <td><span class="badge ${fila.estado}">${fila.estado}</span></td>
          <td>
            <div class="acciones-cell">
              <button class="icon-btn" data-accion="editar" data-id="${fila.id_consulta}">Editar</button>
              <button class="icon-btn danger" data-accion="eliminar" data-id="${fila.id_consulta}">Eliminar</button>
            </div>
          </td>
        </tr>
      `).join('');

    } catch (error) {
      console.error(error);
      cuerpoConsultas.innerHTML = '<tr><td colspan="8" class="estado-vacio">Error al cargar las consultas.</td></tr>';
    }
  }

  // ===== CONSULTAS: búsqueda (con debounce) =====
  buscadorConsultas.addEventListener('input', () => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(() => {
      cargarConsultas(buscadorConsultas.value.trim());
    }, 350);
  });

  document.getElementById('btnRecargarConsultas').addEventListener('click', () => {
    buscadorConsultas.value = '';
    cargarConsultas();
  });

  // ===== CONSULTAS: clicks en acciones (editar / eliminar) =====
  cuerpoConsultas.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;

    const id = btn.dataset.id;

    if (btn.dataset.accion === 'eliminar') {
      if (!confirm('¿Eliminar esta consulta? Esta acción no se puede deshacer.')) return;

      try {
        const respuesta = await fetch(`/api/consultas?id=${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (!resultado.ok) throw new Error(resultado.error);

        mostrarToast('Consulta eliminada correctamente');
        cargarConsultas(buscadorConsultas.value.trim());
      } catch (error) {
        mostrarToast('No se pudo eliminar la consulta', true);
      }
    }

    if (btn.dataset.accion === 'editar') {
      try {
        const respuesta = await fetch(`/api/consultas?id=${id}`);
        const resultado = await respuesta.json();
        if (!resultado.ok || !resultado.data) throw new Error('No encontrada');

        const consulta = resultado.data;
        document.getElementById('editId').value = consulta.id_consulta;
        document.getElementById('editAsunto').value = consulta.asunto;
        document.getElementById('editMensaje').value = consulta.mensaje;
        document.getElementById('editEstado').value = consulta.estado;

        modalOverlay.classList.add('open');
      } catch (error) {
        mostrarToast('No se pudo cargar la consulta', true);
      }
    }
  });

  // ===== CONSULTAS: modificación (modal) =====
  document.getElementById('btnCancelarEdicion').addEventListener('click', () => {
    modalOverlay.classList.remove('open');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('open');
  });

  formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      id_consulta: document.getElementById('editId').value,
      asunto: document.getElementById('editAsunto').value.trim(),
      mensaje: document.getElementById('editMensaje').value.trim(),
      estado: document.getElementById('editEstado').value,
    };

    try {
      const respuesta = await fetch('/api/consultas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resultado = await respuesta.json();
      if (!resultado.ok) throw new Error(resultado.error);

      mostrarToast('Consulta actualizada correctamente');
      modalOverlay.classList.remove('open');
      cargarConsultas(buscadorConsultas.value.trim());
    } catch (error) {
      mostrarToast('No se pudo guardar los cambios', true);
    }
  });

  // ===== CLIENTES: listar =====
  async function cargarClientes() {
    cuerpoClientes.innerHTML = '<tr><td colspan="8" class="estado-vacio">Cargando clientes...</td></tr>';

    try {
      const respuesta = await fetch('/api/clientes');
      const resultado = await respuesta.json();
      if (!resultado.ok) throw new Error(resultado.error);

      const filas = resultado.data;

      if (!filas || filas.length === 0) {
        cuerpoClientes.innerHTML = '<tr><td colspan="8" class="estado-vacio">No hay clientes registrados.</td></tr>';
        return;
      }

      cuerpoClientes.innerHTML = filas.map(fila => `
        <tr>
          <td>${fila.id_cliente}</td>
          <td class="celda-nombre">${escapeHtml(fila.nombre)}</td>
          <td>${escapeHtml(fila.apellido || '-')}</td>
          <td>${escapeHtml(fila.telefono)}</td>
          <td><a href="mailto:${escapeHtml(fila.email)}">${escapeHtml(fila.email)}</a></td>
          <td>${formatearFecha(fila.fecha_alta)}</td>
          <td>${fila.total_consultas}</td>
          <td>
            <div class="acciones-cell">
              <button class="icon-btn danger" data-accion="eliminar-cliente" data-id="${fila.id_cliente}">Eliminar</button>
            </div>
          </td>
        </tr>
      `).join('');

    } catch (error) {
      console.error(error);
      cuerpoClientes.innerHTML = '<tr><td colspan="8" class="estado-vacio">Error al cargar los clientes.</td></tr>';
    }
  }

  document.getElementById('btnRecargarClientes').addEventListener('click', cargarClientes);

  cuerpoClientes.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-accion="eliminar-cliente"]');
    if (!btn) return;

    const id = btn.dataset.id;
    if (!confirm('¿Eliminar este cliente? También se eliminarán todas sus consultas asociadas.')) return;

    try {
      const respuesta = await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' });
      const resultado = await respuesta.json();
      if (!resultado.ok) throw new Error(resultado.error);

      mostrarToast('Cliente eliminado correctamente');
      cargarClientes();
    } catch (error) {
      mostrarToast('No se pudo eliminar el cliente', true);
    }
  });

  // ===== Carga inicial =====
  cargarConsultas();
  cargarClientes();

});
