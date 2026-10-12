/*
 * Certificado de Psicotécnico del Hospital Central, dibujado en un <canvas>
 * de 1224 × 2016 px (proporción de papel Legal, 8,5 × 14 in).
 *
 * Diseño: cabecera y pie con los colores de la facción del agente, ficha tipo
 * credencial, competencias con barras, observaciones y línea de validez.
 * Tipografías (Google Fonts, gratuitas): Fraunces Black suave para los títulos,
 * Questrial para el texto y Pinyon Script para la firma. Se cargan desde index.html.
 */

const CERT = { W: 1224, H: 2016, M: 80 };

const FACCIONES = {
  LSPD: "Los Santos Police Department",
  LSSD: "Los Santos Sheriff Department",
  FBI: "Federal Bureau of Investigation",
};

// Colores por facción: f1 = principal, f2 = acento dorado, f3 = fondo suave de la ficha
const COLORES_FACCION = {
  LSPD: { f1: "#13234A", f2: "#C9A54A", f3: "#DDE4F2" },
  LSSD: { f1: "#1E3B2F", f2: "#C9A54A", f3: "#EFE6CC" },
  FBI: { f1: "#0F2A5F", f2: "#E0B83B", f3: "#DCE5F5" },
};
const CERT_COLORES = {
  tinta: "#15191E", gris: "#5B6670", linea: "#D6DCE3", pista: "#E3E8EE",
  ok: "#1E7F4F", okFondo: "#E6F4EC", mal: "#B3261E", malFondo: "#FBE9E7", firma: "#1B2E6B",
};

const FUENTE_TITULO = '"Fraunces", Georgia, serif';
const PESO_TITULO = "800";
const FUENTE_TEXTO = '"Questrial", "Segoe UI", Arial, sans-serif';
const FUENTE_FIRMA = '"Pinyon Script", "Edwardian Script ITC", cursive';
const FAMILIA_FIRMA = "Pinyon Script";

const _imgCache = {};
function cargarImagen(src) {
  if (!_imgCache[src]) {
    _imgCache[src] = new Promise((ok, mal) => {
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = () => mal(new Error("No se pudo cargar " + src));
      im.src = src;
    });
  }
  return _imgCache[src];
}

async function cargarFuentesCertificado() {
  if (!document.fonts) return;
  const pedidas = [
    `${PESO_TITULO} 40px ${FUENTE_TITULO}`, `400 20px ${FUENTE_TEXTO}`, `400 40px ${FUENTE_FIRMA}`,
  ];
  try { await Promise.all(pedidas.map((f) => document.fonts.load(f))); } catch (e) { /* se usan las fuentes de respaldo */ }
}

function fechaPartes(iso) {
  if (!iso) return ["", "", ""];
  const [a, m, d] = iso.split("-");
  return [d, m, a];
}
function fechaTexto(iso) {
  const [d, m, a] = fechaPartes(iso);
  return iso ? `${d}/${m}/${a}` : "—";
}

