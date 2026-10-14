/* Servicio: Cirugía general → Informe quirúrgico */
window.SERVICIO = (() => {
  const SALUD = "Salud / traumática", ESTETICA = "Estética / reconstructiva";
  const esSalud = (v) => v.tipo !== ESTETICA;
  const esEstetica = (v) => v.tipo === ESTETICA;
  const ZONAS_QX = ["Abdomen", "Tórax", "Cabeza", "Rostro", "Nariz", "Mandíbula", "Cuello", "Espalda", "Hombro derecho", "Hombro izquierdo",
    "Brazo derecho", "Brazo izquierdo", "Mano derecha", "Mano izquierda", "Muslo derecho", "Muslo izquierdo", "Pierna derecha", "Pierna izquierda", "Pie derecho", "Pie izquierdo"];
  const FRASES_SALUD = [
    "Incisión sobre la zona afectada.", "Se localiza y se extrae el proyectil.", "Se localiza el sangrado y se controla la hemorragia.",
    "Se reparan los tejidos y órganos dañados.", "Reducción y fijación de la fractura.", "Se retiran restos y cuerpos extraños.",
    "Lavado de la cavidad con suero fisiológico.", "Se coloca un drenaje.", "Sin otros hallazgos.",
  ];
  const FRASES_ESTETICA = [
    "Marcado de la zona a modificar.", "Incisiones mínimas en zonas poco visibles.", "Remodelación del tejido según lo acordado con el paciente.",
    "Se retira el tejido sobrante.", "Comprobación de la simetría.", "Vendaje compresivo.",
  ];
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
        { id: "zona", tipo: "select", etiqueta: "Zona intervenida", req: true, opciones: ZONAS_QX, otro: true, placeholder: "Selecciona la zona", placeholderOtro: "Ej.: oreja izquierda" },
        { id: "tipo", tipo: "segmentos", etiqueta: "Tipo de cirugía", req: true, opciones: [SALUD, ESTETICA], columnas: 2 },
        { id: "diagnostico", tipo: "select", etiqueta: "Diagnóstico preoperatorio", ancho: true, si: esSalud, otro: true, placeholder: "Selecciona el diagnóstico",
          opciones: ["Herida por arma de fuego con hemorragia interna", "Herida por arma de fuego sin afectación de órganos", "Herida por arma blanca", "Fractura abierta",
            "Fractura cerrada desplazada", "Traumatismo por accidente de tráfico", "Hemorragia interna", "Quemaduras graves", "Apendicitis aguda", "Cuerpo extraño incrustado"] },
        { id: "cambio", tipo: "select", etiqueta: "Cambio solicitado", ancho: true, si: esEstetica, otro: true, placeholder: "Selecciona el cambio",
          opciones: ["Rinoplastia", "Remodelación mandibular", "Cambio de rasgos faciales", "Eliminación de cicatrices", "Cirugía de párpados", "Aumento de pecho", "Liposucción", "Retirada de tatuaje"] },
      ] },
      { id: "anestesia", titulo: "Preparación y anestesia", campos: [
        { id: "preparacion", tipo: "chips", etiqueta: "Preparación", opciones: ["Lavado quirúrgico y guantes estériles", "Desinfección con yodo", "Monitor de constantes", "Mascarilla de oxígeno"], valor: ["Lavado quirúrgico y guantes estériles", "Desinfección con yodo", "Monitor de constantes", "Mascarilla de oxígeno"] },
        { id: "anestesia", tipo: "select", etiqueta: "Anestesia", opciones: ["General (Propofol IV)", "Sedación", "Local"], valor: "General (Propofol IV)" },
        { id: "constantes", tipo: "select", etiqueta: "Constantes durante la cirugía", opciones: ["Estables", "Inestables"], valor: "Estables" },
      ] },
      { id: "procedimiento", titulo: "Procedimiento", campos: [
        { id: "resultado_salud", tipo: "segmentos", etiqueta: "Resultado", etiquetaDoc: "Resultado", si: esSalud, opciones: ["Lesión estabilizada sin complicaciones", "Estabilizada con complicaciones", "No se logra estabilizar"], columnas: 3, valor: "Lesión estabilizada sin complicaciones" },
        { id: "resultado_estetica", tipo: "segmentos", etiqueta: "Resultado", etiquetaDoc: "Resultado", si: esEstetica, opciones: ["Cambio realizado con éxito", "Resultado parcial"], columnas: 2, valor: "Cambio realizado con éxito" },
        { id: "objetos", tipo: "select", etiqueta: "Objetos extraídos", opcional: true, si: esSalud, otro: true, placeholder: "Ninguno",
          opciones: ["Proyectil de 9 mm", "Proyectil de fusil", "Perdigones", "Fragmentos de metralla", "Fragmentos de cristal", "Hoja de arma blanca"] },
        { id: "descripcion", tipo: "area", etiqueta: "Descripción del procedimiento", opcional: true, placeholder: "Pulsa las frases de abajo o escribe lo que se hizo en quirófano", frases: (v) => (esEstetica(v) ? FRASES_ESTETICA : FRASES_SALUD) },
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
        { id: "medicacion", tipo: "texto", etiqueta: "Medicación", opcional: true, placeholder: "Pulsa las de abajo o escribe",
          frases: ["Analgésicos cada 8 horas", "Antibiótico durante 7 días", "Antiinflamatorios cada 12 horas", "Protector gástrico", "Pomada cicatrizante"] },
        { id: "indicaciones", tipo: "area", etiqueta: "Indicaciones", opcional: true, placeholder: "Pulsa las frases de abajo o escribe",
          frases: (v) => esEstetica(v)
            ? ["Revisión en 7 días.", "No exponer la zona al sol durante un mes.", "Aplicar la crema regeneradora dos veces al día.", "Evitar golpes en la zona.", "Dormir boca arriba durante una semana."]
            : ["Revisión de la herida en 5 días.", "Curas diarias de la herida.", "Retirada de puntos en 10 días.", "No mojar la herida durante 48 horas.", "Evitar esfuerzos durante dos semanas.", "Volver al hospital si hay fiebre o sangrado."] },
      ] },
    ],
    conservar: ["nombre", "nacimiento", "sexo", "telefono", "foto_dni", "fecha"],
    casos: [
      { nombre: "Bala en abdomen", desc: "Hemorragia interna, laparotomía y extracción", falta: "tira /dados para los puntos",
        valores: { zona: "Abdomen", tipo: SALUD, diagnostico: "Herida por arma de fuego con hemorragia interna", objetos: "Proyectil de 9 mm",
          descripcion: "Incisión sobre la zona afectada. Se localiza el sangrado y se controla la hemorragia. Se localiza y se extrae el proyectil. Se reparan los tejidos y órganos dañados. Lavado de la cavidad con suero fisiológico.",
          destino: "Hospitalización", reposo: "10", medicacion: "Analgésicos cada 8 horas, antibiótico durante 7 días",
          indicaciones: "Revisión de la herida en 5 días. Evitar esfuerzos durante dos semanas. Volver al hospital si hay fiebre o sangrado." } },
      { nombre: "Bala en pierna o brazo", desc: "Sin afectación de órganos", falta: "elige el lado y tira /dados para los puntos",
        valores: { zona: "Pierna derecha", tipo: SALUD, diagnostico: "Herida por arma de fuego sin afectación de órganos", objetos: "Proyectil de 9 mm",
          descripcion: "Incisión sobre la zona afectada. Se localiza y se extrae el proyectil. Se reparan los tejidos y órganos dañados. Lavado de la cavidad con suero fisiológico.",
          destino: "Hospitalización", reposo: "5", medicacion: "Analgésicos cada 8 horas, antibiótico durante 7 días",
          indicaciones: "Curas diarias de la herida. Retirada de puntos en 10 días." } },
      { nombre: "Arma blanca", desc: "Herida incisa con reparación", falta: "elige la zona y tira /dados para los puntos",
        valores: { zona: "Tórax", tipo: SALUD, diagnostico: "Herida por arma blanca",
          descripcion: "Incisión sobre la zona afectada. Se localiza el sangrado y se controla la hemorragia. Se reparan los tejidos y órganos dañados. Sin otros hallazgos.",
          destino: "Hospitalización", reposo: "7", medicacion: "Analgésicos cada 8 horas, antibiótico durante 7 días",
          indicaciones: "Revisión de la herida en 5 días. No mojar la herida durante 48 horas." } },
      { nombre: "Fractura abierta", desc: "Reducción, fijación y grapas", falta: "elige la zona",
        valores: { zona: "Pierna derecha", tipo: SALUD, diagnostico: "Fractura abierta", tecnica_salud: "Grapas quirúrgicas",
          descripcion: "Se retiran restos y cuerpos extraños. Reducción y fijación de la fractura. Lavado de la cavidad con suero fisiológico.",
          destino: "Hospitalización", reposo: "30", medicacion: "Analgésicos cada 8 horas, antiinflamatorios cada 12 horas",
          indicaciones: "Revisión de la herida en 5 días. Evitar esfuerzos durante dos semanas." } },
      { nombre: "Accidente de tráfico grave", desc: "Hemorragia interna, pasa a la UCI", falta: "tira /dados para los puntos",
        valores: { zona: "Abdomen", tipo: SALUD, diagnostico: "Traumatismo por accidente de tráfico", constantes: "Inestables", resultado_salud: "Estabilizada con complicaciones",
          descripcion: "Incisión sobre la zona afectada. Se localiza el sangrado y se controla la hemorragia. Se reparan los tejidos y órganos dañados. Se coloca un drenaje.",
          despertar: "Requiere vigilancia", destino: "UCI", reposo: "21", medicacion: "Analgésicos cada 8 horas, antibiótico durante 7 días, protector gástrico",
          indicaciones: "Curas diarias de la herida. Volver al hospital si hay fiebre o sangrado." } },
      { nombre: "Rinoplastia", desc: "Cirugía estética de nariz",
        valores: { zona: "Nariz", tipo: ESTETICA, cambio: "Rinoplastia", anestesia: "Sedación",
          descripcion: "Marcado de la zona a modificar. Incisiones mínimas en zonas poco visibles. Remodelación del tejido según lo acordado con el paciente. Comprobación de la simetría. Vendaje compresivo.",
          destino: "Alta domiciliaria", reposo: "7", medicacion: "Analgésicos cada 8 horas, pomada cicatrizante",
          indicaciones: "Revisión en 7 días. Evitar golpes en la zona. Dormir boca arriba durante una semana." } },
      { nombre: "Cambio de rasgos", desc: "Cirugía estética facial",
        valores: { zona: "Rostro", tipo: ESTETICA, cambio: "Cambio de rasgos faciales",
          descripcion: "Marcado de la zona a modificar. Incisiones mínimas en zonas poco visibles. Remodelación del tejido según lo acordado con el paciente. Se retira el tejido sobrante. Comprobación de la simetría.",
          destino: "Alta domiciliaria", reposo: "10", medicacion: "Analgésicos cada 8 horas, pomada cicatrizante",
          indicaciones: "Revisión en 7 días. No exponer la zona al sol durante un mes. Aplicar la crema regeneradora dos veces al día." } },
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
      zona: "Abdomen", tipo: SALUD, diagnostico: "Herida por arma de fuego con hemorragia interna",
      resultado_salud: "Lesión estabilizada sin complicaciones", objetos: "Proyectil de 9 mm",
      descripcion: "Laparotomía media. Se localiza perforación de intestino delgado, se repara y se extrae el proyectil. Lavado de cavidad y control de la hemorragia.",
      puntos: "14", despertar: "Recuperación estable", destino: "Hospitalización", reposo: "10",
      medicacion: "Analgésicos cada 8 horas y antibiótico durante 7 días", indicaciones: "Revisión de la herida en 5 días. Evitar esfuerzos durante dos semanas.",
    },
  };
})();
