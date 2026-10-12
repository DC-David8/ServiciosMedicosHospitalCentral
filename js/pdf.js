/*
 * Generador mínimo de PDF sin dependencias: una o varias páginas, cada una con una imagen JPEG a tamaño completo.
 * Uso: crearPdfDesdeCanvas(canvas, 612, 1008, "Título")          → Blob (una página)
 *      crearPdfDesdeCanvases([c1, c2], 612, 1008, "Título")      → Blob (varias páginas)
 * 612 × 1008 pt = papel Legal (8,5 × 14 in).
 */
function crearPdfDesdeCanvas(canvas, anchoPt, altoPt, titulo = "") {
  return crearPdfDesdeCanvases([canvas], anchoPt, altoPt, titulo);
}

function crearPdfDesdeCanvases(canvases, anchoPt, altoPt, titulo = "") {
  const enc = new TextEncoder();
  const partes = [];
  const offsets = [];
  let largo = 0;
  const push = (d) => { const u = typeof d === "string" ? enc.encode(d) : d; partes.push(u); largo += u.length; };
  const obj = (n, cuerpo) => { offsets[n] = largo; push(`${n} 0 obj\n${cuerpo}\nendobj\n`); };
  // Texto PDF en UTF-16BE para admitir tildes en el título
  const textoPdf = (t) => {
    let hex = "FEFF";
    for (const ch of t) {
      const c = ch.codePointAt(0);
      if (c > 0xffff) continue;
      hex += c.toString(16).padStart(4, "0").toUpperCase();
    }
    return `<${hex}>`;
  };
  const jpegDe = (canvas) => {
    const bin = atob(canvas.toDataURL("image/jpeg", 0.92).split(",")[1]);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  };

  // Objetos: 1 catálogo, 2 páginas, 3 info; por página i: página, imagen, contenido
  const n = canvases.length;
  const idPag = (i) => 4 + i * 3, idImg = (i) => 5 + i * 3, idCont = (i) => 6 + i * 3;
  const total = 3 + n * 3;
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, `<< /Type /Pages /Kids [${canvases.map((_, i) => `${idPag(i)} 0 R`).join(" ")}] /Count ${n} >>`);
  obj(3, `<< /Title ${textoPdf(titulo)} /Producer (Servicios Medicos Hospital Central) >>`);
  const contenido = `q ${anchoPt} 0 0 ${altoPt} 0 0 cm /Im0 Do Q`;
  canvases.forEach((canvas, i) => {
    obj(idPag(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${anchoPt} ${altoPt}] /Resources << /XObject << /Im0 ${idImg(i)} 0 R >> >> /Contents ${idCont(i)} 0 R >>`);
    const jpeg = jpegDe(canvas);
    offsets[idImg(i)] = largo;
    push(`${idImg(i)} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    push(jpeg);
    push("\nendstream\nendobj\n");
    obj(idCont(i), `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`);
  });

  const xref = largo;
  let tabla = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
  for (let k = 1; k <= total; k++) tabla += `${String(offsets[k]).padStart(10, "0")} 00000 n \n`;
  push(tabla + `trailer\n<< /Size ${total + 1} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(partes, { type: "application/pdf" });
}

/** Une varias páginas en una sola imagen alta (para compartir el documento como un único PNG). */
function unirPaginas(canvases) {
  if (canvases.length === 1) return canvases[0];
  const c = document.createElement("canvas");
  c.width = canvases[0].width;
  c.height = canvases.reduce((s, x) => s + x.height, 0);
  const ctx = c.getContext("2d");
  let y = 0;
  canvases.forEach((x) => { ctx.drawImage(x, 0, y); y += x.height; });
  return c;
}
