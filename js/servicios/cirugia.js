/* Servicio: Cirugía general → Informe quirúrgico */
window.SERVICIO = (() => {
  const SALUD = "Salud / traumática", ESTETICA = "Estética / reconstructiva";
  const esSalud = (v) => v.tipo !== ESTETICA;
  const esEstetica = (v) => v.tipo === ESTETICA;
  return {
    id: "cirugia",
    nombre: "Informe quirúrgico",
    org: "Hospital Central · Cirugía general",
    intro: "Rellena el informe al terminar la intervención, con el paciente ya en la habitación. Los pasos IC están en la pestaña <b>Protocolo IC</b>.",
    protocolo: "cirugia",
    colores: { acento: "#0F8B8D", acentoSuave: "#DDF3F2", orgCab: "#9FE3E0", chipTinta: "#0B5E5F" },
    tituloFacultativo: "Cirujano responsable",
    etiquetaFirma: "CIRUJANO RESPONSABLE",
    tituloResumen: "Resumen de la intervención",
    textoGenerar: "Generar informe quirúrgico",
    campoFecha: "fecha", campoNombre: "nombre",
    documentos: [{
      id: "informe", nombre: "Informe quirúrgico", titulo: "INFORME QUIRÚRGICO",
      org: "HOSPITAL CENTRAL · CIRUGÍA GENERAL", subtitulo: "Intervención, cierre y postoperatorio",
      unaPagina: true, agrupar: true,
      prefijo: "QX", etiquetaNumero: "Nº DE INFORME", archivo: "Informe_quirurgico", pie: "HOSPITAL CENTRAL · INFORME MÉDICO",
      fechaCabecera: (v) => fechaHoraTexto(v.fecha),
      nota: "Informe médico emitido tras la intervención. Consérvelo junto a su historial clínico.",
    }],
    secciones: [
      { id: "paciente", titulo: "Paciente", campos: [
        { id: "nombre", tipo: "texto", etiqueta: "Nombre y apellidos", req: true, ancho: true, doc: "titular", placeholder: "Nombre y apellidos del paciente" },
        { id: "nacimiento", tipo: "fecha", etiqueta: "Fecha de nacimiento" },
        { id: "edad", tipo: "calculado", etiqueta: "Edad", calc: (v) => edadEn(v.nacimiento, v.fecha) },
        { id: "sexo", tipo: "select", etiqueta: "Sexo", opciones: ["Masculino", "Femenino"], valor: "Masculino" },
        { id: "telefono", tipo: "texto", etiqueta: "Teléfono", opcional: true, placeholder: "Número de contacto" },
        { id: "foto_dni", tipo: "imagen", etiqueta: "Foto del DNI", opcional: true, lateral: true, pieDoc: "DNI del paciente", ayuda: "El protocolo pide adjuntar la foto del DNI al informe médico. Sale junto a los datos del paciente." },
      ] },
      { id: "intervencion", titulo: "Intervención", campos: [
        { id: "fecha", tipo: "fechahora", etiqueta: "Fecha y hora", req: true, valor: "ahora" },
        { id: "zona", tipo: "texto", etiqueta: "Zona intervenida", req: true, placeholder: "Ej.: abdomen, rostro, pierna derecha" },
        { id: "tipo", tipo: "segmentos", etiqueta: "Tipo de cirugía", req: true, opciones: [SALUD, ESTETICA], columnas: 2 },
        { id: "diagnostico", tipo: "texto", etiqueta: "Diagnóstico preoperatorio", ancho: true, si: esSalud, placeholder: "Ej.: herida por arma de fuego en abdomen con hemorragia interna" },
        { id: "cambio", tipo: "texto", etiqueta: "Cambio solicitado", ancho: true, si: esEstetica, placeholder: "Ej.: rinoplastia y remodelación mandibular" },
      ] },
      { id: "anestesia", titulo: "Preparación y anestesia", campos: [
        { id: "preparacion", tipo: "chips", etiqueta: "Preparación", opciones: ["Lavado quirúrgico y guantes estériles", "Desinfección con yodo", "Monitor de constantes", "Mascarilla de oxígeno"], valor: ["Lavado quirúrgico y guantes estériles", "Desinfección con yodo", "Monitor de constantes", "Mascarilla de oxígeno"] },
        { id: "anestesia", tipo: "select", etiqueta: "Anestesia", opciones: ["General (Propofol IV)", "Sedación", "Local"], valor: "General (Propofol IV)" },
        { id: "constantes", tipo: "select", etiqueta: "Constantes durante la cirugía", opciones: ["Estables", "Inestables"], valor: "Estables" },
      ] },
      { id: "procedimiento", titulo: "Procedimiento", campos: [
        { id: "resultado_salud", tipo: "segmentos", etiqueta: "Resultado", etiquetaDoc: "Resultado", si: esSalud, opciones: ["Lesión estabilizada sin complicaciones", "Estabilizada con complicaciones", "No se logra estabilizar"], columnas: 3, valor: "Lesión estabilizada sin complicaciones" },
        { id: "resultado_estetica", tipo: "segmentos", etiqueta: "Resultado", etiquetaDoc: "Resultado", si: esEstetica, opciones: ["Cambio realizado con éxito", "Resultado parcial"], columnas: 2, valor: "Cambio realizado con éxito" },
        { id: "objetos", tipo: "texto", etiqueta: "Objetos extraídos", opcional: true, si: esSalud, placeholder: "Ej.: proyectil de 9 mm" },
        { id: "descripcion", tipo: "area", etiqueta: "Descripción del procedimiento", opcional: true, placeholder: "Lo que se hizo en quirófano: incisión, reparación, hallazgos…" },
      ] },
      { id: "cierre", titulo: "Cierre", campos: [
        { id: "tecnica_salud", tipo: "select", etiqueta: "Técnica de cierre", si: esSalud, opciones: ["Sutura por capas con hilo de seda", "Grapas quirúrgicas"], valor: "Sutura por capas con hilo de seda" },
        { id: "puntos", tipo: "numero", etiqueta: "Número de puntos", si: esSalud, min: 1, paso: 1, ayuda: "El resultado de /dados." },
        { id: "tecnica_estetica", tipo: "select", etiqueta: "Técnica de cierre", si: esEstetica, opciones: ["Sutura intradérmica y cremas regeneradoras"], valor: "Sutura intradérmica y cremas regeneradoras" },
        { id: "acabado", tipo: "select", etiqueta: "Acabado", si: esEstetica, opciones: ["Limpio y sin imperfecciones", "Con pequeñas imperfecciones"], valor: "Limpio y sin imperfecciones" },
      ] },
      { id: "post", titulo: "Postoperatorio", campos: [
        { id: "despertar", tipo: "segmentos", etiqueta: "Estado al despertar", opciones: ["Recuperación estable", "Requiere vigilancia", "Crítico"], columnas: 3, valor: "Recuperación estable" },
        { id: "destino", tipo: "select", etiqueta: "Destino", opciones: ["Hospitalización", "UCI", "Alta domiciliaria"], valor: "Hospitalización" },
        { id: "reposo", tipo: "numero", etiqueta: "Reposo recomendado", unidad: "días", min: 0, paso: 1 },
        { id: "medicacion", tipo: "texto", etiqueta: "Medicación", opcional: true, placeholder: "Ej.: analgésicos cada 8 horas" },
        { id: "indicaciones", tipo: "area", etiqueta: "Indicaciones", opcional: true, placeholder: "Curas, revisión, actividad física…" },
      ] },
    ],
    resumen(v) {
      const fem = v.sexo === "Femenino";
      const p = fem ? "La paciente" : "El paciente";
      const f = [];
      const anest = v.anestesia === "General (Propofol IV)" ? "anestesia general con propofol intravenoso" : (v.anestesia || "anestesia").toLowerCase();
      if (esEstetica(v)) {
        f.push(`Se realiza cirugía estética / reconstructiva${v.zona ? ` en ${v.zona.toLowerCase()}` : ""}${v.cambio ? ` (${v.cambio.toLowerCase()})` : ""} bajo ${anest}.`);
      } else {
        f.push(`Se realiza cirugía de salud / traumática${v.zona ? ` en ${v.zona.toLowerCase()}` : ""}${v.diagnostico ? ` por ${v.diagnostico.charAt(0).toLowerCase() + v.diagnostico.slice(1)}` : ""} bajo ${anest}.`);
      }
      f.push(v.constantes === "Inestables" ? "Las constantes fueron inestables durante la intervención." : "Las constantes se mantuvieron estables durante toda la intervención.");
      if (esSalud(v)) {
        if (v.resultado_salud) f.push(`${v.resultado_salud}.`);
        if (v.objetos) f.push(`Se extrae: ${v.objetos.toLowerCase()}.`);
        f.push(`Cierre mediante ${(v.tecnica_salud || "sutura").toLowerCase()}${v.puntos ? ` con ${v.puntos} puntos` : ""}.`);
      } else {
        if (v.resultado_estetica) f.push(`${v.resultado_estetica}.`);
        f.push(`Cierre mediante sutura intradérmica y cremas regeneradoras, con acabado ${(v.acabado || "limpio").toLowerCase()}.`);
      }
      const destino = { "Hospitalización": "se traslada a hospitalización para reposo", "UCI": "ingresa en la UCI para vigilancia", "Alta domiciliaria": "recibe el alta domiciliaria" }[v.destino] || "";
      f.push(`${p} despierta con ${(v.despertar || "recuperación estable").toLowerCase()} y ${destino}${v.reposo ? `, con reposo recomendado de ${v.reposo} días` : ""}.`);
      return f.join(" ");
    },
    ejemplo: {
      nombre: "Lucía Martín", nacimiento: "1994-07-21", sexo: "Femenino", telefono: "555-0187",
      zona: "Abdomen", tipo: SALUD, diagnostico: "Herida por arma de fuego en abdomen con hemorragia interna",
      resultado_salud: "Lesión estabilizada sin complicaciones", objetos: "Proyectil de 9 mm",
      descripcion: "Laparotomía media. Se localiza perforación de intestino delgado, se repara y se extrae el proyectil. Lavado de cavidad y control de la hemorragia.",
      puntos: "14", despertar: "Recuperación estable", destino: "Hospitalización", reposo: "10",
      medicacion: "Analgésicos cada 8 horas y antibiótico durante 7 días", indicaciones: "Revisión de la herida en 5 días. Evitar esfuerzos durante dos semanas.",
    },
  };
})();
