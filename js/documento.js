/*
 * Base común para los documentos médicos del Hospital Central (parte de lesiones,
 * certificado de defunción, informe de autopsia…), dibujados en un <canvas> de
 * 1224 × 2016 px (proporción de papel Legal).
 *
 * Uso en un documento nuevo:
 *   const doc = crearDocumento(canvas, { colores: DOC_COLORES });
 *   doc.cabecera({ logo, org: "HOSPITAL CENTRAL · MEDICINA FORENSE", titulo: "CERTIFICADO DE DEFUNCIÓN",
 *                  subtitulo: "…", etiquetaNumero: "Nº DE CERTIFICADO", numero, fecha: "11/10/2026 · 21:40" });
 *   let y = doc.titulo("DATOS DEL FALLECIDO", doc.inicio);
 *   …
 *   doc.firma({ firma, nombre, cargo, etiqueta: "MÉDICO FORENSE", fechaEmision, sello });
 *   doc.pie({ izquierda: "HOSPITAL CENTRAL · DOCUMENTO MÉDICO-LEGAL", referencia: numero });
 *
 * Depende de certificado.js (fuentes, cargarImagen, partirTexto, fechaTexto).
 */

const DOC_COLORES = {
  cab: "#16304B", cab2: "#0E2033", acento: "#D7262E", acentoSuave: "#FBE9E7", orgCab: "#F2A7AB",
  tinta: "#15191E", gris: "#5B6670", linea: "#D6DCE3", suave: "#F3F6FA", firma: "#1B2E6B",
};

const fechaHoraTexto = (iso) => {
  if (!iso) return "—";
  const [f, h] = iso.split("T");
  return `${fechaTexto(f)}${h ? " · " + h.slice(0, 5) : ""}`;
};

