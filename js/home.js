/*
 * Home · Centro de servicios del Hospital Central.
 * Baldosas de servicio (js/servicios.js), buscador, turno, documentos recientes (js/recientes.js),
 * ficha del facultativo (la misma que usan todos los servicios) y comandos /ems de los protocolos.
 */
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const leerLS = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const guardarLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const sinTildes = (t) => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const dos = (n) => String(n).padStart(2, "0");
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OTRO = "__otro";
  const servicios = SERVICIOS_HOSPITAL.filter((s) => s.estado === "activo");

  // ── Baldosas ──
  $("#h-baldosas").innerHTML = servicios.map((s) => `
    <a class="h-baldosa" href="${esc(s.href)}" style="--c:${esc(s.color || "#334")}" data-id="${esc(s.id)}" data-claves="${esc(sinTildes(`${s.nombre} ${s.corto || ""} ${s.desc} ${s.documento} ${s.claves || ""}`))}">
      <span class="h-area">${esc(s.areaCorta || "")}</span>
      <img src="${esc(s.icono)}" alt="" width="52" height="52">
      <span class="h-txt"><b>${esc(s.corto || s.nombre)}</b><span>${esc(s.desc)}</span></span>
    </a>`).join("");

  // ── Buscador ──
  const buscar = $("#h-buscar");
  function filtrar() {
    const q = sinTildes(buscar.value.trim());
    let n = 0;
    document.querySelectorAll(".h-baldosa").forEach((b) => {
      const ok = !q || q.split(/\s+/).every((p) => b.dataset.claves.includes(p));
      b.classList.toggle("apagada", !ok); if (ok) n++;
    });
    $("#h-buscar-info").textContent = !q ? "" : n === 1 ? "1 servicio · Pulsa Intro para abrirlo." : n ? `${n} servicios · Pulsa Intro para abrir el primero.` : "Ningún servicio coincide. Prueba con otra palabra.";
  }
  buscar.addEventListener("input", filtrar);
  buscar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const b = document.querySelector(".h-baldosa:not(.apagada)"); if (b && buscar.value.trim()) location.href = b.getAttribute("href"); }
    if (e.key === "Escape") { buscar.value = ""; filtrar(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); buscar.focus(); }
  });

  // ── Reloj, saludo y turno ──
  const ficha = () => leerLS("psico-evaluador") || {};
  function saludo() {
    const h = new Date().getHours();
    const s = h < 6 ? "Buenas noches" : h < 13 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches";
    const nombre = (ficha().evaluador || "").trim();
    $("#h-saludo").textContent = nombre ? `${s}, ${nombre}` : s;
  }
  function turno() {
    const ini = leerLS("hc-turno");
    const b = $("#h-turno");
    b.classList.toggle("fuera", !ini);
    if (!ini) { b.textContent = "Entrar de servicio"; b.setAttribute("aria-pressed", "false"); return; }
    const t = Math.max(0, Math.floor((Date.now() - ini) / 1000));
    b.innerHTML = `En servicio · <span>${dos(Math.floor(t / 3600))}:${dos(Math.floor(t / 60) % 60)}:${dos(t % 60)}</span>`;
    b.setAttribute("aria-pressed", "true");
  }
  function tic() {
    const d = new Date();
    $("#h-reloj").textContent = `${dos(d.getHours())}:${dos(d.getMinutes())}`;
    turno();
  }
  $("#h-turno").addEventListener("click", () => {
    const ini = leerLS("hc-turno");
    if (ini) {
      const min = Math.round((Date.now() - ini) / 60000);
      try { localStorage.removeItem("hc-turno"); } catch (e) { /* nada */ }
      $("#h-buscar-info").textContent = `Turno terminado: ${Math.floor(min / 60)} h ${min % 60} min de servicio.`;
    } else guardarLS("hc-turno", Date.now());
    turno();
  });
  saludo(); tic(); setInterval(tic, 1000);

  // ── Documentos recientes ──
  const colorDe = (id) => (servicios.find((s) => s.id === id) || {}).color || "#667";
  const cuando = (iso) => {
    const d = new Date(iso), hoy = new Date(), ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
    const hora = `${dos(d.getHours())}:${dos(d.getMinutes())}`;
    if (d.toDateString() === hoy.toDateString()) return `Hoy ${hora}`;
    if (d.toDateString() === ayer.toDateString()) return `Ayer ${hora}`;
    return `${dos(d.getDate())}/${dos(d.getMonth() + 1)} ${hora}`;
  };
  function pintarRecientes() {
    const l = leerRecientes();
    $("#h-rec-borrar").hidden = !l.length;
    $("#h-recientes").innerHTML = l.length ? l.map((r) => `
      <div class="h-reciente" style="--c:${esc(colorDe(r.servicio))}">
        <i aria-hidden="true"></i>
        <div><b>${esc(r.titulo)} · ${esc(r.nombre || "—")}</b><span>${esc(cuando(r.fecha))}${r.numero ? ` · ${esc(r.numero)}` : ""}</span></div>
        <a class="h-btn-mini" href="${esc(r.href)}${r.datos ? `#reciente-${esc(r.id)}` : ""}">${r.datos ? "Abrir" : "Ir"}</a>
      </div>`).join("")
      : `<p class="h-vacio">Aún no has generado documentos en este navegador. Los que generes aparecerán aquí para reabrirlos con sus datos.</p>`;
  }
  $("#h-rec-borrar").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (b.dataset.confirmar) { borrarRecientes(); delete b.dataset.confirmar; b.textContent = "Borrar"; pintarRecientes(); return; }
    b.dataset.confirmar = "1"; b.textContent = "¿Borrar todo? Pulsa otra vez";
    setTimeout(() => { if (b.dataset.confirmar) { delete b.dataset.confirmar; b.textContent = "Borrar"; } }, 4000);
  });
  pintarRecientes();
  window.addEventListener("storage", (e) => { if (e.key === RECIENTES_CLAVE) pintarRecientes(); if (e.key === "psico-evaluador") { pintarFicha(); saludo(); } });

  // ── Ficha del facultativo ──
  function pintarFicha() {
    const f = ficha();
    $("#h-ficha-ver").innerHTML = f.evaluador
      ? `<div class="h-firma">${esc(f.firma || f.evaluador)}</div><b>${esc(f.evaluador)}</b><span>${esc(f.cargo || "Sin cargo")}</span>`
      : `<p class="h-vacio">Pon tu nombre, cargo y firma una vez y saldrán en todos los documentos.</p>`;
    $("#h-ficha-editar").textContent = f.evaluador ? "Editar" : "Configurar";
    document.querySelector(".h-nota").hidden = !f.evaluador;
  }
  $("#hf-cargo").innerHTML = `<option value="">Selecciona el cargo</option>${CARGOS.map((c) => `<option>${esc(c)}</option>`).join("")}<option value="${OTRO}">Otro (escribir)…</option>`;
  $("#hf-cargo").addEventListener("change", () => { $("#hf-cargo-otro").hidden = $("#hf-cargo").value !== OTRO; if (!$("#hf-cargo-otro").hidden) $("#hf-cargo-otro").focus(); });
  function abrirFicha(abrir) {
    $("#h-ficha-form").hidden = !abrir; $("#h-ficha-ver").hidden = abrir; $("#h-ficha-editar").hidden = abrir;
    if (!abrir) return;
    const f = ficha();
    $("#hf-nombre").value = f.evaluador || ""; $("#hf-firma").value = f.firma || "";
    const conocido = !f.cargo || CARGOS.includes(f.cargo);
    $("#hf-cargo").value = conocido ? (f.cargo || "") : OTRO;
    $("#hf-cargo-otro").value = conocido ? "" : f.cargo; $("#hf-cargo-otro").hidden = conocido;
    $("#hf-nombre").focus();
  }
  $("#h-ficha-editar").addEventListener("click", () => abrirFicha(true));
  $("#hf-cancelar").addEventListener("click", () => abrirFicha(false));
  $("#h-ficha-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("#hf-nombre").value.trim(); if (!nombre) { $("#hf-nombre").focus(); return; }
    const cargo = $("#hf-cargo").value === OTRO ? $("#hf-cargo-otro").value.trim() : $("#hf-cargo").value;
    guardarLS("psico-evaluador", { ...ficha(), evaluador: nombre, cargo, firma: $("#hf-firma").value.trim() });
    abrirFicha(false); pintarFicha(); saludo();
  });
  pintarFicha();

  // ── Comandos /ems de los protocolos ──
  const comandos = [];
  const recoger = (pasos) => (pasos || []).forEach((p) => {
    if (typeof p === "string" && p.startsWith("/ems") && !comandos.includes(p)) comandos.push(p);
    else if (p && p.pasos) recoger(p.pasos);
  });
  Object.values(typeof PROTOCOLOS === "object" ? PROTOCOLOS : {}).forEach((pr) => (pr.etapas || []).forEach((et) => recoger(et.pasos)));
  $("#h-comandos").innerHTML = comandos.length ? comandos.map((c) => `
    <div class="h-cmd"><code title="${esc(c)}">${esc(c)}</code><button type="button" class="h-btn-mini" data-texto="${esc(c)}">Copiar</button></div>`).join("")
    : `<p class="h-vacio">Sin comandos.</p>`;
  $("#h-comandos").addEventListener("click", (e) => { const b = e.target.closest("[data-texto]"); if (b) copiarTexto(b.dataset.texto, b); });

  // ── Trazo de ECG en la cabecera (barrido como en un monitor) ──
  const c = $("#h-ecg"), g = c.getContext("2d");
  const ecg = (t) => { const p = t % 1;
    if (p < .08) return Math.sin(p / .08 * Math.PI) * .12;
    if (p > .16 && p < .19) return -.15;
    if (p >= .19 && p < .22) return 1;
    if (p >= .22 && p < .25) return -.35;
    if (p > .38 && p < .52) return Math.sin((p - .38) / .14 * Math.PI) * .25;
    return 0; };
  let W = 0, H = 44, x = 0, fase = 0, prev = null;
  const PER = 150, Y = (v) => H * .62 - v * H * .5;
  const COLOR = "#FF5A63";
  function medir() {
    W = c.clientWidth; const r = Math.min(2, devicePixelRatio || 1);
    c.width = Math.round(W * r); c.height = Math.round(H * r); g.setTransform(r, 0, 0, r, 0, 0);
    g.clearRect(0, 0, W, H); g.strokeStyle = COLOR; g.lineWidth = 1.8; g.beginPath();
    for (let i = 0; i <= W; i++) { const y = Y(ecg(i / PER)); i ? g.lineTo(i, y) : g.moveTo(i, y); }
    g.stroke(); x = 0; fase = 0; prev = null;
  }
  let ultimo = performance.now();
  function frame(ahora) {
    const pasos = Math.max(1, Math.round(Math.min(64, ahora - ultimo) * 0.11)); ultimo = ahora;
    for (let i = 0; i < pasos; i++) {
      fase += 1 / PER; const y = Y(ecg(fase));
      g.clearRect(x + 1, 0, 16, H);
      g.strokeStyle = COLOR; g.lineWidth = 1.8; g.shadowColor = COLOR; g.shadowBlur = 5;
      if (prev !== null && x > 0) { g.beginPath(); g.moveTo(x - 1, prev); g.lineTo(x, y); g.stroke(); }
      prev = y; x++; if (x > W) { x = 0; prev = null; }
    }
    requestAnimationFrame(frame);
  }
  medir(); window.addEventListener("resize", medir);
  if (!reducir) requestAnimationFrame(frame);
})();
