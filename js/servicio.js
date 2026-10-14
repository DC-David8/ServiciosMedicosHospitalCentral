/*
 * Motor de servicios del Hospital Central.
 * Cada página de servicio carga un esquema (js/servicios/<id>.js) que define SERVICIO y este archivo
 * construye el formulario, la pestaña de protocolo, los mensajes /ems y los documentos.
 *
 * Tipos de campo: texto, area, fecha, fechahora, hora, numero, select, segmentos, chips, check,
 * imagen, calculado, zonas (hallazgos sobre la figura corporal) y equipo (personal de la operación).
 * Opciones comunes: id, etiqueta, req, ancho, valor (inicial: "hoy" / "ahora" para fechas), si(v),
 * placeholder, ayuda, unidad, opciones, enDoc:false, etiquetaDoc, doc:"titular".
 * Rellenado rápido (js/rapido.js): frases (lista o función (v) → lista) en texto y area, con
 * modoFrases:"reemplazar" para valores sueltos; select con otro:true (añade «Otro» con texto libre);
 * fechas "+30d" (hoy + 30 días); S.casos [{ nombre, desc, valores }] y S.conservar [ids que no toca un caso].
 */
(() => {
  const S = window.SERVICIO;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const OTRO = "__otro";
  const RECURSOS = window.RECURSOS || { logo: "assets/logo-ems.png", sello: "assets/sello-oficial.png" };
  const leerLS = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const guardarLS = (k, val) => { try { localStorage.setItem(k, JSON.stringify(val)); } catch (e) { /* sin almacenamiento */ } };
  const ahora = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const campos = () => S.secciones.flatMap((s) => s.campos.map((c) => ({ ...c, _sec: s.id })));
  const campo = (id) => campos().find((c) => c.id === id);

  const imagenes = {};      // id → dataURL
  const listas = {};        // id → array (zonas, equipo)
  let conclusionEditada = false;
  let docActual = S.documentos[0].id;
  let paginas = [];
  let datos = null;

  // ── Construcción del formulario ──
  const etiquetaHTML = (c) => `${esc(c.etiqueta)}${c.unidad ? ` <small>(${esc(c.unidad)})</small>` : ""}${!c.req && c.opcional ? " <small>(opcional)</small>" : ""}`;
  const slotFrases = (c) => (c.frases ? `<div class="frases-slot" data-slot="${c.id}"></div>` : "");
  const frasesDe = (c, v) => (typeof c.frases === "function" ? c.frases(v) : c.frases) || [];
  function htmlCampo(c) {
    const id = `f-${c.id}`, ayuda = c.ayuda ? `<p class="ayuda">${esc(c.ayuda)}</p>` : "";
    const ancho = c.ancho || ["area", "segmentos", "chips", "check", "imagen", "zonas", "equipo"].includes(c.tipo) ? " campo-ancho" : "";
    const attrs = `data-campo="${c.id}"`;
    switch (c.tipo) {
      case "texto": return `<div class="campo${ancho}" ${attrs}><label class="etiqueta" for="${id}">${etiquetaHTML(c)}</label><input id="${id}" autocomplete="off" placeholder="${esc(c.placeholder || "")}">${slotFrases(c)}${ayuda}</div>`;
      case "area": return `<div class="campo${ancho}" ${attrs}><label class="etiqueta" for="${id}">${etiquetaHTML(c)}</label><textarea id="${id}" rows="${c.filas || 3}" maxlength="${c.max || 700}" placeholder="${esc(c.placeholder || "")}"></textarea>${slotFrases(c)}${ayuda}</div>`;
      case "fecha": case "fechahora": case "hora": case "numero": {
        const tipo = { fecha: "date", fechahora: "datetime-local", hora: "time", numero: "number" }[c.tipo];
        const extra = c.tipo === "numero" ? ` inputmode="decimal" step="${c.paso || "any"}" ${c.min != null ? `min="${c.min}"` : ""} ${c.maxv != null ? `max="${c.maxv}"` : ""}` : "";
        return `<label class="campo${ancho}" ${attrs}><span class="etiqueta">${etiquetaHTML(c)}</span><input id="${id}" type="${tipo}"${extra} placeholder="${esc(c.placeholder || "")}">${ayuda}</label>`;
      }
      case "select": return `<div class="campo${ancho}" ${attrs}><label class="etiqueta" for="${id}">${etiquetaHTML(c)}</label><select id="${id}"${c.otro ? " data-otro" : ""}>${c.valor == null ? `<option value="" selected>${esc(c.placeholder || "Selecciona…")}</option>` : ""}${c.opciones.map((o) => `<option>${esc(o)}</option>`).join("")}${c.otro ? `<option value="${OTRO}">Otro (escribir)…</option>` : ""}</select>${c.otro ? `<input id="${id}-otro" class="otro-texto" autocomplete="off" placeholder="${esc(c.placeholderOtro || "Escríbelo")}" aria-label="${esc(c.etiqueta)} (escrito a mano)" hidden>` : ""}${ayuda}</div>`;
      case "segmentos": return `<div class="campo${ancho}" ${attrs}><span class="etiqueta" id="lbl-${id}">${etiquetaHTML(c)}</span>
        <div class="segmentos seg-texto" role="radiogroup" aria-labelledby="lbl-${id}" style="grid-template-columns:repeat(${Math.min(c.opciones.length, c.columnas || 4)},minmax(0,1fr))">
        ${c.opciones.map((o, i) => `<label><input type="radio" name="${c.id}" id="${id}-${i}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join("")}</div>${ayuda}</div>`;
      case "chips": return `<div class="campo${ancho}" ${attrs}><span class="etiqueta">${etiquetaHTML(c)}</span><div class="chips">
        ${c.opciones.map((o, i) => `<label><input type="checkbox" name="${c.id}" id="${id}-${i}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join("")}</div>${ayuda}</div>`;
      case "check": return `<div class="campo${ancho}" ${attrs}><label class="check"><input type="checkbox" id="${id}"> ${esc(c.etiqueta)}</label>${ayuda}</div>`;
      case "calculado": return `<div class="campo${ancho}" ${attrs}><span class="etiqueta">${etiquetaHTML(c)}</span><output id="${id}" class="dato-fijo">—</output></div>`;
      case "imagen": return `<div class="campo${ancho}" ${attrs}><span class="etiqueta">${etiquetaHTML(c)}</span>
        ${campoImagenHTML(id, c.id, c.etiqueta)}${ayuda}</div>`;
      case "zonas": return `<div class="campo${ancho}" ${attrs}><span class="etiqueta">${etiquetaHTML(c)}</span><div class="lista-lesiones" id="lista-${c.id}"></div>
        <div class="fila-accion"><button type="button" class="btn btn-sec btn-peq" data-anadir="${c.id}">+ Añadir hallazgo</button>${ayuda}</div></div>`;
      case "equipo": return `<div class="campo${ancho}" ${attrs}><span class="etiqueta">${etiquetaHTML(c)}</span><div class="lista-equipo" id="lista-${c.id}"></div>
        <div class="fila-accion"><button type="button" class="btn btn-sec btn-peq" data-anadir="${c.id}">+ Añadir miembro</button><p class="ayuda" id="val-${c.id}"></p></div></div>`;
      default: return "";
    }
  }

  function construir() {
    const opcCargo = `<option value="" disabled selected>Selecciona el cargo</option>${CARGOS.map((c) => `<option>${esc(c)}</option>`).join("")}<option value="${OTRO}">Otro (escribir a mano)</option>`;
    let html = S.secciones.map((s) => `
      <fieldset class="bloque" data-seccion="${s.id}"><legend>${esc(s.titulo)}</legend>
        ${s.ayuda ? `<p class="ayuda">${esc(s.ayuda)}</p>` : ""}
        <div class="rejilla">${s.campos.map(htmlCampo).join("")}</div>
      </fieldset>`).join("");
    if (S.resumen) html += `
      <fieldset class="bloque"><legend>${esc(S.tituloResumen || "Conclusión")}</legend>
        <div class="campo">
          <div class="titulo-fila"><span class="etiqueta">Texto del documento</span><button type="button" class="btn-texto" id="btn-regenerar">Volver al texto automático</button></div>
          <textarea id="f-conclusion" rows="6" maxlength="1400"></textarea>
          <p class="ayuda">Se redacta solo con los datos del formulario. Puedes editarlo.</p>
        </div>
      </fieldset>`;
    html += `
      <fieldset class="bloque"><legend>${esc(S.tituloFacultativo || "Facultativo responsable")}</legend>
        <div class="rejilla">
          <label class="campo"><span class="etiqueta">Nombre</span><input id="medico" autocomplete="off" placeholder="Nombre y apellidos"></label>
          <div class="campo"><label class="etiqueta" for="cargo-sel">Cargo</label><select id="cargo-sel">${opcCargo}</select>
            <input id="cargo" autocomplete="off" placeholder="Escribe el cargo" aria-label="Cargo (escrito a mano)" hidden></div>
          <label class="campo campo-ancho"><span class="etiqueta">Firma <small>(si la dejas vacía, se usa el nombre)</small></span><input id="firma" autocomplete="off" placeholder="Igual que el nombre"></label>
        </div>
      </fieldset>`;
    if (S.mensajes) html += `<div class="bloque mensajes"><h3 class="titulo-bloque">Mensajes para el rol</h3><div id="mensajes-form"></div></div>`;
    html += `<p class="error" id="error-form" role="alert" tabindex="-1" hidden></p>
      <div class="acciones"><button type="submit" class="btn btn-primario">${esc(S.textoGenerar || "Generar documento")}</button></div>`;
    $("#form-servicio").innerHTML = html;
  }

  // ── Listas dinámicas ──
  function opcionesZona(sel) {
    const g = { F: [], P: [] }; ZONAS.forEach((z) => g[z.v].push(z));
    return `<option value="" disabled ${sel ? "" : "selected"}>Zona</option>` +
      ["F", "P"].map((k) => `<optgroup label="${k === "F" ? "Vista frontal" : "Vista posterior"}">${g[k].map((z) => `<option value="${z.id}" ${z.id === sel ? "selected" : ""}>${esc(z.nombre)}</option>`).join("")}</optgroup>`).join("");
  }
  function pintarLista(id) {
    const c = campo(id), l = listas[id], cont = $(`#lista-${id}`);
    if (c.tipo === "zonas") {
      cont.innerHTML = l.map((z, i) => `
        <div class="lesion lesion-3${c.destacar ? " lesion-marca" : ""}${c.destacar && z.destacado ? " destacada" : ""}" data-lista="${id}" data-i="${i}">
          <span class="lesion-num">${i + 1}</span>
          <select data-k="zona" aria-label="Zona ${i + 1}">${opcionesZona(z.zona)}</select>
          <select data-k="tipo" aria-label="Hallazgo ${i + 1}"><option value="" disabled ${z.tipo ? "" : "selected"}>${esc(c.textoTipo || "Hallazgo")}</option>${c.tipos.map((t) => `<option ${t === z.tipo ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>
          <input data-k="desc" value="${esc(z.desc || "")}" placeholder="Descripción (opcional)" aria-label="Descripción ${i + 1}" maxlength="110">
          ${c.destacar ? `<label class="check lesion-destacar"><input type="checkbox" data-k="destacado" ${z.destacado ? "checked" : ""}> ${esc(c.destacar.etiqueta)}</label>` : ""}
          <button type="button" class="btn-quitar" aria-label="Quitar ${i + 1}" title="Quitar">✕</button>
        </div>`).join("");
    } else {
      const opc = (sel) => `<option value="" ${sel ? "" : "selected"} disabled>Cargo</option>${(c.cargos || CARGOS).map((x) => `<option ${x === sel ? "selected" : ""}>${esc(x)}</option>`).join("")}`;
      cont.innerHTML = l.map((m, i) => `
        <div class="miembro" data-lista="${id}" data-i="${i}">
          <input data-k="nombre" value="${esc(m.nombre || "")}" placeholder="Nombre" aria-label="Nombre del miembro ${i + 1}">
          <select data-k="cargo" aria-label="Cargo del miembro ${i + 1}">${opc(m.cargo)}</select>
          <label class="check"><input type="checkbox" data-k="sar" ${m.sar ? "checked" : ""}> Especialista SAR</label>
          <label class="check"><input type="checkbox" data-k="piloto" ${m.piloto ? "checked" : ""}> Piloto</label>
          <button type="button" class="btn-quitar" aria-label="Quitar miembro ${i + 1}" title="Quitar">✕</button>
        </div>`).join("");
    }
    const b = document.querySelector(`[data-anadir="${id}"]`); if (b) b.disabled = l.length >= (c.maximo || 8);
  }

  // ── Lectura y escritura de valores ──
  function leer() {
    const v = {};
    campos().forEach((c) => {
      const el = $(`#f-${c.id}`);
      switch (c.tipo) {
        case "segmentos": v[c.id] = ($(`input[name="${c.id}"]:checked`) || {}).value || ""; break;
        case "chips": v[c.id] = $$(`input[name="${c.id}"]:checked`).map((i) => i.value); break;
        case "check": v[c.id] = !!(el && el.checked); break;
        case "imagen": v[c.id] = imagenes[c.id] || ""; break;
        case "zonas": case "equipo": v[c.id] = (listas[c.id] || []).map((x) => ({ ...x })); break;
        case "calculado": break;
        case "select": v[c.id] = !el ? "" : el.value === OTRO ? ($(`#f-${c.id}-otro`).value || "").trim() : el.value; break;
        default: v[c.id] = el ? el.value.trim() : "";
      }
    });
    v.conclusion = $("#f-conclusion") ? $("#f-conclusion").value.trim() : "";
    return v;
  }
  function escribir(id, val) {
    const c = campo(id); if (!c) return;
    const el = $(`#f-${c.id}`);
    switch (c.tipo) {
      case "segmentos": $$(`input[name="${c.id}"]`).forEach((r) => (r.checked = r.value === val)); break;
      case "chips": $$(`input[name="${c.id}"]`).forEach((r) => (r.checked = (val || []).includes(r.value))); break;
      case "check": el.checked = !!val; break;
      case "zonas": case "equipo": listas[c.id] = (val || []).map((x) => ({ ...x })); pintarLista(c.id); break;
      case "imagen": case "calculado": break;
      case "select":
        if (!el) break;
        if (c.otro) {
          const libre = !!val && !c.opciones.includes(val);
          el.value = libre ? OTRO : (val ?? (c.valor == null ? "" : c.valor));
          if (el.selectedIndex < 0) el.value = "";
          const o = $(`#f-${c.id}-otro`); o.value = libre ? val : ""; o.hidden = !libre;
        } else el.value = val ?? "";
        break;
      case "fecha":
        if (el && /^\+\d+d$/.test(val || "")) { const d = new Date(); d.setDate(d.getDate() + Number(val.slice(1, -1))); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); el.value = d.toISOString().slice(0, 10); break; }
        // falls through
      default: if (el) el.value = val === "hoy" ? ahora().slice(0, 10) : val === "ahora" ? (c.tipo === "hora" ? ahora().slice(11, 16) : ahora()) : (val ?? "");
    }
  }
  function valoresIniciales() {
    campos().forEach((c) => {
      if (c.tipo === "zonas" || c.tipo === "equipo") { listas[c.id] = []; pintarLista(c.id); }
      if (c.valor !== undefined) escribir(c.id, c.valor);
    });
  }

  // ── Actualización en vivo ──
  function actualizar() {
    const v = leer();
    S.secciones.forEach((s) => {
      const fs = document.querySelector(`[data-seccion="${s.id}"]`);
      if (fs) fs.hidden = !!(s.si && !s.si(v));
      s.campos.forEach((c) => {
        const w = document.querySelector(`[data-campo="${c.id}"]`);
        if (w) w.hidden = !!(c.si && !c.si(v));
        if (c.tipo === "calculado") { const o = $(`#f-${c.id}`); if (o) o.textContent = c.calc(v) || "—"; }
        if (c.tipo === "equipo" && c.validar) {
          const r = c.validar(v[c.id], v); const p = $(`#val-${c.id}`);
          if (p) { p.textContent = r.mensaje; p.style.color = r.ok ? "var(--ok)" : "var(--warn)"; }
        }
      });
    });
    // Frases rápidas (pueden depender de otros campos)
    campos().filter((c) => c.frases).forEach((c) => {
      const slot = document.querySelector(`[data-slot="${c.id}"]`); if (!slot) return;
      const lista = frasesDe(c, v), clave = lista.join("|");
      if (slot.dataset.clave !== clave) { slot.dataset.clave = clave; slot.innerHTML = frasesHTML(`f-${c.id}`, lista, c.modoFrases || ""); }
    });
    marcarFrases($("#form-servicio"));
    if (S.resumen && !conclusionEditada) $("#f-conclusion").value = S.resumen(v);
    if (S.mensajes) pintarMensajes($("#mensajes-form"), S.mensajes(v));
  }

  function pintarMensajes(el, lista) {
    if (!el) return;
    el.innerHTML = lista.map((m) => `
      <div class="mensaje"><span class="etiqueta">${esc(m.etiqueta)}</span>
        <div class="mensaje-fila"><code>${esc(m.texto)}</code><button type="button" class="pc-copiar" data-texto="${esc(m.texto)}">Copiar</button></div></div>`).join("");
  }

  // ── Facultativo ──
  function iniciarFacultativo() {
    const ev = leerLS("psico-evaluador");
    if (ev) {
      $("#medico").value = ev.evaluador || ""; $("#firma").value = ev.firma || "";
      if (CARGOS.includes(ev.cargo)) $("#cargo-sel").value = ev.cargo;
      else if (ev.cargo) { $("#cargo-sel").value = OTRO; $("#cargo").value = ev.cargo; }
    }
    $("#cargo").hidden = $("#cargo-sel").value !== OTRO;
  }
  const valorCargo = () => ($("#cargo-sel").value === OTRO ? $("#cargo").value.trim() : $("#cargo-sel").value || "");

  // ── Generar documento ──
  async function generar(e) {
    e && e.preventDefault();
    const v = leer();
    const faltan = campos().filter((c) => c.req && (!c.si || c.si(v)) && (Array.isArray(v[c.id]) ? !v[c.id].length : !v[c.id]));
    $$("[aria-invalid]").forEach((x) => x.removeAttribute("aria-invalid"));
    faltan.forEach((c) => { const el = $(`#f-${c.id}`) || document.querySelector(`[data-campo="${c.id}"]`); el && el.setAttribute("aria-invalid", "true"); });
    if (!$("#medico").value.trim()) $("#medico").setAttribute("aria-invalid", "true");
    if (!valorCargo()) $("#cargo-sel").setAttribute("aria-invalid", "true");
    const extra = S.validar ? S.validar(v) : "";
    if (faltan.length || !$("#medico").value.trim() || !valorCargo() || extra) {
      const msg = faltan.length || !$("#medico").value.trim() || !valorCargo()
        ? `Completa los campos marcados en rojo${faltan.length ? `: ${faltan.slice(0, 4).map((c) => c.etiqueta.toLowerCase()).join(", ")}${faltan.length > 4 ? "…" : ""}` : ""}.`
        : extra;
      $("#error-form").textContent = msg; $("#error-form").hidden = false; $("#error-form").focus(); return;
    }
    $("#error-form").hidden = true;
    guardarLS("psico-evaluador", { ...(leerLS("psico-evaluador") || {}), evaluador: $("#medico").value.trim(), cargo: valorCargo(), firma: $("#firma").value.trim() });
    const fecha = v[S.campoFecha] || ahora();
    const clave = `${v[S.campoNombre] || ""}|${fecha}`;
    datos = {
      ...v,
      _clave: clave,
      _numeros: datos && datos._clave === clave ? datos._numeros : {},
      _emision: String(fecha).slice(0, 10),
      _medico: $("#medico").value.trim(), _cargo: valorCargo(), _firma: $("#firma").value.trim() || $("#medico").value.trim(),
    };
    S.documentos.forEach((d) => { if (!datos._numeros[d.id]) datos._numeros[d.id] = numeroDocumento(d.prefijo, fecha, v[S.campoNombre]); });
    irA("doc");
    await pintarDocumento();
    // Documentos recientes (Home): se guarda todo para poder reabrirlo
    const d0 = S.documentos[0];
    guardarReciente({ id: datos._numeros[d0.id], servicio: S.id, titulo: S.nombre, nombre: v[S.campoNombre] || "", numero: datos._numeros[d0.id],
      href: location.pathname.split("/").pop() || `${S.id}.html`, datos: { ...datos, conclusionEditada } });
  }

  async function pintarDocumento() {
    const d = S.documentos.find((x) => x.id === docActual);
    $("#aviso-descarga").hidden = true;
    try {
      paginas = await dibujarServicio(S, d, { ...datos, _numero: datos._numeros[d.id] }, RECURSOS);
      const cont = $("#hojas"); cont.innerHTML = "";
      paginas.forEach((c, i) => { c.setAttribute("aria-label", `${d.titulo}, página ${i + 1}`); const h = document.createElement("div"); h.className = "hoja"; h.appendChild(c); cont.appendChild(h); });
      $("#info-paginas").textContent = paginas.length > 1 ? `${paginas.length} páginas. El PNG las une en una sola imagen; el PDF las mantiene separadas.` : "";
    } catch (err) {
      console.error(err);
      $("#aviso-descarga").textContent = "No se pudo dibujar el documento. Comprueba que la carpeta assets está junto a la página.";
      $("#aviso-descarga").hidden = false;
    }
    if (S.mensajes) pintarMensajes($("#mensajes-doc"), S.mensajes(datos));
  }

  function irA(vista) {
    $("#vista-form").hidden = vista !== "form";
    $("#vista-doc").hidden = vista !== "doc";
    $("#vista-protocolo").hidden = vista !== "protocolo";
    $$(".pestanas button").forEach((b) => b.classList.toggle("activo", (b.dataset.tab === "protocolo") === (vista === "protocolo")));
    window.scrollTo(0, 0);
  }

  const nombreArchivo = () => {
    const d = S.documentos.find((x) => x.id === docActual);
    return `${d.archivo || d.prefijo}_${String(datos[S.campoNombre] || "").replace(/\s+/g, "_").replace(/[^\w\-áéíóúñÁÉÍÓÚÑ]/g, "")}_${datos._numeros[d.id]}`;
  };
  function descargar(blob, nombre) {
    descargarArchivo(blob, nombre);
    if (enVistaPrevia()) { $("#aviso-descarga").textContent = "Esta vista previa no permite descargar archivos. En la web del hospital las descargas funcionan con normalidad."; $("#aviso-descarga").hidden = false; }
  }

  // ── Arranque ──
  document.title = `${S.nombre} · Hospital Central`;
  $("#cab-org").textContent = S.org;
  $("#cab-titulo").textContent = S.nombre;
  $("#intro").innerHTML = S.intro;
  construir();
  valoresIniciales();
  iniciarFacultativo();
  if (S.protocolo && PROTOCOLOS[S.protocolo]) pintarProtocolo($("#protocolo"), PROTOCOLOS[S.protocolo]);
  else $("#tab-protocolo").hidden = true;
  if (S.documentos.length > 1) {
    $("#selector-doc").hidden = false;
    $("#selector-doc .segmentos").innerHTML = S.documentos.map((d, i) => `<label><input type="radio" name="docsel" value="${d.id}" ${i ? "" : "checked"}><span>${esc(d.nombre)}</span></label>`).join("");
    $("#selector-doc .segmentos").style.gridTemplateColumns = `repeat(${S.documentos.length},minmax(0,1fr))`;
    $$('input[name="docsel"]').forEach((r) => r.addEventListener("change", () => { docActual = r.value; pintarDocumento(); }));
  }
  if (!S.mensajes) $("#mensajes-doc-bloque").hidden = true;
  actualizar();

  $("#form-servicio").addEventListener("input", (e) => {
    e.target.removeAttribute("aria-invalid");
    const fila = e.target.closest("[data-lista]");
    if (fila) { const l = listas[fila.dataset.lista][Number(fila.dataset.i)]; const k = e.target.dataset.k; l[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; }
    if (e.target.id === "f-conclusion") { conclusionEditada = true; return; }
    actualizar();
  });
  $("#form-servicio").addEventListener("change", (e) => {
    const fila = e.target.closest("[data-lista]");
    if (fila) { const l = listas[fila.dataset.lista][Number(fila.dataset.i)]; const k = e.target.dataset.k; l[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; if (k === "destacado") fila.classList.toggle("destacada", e.target.checked); }
    if (e.target.matches("select[data-otro]")) {
      const o = $(`#${e.target.id}-otro`); o.hidden = e.target.value !== OTRO;
      if (!o.hidden) o.focus();
    }
    if (e.target.id === "cargo-sel") { $("#cargo").hidden = e.target.value !== OTRO; if (!$("#cargo").hidden) $("#cargo").focus(); }
    actualizar();
  });
  $("#form-servicio").addEventListener("click", (e) => {
    const add = e.target.closest("[data-anadir]");
    if (add) { const id = add.dataset.anadir; listas[id].push(campo(id).tipo === "zonas" ? { zona: "", tipo: "", desc: "", destacado: false } : { nombre: "", cargo: "", sar: false, piloto: false }); pintarLista(id); actualizar(); return; }
    const q = e.target.closest(".btn-quitar");
    if (q) { const f = q.closest("[data-lista]"); listas[f.dataset.lista].splice(Number(f.dataset.i), 1); pintarLista(f.dataset.lista); actualizar(); return; }
    if (e.target.closest("[data-imagen], [data-pegar], [data-quitar-imagen]")) return; // campos de imagen (pegar-imagen.js)
    if (e.target.id === "btn-regenerar") { conclusionEditada = false; actualizar(); return; }
    const cp = e.target.closest(".pc-copiar"); if (cp) copiarTexto(cp.dataset.texto, cp);
  });
  $("#form-servicio").addEventListener("submit", generar);
  const fotos = activarImagenes({
    raiz: $("#form-servicio"), valores: imagenes,
    activo: () => !$("#vista-form").hidden,
    claves: () => campos().filter((c) => c.tipo === "imagen" && !document.querySelector(`[data-campo="${c.id}"]`).hidden).map((c) => c.id),
  });
  $("#mensajes-doc").addEventListener("click", (e) => { const cp = e.target.closest(".pc-copiar"); if (cp) copiarTexto(cp.dataset.texto, cp); });
  // ── Casos frecuentes ──
  if (S.casos && S.casos.length) {
    $(".intro-parte").insertAdjacentHTML("afterend", casosHTML(S.casos));
    $(".casos").addEventListener("click", (e) => {
      const b = e.target.closest("[data-caso]"); if (!b) return;
      const caso = S.casos[Number(b.dataset.caso)];
      const conservar = new Set(S.conservar || []);
      // Vacía (o vuelve al valor inicial) todo lo que no se conserva y aplica el caso
      campos().forEach((c) => {
        if (conservar.has(c.id) || c.tipo === "imagen" || c.tipo === "calculado") return;
        const ini = c.valor !== undefined ? c.valor : c.tipo === "chips" || c.tipo === "zonas" || c.tipo === "equipo" ? [] : c.tipo === "check" ? false : "";
        escribir(c.id, ini);
      });
      Object.entries(caso.valores).forEach(([k, val]) => escribir(k, val));
      conclusionEditada = false; $$("[aria-invalid]").forEach((x) => x.removeAttribute("aria-invalid")); $("#error-form").hidden = true;
      $$(".caso").forEach((x) => x.classList.toggle("activo", x === b));
      $("#casos-aviso").textContent = `Aplicado: ${caso.nombre}. Revisa y cambia lo que sea distinto${caso.falta ? ` (${caso.falta})` : ""}.`;
      actualizar();
    });
  }
  activarFrases($("#form-servicio"));

  $("#btn-ejemplo").addEventListener("click", () => {
    Object.entries(S.ejemplo || {}).forEach(([k, val]) => escribir(k, val));
    conclusionEditada = false; $$("[aria-invalid]").forEach((x) => x.removeAttribute("aria-invalid")); $("#error-form").hidden = true;
    actualizar();
  });
  $("#btn-png").addEventListener("click", () => descargar(lienzoAPng(unirPaginas(paginas)), nombreArchivo() + ".png"));
  $("#btn-pdf").addEventListener("click", () => {
    const d = S.documentos.find((x) => x.id === docActual);
    descargar(crearPdfDesdeCanvases(paginas, 612, 1008, `${d.titulo} · ${datos[S.campoNombre] || ""}`), nombreArchivo() + ".pdf");
  });
  $("#btn-editar").addEventListener("click", () => irA("form"));
  $("#btn-nuevo").addEventListener("click", () => {
    $("#form-servicio").reset();
    fotos.quitarTodas();
    $$(".otro-texto").forEach((o) => { o.value = ""; o.hidden = true; });
    $$(".caso").forEach((x) => x.classList.remove("activo")); if ($("#casos-aviso")) $("#casos-aviso").textContent = "";
    conclusionEditada = false; datos = null;
    valoresIniciales(); iniciarFacultativo(); actualizar(); irA("form");
  });
  $$(".pestanas button").forEach((b) => b.addEventListener("click", () => {
    irA(b.dataset.tab === "protocolo" ? "protocolo" : "form");
  }));
  if (location.hash === "#protocolo" && S.protocolo) irA("protocolo");
  // ── Reabrir un documento reciente (desde el Home: <servicio>.html#reciente-<id>) ──
  const rec = recienteDeLaDireccion();
  if (rec && rec.datos && rec.servicio === S.id) {
    const d = rec.datos;
    campos().forEach((c) => {
      if (c.tipo === "imagen") { if (d[c.id]) blobDeDataUrl(d[c.id]).then((b) => fotos.asignar(c.id, b, "Imagen del documento guardado")).catch(() => {}); }
      else if (c.tipo !== "calculado" && d[c.id] !== undefined) escribir(c.id, d[c.id]);
    });
    datos = { ...d }; delete datos.conclusionEditada; // conserva el número del documento
    actualizar();
    if (d.conclusionEditada && d.conclusion) { conclusionEditada = true; $("#f-conclusion").value = d.conclusion; }
    $(".intro-parte").insertAdjacentHTML("afterend", `<p class="aviso-reciente" role="status">Reabierto: <b>${esc(rec.nombre || rec.titulo)}</b> · ${esc(rec.numero || "")}. Cambia lo que necesites y vuelve a generarlo; se mantiene el mismo número.</p>`);
    history.replaceState(null, "", location.pathname);
  }
})();