function crearDocumento(canvas, { W = 1224, H = 2016, M = 72, colores = DOC_COLORES } = {}) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const C = colores;
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);

  const fuente = (px, peso, fam = FUENTE_TEXTO) => (ctx.font = `${peso} ${px}px ${fam}`);
  const texto = (t, x, y, { px = 21, peso = "400", fam = FUENTE_TEXTO, color = C.tinta, align = "left", esp = 0, estilo = "" } = {}) => {
    ctx.font = `${estilo} ${peso} ${px}px ${fam}`.trim();
    ctx.fillStyle = color; ctx.textAlign = align;
    if ("letterSpacing" in ctx) ctx.letterSpacing = esp ? `${esp}px` : "0px";
    ctx.fillText(t, x, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
  };
  const recortar = (t, ancho, px, peso = "400", fam = FUENTE_TEXTO) => {
    fuente(px, peso, fam);
    let v = String(t ?? "");
    while (ctx.measureText(v).width > ancho && v.length > 3) v = v.slice(0, -2) + "…";
    return v;
  };
  const rect = (x, y, w, h, r, relleno, borde, g = 2) => {
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
    if (relleno) { ctx.fillStyle = relleno; ctx.fill(); }
    if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = g; ctx.stroke(); }
  };
  const linea = (x1, y1, x2, y2, color = C.linea, g = 2) => {
    ctx.strokeStyle = color; ctx.lineWidth = g; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const imagen = (im, cx, cy, lado) => {
    if (!im) return;
    const k = lado / Math.max(im.width, im.height);
    ctx.drawImage(im, cx - im.width * k / 2, cy - im.height * k / 2, im.width * k, im.height * k);
  };
  /** Texto en varios renglones; devuelve la línea base del último renglón. */
  const parrafo = (t, x, y, ancho, { px = 20, lh = 30, max = 99, color = C.tinta, estilo = "" } = {}) => {
    ctx.font = `${estilo} 400 ${px}px ${FUENTE_TEXTO}`.trim();
    let r = partirTexto(ctx, t, ancho);
    if (r.length > max) { r = r.slice(0, max); r[max - 1] = r[max - 1].replace(/\s+\S*$/, "") + "…"; }
    r.forEach((l, i) => texto(l, x, y + i * lh, { px, color, estilo }));
    return y + (r.length - 1) * lh;
  };
  /** Título de sección con filete de color; devuelve la y del filete. */
  const titulo = (t, y) => {
    texto(t, M, y, { px: 18, peso: "700", color: C.cab, esp: 3.2 });
    linea(M, y + 11, W - M, y + 11, C.acento, 2);
    return y + 11;
  };
  /** Etiqueta pequeña en mayúsculas con su valor debajo. */
  const dato = (etiqueta, valor, x, y, w) => {
    texto(etiqueta.toUpperCase(), x, y, { px: 14, peso: "700", color: C.gris, esp: 2 });
    texto(recortar(valor || "—", w - 14, 21), x, y + 30, { px: 21 });
  };

  /** Cabecera azul con logo, título centrado y recuadro de número y fecha. Devuelve dónde empieza el cuerpo. */
  const cabecera = ({ logo, org, titulo: tit, subtitulo, etiquetaNumero, numero, fecha }) => {
    const alto = 236;
    const g = ctx.createLinearGradient(0, 0, 0, alto); g.addColorStop(0, C.cab); g.addColorStop(1, C.cab2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, alto);
    ctx.fillStyle = C.acento; ctx.fillRect(0, alto, W, 10);
    imagen(logo, M + 80, 118, 160);
    const bx = W - M - 250, by = 54;
    rect(bx, by, 250, 130, 12, "rgba(255,255,255,.08)", "rgba(255,255,255,.35)", 1.5);
    texto(etiquetaNumero, bx + 125, by + 34, { px: 13, peso: "700", color: "rgba(255,255,255,.7)", align: "center", esp: 2.5 });
    texto(recortar(numero, 230, 22, "700"), bx + 125, by + 70, { px: 22, peso: "700", color: "#FFFFFF", align: "center" });
    texto(fecha || "", bx + 125, by + 104, { px: 18, color: "rgba(255,255,255,.85)", align: "center" });
    const cx = (M + 176 + bx) / 2, hueco = bx - (M + 196) - 30;
    texto(org, cx, 84, { px: 15, peso: "700", color: C.orgCab, align: "center", esp: 3.5 });
    let px = 50; fuente(px, PESO_TITULO, FUENTE_TITULO);
    while (ctx.measureText(tit).width > hueco && px > 28) { px--; fuente(px, PESO_TITULO, FUENTE_TITULO); }
    texto(tit, cx, 144, { px, peso: PESO_TITULO, fam: FUENTE_TITULO, color: "#FFFFFF", align: "center" });
    if (subtitulo) texto(subtitulo, cx, 184, { px: 18, color: "rgba(255,255,255,.8)", align: "center" });
    return 292;
  };

  /** Bloque de firma del facultativo, fecha de emisión, sello y nota legal. Ocupa la parte baja de la hoja. */
  const firma = ({ firma: f, nombre, cargo, etiqueta = "FACULTATIVO RESPONSABLE", fechaEmision, sello, nota }) => {
    const sy = H - 178;
    linea(M, sy - 84, W - M, sy - 84, C.linea, 1.5);
    texto(etiqueta, M, sy - 56, { px: 14, peso: "700", color: C.gris, esp: 2 });
    if (f) {
      const hay = !!document.fonts && [...document.fonts].some((x) => x.family.replace(/["']/g, "") === FAMILIA_FIRMA && x.status === "loaded");
      ctx.font = hay ? `400 56px ${FUENTE_FIRMA}` : `italic 400 40px Georgia, serif`;
      ctx.fillStyle = C.firma; ctx.fillText(f, M + 8, sy - 8);
    }
    linea(M, sy, M + 430, sy, C.tinta, 2);
    texto(nombre || "", M, sy + 30, { px: 20, peso: "700" });
    texto(cargo || "", M, sy + 56, { px: 18, color: C.gris });
    texto("Emitido el", M + 520, sy - 20, { px: 16, color: C.gris });
    texto(fechaTexto(fechaEmision), M + 520, sy + 10, { px: 24, peso: "700" });
    if (sello) { ctx.globalAlpha = 0.92; imagen(sello, W - M - 112, sy - 18, 214); ctx.globalAlpha = 1; }
    if (nota) texto(nota, W / 2, H - 92, { px: 15, color: C.gris, align: "center" });
    return sy - 84; // límite superior del bloque: el contenido debe acabar antes
  };

  const pie = ({ izquierda = "HOSPITAL CENTRAL · DOCUMENTO MÉDICO-LEGAL", referencia, pagina } = {}) => {
    ctx.fillStyle = C.acento; ctx.fillRect(0, H - 66, W, 6);
    ctx.fillStyle = C.cab; ctx.fillRect(0, H - 60, W, 60);
    texto(izquierda, M - 8, H - 23, { px: 15, peso: "700", color: "#FFFFFF", esp: 3 });
    if (pagina) texto(pagina, W / 2 + 120, H - 23, { px: 15, color: "rgba(255,255,255,.75)", align: "center", esp: 2 });
    if (referencia) texto(`REF. ${referencia}`, W - M + 8, H - 23, { px: 15, color: "#FFFFFF", align: "right", esp: 2 });
  };

  /** Cabecera reducida para las páginas 2 y siguientes. Devuelve dónde empieza el cuerpo. */
  const cabeceraCompacta = ({ logo, titulo: tit, numero }) => {
    const alto = 116;
    const g = ctx.createLinearGradient(0, 0, 0, alto); g.addColorStop(0, C.cab); g.addColorStop(1, C.cab2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, alto);
    ctx.fillStyle = C.acento; ctx.fillRect(0, alto, W, 8);
    imagen(logo, M + 38, 58, 76);
    texto(recortar(tit, 640, 30, PESO_TITULO, FUENTE_TITULO), M + 96, 70, { px: 30, peso: PESO_TITULO, fam: FUENTE_TITULO, color: "#FFFFFF" });
    texto("(continuación)", M + 96, 98, { px: 16, color: "rgba(255,255,255,.75)" });
    if (numero) texto(numero, W - M, 70, { px: 20, peso: "700", color: "#FFFFFF", align: "right" });
    return 172;
  };

  return { ctx, W, H, M, C, inicio: 292, limiteContenido: H - 270, fuente, texto, recortar, rect, linea, imagen, parrafo, titulo, dato, cabecera, cabeceraCompacta, firma, pie };
}

/** Número de documento: PREFIJO-AAAAMMDD-NNNN */
function numeroDocumento(prefijo, fechaIso, semilla = "") {
  let h = 0;
  for (const ch of `${semilla}|${fechaIso}|${Date.now()}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `${prefijo}-${String(fechaIso || "").slice(0, 10).replace(/-/g, "")}-${String(h % 10000).padStart(4, "0")}`;
}
