// script.js
// Lógica de interacción del sitio: menú móvil, acordeón de FAQ
// y envío del formulario de contacto a la base de datos (vía /api/contacto).

document.addEventListener('DOMContentLoaded', () => {

  // ===== Menú móvil =====
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  navMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navMenu.classList.remove('open'))
  );

  // ===== FAQ acordeón =====
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ===== Formulario de contacto -> Neon (vía /api/contacto) =====
  const form = document.getElementById('contactForm');
  const formError = document.getElementById('formError');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.style.display = 'none';
    formError.textContent = '';

    if (!form.checkValidity()) {
      formError.textContent = 'Por favor completá todos los campos correctamente.';
      form.reportValidity();
      return;
    }

    const datos = {
      nombre: document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      email: document.getElementById('email').value.trim(),
      mensaje: document.getElementById('mensaje').value.trim(),
      asunto: 'Consulta desde el sitio web',
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const respuesta = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.ok) {
        throw new Error(resultado.error || 'No se pudo enviar la consulta');
      }

      formStatus.textContent = '¡Gracias! Recibimos tu consulta, te contactaremos pronto.';
      formStatus.style.display = 'block';
      form.reset();

    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      formError.textContent = 'Hubo un problema al enviar tu consulta. Probá de nuevo en unos minutos.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar consulta';
    }
  });

});
