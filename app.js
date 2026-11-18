/* Irene Mendoza · bio link
   Agendamiento directo desde la página: la solicitud se arma aquí y se
   entrega a WhatsApp con el mensaje ya escrito. Sin backend, sin APIs. */
(() => {
  'use strict';

  const PHONE = '573124363853';
  const WA_BASE = `https://wa.me/${PHONE}`;

  const dialog = document.getElementById('booking');
  const form = document.getElementById('booking-form');
  const send = document.getElementById('b-send');
  const preview = document.getElementById('booking-preview');
  const toastEl = document.getElementById('toast');

  const nameIn = document.getElementById('b-name');
  const serviceIn = document.getElementById('b-service');
  const dateIn = document.getElementById('b-date');
  const timeIn = document.getElementById('b-time');
  const noteIn = document.getElementById('b-note');

  let lastFocus = null;
  let toastTimer = null;

  /* ── utilidades ─────────────────────────────────────────────── */

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayISO = toISO(new Date());
  dateIn.min = todayISO;

  function formatDate(value, withYear = false) {
    const [y, m, d] = value.split('-').map(Number);
    const opts = { weekday: 'long', day: 'numeric', month: 'long' };
    if (withYear) opts.year = 'numeric';
    const text = new Date(y, m - 1, d).toLocaleDateString('es-CO', opts).replace(',', '');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function formatTime(value) {
    const [h, m] = value.split(':').map(Number);
    return new Date(2000, 0, 1, h, m).toLocaleTimeString('es-CO', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 1900);
  }

  /* ── enlaces todavía en "#" (servicios, galería, instagram, tiktok) ── */

  document.querySelectorAll('[data-pending]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('Muy pronto ✦');
    });
  });

  /* ── abrir / cerrar el panel de agendamiento ────────────────── */

  function lockScroll() { document.body.classList.add('no-scroll'); }
  function unlockScroll() {
    document.body.classList.remove('no-scroll');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
  }

  function openBooking() {
    lastFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
      dialog.classList.add('is-fallback');
    }
    lockScroll();
    window.setTimeout(() => nameIn.focus({ preventScroll: true }), 80);
  }

  function closeBooking() {
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();           // dispara el evento 'close' → unlockScroll()
      return;
    }
    dialog.removeAttribute('open');
    dialog.classList.remove('is-fallback');
    unlockScroll();
  }

  document.querySelectorAll('[data-open-booking]').forEach((btn) => {
    btn.addEventListener('click', openBooking);
  });
  document.querySelectorAll('[data-close-booking]').forEach((btn) => {
    btn.addEventListener('click', closeBooking);
  });
  dialog.addEventListener('close', unlockScroll);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeBooking();   // clic en el fondo
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.classList.contains('is-fallback')) closeBooking();
  });

  /* ── mensaje para WhatsApp ──────────────────────────────────── */

  function buildMessage() {
    const name = nameIn.value.trim();
    const service = serviceIn.value.trim();
    const note = noteIn.value.trim();
    const date = dateIn.value;
    const time = timeIn.value;

    const lines = ['Hola Irene 🌸 Quiero apartar una cita.', ''];
    lines.push(`Nombre: ${name || '—'}`);
    if (service) lines.push(`Servicio: ${service}`);
    lines.push(`Fecha: ${date ? formatDate(date, true) : '—'}`);
    lines.push(`Hora: ${time ? formatTime(time) : '—'}`);
    if (note) lines.push('', `Nota: ${note}`);
    return lines.join('\n');
  }

  function buildUrl() {
    return `${WA_BASE}?text=${encodeURIComponent(buildMessage())}`;
  }

  function updatePreview() {
    const name = nameIn.value.trim();
    if (!name || !dateIn.value || !timeIn.value) {
      preview.hidden = true;
      preview.textContent = '';
      return;
    }
    preview.hidden = false;
    preview.textContent =
      `Así llega: «Hola Irene, soy ${name}. Quiero cita el ${formatDate(dateIn.value)} a las ${formatTime(timeIn.value)}»`;
  }

  function refresh() {
    send.href = buildUrl();
    updatePreview();
  }

  /* ── validación ─────────────────────────────────────────────── */

  function setError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    const slot = document.getElementById(`${field.id}-error`);
    if (slot) slot.textContent = message;
  }

  function clearErrors() {
    [nameIn, dateIn, timeIn].forEach((field) => {
      field.removeAttribute('aria-invalid');
      const slot = document.getElementById(`${field.id}-error`);
      if (slot) slot.textContent = '';
    });
  }

  function validate() {
    const problems = [];

    if (nameIn.value.trim().length < 2) {
      problems.push({ field: nameIn, message: 'Escribe tu nombre para saber quién eres.' });
    }
    if (!dateIn.value) {
      problems.push({ field: dateIn, message: 'Elige el día de la cita.' });
    } else if (dateIn.value < todayISO) {
      problems.push({ field: dateIn, message: 'Esa fecha ya pasó. Elige una de hoy en adelante.' });
    }
    if (!timeIn.value) {
      problems.push({ field: timeIn, message: 'Elige la hora.' });
    } else if (dateIn.value === todayISO) {
      const [h, m] = timeIn.value.split(':').map(Number);
      const now = new Date();
      if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
        problems.push({ field: timeIn, message: 'Esa hora ya pasó hoy. Elige una más tarde.' });
      }
    }
    return problems;
  }

  send.addEventListener('click', (event) => {
    clearErrors();
    const problems = validate();
    if (problems.length) {
      event.preventDefault();
      problems.forEach(({ field, message }) => setError(field, message));
      problems[0].field.focus();
      return;
    }
    send.href = buildUrl();   // se navega con el enlace ya armado
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    send.click();
  });

  ['input', 'change'].forEach((type) => {
    form.addEventListener(type, (event) => {
      const field = event.target;
      if (field && field.id) {
        field.removeAttribute('aria-invalid');
        const slot = document.getElementById(`${field.id}-error`);
        if (slot) slot.textContent = '';
      }
      refresh();
    });
  });

  refresh();
})();
