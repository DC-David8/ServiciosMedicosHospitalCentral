/*
 * Datos y utilidades compartidas por las herramientas del Hospital Central
 * (psicotécnico y parte médico de lesiones).
 */

// Cargos del Hospital Central, de mayor a menor
const CARGOS = ["Director/a General", "Sub-director/a General", "Supervisor/a", "Médico/a Residente", "Cirujano/a", "Doctor/a", "Enfermero/a", "Auxiliar", "Celador/a", "En prácticas"];

// ¿Se está usando como app de inicio (iPhone/Android)?
const esAppInstalada = () =>
  window.navigator.standalone === true || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

// Convierte el lienzo a PNG de forma inmediata (sin esperar), para no perder el permiso del toque en iPhone
function lienzoAPng(canvas) {
  const bin = atob(canvas.toDataURL("image/png").split(",")[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: "image/png" });
}

/**
 * Entrega un archivo al usuario. En la app de inicio del iPhone una descarga normal abre el
 * archivo sin botón para volver, así que se usa el menú Compartir (Guardar en Archivos, Fotos…).
 */
function descargarArchivo(blob, nombre) {
  if (esAppInstalada() && navigator.canShare) {
    const archivo = new File([blob], nombre, { type: blob.type });
    if (navigator.canShare({ files: [archivo] })) {
      navigator.share({ files: [archivo], title: nombre }).catch(() => { /* el usuario cerró el menú */ });
      return "compartido";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "descargado";
}

// ¿La página está dentro de una vista previa (un marco) donde las descargas están bloqueadas?
const enVistaPrevia = () => {
  if (window.MODO_VISTA_PREVIA) return true;
  try { return window.self !== window.top; } catch (e) { return true; }
};

/** Edad en años en una fecha de referencia (ISO). Devuelve "" si no se puede calcular. */
function edadEn(nacimiento, referencia) {
  if (!nacimiento) return "";
  const a = new Date(nacimiento), b = referencia ? new Date(referencia) : new Date();
  let e = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) e--;
  return e >= 0 && e < 130 ? `${e} años` : "";
}

/** Une una lista en español: "a, b y c". */
const unirEs = (arr) => (arr.length <= 1 ? arr.join("") : `${arr.slice(0, -1).join(", ")} y ${arr[arr.length - 1]}`);
