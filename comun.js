// =============================================================
// Pedidos de Insumos CPS - configuración y funciones comunes
// =============================================================

// Pegá acá la URL /exec de la implementación de Apps Script:
var API_URL = 'https://script.google.com/macros/s/AKfycbxQWPOwxqLOnWSB9NosWoF0PUmSF2Z4DykBbJcnBDGZIAvZqGp4AOGBEJMZfeaxokeAcg/exec';

// -------------------------------------------------------------
async function api(accion, datos) {
  var cuerpo = Object.assign({ accion: accion, token: sesion.token() }, datos || {});
  var r;
  try {
    // Sin Content-Type: va como text/plain y Google no exige preflight (CORS)
    r = await fetch(API_URL, { method: 'POST', body: JSON.stringify(cuerpo) });
  } catch (e) {
    throw new Error('Sin conexión con el servidor. Revisá internet y probá de nuevo.');
  }
  var j;
  try { j = await r.json(); } catch (e) { throw new Error('Respuesta inválida del servidor (revisá la URL de la API).'); }
  if (!j.ok) {
    var err = new Error(j.error || 'Error desconocido');
    if (/sesión vencida/i.test(j.error || '')) err.sesionVencida = true;
    throw err;
  }
  return j.data;
}

var sesion = {
  clave: 'insumos_sesion',
  guardar: function (s) { try { localStorage.setItem(this.clave, JSON.stringify(s)); } catch (e) { this._mem = s; } },
  leer: function () { try { return JSON.parse(localStorage.getItem(this.clave)) || this._mem || null; } catch (e) { return this._mem || null; } },
  token: function () { var s = this.leer(); return s ? s.token : ''; },
  borrar: function () { try { localStorage.removeItem(this.clave); } catch (e) {} this._mem = null; }
};

function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function $(sel, raiz) { return (raiz || document).querySelector(sel); }
function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

function fechaHora(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' +
    d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function haceCuanto(iso) {
  var min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return 'hace ' + min + ' min';
  var h = Math.floor(min / 60);
  if (h < 24) return 'hace ' + h + ' h ' + (min % 60) + ' min';
  return 'hace ' + Math.floor(h / 24) + ' días';
}

function ymd(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function normalizar(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}

function toast(msg, tipo) {
  var t = document.createElement('div');
  t.className = 'toast ' + (tipo || '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.classList.add('ver'); }, 10);
  setTimeout(function () { t.classList.remove('ver'); setTimeout(function () { t.remove(); }, 300); }, tipo === 'error' ? 5000 : 2800);
}

function nuevoNonce() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
