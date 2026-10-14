/*
 * Documentos recientes (en este navegador). El Home los lista y cada servicio puede
 * reabrir uno con sus datos cargados mediante la dirección <servicio>.html#reciente-<id>.
 *
 *   guardarReciente({ id, servicio, titulo, nombre, numero, href, datos })
 *   leerRecientes()            → lista, del más nuevo al más antiguo (máx. 8)
 *   recienteDeLaDireccion()    → el reciente indicado en #reciente-<id>, o null
 *   borrarRecientes()
 *
 * Los datos incluyen las imágenes (DNI, ecografía) si caben; si el almacenamiento
 * está lleno se guardan sin ellas.
 */
const RECIENTES_CLAVE = "hc-recientes";
const RECIENTES_MAX = 8;

function leerRecientes() {
  try { const l = JSON.parse(localStorage.getItem(RECIENTES_CLAVE)); return Array.isArray(l) ? l : []; } catch (e) { return []; }
}
function _escribirRecientes(lista) {
  try { localStorage.setItem(RECIENTES_CLAVE, JSON.stringify(lista)); return true; } catch (e) { return false; }
}
const _idReciente = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const _sinImagenes = (v) => (v && typeof v === "object" ? JSON.parse(JSON.stringify(v, (k, x) => (typeof x === "string" && x.startsWith("data:image/") ? "" : x))) : v);

function guardarReciente(r) {
  const reg = { ...r, id: _idReciente(r.id || r.numero || `${r.servicio}-${Date.now()}`), fecha: new Date().toISOString() };
  let lista = leerRecientes().filter((x) => x.id !== reg.id);
  lista.unshift(reg);
  lista = lista.slice(0, RECIENTES_MAX);
  if (_escribirRecientes(lista)) return reg;
  // Sin espacio: se guardan sin imágenes
  lista = lista.map((x) => ({ ...x, datos: _sinImagenes(x.datos) }));
  if (_escribirRecientes(lista)) return reg;
  _escribirRecientes(lista.slice(0, 3));
  return reg;
}
function recienteDeLaDireccion() {
  const m = /^#reciente-([A-Za-z0-9_-]+)$/.exec(location.hash || "");
  if (!m) return null;
  return leerRecientes().find((x) => x.id === m[1]) || null;
}
function borrarRecientes() { try { localStorage.removeItem(RECIENTES_CLAVE); } catch (e) { /* nada */ } }
/** Convierte un dataURL guardado en un Blob para volver a ponerlo en un campo de imagen. */
async function blobDeDataUrl(url) { return (await fetch(url)).blob(); }
