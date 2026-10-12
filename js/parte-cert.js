/*
 * Parte médico de lesiones del Hospital Central, dibujado en un <canvas>
 * de 1224 × 2016 px (proporción de papel Legal, 8,5 × 14 in).
 * Usa la base común de js/documento.js (cabecera, pie, firma y utilidades).
 */

const PARTE_COL = {
  ...DOC_COLORES,
  rojo: "#D7262E", rojoSuave: "#FBE9E7",
  cuerpo: "#E3E9F0", cuerpoBorde: "#8E9BA9",
};

/*
 * Zonas anatómicas. Coordenadas sobre una figura de 150 × 340 px.
 * Vista F = frontal, P = posterior. En la vista frontal el lado derecho del
 * paciente queda a la izquierda del dibujo; en la posterior, a la derecha.
 */
const ZONAS_BASE = [
  { id: "craneo", nombre: "Cabeza (cráneo)", v: "P", x: 75, y: 20 },
  { id: "frente", nombre: "Frente", v: "F", x: 75, y: 13 },
  { id: "ojo", nombre: "Ojo", v: "F", lado: true, x: 68, y: 22 },
  { id: "pomulo", nombre: "Pómulo", v: "F", lado: true, x: 64, y: 31 },
  { id: "nariz", nombre: "Nariz", v: "F", x: 75, y: 29 },
  { id: "boca", nombre: "Boca / labios", v: "F", x: 75, y: 37 },
  { id: "mandibula", nombre: "Mandíbula", v: "F", x: 75, y: 43 },
  { id: "cuello", nombre: "Cuello", v: "F", x: 75, y: 51 },
  { id: "nuca", nombre: "Nuca", v: "P", x: 75, y: 50 },
  { id: "hombro", nombre: "Hombro", v: "F", lado: true, x: 44, y: 64 },
  { id: "brazo", nombre: "Brazo", v: "F", lado: true, x: 35, y: 95 },
  { id: "codo", nombre: "Codo", v: "P", lado: true, x: 30, y: 120 },
  { id: "antebrazo", nombre: "Antebrazo", v: "F", lado: true, x: 26, y: 150 },
  { id: "muneca", nombre: "Muñeca", v: "F", lado: true, x: 23, y: 175 },
  { id: "mano", nombre: "Mano", v: "F", lado: true, x: 21, y: 191 },
  { id: "torax", nombre: "Tórax", v: "F", x: 75, y: 88 },
  { id: "costillas", nombre: "Costado / costillas", v: "F", lado: true, x: 52, y: 118 },
  { id: "abdomen", nombre: "Abdomen", v: "F", x: 75, y: 140 },
  { id: "espalda", nombre: "Espalda", v: "P", x: 75, y: 92 },
  { id: "lumbar", nombre: "Zona lumbar", v: "P", x: 75, y: 148 },
  { id: "gluteo", nombre: "Glúteo", v: "P", lado: true, x: 62, y: 180 },
  { id: "muslo", nombre: "Muslo", v: "F", lado: true, x: 60, y: 210 },
  { id: "rodilla", nombre: "Rodilla", v: "F", lado: true, x: 58, y: 252 },
  { id: "pierna", nombre: "Pierna", v: "F", lado: true, x: 56, y: 288 },
  { id: "tobillo", nombre: "Tobillo", v: "F", lado: true, x: 55, y: 316 },
  { id: "pie", nombre: "Pie", v: "F", lado: true, x: 53, y: 330 },
];

// Expande las zonas con lado en "derecho" e "izquierdo"
const ZONAS = (() => {
  const out = [];
  ZONAS_BASE.forEach((z) => {
    if (!z.lado) { out.push({ id: z.id, nombre: z.nombre, v: z.v, x: z.x, y: z.y }); return; }
    const femeninas = ["Mano", "Muñeca", "Rodilla", "Pierna"];
    const adj = (base, d) => {
      const f = femeninas.includes(base);
      return d ? (f ? "derecha" : "derecho") : (f ? "izquierda" : "izquierdo");
    };
    // Derecho del paciente: en vista F queda a la izquierda del dibujo (x < 75); en P, a la derecha
    const xDer = z.v === "F" ? z.x : 150 - z.x;
    const xIzq = 150 - xDer;
    out.push({ id: z.id + "_d", nombre: `${z.nombre} ${adj(z.nombre, true)}`, v: z.v, x: xDer, y: z.y });
    out.push({ id: z.id + "_i", nombre: `${z.nombre} ${adj(z.nombre, false)}`, v: z.v, x: xIzq, y: z.y });
  });
  return out;
})();
const zonaPorId = (id) => ZONAS.find((z) => z.id === id);