function partirTexto(ctx, t, ancho) {
  const palabras = String(t || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const out = [];
  let actual = "";
  palabras.forEach((p) => {
    const prueba = actual ? actual + " " + p : p;
    if (ctx.measureText(prueba).width > ancho && actual) { out.push(actual); actual = p; }
    else actual = prueba;
  });
  if (actual) out.push(actual);
  return out;
}

const OBS = { px: 24, ancho: 1020, maxRenglones: 4 };
/** Número de renglones que ocupa un texto en el recuadro de observaciones. */
function renglonesObservaciones(t) {
  const c = document.createElement("canvas").getContext("2d");
  c.font = `400 ${OBS.px}px ${FUENTE_TEXTO}`;
  return partirTexto(c, t, OBS.ancho).length;
}

async function dibujarCertificado(canvas, datos, recursos) {
  const { W, H, M } = CERT;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const col = COLORES_FACCION[datos.faccion] || COLORES_FACCION.LSPD;
  const srcFaccion = recursos.facciones && recursos.facciones[datos.faccion];
  const [logo, sello, escudo] = await Promise.all([
    cargarImagen(recursos.logo),
    cargarImagen(recursos.sello),
    srcFaccion ? cargarImagen(srcFaccion).catch(() => null) : Promise.resolve(null),
  ]);
  await cargarFuentesCertificado();

  // ── utilidades de dibujo ──
  const fuente = (px, peso, fam) => (ctx.font = `${peso} ${px}px ${fam}`);
  const texto = (t, x, y, { px = 22, peso = "400", fam = FUENTE_TEXTO, color = CERT_COLORES.tinta, align = "left", esp = 0 } = {}) => {
    fuente(px, peso, fam);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    if ("letterSpacing" in ctx) ctx.letterSpacing = esp ? `${esp}px` : "0px";
    ctx.fillText(t, x, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
  };
  const rect = (x, y, w, h, r, relleno, borde, grosor = 2) => {
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
    if (relleno) { ctx.fillStyle = relleno; ctx.fill(); }
    if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = grosor; ctx.stroke(); }
  };
  const linea = (x1, y1, x2, y2, color, g = 2) => {
    ctx.strokeStyle = color; ctx.lineWidth = g; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const tituloSeccion = (t, y) => {
    texto(t, M, y, { px: 19, peso: "700", fam: FUENTE_TEXTO, color: col.f1, esp: 3.5 });
    linea(M, y + 12, W - M, y + 12, col.f2, 2.5);
  };
  const imagenCentrada = (im, cx, cy, lado) => {
    if (!im) return;
    const k = lado / Math.max(im.width, im.height);
    const w = im.width * k, h = im.height * k;
    ctx.drawImage(im, cx - w / 2, cy - h / 2, w, h);
  };
  const check = (x, y, s, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.5); ctx.lineTo(x + s * 0.36, y + s * 0.85); ctx.lineTo(x + s, y + s * 0.12); ctx.stroke();
    ctx.lineCap = "butt";
  };
  const cruz = (x, y, s, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y); ctx.lineTo(x, y + s); ctx.stroke();
    ctx.lineCap = "butt";
  };

  // ── Fondo ──
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // ── Cabecera de facción ──
  ctx.fillStyle = col.f1;
  ctx.fillRect(0, 0, W, 360);
  ctx.fillStyle = col.f2;
  ctx.fillRect(0, 360, W, 16);
  imagenCentrada(logo, 70 + 105, 180, 210);
  imagenCentrada(escudo, W - 70 - 105, 180, 220);
  texto("HOSPITAL CENTRAL · EMS", W / 2, 130, { px: 21, peso: "700", color: col.f2, align: "center", esp: 6 });
  // El título se ajusta al hueco entre el logo EMS y el escudo de la facción
  const tituloCab = "EXAMEN PSICOTÉCNICO";
  let pxCab = 62;
  fuente(pxCab, PESO_TITULO, FUENTE_TITULO);
  while (ctx.measureText(tituloCab).width + tituloCab.length * 1.5 > 620 && pxCab > 36) { pxCab -= 1; fuente(pxCab, PESO_TITULO, FUENTE_TITULO); }
  texto(tituloCab, W / 2, 210, { px: pxCab, peso: PESO_TITULO, fam: FUENTE_TITULO, color: "#FFFFFF", align: "center", esp: 1.5 });
  texto((FACCIONES[datos.faccion] || "").toUpperCase(), W / 2, 262, { px: 22, color: "rgba(255,255,255,.86)", align: "center", esp: 3 });

  // ── Título del documento ──
  texto("CERTIFICADO DE APTITUD", W / 2, 452, { px: 38, peso: PESO_TITULO, fam: FUENTE_TITULO, color: col.f1, align: "center", esp: 5 });
  texto("Departamento de Salud Mental y Evaluación Psicológica", W / 2, 490, { px: 20, color: CERT_COLORES.gris, align: "center" });

  // ── Ficha del agente ──
  const fy = 530, fh = 230;
  const grad = ctx.createLinearGradient(M, 0, W - M, 0);
  grad.addColorStop(0, col.f3); grad.addColorStop(0.6, "#FFFFFF");
  rect(M, fy, W - 2 * M, fh, 14, grad, col.f1, 2.5);
  rect(M + 26, fy + 26, 170, fh - 52, 10, col.f1);
  imagenCentrada(escudo || logo, M + 26 + 85, fy + fh / 2, 130);
  const fx = M + 230;
  const fis = datos.fisico;
  const px0 = W - M - 360; // panel de evaluación física a la derecha de la ficha
  const limiteNombre = fis ? px0 - fx - 30 : W - M - fx - 20;
  fuente(46, PESO_TITULO, FUENTE_TITULO);
  let nombre = datos.nombre || "";
  while (ctx.measureText(nombre).width > limiteNombre && nombre.length > 3) nombre = nombre.slice(0, -2) + "…";
  if (fis) {
    linea(px0 - 20, fy + 24, px0 - 20, fy + fh - 24, "rgba(0,0,0,.12)", 1.5);
    texto("EVALUACIÓN FÍSICA", px0, fy + 44, { px: 14, peso: "700", color: col.f1, esp: 2.5 });
    const filasF = [
      ["Tensión arterial", fis.tension ? `${fis.tension} mmHg` : "—"],
      ["Reflejos oculares", (fis.reflejos || "—").replace(" y coordinados", "")],
      ["Pulso máx. / a 30 s", fis.pico || fis.recuperacion ? `${fis.pico || "—"} / ${fis.recuperacion || "—"} lpm` : "—"],
      ["Saturación O2", fis.saturacion ? `${fis.saturacion} %` : "—"],
      ["Test de sustancias", fis.sustancias || "—"],
    ];
    filasF.forEach(([k, val], i) => {
      const yy = fy + 80 + i * 30;
      texto(k, px0, yy, { px: 16, color: CERT_COLORES.gris });
      const color = k === "Test de sustancias" ? (val === "Positivo" ? CERT_COLORES.mal : CERT_COLORES.ok) : CERT_COLORES.tinta;
      texto(val, W - M - 22, yy, { px: 17, peso: "700", color, align: "right" });
    });
  }
  texto(nombre, fx, fy + 76, { px: 46, peso: PESO_TITULO, fam: FUENTE_TITULO });
  texto(`${datos.rango || ""} · ${datos.faccion || ""}`, fx, fy + 112, { px: 24, peso: "700", color: col.f1 });
  const filas = [
    ["ID / Placa", datos.placa || "—"],
    ["Nacimiento", fechaTexto(datos.nacimiento)],
    ["Preguntas", `${datos.preguntas ?? "—"} · ${datos.alertas ?? 0} ${datos.alertas === 1 ? "incompatible" : "incompatibles"}`],
  ];
  filas.forEach(([k, v], i) => {
    texto(k, fx, fy + 152 + i * 30, { px: 20, color: CERT_COLORES.gris });
    texto(v, fx + 150, fy + 152 + i * 30, { px: 20, peso: "700" });
  });

  // ── Resultado y puntuación ──
  const ry = 790, rh = 124, rw = (W - 2 * M - 26) / 2;
  const colorRes = datos.apto ? CERT_COLORES.ok : CERT_COLORES.mal;
  rect(M, ry, rw, rh, 14, colorRes);
  texto("RESULTADO FINAL", M + 30, ry + 40, { px: 17, peso: "700", color: "rgba(255,255,255,.85)", esp: 3.5 });
  if (datos.apto) check(M + 30, ry + 60, 40, "#FFFFFF"); else cruz(M + 34, ry + 64, 32, "#FFFFFF");
  texto(datos.apto ? "APTO/A" : "NO APTO/A", M + 92, ry + 100, { px: 44, peso: PESO_TITULO, fam: FUENTE_TITULO, color: "#FFFFFF", esp: 1.5 });
  const px2 = M + rw + 26;
  rect(px2, ry, rw, rh, 14, "#FFFFFF", colorRes, 2.5);
  texto("PUNTUACIÓN", px2 + 30, ry + 46, { px: 17, peso: "700", color: CERT_COLORES.gris, esp: 3.5 });
  if (datos.puntos != null) texto(`${datos.puntos} / ${datos.maximo} puntos`, px2 + 30, ry + 82, { px: 21 });
  texto(`${datos.puntuacion ?? "—"}%`, px2 + rw - 30, ry + 96, { px: 70, peso: PESO_TITULO, fam: FUENTE_TITULO, color: colorRes, align: "right" });

  // ── Competencias evaluadas ──
  tituloSeccion("COMPETENCIAS EVALUADAS", 984);
  const comps = datos.competencias || [];
  const cw = (W - 2 * M - 60) / 2;
  comps.forEach((c, i) => {
    const cx = M + (i % 2) * (cw + 60);
    const cy = 1036 + Math.floor(i / 2) * 64;
    texto(c.corto || c.nombre, cx, cy, { px: 20, peso: "700" });
    texto(`${c.pct}%`, cx + cw, cy, { px: 20, peso: "700", align: "right", color: c.pct < 50 ? CERT_COLORES.mal : CERT_COLORES.tinta });
    rect(cx, cy + 14, cw, 11, 5.5, CERT_COLORES.pista);
    if (c.pct > 0) rect(cx, cy + 14, Math.max(11, (cw * c.pct) / 100), 11, 5.5, c.pct < 50 ? CERT_COLORES.mal : col.f1);
  });

  // ── Observaciones ──
  tituloSeccion("OBSERVACIONES", 1250);
  fuente(OBS.px, "400", FUENTE_TEXTO);
  const renglones = partirTexto(ctx, datos.observaciones, OBS.ancho).slice(0, OBS.maxRenglones);
  const oy = 1300;
  ctx.fillStyle = col.f2;
  ctx.fillRect(M, oy - 8, 6, Math.max(1, renglones.length) * 38 + 8);
  renglones.forEach((r, i) => texto(r, M + 30, oy + 22 + i * 38, { px: OBS.px }));

  // ── Validez (línea de tiempo) ──
  tituloSeccion("VALIDEZ", 1510);
  const hitos = [["EVALUACIÓN", datos.fechaEvaluacion], ["EMISIÓN", datos.fechaEmision], ["VÁLIDO HASTA", datos.validoHasta]];
  const lx1 = M + 170, lx2 = W - M - 170, ly = 1574;
  linea(lx1, ly, lx2, ly, CERT_COLORES.linea, 4);
  hitos.forEach(([k, v], i) => {
    const x = lx1 + ((lx2 - lx1) * i) / 2;
    const c = i === 2 ? CERT_COLORES.ok : col.f1;
    ctx.beginPath(); ctx.arc(x, ly, 17, 0, Math.PI * 2); ctx.fillStyle = "#FFFFFF"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = c; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, ly, 10, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
    texto(k, x, ly + 52, { px: 16, peso: "700", color: CERT_COLORES.gris, align: "center", esp: 2.5 });
    texto(fechaTexto(v), x, ly + 88, { px: 28, peso: "700", align: "center" });
  });

  // ── Profesional responsable ──
  tituloSeccion("PROFESIONAL RESPONSABLE", 1730);
  const sy = 1870;
  if (datos.firma) {
    const hayCursiva = !!document.fonts && [...document.fonts].some((f) => f.family.replace(/["']/g, "") === FAMILIA_FIRMA && f.status === "loaded");
    ctx.font = hayCursiva ? `400 62px ${FUENTE_FIRMA}` : `italic 400 42px Georgia, serif`;
    ctx.fillStyle = CERT_COLORES.firma;
    ctx.fillText(datos.firma, M + 10, sy - 8);
  }
  linea(M, sy, M + 440, sy, CERT_COLORES.tinta, 2);
  texto(datos.evaluador || "", M, sy + 32, { px: 21, peso: "700" });
  texto(datos.cargo || "", M, sy + 60, { px: 20, color: CERT_COLORES.gris });
  ctx.globalAlpha = 0.92;
  imagenCentrada(sello, W - M - 125, 1832, 240);
  ctx.globalAlpha = 1;

  // ── Pie de facción ──
  ctx.fillStyle = col.f2;
  ctx.fillRect(0, H - 82, W, 10);
  ctx.fillStyle = col.f1;
  ctx.fillRect(0, H - 72, W, 72);
  texto("HOSPITAL CENTRAL · DOCUMENTO OFICIAL", M - 10, H - 28, { px: 16, peso: "700", color: "#FFFFFF", esp: 3 });
  if (datos.referencia) texto(`REF. ${datos.referencia}`, W - M + 10, H - 28, { px: 16, color: "#FFFFFF", align: "right", esp: 2 });
  return canvas;
}
