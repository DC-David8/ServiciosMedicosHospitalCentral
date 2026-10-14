/*
 * Rellenado rápido compartido por el motor de servicios y el parte de lesiones.
 *
 *   frasesHTML(destinoId, frases)   → botones de frases típicas para un campo de texto
 *   activarFrases(raiz)             → un clic añade la frase al campo (otro clic la quita)
 *   marcarFrases(raiz)              → resalta las frases que ya están en el texto
 *   casosHTML(casos)                → barra de «Casos frecuentes» (botones data-caso="i")
 *
 * En un <textarea> las frases se separan con un espacio (cada una termina en punto);
 * en un <input> se separan con coma, salvo data-modo="reemplazar", que sustituye el valor.
 */

function frasesHTML(destinoId, frases, modo = "") {
  const e = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (!frases || !frases.length) return "";
  return `<div class="frases" data-frases="${destinoId}"${modo ? ` data-modo="${modo}"` : ""} role="group" aria-label="Frases rápidas">
    ${frases.map((f) => `<button type="button" class="frase" data-frase="${e(f)}" aria-pressed="false">${e(f.replace(/\.$/, ""))}</button>`).join("")}
  </div>`;
}

function casosHTML(casos) {
  const e = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (!casos || !casos.length) return "";
  return `<section class="casos" aria-labelledby="casos-tit">
    <div class="casos-cab"><h2 id="casos-tit">Casos frecuentes</h2><p>Rellena el formulario con un caso típico; luego solo cambia lo que sea distinto. No toca los datos del paciente ni del facultativo.</p></div>
    <div class="casos-lista">${casos.map((c, i) => `<button type="button" class="caso" data-caso="${i}"${c.desc ? ` title="${e(c.desc)}"` : ""}><b>${e(c.nombre)}</b>${c.desc ? `<span>${e(c.desc)}</span>` : ""}</button>`).join("")}</div>
    <p class="casos-aviso ayuda" id="casos-aviso" aria-live="polite"></p>
  </section>`;
}

const _sinPunto = (t) => t.trim().replace(/[.,;]\s*$/, "");
function _contieneFrase(valor, frase) {
  return valor.toLowerCase().includes(_sinPunto(frase).toLowerCase());
}
function _alternarFrase(el, frase, modo) {
  const area = el.tagName === "TEXTAREA";
  let v = el.value.trim();
  if (modo === "reemplazar") { el.value = v === frase ? "" : frase; return; }
  if (_contieneFrase(v, frase)) {
    // Quitar la frase (con su separador)
    const base = _sinPunto(frase).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    v = v.replace(new RegExp(area ? `\\s*${base}\\.?` : `\\s*,?\\s*${base}`, "i"), "").replace(/^\s*,\s*/, "").replace(/\s{2,}/g, " ").trim();
    el.value = v;
    return;
  }
  if (area) {
    const f = /[.!?]$/.test(frase) ? frase : frase + ".";
    el.value = v ? `${/[.!?]$/.test(v) ? v : v + "."} ${f}` : f;
  } else {
    const f = _sinPunto(frase);
    el.value = v ? `${_sinPunto(v)}, ${v ? f.charAt(0).toLowerCase() + f.slice(1) : f}` : f;
  }
}
function marcarFrases(raiz) {
  raiz.querySelectorAll(".frases").forEach((g) => {
    const el = document.getElementById(g.dataset.frases); if (!el) return;
    g.querySelectorAll(".frase").forEach((b) => {
      const on = g.dataset.modo === "reemplazar" ? el.value.trim() === b.dataset.frase : _contieneFrase(el.value, b.dataset.frase);
      b.classList.toggle("activa", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });
}
function activarFrases(raiz) {
  raiz.addEventListener("click", (e) => {
    const b = e.target.closest(".frase"); if (!b) return;
    const g = b.closest(".frases"), el = document.getElementById(g.dataset.frases); if (!el) return;
    _alternarFrase(el, b.dataset.frase, g.dataset.modo);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    marcarFrases(raiz);
  });
  raiz.addEventListener("input", () => marcarFrases(raiz));
}