function dibujarFigura(ctx, ox, oy, k, vista) {
  const X = (x) => ox + x * k, Y = (y) => oy + y * k;
  const segs = [
    [40, 64, 30, 120, 17], [30, 120, 22, 180, 14],
    [110, 64, 120, 120, 17], [120, 120, 128, 180, 14],
    [62, 168, 58, 252, 25], [58, 252, 55, 318, 18],
    [88, 168, 92, 252, 25], [92, 252, 95, 318, 18],
  ];
  const torso = [[42, 56], [108, 56], [104, 110], [100, 150], [106, 178], [44, 178], [50, 150], [46, 110]];
  const formas = (relleno, extra) => {
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    segs.forEach(([x1, y1, x2, y2, w]) => {
      ctx.strokeStyle = relleno; ctx.lineWidth = w * k + extra;
      ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke();
    });
    ctx.beginPath(); torso.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath();
    ctx.fillStyle = relleno; ctx.fill(); if (extra) { ctx.lineWidth = extra; ctx.strokeStyle = relleno; ctx.stroke(); }
    ctx.fillRect(X(67) - extra / 2, Y(40), 16 * k + extra, 20 * k);
    [[75, 24, 20, 20], [21, 191, 9, 10], [129, 191, 9, 10], [52, 330, 11, 7], [98, 330, 11, 7]].forEach(([x, y, rx, ry]) => {
      ctx.beginPath(); ctx.ellipse(X(x), Y(y), rx * k + extra / 2, ry * k + extra / 2, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.lineCap = "butt";
  };
  formas(PARTE_COL.cuerpoBorde, 3);
  formas(PARTE_COL.cuerpo, 0);
  // Detalles mínimos para distinguir las vistas
  ctx.strokeStyle = PARTE_COL.cuerpoBorde; ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (vista === "P") { ctx.moveTo(X(75), Y(62)); ctx.lineTo(X(75), Y(168)); }
  else { ctx.moveTo(X(62), Y(84)); ctx.quadraticCurveTo(X(75), Y(92), X(88), Y(84)); ctx.moveTo(X(75), Y(132)); ctx.arc(X(75), Y(132), 1.5, 0, Math.PI * 2); }
  ctx.stroke();
}

async function dibujarParte(canvas, d, recursos) {
  const srcFac = d.hechos.faccion && recursos.facciones ? recursos.facciones[d.hechos.faccion] : null;
  const [logo, sello, escudo, dni] = await Promise.all([
    cargarImagen(recursos.logo), cargarImagen(recursos.sello),
    srcFac ? cargarImagen(srcFac).catch(() => null) : Promise.resolve(null),
    d.paciente.dni ? cargarImagen(d.paciente.dni).catch(() => null) : Promise.resolve(null),
  ]);
  await cargarFuentesCertificado();

  const doc = crearDocumento(canvas, { colores: PARTE_COL });
  const { ctx, W, H, M, C, fuente, texto, rect, linea, imagen, parrafo, titulo, dato } = doc;
  const fechaHora = fechaHoraTexto;

  doc.cabecera({
    logo, org: "HOSPITAL CENTRAL · SERVICIO DE URGENCIAS", titulo: "PARTE MÉDICO DE LESIONES",
    subtitulo: "Informe médico-legal de asistencia sanitaria", etiquetaNumero: "Nº DE PARTE",
    numero: d.numero, fecha: fechaHora(d.fechaAsistencia),
  });

  // ── Paciente ──
  let y = titulo("DATOS DEL PACIENTE", 292);
  const nacimiento = d.paciente.nacimiento ? `${fechaTexto(d.paciente.nacimiento)}${d.paciente.edad != null ? ` (${d.paciente.edad} años)` : ""}` : "—";
  const sexo = d.paciente.sexo === "F" ? "Femenino" : "Masculino";
  if (dni) {
    // DNI a la derecha y datos en dos columnas a la izquierda
    const esc = Math.min(270 / dni.width, 156 / dni.height, 2);
    const iw = Math.round(dni.width * esc), ih = Math.round(dni.height * esc);
    const ix = W - M - iw, iy = y + 18;
    rect(ix - 1, iy - 1, iw + 2, ih + 2, 8, null, C.linea, 1.5);
    ctx.save(); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(ix, iy, iw, ih, 7) : ctx.rect(ix, iy, iw, ih); ctx.clip();
    ctx.drawImage(dni, ix, iy, iw, ih); ctx.restore();
    texto("DNI APORTADO POR EL PACIENTE", ix + iw / 2, iy + ih + 22, { px: 12, peso: "700", color: C.gris, align: "center", esp: 1.5 });
    const lw = ix - 30 - M, cw = lw / 2;
    texto(doc.recortar(d.paciente.nombre || "—", lw, 36, PESO_TITULO, FUENTE_TITULO), M, y + 46, { px: 36, peso: PESO_TITULO, fam: FUENTE_TITULO });
    dato("Nacimiento", nacimiento, M, y + 82, cw);
    dato("Sexo", sexo, M + cw, y + 82, cw);
    dato("Teléfono", d.paciente.telefono, M, y + 146, cw);
    y += Math.max(196, ih + 48);
  } else {
    texto(d.paciente.nombre || "—", M, y + 46, { px: 36, peso: PESO_TITULO, fam: FUENTE_TITULO });
    const cw = (W - 2 * M) / 3;
    dato("Nacimiento", nacimiento, M, y + 82, cw);
    dato("Sexo", sexo, M + cw, y + 82, cw);
    dato("Teléfono", d.paciente.telefono, M + 2 * cw, y + 82, cw);
    y += 136;
  }

  // ── Hechos ──
  y = titulo("HECHOS QUE REFIERE EL PACIENTE", y + 20);
  const h = d.hechos;
  texto("Fecha y hora:", M, y + 38, { px: 19, color: C.gris }); texto(fechaHora(h.fecha), M + 140, y + 38, { px: 20, peso: "700" });
  texto("Lugar:", M + 470, y + 38, { px: 19, color: C.gris });
  fuente(20, "400", FUENTE_TEXTO); let lugar = h.lugar || "—"; while (ctx.measureText(lugar).width > W - M - (M + 545) && lugar.length > 3) lugar = lugar.slice(0, -2) + "…";
  texto(lugar, M + 545, y + 38, { px: 20, peso: "700" });
  // Presunto agresor
  const ay = y + 56, ah = 84;
  rect(M, ay, W - 2 * M, ah, 10, C.suave, C.linea, 1.5);
  let tx = M + 22;
  if (escudo) { imagen(escudo, M + 54, ay + ah / 2, 64); tx = M + 104; }
  texto("PRESUNTO AGRESOR (SEGÚN MANIFIESTA)", tx, ay + 30, { px: 13, peso: "700", color: C.gris, esp: 2 });
  let agresor = h.tipoAgresor === "agente" ? "Agente de la ley" : h.tipoAgresor === "civil" ? "Civil" : "Desconocido";
  if (h.tipoAgresor === "agente") agresor += h.faccion ? ` · ${h.faccion} (${FACCIONES[h.faccion]})` : " · Facción no identificada";
  if (h.identificacion) agresor += ` · ${h.identificacion}`;
  fuente(21, "700", FUENTE_TEXTO); while (ctx.measureText(agresor).width > W - M - tx - 20 && agresor.length > 3) agresor = agresor.slice(0, -2) + "…";
  texto(agresor, tx, ay + 63, { px: 21, peso: "700" });
  y = ay + ah;
  if (h.mecanismos.length) { y = parrafo("Mecanismo referido: " + h.mecanismos.join(", ").toLowerCase() + ".", M, y + 34, W - 2 * M, { px: 19, max: 2, color: C.tinta }); }
  if (h.relato) { y = parrafo("«" + h.relato.trim() + "»", M, y + 32, W - 2 * M, { px: 18, lh: 26, max: 3, color: "#33404C", estilo: "italic" }); }

  // ── Exploración física ──
  y = titulo("EXPLORACIÓN FÍSICA", y + 44);
  const fy = y + 24, k = 0.86;
  const fxF = M + 10, fxP = M + 170;
  dibujarFigura(ctx, fxF, fy, k, "F"); dibujarFigura(ctx, fxP, fy, k, "P");
  texto("FRONTAL", fxF + 75 * k, fy + 318, { px: 13, peso: "700", color: C.gris, align: "center", esp: 2 });
  texto("POSTERIOR", fxP + 75 * k, fy + 318, { px: 13, peso: "700", color: C.gris, align: "center", esp: 2 });
  texto("D", fxF + 2, fy + 12, { px: 14, peso: "700", color: C.gris }); texto("I", fxF + 124, fy + 12, { px: 14, peso: "700", color: C.gris });
  texto("I", fxP + 2, fy + 12, { px: 14, peso: "700", color: C.gris }); texto("D", fxP + 124, fy + 12, { px: 14, peso: "700", color: C.gris });
  // Marcadores (si dos caen en el mismo sitio, el segundo se aparta con una línea guía)
  const puestos = [];
  d.lesiones.forEach((l, i) => {
    const z = l.zona; if (!z) return;
    const ox0 = (z.v === "F" ? fxF : fxP) + z.x * k, oy0 = fy + z.y * k;
    const fuera = z.x < 75 ? -1 : z.x > 75 ? 1 : (i % 2 ? 1 : -1);
    const cand = [[0, 0], [fuera * 30, -10], [fuera * 30, 16], [fuera * 56, 0], [-fuera * 30, -10], [fuera * 56, 26], [fuera * 56, -26], [-fuera * 56, 0]];
    let px = ox0, py = oy0;
    for (const [dx, dy] of cand) {
      const tx = ox0 + dx, ty = oy0 + dy;
      if (puestos.every(([qx, qy]) => Math.hypot(qx - tx, qy - ty) >= 25)) { px = tx; py = ty; break; }
    }
    if (px !== ox0 || py !== oy0) {
      linea(ox0, oy0, px, py, C.rojo, 1.5);
      ctx.beginPath(); ctx.arc(ox0, oy0, 3, 0, Math.PI * 2); ctx.fillStyle = C.rojo; ctx.fill();
    }
    puestos.push([px, py]);
    ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fillStyle = C.rojo; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "#FFFFFF"; ctx.stroke();
    texto(String(i + 1), px, py + 5, { px: 14, peso: "700", color: "#FFFFFF", align: "center" });
  });
  // Lista de lesiones
  const lx = M + 340, lw = W - M - lx;
  let ly = fy + 6;
  if (!d.lesiones.length) {
    texto("No se objetivan lesiones físicas.", lx, ly + 24, { px: 20, color: C.gris });
  } else {
    const conDesc = d.lesiones.length <= 4;
    d.lesiones.forEach((l, i) => {
      ctx.beginPath(); ctx.arc(lx + 13, ly + 13, 13, 0, Math.PI * 2); ctx.fillStyle = C.rojo; ctx.fill();
      texto(String(i + 1), lx + 13, ly + 19, { px: 15, peso: "700", color: "#FFFFFF", align: "center" });
      const grav = ["Leve", "Moderada", "Grave"][l.gravedad] || "";
      let t1 = `${l.tipo} · ${l.zona ? l.zona.nombre : "—"}`;
      fuente(20, "700", FUENTE_TEXTO); while (ctx.measureText(t1).width > lw - 160 && t1.length > 3) t1 = t1.slice(0, -2) + "…";
      texto(t1, lx + 38, ly + 20, { px: 20, peso: "700" });
      const colG = l.gravedad === 2 ? C.rojo : l.gravedad === 1 ? "#9A6200" : "#1E7F4F";
      texto(grav.toUpperCase(), W - M, ly + 20, { px: 14, peso: "700", color: colG, align: "right", esp: 1.5 });
      ly += 22;
      if (conDesc && l.desc) { ly = parrafo(l.desc, lx + 38, ly + 24, lw - 40, { px: 17, lh: 23, max: 2, color: C.gris }) + 30; }
      else ly += 18;
    });
  }
  y = Math.max(fy + 326, ly);
  const lineaLista = (lab, arr) => {
    if (!arr.length) return;
    texto(lab, M, y + 28, { px: 19, peso: "700" });
    fuente(19, "700", FUENTE_TEXTO); const off = ctx.measureText(lab).width + 10;
    y = parrafo(arr.join(", ") + ".", M + off, y + 28, W - 2 * M - off, { px: 19, lh: 27, max: 2 });
  };
  lineaLista("Pruebas complementarias:", d.pruebas);
  lineaLista("Tratamiento aplicado:", d.tratamiento);

  // ── Daños psicológicos y morales ──
  y = titulo("ESTADO PSICOLÓGICO Y DAÑO MORAL", y + 46);
  const p = d.psico;
  if (!p.sintomas.length) {
    texto("No refiere afectación psicológica.", M, y + 38, { px: 20, color: C.gris }); y += 38;
  } else {
    let px0 = M, py0 = y + 18;
    fuente(17, "700", FUENTE_TEXTO);
    p.sintomas.forEach((s) => {
      const w = ctx.measureText(s).width + 30;
      if (px0 + w > W - M) { px0 = M; py0 += 44; }
      rect(px0, py0, w, 34, 17, C.rojoSuave, null);
      texto(s, px0 + 15, py0 + 23, { px: 17, peso: "700", color: "#8E1F19" });
      px0 += w + 10;
    });
    y = py0 + 34;
    const intens = { leve: "Leve", moderada: "Moderada", grave: "Grave" }[p.intensidad] || "—";
    texto(`Intensidad: ${intens}`, M, y + 32, { px: 19, peso: "700" });
    if (p.seguimiento) { fuente(19, "700", FUENTE_TEXTO); texto("· Se recomienda seguimiento psicológico", M + ctx.measureText(`Intensidad: ${intens}`).width + 12, y + 32, { px: 19, color: C.tinta }); }
    y += 32;
  }

  // ── Valoración médico-legal ──
  y = titulo("VALORACIÓN MÉDICO-LEGAL", y + 46);
  const v = d.valoracion;
  const bw = (W - 2 * M - 3 * 16) / 4, byv = y + 18, bh = 82;
  const cajas = [["PRONÓSTICO", v.pronostico], ["DÍAS DE CURACIÓN", v.dias != null && v.dias !== "" ? `${v.dias}` : "—"], ["DÍAS IMPEDITIVOS", v.impeditivos != null && v.impeditivos !== "" ? `${v.impeditivos}` : "—"], ["SECUELAS", v.secuelas || "—"]];
  cajas.forEach(([lab, val], i) => {
    const x = M + i * (bw + 16);
    const destacado = i === 0;
    rect(x, byv, bw, bh, 10, destacado ? C.cab : C.suave, destacado ? null : C.linea, 1.5);
    texto(lab, x + 18, byv + 26, { px: 12, peso: "700", color: destacado ? "rgba(255,255,255,.75)" : C.gris, esp: 1.8 });
    if (i === 3) { parrafo(val, x + 18, byv + 52, bw - 30, { px: 16, lh: 20, max: 2 }); }
    else {
      let px = i === 0 ? 28 : 34; fuente(px, PESO_TITULO, FUENTE_TITULO);
      while (ctx.measureText(val).width > bw - 30 && px > 16) { px--; fuente(px, PESO_TITULO, FUENTE_TITULO); }
      texto(val, x + 18, byv + 66, { px, peso: PESO_TITULO, fam: FUENTE_TITULO, color: destacado ? "#FFFFFF" : C.tinta });
    }
  });
  y = byv + bh;
  texto("JUICIO CLÍNICO", M, y + 36, { px: 14, peso: "700", color: C.gris, esp: 2 });
  const limite = doc.limiteContenido;
  // Si el juicio no cabe (p. ej. con DNI y muchas lesiones), se reduce un poco la letra antes de cortarlo
  const lineasDe = (t, px, ancho) => { ctx.font = `400 ${px}px ${FUENTE_TEXTO}`; return partirTexto(ctx, t || "", ancho).length; };
  let jpx = 18, jlh = 27;
  for (const [px, lh] of [[18, 27], [17, 25], [16, 23], [15, 21]]) {
    jpx = px; jlh = lh;
    if (lineasDe(v.juicio, px, W - 2 * M) <= Math.floor((limite - (y + 64)) / lh) + 1) break;
  }
  const maxLin = Math.max(2, Math.floor((limite - (y + 64)) / jlh) + 1);
  y = parrafo(v.juicio, M, y + 64, W - 2 * M, { px: jpx, lh: jlh, max: maxLin });

  // ── Facultativo y pie ──
  doc.firma({
    firma: d.medico.firma, nombre: d.medico.nombre, cargo: d.medico.cargo, fechaEmision: d.fechaEmision, sello,
    nota: "Se expide el presente parte a petición del interesado, para su presentación ante las autoridades competentes.",
  });
  doc.pie({ referencia: d.numero });
  return canvas;
}
