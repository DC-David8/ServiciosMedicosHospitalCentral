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
        { id: "tension", tipo: "texto", etiqueta: "Tensión arterial", unidad: "mmHg", placeholder: "120/80", modoFrases: "reemplazar", frases: ["110/70", "118/76", "120/80", "130/85", "140/90"] },
        { id: "peso", tipo: "numero", etiqueta: "Peso", unidad: "kg", min: 20, maxv: 250, paso: 0.1 },
        { id: "molestias", tipo: "texto", etiqueta: "Molestias que refiere", ancho: true, si: (v) => v.motivo === MOL, placeholder: "Pulsa las de abajo o escribe",
          frases: ["Dolor pélvico", "Dolor en la parte baja del abdomen", "Sangrado irregular", "Picor o escozor vaginal", "Flujo anormal", "Dolor menstrual intenso", "Molestias al orinar", "Desde hace una semana", "Desde hace varios días"] },
      ] },
      { id: "ecografia", titulo: "Ecografía", campos: [
        { id: "hallazgo", tipo: "select", etiqueta: "Hallazgo principal", opciones: ["Útero sano", "Desarrollo fetal normal", "Quiste pequeño", "Otro hallazgo"] },
        { id: "eco_desc", tipo: "area", etiqueta: "Descripción", opcional: true, placeholder: "Pulsa las frases de abajo o escribe lo que se ve en el monitor",
          frases: (v) => v.motivo === EMB
            ? ["Feto único con movimientos activos.", "Anatomía fetal acorde a la edad gestacional.", "Placenta en posición normal.", "Líquido amniótico en cantidad normal.", "Latido cardíaco fetal visible."]
            : ["Útero de tamaño y forma normales.", "Endometrio sin alteraciones.", "Ovarios sin alteraciones.", "Quiste simple de pequeño tamaño en un ovario.", "Sin líquido libre en la pelvis."] },
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
        { id: "diagnostico", tipo: "select", etiqueta: "Diagnóstico", ancho: true, otro: true, placeholder: "Selecciona el diagnóstico",
          opciones: ["Sin alteraciones", "Inflamación leve, sin signos de gravedad", "Infección vaginal leve", "Infección urinaria", "Quiste ovárico funcional", "Dolor menstrual (dismenorrea)", "Ciclo menstrual irregular"] },
        { id: "muestras", tipo: "check", etiqueta: "Muestras enviadas al laboratorio", etiquetaDoc: "Muestras de laboratorio", textoSi: "Enviadas" },
        { id: "tratamiento", tipo: "area", etiqueta: "Tratamiento", opcional: true, placeholder: "Pulsa las frases de abajo o escribe fármaco, dosis y duración",
          frases: ["Antiinflamatorio cada 8 horas durante 5 días.", "Antibiótico durante 7 días.", "Óvulos vaginales durante 6 noches.", "Analgésico si hay dolor.", "Reposo relativo durante 48 horas.", "Abundante hidratación.", "Sin tratamiento por ahora."] },
      ] },
      { id: "seguimiento", titulo: "Seguimiento", campos: [
        { id: "proxima", tipo: "fecha", etiqueta: "Próxima revisión" },
        { id: "observaciones", tipo: "area", etiqueta: "Observaciones", opcional: true, placeholder: "Pulsa las frases de abajo o escribe",
          frases: ["Paciente tranquila y colaboradora.", "Buena evolución.", "Se resuelven sus dudas.", "Acudir a urgencias si hay sangrado abundante o dolor intenso.", "Se recomienda dieta equilibrada y ejercicio suave."] },
      ] },
    ],
    conservar: ["nombre", "nacimiento", "telefono", "captura", "fecha", "tension", "peso"],
    casos: [
      { nombre: "Revisión rutinaria", desc: "Todo normal, próxima en 6 meses",
        valores: { motivo: RUT, hallazgo: "Útero sano", eco_desc: "Útero de tamaño y forma normales. Ovarios sin alteraciones.", diagnostico: "Sin alteraciones",
          tratamiento: "Sin tratamiento por ahora.", proxima: "+180d", observaciones: "Paciente tranquila y colaboradora. Se resuelven sus dudas." } },
      { nombre: "Infección leve", desc: "Picor o flujo, óvulos y control en 2 semanas",
        valores: { motivo: MOL, molestias: "Picor o escozor vaginal, flujo anormal, desde hace varios días", hallazgo: "Útero sano", eco_desc: "Útero de tamaño y forma normales. Sin líquido libre en la pelvis.",
          diagnostico: "Infección vaginal leve", muestras: true, tratamiento: "Óvulos vaginales durante 6 noches. Abundante hidratación.", proxima: "+14d",
          observaciones: "Acudir a urgencias si hay sangrado abundante o dolor intenso." } },
      { nombre: "Dolor pélvico (quiste)", desc: "Quiste pequeño, antiinflamatorio y control en 1 mes",
        valores: { motivo: MOL, molestias: "Dolor pélvico, desde hace una semana", hallazgo: "Quiste pequeño", eco_desc: "Útero de tamaño y forma normales. Quiste simple de pequeño tamaño en un ovario.",
          diagnostico: "Quiste ovárico funcional", tratamiento: "Antiinflamatorio cada 8 horas durante 5 días. Reposo relativo durante 48 horas.", proxima: "+30d",
          observaciones: "Acudir a urgencias si hay sangrado abundante o dolor intenso." } },
      { nombre: "Embarazo · 1.er trimestre", desc: "Semana 10, ácido fólico",
        valores: { motivo: EMB, hallazgo: "Desarrollo fetal normal", eco_desc: "Feto único con movimientos activos. Latido cardíaco fetal visible.", semanas: "10", latido: "Rápido y fuerte", fcf: "165",
          prescripcion: ["Ácido fólico"], copia_eco: true, proxima: "+28d", observaciones: "Buena evolución. Se resuelven sus dudas." } },
      { nombre: "Embarazo · 2.º trimestre", desc: "Semana 20, ecografía morfológica",
        valores: { motivo: EMB, hallazgo: "Desarrollo fetal normal", eco_desc: "Feto único con movimientos activos. Anatomía fetal acorde a la edad gestacional. Placenta en posición normal.", semanas: "20", latido: "Rápido y fuerte", fcf: "150",
          prescripcion: ["Ácido fólico", "Vitaminas prenatales"], copia_eco: true, proxima: "+28d", observaciones: "Buena evolución. Se recomienda dieta equilibrada y ejercicio suave." } },
      { nombre: "Embarazo · 3.er trimestre", desc: "Semana 32, hierro y control cada 2 semanas",
        valores: { motivo: EMB, hallazgo: "Desarrollo fetal normal", eco_desc: "Feto único con movimientos activos. Placenta en posición normal. Líquido amniótico en cantidad normal.", semanas: "32", latido: "Rápido y fuerte", fcf: "140",
          prescripcion: ["Vitaminas prenatales", "Hierro"], copia_eco: true, proxima: "+14d", observaciones: "Buena evolución. Acudir a urgencias si hay sangrado abundante o dolor intenso." } },
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
