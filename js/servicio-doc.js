/*
 * Dibuja el documento de un servicio a partir de su esquema (js/servicios/*.js) y los valores
 * del formulario. Reparte el contenido en páginas de 1224 × 2016 px cuando no cabe en una.
 * Depende de: certificado.js (fuentes, utilidades), documento.js, parte-cert.js (figura corporal).
 */

const GRUPO_CORTO = ["texto", "fecha", "fechahora", "hora", "numero", "select", "segmentos", "check", "calculado"];

/** Valor legible de un campo para el documento ("" si está vacío o no aplica). */
function textoCampo(c, v) {
  const val = c.tipo === "calculado" ? c.calc(v) : v[c.id];
  if (val == null || val === "" || (Array.isArray(val) && !val.length)) return "";
  switch (c.tipo) {
    case "fecha": return fechaTexto(val);
    case "fechahora": return fechaHoraTexto(val);
    case "numero": return `${val}${c.unidad ? " " + c.unidad : ""}`;
    case "check": return val ? (c.textoSi || "Sí") : (c.textoNo || "");
    case "chips": return val.join(", ");
    default: return String(val);
  }
}

const campoVisible = (c, v) => !c.si || c.si(v);

async function dibujarServicio(servicio, docDef, v, recursos) {
  await cargarFuentesCertificado();
  const [logo, sello] = await Promise.all([cargarImagen(recursos.logo), cargarImagen(recursos.sello)]);
  const colores = { ...DOC_COLORES, ...(servicio.colores || {}), ...(docDef.colores || {}) };
  const W = 1224, H = 2016, M = 72, ANCHO = W - 2 * M;
  const med = document.createElement("canvas").getContext("2d");
  const lineas = (t, px, ancho, estilo = "") => { med.font = `${estilo} 400 ${px}px ${FUENTE_TEXTO}`.trim(); return partirTexto(med, t, ancho); };

  // Imágenes subidas por el usuario
  const imagenes = {};
  for (const s of servicio.secciones) for (const c of s.campos) {
    if (c.tipo === "imagen" && v[c.id]) imagenes[c.id] = await cargarImagen(v[c.id]).catch(() => null);
  }

  // ── Construcción de bloques (alto + función de dibujo) ──
  const bloques = [];
  const anadir = (b) => bloques.push(b);
  const etiqueta = (doc, t, y) => doc.texto(t.toUpperCase(), M, y, { px: 14, peso: "700", color: colores.gris, esp: 2 });

  const secciones = servicio.secciones.filter((s) => (!docDef.secciones || docDef.secciones.includes(s.id)) && (!s.si || s.si(v)));
  for (const s of secciones) {
    const campos = s.campos.filter((c) => c.enDoc !== false && (!docDef.ocultar || !docDef.ocultar.includes(c.id)) && campoVisible(c, v));
    const contenido = [];
    let fila = [];
    const cerrarFila = () => { if (fila.length) { contenido.push({ tipo: "fila", campos: fila }); fila = []; } };
    // Imagen «lateral» (p. ej. el DNI): va a la derecha del nombre y los datos cortos de la sección
    const lat = campos.find((c) => c.tipo === "imagen" && c.lateral && imagenes[c.id]);
    const ficha = lat ? { tipo: "ficha", c: lat, im: imagenes[lat.id], titular: "", datos: [] } : null;
    for (const c of campos) {
      if (ficha && c === lat) continue;
      if (ficha && (c.doc === "titular" || (GRUPO_CORTO.includes(c.tipo) && c.doc !== "ancho"))) {
        const t = textoCampo(c, v); if (!t) continue;
        if (c.doc === "titular") ficha.titular = t;
        else if (t.length > 34) { cerrarFila(); contenido.push({ tipo: "ancho", c, t }); }
        else ficha.datos.push({ c, t });
        continue;
      }
      if (c.tipo === "zonas") { cerrarFila(); const l = (v[c.id] || []).filter((z) => z.zona && z.tipo); if (l.length) contenido.push({ tipo: "zonas", c, lista: l }); continue; }
      if (c.tipo === "equipo") { cerrarFila(); const l = (v[c.id] || []).filter((m) => m.nombre); if (l.length) contenido.push({ tipo: "equipo", c, lista: l }); continue; }
      if (c.tipo === "imagen") { cerrarFila(); if (imagenes[c.id]) contenido.push({ tipo: "imagen", c, im: imagenes[c.id] }); continue; }
      const t = textoCampo(c, v);
      if (!t) continue;
      if (c.doc === "titular") { cerrarFila(); contenido.push({ tipo: "titular", t }); continue; }
      if (c.tipo === "area") { cerrarFila(); contenido.push({ tipo: "area", c, t }); continue; }
      if (c.tipo === "chips") { cerrarFila(); contenido.push({ tipo: "chips", c, lista: v[c.id] }); continue; }
      if (t.length > 34) { cerrarFila(); contenido.push({ tipo: "ancho", c, t }); continue; }
      fila.push({ c, t }); if (fila.length === 3) cerrarFila();
    }
    cerrarFila();
    if (ficha) contenido.unshift(ficha);
    if (!contenido.length) continue;

    anadir({ alto: 58, titulo: true, dibujar: (doc, y) => doc.titulo((s.tituloDoc || s.titulo).toUpperCase(), y + 30) });
    for (const k of contenido) {
      if (k.tipo === "ficha") {
        const esc = Math.min(300 / k.im.width, 176 / k.im.height, 2);
        const iw = Math.round(k.im.width * esc), ih = Math.round(k.im.height * esc);
        const ix = W - M - iw, lw = ix - 30 - M, cw = lw / 2;
        const top = k.titular ? 54 : 0, filas = Math.ceil(k.datos.length / 2);
        anadir({ alto: Math.max(top + filas * 64, ih + 46), dibujar: (doc, y) => {
          doc.rect(ix - 1, y + 11, iw + 2, ih + 2, 8, null, colores.linea, 1.5);
          doc.ctx.save(); doc.ctx.beginPath(); doc.ctx.roundRect ? doc.ctx.roundRect(ix, y + 12, iw, ih, 7) : doc.ctx.rect(ix, y + 12, iw, ih); doc.ctx.clip();
          doc.ctx.drawImage(k.im, ix, y + 12, iw, ih); doc.ctx.restore();
          doc.texto((k.c.pieDoc || k.c.etiquetaDoc || k.c.etiqueta).toUpperCase(), ix + iw / 2, y + ih + 34, { px: 12, peso: "700", color: colores.gris, align: "center", esp: 1.5 });
          if (k.titular) doc.texto(doc.recortar(k.titular, lw, 36, PESO_TITULO, FUENTE_TITULO), M, y + 38, { px: 36, peso: PESO_TITULO, fam: FUENTE_TITULO });
          k.datos.forEach((f, i) => doc.dato(f.c.etiquetaDoc || f.c.etiqueta, f.t, M + (i % 2) * cw, y + top + 18 + Math.floor(i / 2) * 64, cw));
        } });
      } else if (k.tipo === "titular") anadir({ alto: 54, dibujar: (doc, y) => doc.texto(doc.recortar(k.t, ANCHO, 36, PESO_TITULO, FUENTE_TITULO), M, y + 38, { px: 36, peso: PESO_TITULO, fam: FUENTE_TITULO }) });
      else if (k.tipo === "fila") {
        const cw = ANCHO / 3;
        anadir({ alto: 64, dibujar: (doc, y) => k.campos.forEach((f, i) => doc.dato(f.c.etiquetaDoc || f.c.etiqueta, f.t, M + i * cw, y + 18, cw)) });
      } else if (k.tipo === "ancho") {
        const r = lineas(k.t, 21, ANCHO).slice(0, 3);
        anadir({ alto: 30 + r.length * 28 + 8, dibujar: (doc, y) => { etiqueta(doc, k.c.etiquetaDoc || k.c.etiqueta, y + 18); doc.parrafo(k.t, M, y + 48, ANCHO, { px: 21, lh: 28, max: 3 }); } });
      } else if (k.tipo === "area") {
        const r = lineas(k.t, 20, ANCHO).slice(0, 14);
        anadir({ alto: 30 + r.length * 28 + 10, dibujar: (doc, y) => { etiqueta(doc, k.c.etiquetaDoc || k.c.etiqueta, y + 18); doc.parrafo(k.t, M, y + 48, ANCHO, { px: 20, lh: 28, max: 14 }); } });
      } else if (k.tipo === "chips") {
        med.font = `700 17px ${FUENTE_TEXTO}`;
        let x = M, filas = 1;
        k.lista.forEach((t) => { const w = med.measureText(t).width + 30; if (x + w > W - M) { x = M; filas++; } x += w + 10; });
        anadir({ alto: 30 + filas * 44, dibujar: (doc, y) => {
          etiqueta(doc, k.c.etiquetaDoc || k.c.etiqueta, y + 18);
          let px = M, py = y + 30; doc.fuente(17, "700");
          k.lista.forEach((t) => {
            const w = doc.ctx.measureText(t).width + 30;
            if (px + w > W - M) { px = M; py += 44; }
            doc.rect(px, py, w, 34, 17, colores.acentoSuave || "#EEF2F6", null);
            doc.texto(t, px + 15, py + 23, { px: 17, peso: "700", color: colores.chipTinta || colores.cab });
            px += w + 10;
          });
        } });
      } else if (k.tipo === "imagen") {
        const maxW = ANCHO, maxH = 420, esc = Math.min(maxW / k.im.width, maxH / k.im.height, 1.6);
        const iw = k.im.width * esc, ih = k.im.height * esc;
        anadir({ alto: 36 + ih + 12, dibujar: (doc, y) => {
          etiqueta(doc, k.c.etiquetaDoc || k.c.etiqueta, y + 18);
          doc.rect(M - 1, y + 31, iw + 2, ih + 2, 6, null, colores.linea, 1.5);
          doc.ctx.save(); doc.ctx.beginPath(); doc.ctx.roundRect ? doc.ctx.roundRect(M, y + 32, iw, ih, 5) : doc.ctx.rect(M, y + 32, iw, ih); doc.ctx.clip();
          doc.ctx.drawImage(k.im, M, y + 32, iw, ih); doc.ctx.restore();
        } });
      } else if (k.tipo === "equipo") {
        anadir({ alto: 62 + k.lista.length * 36, dibujar: (doc, y) => {
          etiqueta(doc, k.c.etiquetaDoc || k.c.etiqueta, y + 18);
          const cols = [M, M + 470, M + 800];
          ["Nombre", "Cargo", "Función"].forEach((h, i) => doc.texto(h.toUpperCase(), cols[i], y + 50, { px: 13, peso: "700", color: colores.gris, esp: 1.5 }));
          doc.linea(M, y + 60, W - M, y + 60, colores.linea, 1.5);
          k.lista.forEach((m, i) => {
            const yy = y + 88 + i * 36;
            doc.texto(doc.recortar(m.nombre, 450, 20, "700"), cols[0], yy, { px: 20, peso: "700" });
            doc.texto(doc.recortar(m.cargo || "—", 310, 19), cols[1], yy, { px: 19 });
            const fun = [m.sar ? "Especialista SAR" : "", m.piloto ? "Piloto" : ""].filter(Boolean).join(" · ") || "Apoyo EMS";
            doc.texto(doc.recortar(fun, W - M - cols[2], 19), cols[2], yy, { px: 19, color: m.sar ? colores.cab : colores.gris, peso: m.sar ? "700" : "400" });
          });
        } });
      } else if (k.tipo === "zonas") {
        const k2 = 0.86, conDesc = k.lista.length <= 6;
        const listaH = k.lista.reduce((s2, z) => s2 + (conDesc && z.desc ? 78 : 44), 0);
        const marca = k.c.destacar && k.lista.some((z) => z.destacado) ? k.c.destacar : null;
        anadir({ alto: Math.max(marca ? 372 : 340, listaH + 20), dibujar: (doc, y) => dibujarZonas(doc, k.lista, y + 8, k2, conDesc, colores, marca) });
      }
    }
  }

  // Declaración formal (p. ej. la certificación del acta de defunción)
  if (docDef.declaracion) {
    const t = docDef.declaracion(v);
    const r = lineas(t, 20, ANCHO).slice(0, 10);
    anadir({ alto: 58, titulo: true, dibujar: (doc, y) => doc.titulo((docDef.tituloDeclaracion || "Certificación").toUpperCase(), y + 30) });
    anadir({ alto: 20 + r.length * 30, dibujar: (doc, y) => doc.parrafo(t, M, y + 26, ANCHO, { px: 20, lh: 30, max: 10 }) });
  }

  // Conclusión / resumen
  if (docDef.resumen !== false && v.conclusion && v.conclusion.trim()) {
    const r = lineas(v.conclusion, 19, ANCHO).slice(0, 18);
    anadir({ alto: 58, titulo: true, dibujar: (doc, y) => doc.titulo((servicio.tituloResumen || "CONCLUSIÓN").toUpperCase(), y + 30) });
    anadir({ alto: 20 + r.length * 28, dibujar: (doc, y) => doc.parrafo(v.conclusion, M, y + 26, ANCHO, { px: 19, lh: 28, max: 18 }) });
  }

  // ── Paginación ──
  const INICIO1 = 292, INICIO2 = 172, LIMITE = H - 104, HUECO = 10, FIRMA = H - 262 - 18;
  const paginas = [[]];
  let y = INICIO1;
  bloques.forEach((b, i) => {
    const sig = bloques[i + 1];
    const necesita = b.titulo && sig ? b.alto + sig.alto : b.alto;
    if (y + necesita > LIMITE && paginas[paginas.length - 1].length) { paginas.push([]); y = INICIO2; }
    paginas[paginas.length - 1].push({ b, y });
    y += b.alto + HUECO;
  });
  if (y - HUECO > FIRMA) paginas.push([]);

  // ── Dibujo ──
  const numero = v._numero;
  const fechaCab = docDef.fechaCabecera ? docDef.fechaCabecera(v) : "";
  return paginas.map((items, p) => {
    const canvas = document.createElement("canvas");
    const doc = crearDocumento(canvas, { colores });
    if (p === 0) doc.cabecera({ logo, org: docDef.org, titulo: docDef.titulo, subtitulo: docDef.subtitulo, etiquetaNumero: docDef.etiquetaNumero || "Nº DE DOCUMENTO", numero, fecha: fechaCab });
    else doc.cabeceraCompacta({ logo, titulo: docDef.titulo, numero });
    items.forEach(({ b, y: by }) => b.dibujar(doc, by));
    if (p === paginas.length - 1) {
      doc.firma({ firma: v._firma, nombre: v._medico, cargo: v._cargo, etiqueta: docDef.etiquetaFirma || servicio.etiquetaFirma || "FACULTATIVO RESPONSABLE", fechaEmision: v._emision, sello, nota: docDef.nota });
    }
    doc.pie({ izquierda: docDef.pie || "HOSPITAL CENTRAL · DOCUMENTO MÉDICO-LEGAL", referencia: numero, pagina: paginas.length > 1 ? `PÁGINA ${p + 1} DE ${paginas.length}` : "" });
    return canvas;
  });
}

