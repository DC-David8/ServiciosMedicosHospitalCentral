/* Servicio: Búsqueda y rescate → Informe de operación SAR */
window.SERVICIO = (() => {
  const DIFICIL = ["Montaña de difícil acceso", "Mar"];
  const idxAux = () => CARGOS.indexOf("Auxiliar");
  // Comprueba la dotación mínima del protocolo según la zona
  function dotacion(lista, v) {
    const eq = (lista || []).filter((m) => m.nombre);
    if (!v.zona) return { ok: false, mensaje: "Elige el tipo de zona para comprobar la dotación mínima." };
    const dif = DIFICIL.includes(v.zona);
    const minSar = dif ? 2 : 1, minTotal = dif ? 3 : 2;
    const sar = eq.filter((m) => m.sar).length;
    const apoyo = eq.some((m) => !m.sar && CARGOS.indexOf(m.cargo) > -1 && CARGOS.indexOf(m.cargo) <= idxAux());
    const faltas = [];
    if (eq.length < minTotal) faltas.push(`mínimo ${minTotal} rescatistas`);
    if (sar < minSar) faltas.push(`${minSar} especialista${minSar > 1 ? "s" : ""} en Búsqueda y Rescate`);
    if (!apoyo) faltas.push("un EMS de apoyo de rango Auxiliar o superior");
    return faltas.length
      ? { ok: false, mensaje: `No cumple el protocolo: falta ${unirEs(faltas)}.` }
      : { ok: true, mensaje: `Cumple el protocolo (${eq.length} rescatistas, ${sar} especialista${sar > 1 ? "s" : ""} SAR).` };
  }
  const heli = (v) => (v.medios || []).includes("Helicóptero");
  return {
    id: "rescate",
    nombre: "Búsqueda y rescate",
    org: "Hospital Central · Búsqueda y rescate",
    intro: "Informe de la operación. Primero copia el aviso <b>/ems</b> de salida (abajo, en Mensajes para el rol); al terminar, completa el resto y genera el informe. La dotación del equipo se comprueba sola con el protocolo.",
    protocolo: "rescate",
    colores: { acento: "#E36414", acentoSuave: "#FFF0E6", orgCab: "#FFC9A6", chipTinta: "#9A3E00" },
    tituloFacultativo: "Responsable de la operación",
    etiquetaFirma: "RESPONSABLE DE LA OPERACIÓN",
    tituloResumen: "Resumen de la operación",
    textoGenerar: "Generar informe de rescate",
    campoFecha: "fecha", campoNombre: "ubicacion",
    documentos: [{
      id: "informe", nombre: "Informe de operación", titulo: "INFORME DE BÚSQUEDA Y RESCATE",
      org: "HOSPITAL CENTRAL · GRUPO DE BÚSQUEDA Y RESCATE", subtitulo: "Aviso, equipo, búsqueda y víctimas",
      prefijo: "SAR", etiquetaNumero: "Nº DE OPERACIÓN", archivo: "Informe_rescate", pie: "HOSPITAL CENTRAL · INFORME DE OPERACIÓN",
      fechaCabecera: (v) => fechaHoraTexto(v.fecha),
      nota: "Informe interno del Grupo de Búsqueda y Rescate del Hospital Central.",
    }],
    secciones: [
      { id: "aviso", titulo: "Aviso", campos: [
        { id: "fecha", tipo: "fechahora", etiqueta: "Fecha y hora del aviso", req: true, valor: "ahora" },
        { id: "ubicacion", tipo: "texto", etiqueta: "Ubicación", req: true, placeholder: "Parcela 1234 o nombre de la montaña" },
        { id: "zona", tipo: "segmentos", etiqueta: "Tipo de zona", req: true, opciones: ["Montaña de fácil acceso", "Montaña de difícil acceso", "Mar"], columnas: 3 },
        { id: "norte", tipo: "check", etiqueta: "Operación en el Norte", etiquetaDoc: "Zona Norte", textoSi: "Sí" },
        { id: "motivo_norte", tipo: "segmentos", etiqueta: "Motivo para actuar en el Norte", req: true, si: (v) => v.norte, opciones: ["Sin EMS Norte disponibles", "Solicitud de apoyo de EMS Norte"], columnas: 2, ayuda: "Solo se rescata en el Norte si no hay EMS Norte o si piden apoyo." },
      ] },
      { id: "medios", titulo: "Medios", campos: [
        { id: "medios", tipo: "chips", etiqueta: "Medios empleados", req: true, opciones: ["Helicóptero", "Vehículo todoterreno", "Embarcación", "A pie"] },
        { id: "camaras", tipo: "chips", etiqueta: "Cámaras del helicóptero", si: heli, opciones: ["Cámara térmica", "Escáner", "Zoom"] },
      ] },
      { id: "equipo", titulo: "Equipo", ayuda: "Zona de fácil acceso: mínimo 2 rescatistas (1 especialista SAR + 1 EMS de rango Auxiliar o superior). Difícil acceso o mar: mínimo 3 (2 especialistas SAR + 1 EMS de apoyo).", campos: [
        { id: "equipo", tipo: "equipo", etiqueta: "Rescatistas", req: true, validar: dotacion },
        { id: "conformidad", tipo: "calculado", etiqueta: "Dotación según protocolo", ancho: true, calc: (v) => dotacion(v.equipo, v).mensaje },
      ] },
      { id: "busqueda", titulo: "Búsqueda", campos: [
        { id: "metodos", tipo: "chips", etiqueta: "Métodos de búsqueda", opciones: ["Análisis del terreno", "Rastreo de huellas y marcas", "Búsqueda visual"] },
        { id: "hora_loc", tipo: "hora", etiqueta: "Hora de localización" },
        { id: "desc_busqueda", tipo: "area", etiqueta: "Desarrollo de la búsqueda", opcional: true },
      ] },
      { id: "victimas", titulo: "Víctimas", campos: [
        { id: "num_victimas", tipo: "numero", etiqueta: "Víctimas localizadas", min: 0, paso: 1 },
        { id: "estado", tipo: "segmentos", etiqueta: "Estado de las víctimas", opciones: ["Ilesas", "Heridas leves", "Heridas graves", "Fallecidas"], columnas: 4 },
        { id: "auxilios", tipo: "area", etiqueta: "Primeros auxilios aplicados", opcional: true },
        { id: "extraccion", tipo: "check", etiqueta: "Requirió extracción del lugar", etiquetaDoc: "Extracción", textoSi: "Realizada" },
        { id: "traslado", tipo: "check", etiqueta: "Trasladadas al Hospital Central", etiquetaDoc: "Traslado", textoSi: "Al Hospital Central", valor: true },
      ] },
      { id: "resultado", titulo: "Resultado", campos: [
        { id: "resultado", tipo: "segmentos", etiqueta: "Resultado de la operación", req: true, opciones: ["Rescate completado", "Víctimas no localizadas", "Operación suspendida"], columnas: 3 },
        { id: "observaciones", tipo: "area", etiqueta: "Observaciones", opcional: true },
      ] },
    ],
    validar(v) {
      if (heli(v) && !(v.equipo || []).some((m) => m.nombre && m.piloto)) return "Marca qué miembro del equipo pilotó el helicóptero (solo puede pilotar quien tenga el rango Piloto).";
      return "";
    },
    resumen(v) {
      const f = [];
      const eq = (v.equipo || []).filter((m) => m.nombre);
      f.push(`Aviso recibido el ${fechaHoraTexto(v.fecha).replace(" · ", " a las ")} en ${v.ubicacion || "—"} (${(v.zona || "zona sin especificar").toLowerCase()})${v.norte ? `, en el Norte por ${minusc(v.motivo_norte)}` : ""}.`);
      if (eq.length) f.push(`Acude un equipo de ${eq.length} rescatistas${(v.medios || []).length ? ` con ${unirEs(v.medios.map((m) => m.toLowerCase()))}` : ""}. ${dotacion(v.equipo, v).mensaje}`);
      const met = [...(v.metodos || []), ...((heli(v) && v.camaras) || []).map((c) => `${c.toLowerCase()} del helicóptero`)];
      if (met.length) f.push(`Búsqueda mediante ${unirEs(met.map((m) => m.toLowerCase()))}${v.hora_loc ? `, con localización a las ${v.hora_loc}` : ""}.`);
      if (v.num_victimas) f.push(`Se localizan ${v.num_victimas} ${v.num_victimas === "1" ? "víctima" : "víctimas"}${v.estado ? ` (${v.estado.toLowerCase()})` : ""}${v.extraccion ? ", que requieren extracción" : ""}${v.traslado ? " y se trasladan al Hospital Central" : ""}.`);
      if (v.resultado) f.push(`Resultado: ${v.resultado.toLowerCase()}.`);
      return f.join(" ");
    },
    mensajes(v) {
      return [{ etiqueta: "Aviso de salida (/ems)", texto: `/ems Grupo de Búsqueda y Rescate de camino a ${v.ubicacion || "parcela XXXX"}.` }];
    },
    ejemplo: {
      ubicacion: "Monte Chiliad, cara norte", zona: "Montaña de difícil acceso", norte: true, motivo_norte: "Sin EMS Norte disponibles",
      medios: ["Helicóptero", "Vehículo todoterreno"], camaras: ["Cámara térmica", "Zoom"],
      equipo: [
        { nombre: "Daniel Ortega", cargo: "Doctor/a", sar: true, piloto: true },
        { nombre: "Clara Ruiz", cargo: "Enfermero/a", sar: true, piloto: false },
        { nombre: "Iván Morales", cargo: "Auxiliar", sar: false, piloto: false },
      ],
      metodos: ["Análisis del terreno", "Rastreo de huellas y marcas"], hora_loc: "22:40",
      desc_busqueda: "Se localiza con la cámara térmica a un senderista caído en un barranco a 300 m de la cima.",
      num_victimas: "1", estado: "Heridas leves", auxilios: "Inmovilización de tobillo derecho y manta térmica.",
      extraccion: true, traslado: true, resultado: "Rescate completado",
    },
  };
  function minusc(t) { return t ? t.charAt(0).toLowerCase() + t.slice(1) : ""; }
})();
