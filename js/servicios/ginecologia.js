/* Servicio: Ginecología y obstetricia → Informe de consulta */
window.SERVICIO = (() => {
  const EMB = "Seguimiento de embarazo", MOL = "Molestias", RUT = "Revisión rutinaria";
  const fpp = (v) => {
    const s = Number(v.semanas);
    if (!v.fecha || !s || s < 1 || s > 42) return "";
    const d = new Date(v.fecha.slice(0, 10)); d.setDate(d.getDate() + Math.round((40 - s) * 7));
    return fechaTexto(d.toISOString().slice(0, 10));
  };
  return {
    id: "ginecologia",
    nombre: "Consulta de ginecología",
    org: "Hospital Central · Ginecología y obstetricia",
    intro: "Informe de la consulta para entregar a la paciente y guardar en su historial. Puedes adjuntar la captura de la ecografía. Los pasos IC están en la pestaña <b>Protocolo IC</b>.",
    protocolo: "ginecologia",
    colores: { acento: "#C2185B", acentoSuave: "#FCE4EC", orgCab: "#F8BBD0", chipTinta: "#8E1048" },
    etiquetaFirma: "FACULTATIVO RESPONSABLE",
    tituloResumen: "Diagnóstico y plan",
    textoGenerar: "Generar informe de consulta",
    campoFecha: "fecha", campoNombre: "nombre",
    documentos: [{
      id: "informe", nombre: "Informe de consulta", titulo: "INFORME DE CONSULTA",
      org: "HOSPITAL CENTRAL · GINECOLOGÍA Y OBSTETRICIA", subtitulo: "Exploración, ecografía y seguimiento",
      unaPagina: true, agrupar: true,
      prefijo: "GIN", etiquetaNumero: "Nº DE INFORME", archivo: "Informe_ginecologia", pie: "HOSPITAL CENTRAL · INFORME MÉDICO",
      fechaCabecera: (v) => fechaHoraTexto(v.fecha),
      nota: "Informe confidencial. Preséntelo en su próxima revisión.",
    }],
    secciones: [
      { id: "paciente", titulo: "Paciente", campos: [
        { id: "nombre", tipo: "texto", etiqueta: "Nombre y apellidos", req: true, ancho: true, doc: "titular", placeholder: "Nombre y apellidos de la paciente" },
        { id: "nacimiento", tipo: "fecha", etiqueta: "Fecha de nacimiento" },
        { id: "edad", tipo: "calculado", etiqueta: "Edad", calc: (v) => edadEn(v.nacimiento, v.fecha) },
        { id: "telefono", tipo: "texto", etiqueta: "Teléfono", opcional: true, placeholder: "Número de contacto" },
      ] },
      { id: "consulta", titulo: "Consulta y triaje", campos: [
        { id: "fecha", tipo: "fechahora", etiqueta: "Fecha y hora", req: true, valor: "ahora" },
        { id: "motivo", tipo: "segmentos", etiqueta: "Motivo de la consulta", req: true, opciones: [RUT, MOL, EMB], columnas: 3 },
        { id: "tension", tipo: "texto", etiqueta: "Tensión arterial", unidad: "mmHg", placeholder: "120/80" },
        { id: "peso", tipo: "numero", etiqueta: "Peso", unidad: "kg", min: 20, maxv: 250, paso: 0.1 },
        { id: "molestias", tipo: "texto", etiqueta: "Molestias que refiere", ancho: true, si: (v) => v.motivo === MOL, placeholder: "Ej.: dolor pélvico intermitente desde hace una semana" },
      ] },
      { id: "ecografia", titulo: "Ecografía", campos: [
        { id: "hallazgo", tipo: "select", etiqueta: "Hallazgo principal", opciones: ["Útero sano", "Desarrollo fetal normal", "Quiste pequeño", "Otro hallazgo"] },
        { id: "eco_desc", tipo: "area", etiqueta: "Descripción", opcional: true, placeholder: "Lo que se observa en el monitor" },
        { id: "captura", tipo: "imagen", etiqueta: "Captura de la ecografía", opcional: true, lateral: { ancho: 400, alto: 300, textos: true }, pieDoc: "Captura de la ecografía", ayuda: "Pega el recorte de la ecografía (Ctrl + V) o sube la captura. Sale junto a la descripción." },
      ] },
      { id: "embarazo", titulo: "Seguimiento de embarazo", si: (v) => v.motivo === EMB, campos: [
        { id: "semanas", tipo: "numero", etiqueta: "Semanas de gestación", min: 1, maxv: 42, paso: 1 },
        { id: "fpp", tipo: "calculado", etiqueta: "Fecha probable de parto", calc: fpp },
        { id: "latido", tipo: "segmentos", etiqueta: "Latido fetal (Doppler)", opciones: ["Rápido y fuerte", "Débil", "No detectado"], columnas: 3, valor: "Rápido y fuerte" },
        { id: "fcf", tipo: "numero", etiqueta: "Frecuencia cardíaca fetal", unidad: "lpm", min: 60, maxv: 220, paso: 1 },
        { id: "prescripcion", tipo: "chips", etiqueta: "Prescripción", opciones: ["Ácido fólico", "Vitaminas prenatales", "Hierro"], valor: ["Ácido fólico", "Vitaminas prenatales"] },
        { id: "copia_eco", tipo: "check", etiqueta: "Se entrega copia de la ecografía a la paciente", etiquetaDoc: "Copia de la ecografía", textoSi: "Entregada", valor: true },
      ] },
      { id: "salud", titulo: "Revisión de salud", si: (v) => v.motivo === MOL || v.motivo === RUT, campos: [
        { id: "diagnostico", tipo: "texto", etiqueta: "Diagnóstico", ancho: true, placeholder: "Ej.: inflamación leve, sin signos de gravedad" },
        { id: "muestras", tipo: "check", etiqueta: "Muestras enviadas al laboratorio", etiquetaDoc: "Muestras de laboratorio", textoSi: "Enviadas" },
        { id: "tratamiento", tipo: "area", etiqueta: "Tratamiento", opcional: true, placeholder: "Fármaco, dosis y duración" },
      ] },
      { id: "seguimiento", titulo: "Seguimiento", campos: [
        { id: "proxima", tipo: "fecha", etiqueta: "Próxima revisión" },
        { id: "observaciones", tipo: "area", etiqueta: "Observaciones", opcional: true },
      ] },
    ],
    resumen(v) {
      const f = [];
      const motivo = { [RUT]: "revisión rutinaria", [MOL]: "molestias", [EMB]: "seguimiento de embarazo" }[v.motivo] || "consulta";
      f.push(`La paciente acude por ${motivo}${v.motivo === MOL && v.molestias ? ` (${v.molestias.charAt(0).toLowerCase() + v.molestias.slice(1)})` : ""}.`);
      const cons = [v.tension ? `tensión arterial ${v.tension} mmHg` : "", v.peso ? `peso ${v.peso} kg` : ""].filter(Boolean);
      if (cons.length) f.push(`Constantes: ${unirEs(cons)}.`);
      if (v.hallazgo) f.push(`En la ecografía se observa: ${v.hallazgo.toLowerCase()}.`);
      if (v.motivo === EMB) {
        if (v.semanas) f.push(`Gestación de ${v.semanas} semanas${fpp(v) ? `, con fecha probable de parto el ${fpp(v)}` : ""}.`);
        if (v.latido) f.push(`Latido fetal ${v.latido.toLowerCase()}${v.fcf ? ` (${v.fcf} lpm)` : ""}.`);
        if (v.prescripcion && v.prescripcion.length) f.push(`Se prescribe ${unirEs(v.prescripcion.map((x) => x.toLowerCase()))}.`);
      } else {
        if (v.diagnostico) f.push(`Diagnóstico: ${v.diagnostico.charAt(0).toLowerCase() + v.diagnostico.slice(1)}.`);
        if (v.muestras) f.push("Se toman muestras para el laboratorio.");
        if (v.tratamiento) f.push(`Tratamiento: ${v.tratamiento.charAt(0).toLowerCase() + v.tratamiento.slice(1).replace(/\.$/, "")}.`);
      }
      if (v.proxima) f.push(`Próxima revisión el ${fechaTexto(v.proxima)}.`);
      return f.join(" ");
    },
    ejemplo: {
      nombre: "Sofía Reyes", nacimiento: "1998-03-02", telefono: "555-0110",
      motivo: EMB, tension: "118/76", peso: "64.5", hallazgo: "Desarrollo fetal normal",
      eco_desc: "Feto único, movimientos activos y anatomía acorde a la edad gestacional.",
      semanas: "20", latido: "Rápido y fuerte", fcf: "148", prescripcion: ["Ácido fólico", "Vitaminas prenatales"],
      observaciones: "Paciente tranquila y con buena evolución.",
    },
  };
})();
