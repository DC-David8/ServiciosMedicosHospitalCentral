/*
 * Campos de imagen compartidos: elegir archivo, pegar un recorte (Ctrl + V,
 * p. ej. el DNI capturado con Win + Shift + S), botón «Pegar del portapapeles»
 * (útil en iPhone) o arrastrar una imagen.
 *
 *   campoImagenHTML(domId, clave, etiqueta)  → HTML del recuadro y sus botones
 *   activarImagenes({ raiz, activo, claves, alCambiar }) → { valores, asignar, quitar, quitarTodas }
 *
 * domId es el id del <input type="file">; el resto de elementos usan domId + sufijo
 * (-zona, -vista, -txt, -quitar, -nombre). clave es el nombre del dato.
 */

function campoImagenHTML(domId, clave, etiqueta) {
  const e = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  return `<div class="pegar" id="${domId}-zona" data-imagen="${clave}" data-dom="${domId}" tabindex="0" role="button" aria-label="${e(etiqueta)}: pega aquí el recorte con Ctrl + V o arrastra una imagen">
      <img class="pegar-vista" id="${domId}-vista" alt="Imagen adjunta" hidden>
      <span class="pegar-txt" id="${domId}-txt"><b>Pega aquí el recorte</b><span>Haz clic en este recuadro y pulsa <kbd>Ctrl</kbd> + <kbd>V</kbd> (recorte con <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>) o arrastra una imagen</span></span>
    </div>
    <div class="subir">
      <label class="btn btn-sec btn-peq subir-btn"><input type="file" accept="image/*" id="${domId}" data-imagen-archivo="${clave}" hidden>Elegir archivo</label>
      <button type="button" class="btn btn-sec btn-peq" data-pegar="${clave}">Pegar del portapapeles</button>
      <button type="button" class="btn-texto" data-quitar-imagen="${clave}" id="${domId}-quitar" hidden>Quitar imagen</button>
      <span class="ayuda subir-nombre" id="${domId}-nombre" aria-live="polite"></span>
    </div>`;
}

/*
 * raiz:      elemento que contiene los campos (formulario).
 * activo():  true si el formulario está a la vista (para atender Ctrl + V en la página).
 * claves():  claves de los campos de imagen visibles, en orden.
 * alCambiar(clave, dataURL | null): aviso tras asignar o quitar.
 * valores:  objeto donde se guardan las imágenes (clave → dataURL); opcional.
 */
function activarImagenes({ raiz, activo = () => true, claves, alCambiar = () => {}, valores = {} }) {
  let ultima = null; // último recuadro usado
  const zonaDe = (clave) => raiz.querySelector(`[data-imagen="${clave}"]`);
  const el = (clave, suf) => { const z = zonaDe(clave); return z ? document.getElementById(z.dataset.dom + suf) : null; };

  function aviso(clave, texto, ok) {
    const n = el(clave, "-nombre"); if (!n) return;
    n.textContent = texto; n.style.color = ok ? "var(--ok)" : texto ? "var(--warn)" : "";
  }
  function asignar(clave, blob, origen) {
    if (!blob || !/^image\//.test(blob.type || "")) { aviso(clave, "Eso no es una imagen. Copia un recorte o elige un archivo de imagen."); return; }
    const lector = new FileReader();
    lector.onload = () => {
      valores[clave] = lector.result;
      const v = el(clave, "-vista"); v.src = lector.result; v.hidden = false;
      el(clave, "-txt").hidden = true; el(clave, "-quitar").hidden = false;
      zonaDe(clave).classList.add("con-imagen");
      aviso(clave, origen, true);
      alCambiar(clave, lector.result);
    };
    lector.readAsDataURL(blob);
  }
  function quitar(clave) {
    const z = zonaDe(clave); if (!z) return;
    delete valores[clave];
    document.getElementById(z.dataset.dom).value = "";
    const v = el(clave, "-vista"); v.hidden = true; v.removeAttribute("src");
    el(clave, "-txt").hidden = false; el(clave, "-quitar").hidden = true;
    z.classList.remove("con-imagen"); aviso(clave, "");
    alCambiar(clave, null);
  }
  const imagenDe = (dt) => {
    if (!dt) return null;
    for (const it of dt.items || []) if (it.kind === "file" && it.type.startsWith("image/")) return it.getAsFile();
    for (const f of dt.files || []) if (f.type.startsWith("image/")) return f;
    return null;
  };
  // Destino de un recorte pegado: el recuadro enfocado, el último usado o el primero visible (vacío si hay)
  function destino(target) {
    const z = target && target.closest && target.closest("[data-imagen]");
    if (z) return z.dataset.imagen;
    const vis = claves();
    if (ultima && vis.includes(ultima)) return ultima;
    return vis.find((c) => !valores[c]) || vis[0] || null;
  }
  async function pegarPortapapeles(clave) {
    try {
      for (const it of await navigator.clipboard.read()) {
        const tipo = it.types.find((t) => t.startsWith("image/"));
        if (tipo) { asignar(clave, await it.getType(tipo), "Recorte pegado"); return; }
      }
      aviso(clave, "No hay ninguna imagen en el portapapeles. Haz el recorte con Win + Shift + S y vuelve a intentarlo.");
    } catch (err) {
      aviso(clave, "El navegador no dejó leer el portapapeles. Haz clic en el recuadro y pulsa Ctrl + V.");
      zonaDe(clave).focus();
    }
  }

  raiz.addEventListener("change", (e) => {
    const clave = e.target.dataset && e.target.dataset.imagenArchivo; if (!clave) return;
    const f = e.target.files[0]; if (f) asignar(clave, f, f.name);
  });
  raiz.addEventListener("click", (e) => {
    const q = e.target.closest("[data-quitar-imagen]"); if (q) { quitar(q.dataset.quitarImagen); return; }
    const p = e.target.closest("[data-pegar]"); if (p) { ultima = p.dataset.pegar; pegarPortapapeles(ultima); return; }
    const z = e.target.closest("[data-imagen]"); if (z) { ultima = z.dataset.imagen; z.focus(); }
  });
  raiz.addEventListener("focusin", (e) => { const z = e.target.closest("[data-imagen]"); if (z) ultima = z.dataset.imagen; });
  raiz.addEventListener("keydown", (e) => {
    const z = e.target.closest("[data-imagen]");
    if (z && (e.key === "Delete" || e.key === "Backspace") && valores[z.dataset.imagen]) { e.preventDefault(); quitar(z.dataset.imagen); }
  });
  ["dragenter", "dragover"].forEach((t) => raiz.addEventListener(t, (e) => {
    const z = e.target.closest("[data-imagen]"); if (!z) return;
    e.preventDefault(); z.classList.add("arrastrando");
  }));
  ["dragleave", "drop"].forEach((t) => raiz.addEventListener(t, (e) => {
    const z = e.target.closest("[data-imagen]"); if (!z) return;
    z.classList.remove("arrastrando");
    if (t === "drop") { e.preventDefault(); const f = imagenDe(e.dataTransfer); if (f) asignar(z.dataset.imagen, f, f.name || "Imagen arrastrada"); }
  }));
  // Ctrl + V en cualquier parte de la página: si es una imagen, va al campo de imagen; el texto se pega como siempre
  document.addEventListener("paste", (e) => {
    if (!activo()) return;
    const img = imagenDe(e.clipboardData); if (!img) return;
    const clave = destino(e.target); if (!clave) return;
    e.preventDefault();
    asignar(clave, img, "Recorte pegado");
  });

  return { valores, asignar, quitar, quitarTodas: () => Object.keys(valores).forEach(quitar) };
}