/**
 * Figura frontal y posterior con marcadores numerados y lista de hallazgos a la derecha.
 * marca = { etiqueta, doc } resalta en rojo los hallazgos con «destacado» (p. ej. lesiones mortales).
 */
function dibujarZonas(doc, lista, fy, k, conDesc, colores, marca) {
  const { ctx, M, W } = doc;
  const ROJO = colores.destacado || "#B3261E";
  const fxF = M + 10, fxP = M + 170;
  dibujarFigura(ctx, fxF, fy, k, "F"); dibujarFigura(ctx, fxP, fy, k, "P");
  doc.texto("FRONTAL", fxF + 75 * k, fy + 318, { px: 13, peso: "700", color: colores.gris, align: "center", esp: 2 });
  doc.texto("POSTERIOR", fxP + 75 * k, fy + 318, { px: 13, peso: "700", color: colores.gris, align: "center", esp: 2 });
  const marcado = (l) => !!(marca && l.destacado);
  // Leyenda
  if (marca) {
    const ly0 = fy + 348;
    ctx.beginPath(); ctx.arc(M + 18, ly0 - 5, 9, 0, Math.PI * 2); ctx.fillStyle = ROJO; ctx.fill();
    ctx.beginPath(); ctx.arc(M + 18, ly0 - 5, 13, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = ROJO; ctx.stroke();
    doc.texto(marca.etiqueta, M + 38, ly0, { px: 15, peso: "700", color: ROJO });
    ctx.beginPath(); ctx.arc(M + 188, ly0 - 5, 9, 0, Math.PI * 2); ctx.fillStyle = colores.acento; ctx.fill();
    doc.texto("Otro hallazgo", M + 204, ly0, { px: 15, color: colores.gris });
  }
  // Primero los normales y encima los destacados, para que estos no queden tapados
  const orden = lista.map((l, i) => ({ l, i })).sort((a, b) => marcado(a.l) - marcado(b.l));
  const puestos = [];
  const pos = {};
  // Las posiciones se reparten en el orden de la lista (los números no cambian de sitio)
  lista.forEach((l, i) => {
    const z = zonaPorId(l.zona); if (!z) return;
    const ox0 = (z.v === "F" ? fxF : fxP) + z.x * k, oy0 = fy + z.y * k;
    const fuera = z.x < 75 ? -1 : z.x > 75 ? 1 : (i % 2 ? 1 : -1);
    const cand = [[0, 0], [fuera * 30, -10], [fuera * 30, 16], [fuera * 56, 0], [-fuera * 30, -10], [fuera * 56, 26], [fuera * 56, -26], [-fuera * 56, 0]];
    let px = ox0, py = oy0;
    for (const [dx, dy] of cand) { const tx = ox0 + dx, ty = oy0 + dy; if (puestos.every(([qx, qy]) => Math.hypot(qx - tx, qy - ty) >= 28)) { px = tx; py = ty; break; } }
    puestos.push([px, py]);
    pos[i] = { ox0, oy0, px, py };
  });
  orden.forEach(({ l, i }) => {
    const p = pos[i]; if (!p) return;
    const col = marcado(l) ? ROJO : colores.acento;
    if (p.px !== p.ox0 || p.py !== p.oy0) { doc.linea(p.ox0, p.oy0, p.px, p.py, col, 1.5); ctx.beginPath(); ctx.arc(p.ox0, p.oy0, 3, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
    ctx.beginPath(); ctx.arc(p.px, p.py, 12, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#FFFFFF"; ctx.stroke();
    if (marcado(l)) { ctx.beginPath(); ctx.arc(p.px, p.py, 16, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = ROJO; ctx.stroke(); }
    doc.texto(String(i + 1), p.px, p.py + 5, { px: 14, peso: "700", color: "#FFFFFF", align: "center" });
  });
  const lx = M + 340, lw = W - M - lx;
  let ly = fy;
  lista.forEach((l, i) => {
    const m = marcado(l), col = m ? ROJO : colores.acento;
    ctx.beginPath(); ctx.arc(lx + 13, ly + 13, 13, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    doc.texto(String(i + 1), lx + 13, ly + 19, { px: 15, peso: "700", color: "#FFFFFF", align: "center" });
    let tagW = 0;
    if (m) {
      const tag = (marca.doc || marca.etiqueta).toUpperCase();
      doc.fuente(13, "700"); tagW = doc.ctx.measureText(tag).width + 18 + tag.length * 1.5;
      doc.rect(W - M - tagW, ly + 1, tagW, 26, 13, ROJO, null);
      doc.texto(tag, W - M - tagW / 2, ly + 19, { px: 13, peso: "700", color: "#FFFFFF", align: "center", esp: 1.5 });
    }
    doc.texto(doc.recortar(`${l.tipo} · ${zonaPorId(l.zona) ? zonaPorId(l.zona).nombre : "—"}`, lw - 40 - (tagW ? tagW + 12 : 0), 20, "700"), lx + 38, ly + 20, { px: 20, peso: "700", color: m ? ROJO : undefined });
    ly += 22;
    if (conDesc && l.desc) ly = doc.parrafo(l.desc, lx + 38, ly + 24, lw - 40, { px: 17, lh: 23, max: 2, color: colores.gris }) + 30;
    else ly += 22;
  });
}
