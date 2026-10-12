/* Servicio: Medicina forense (CK) → Certificado de defunción + Informe de autopsia */
window.SERVICIO = (() => {
  const art = (v) => (v.sexo === "Femenino" ? { el: "la", ciud: "la ciudadana", fall: "la fallecida", D: "Dña.", o: "a" } : { el: "el", ciud: "el ciudadano", fall: "el fallecido", D: "D.", o: "o" });
  const minus = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : "");
  const mortales = (v) => {
    const m = (v.hallazgos_ext || []).filter((z) => z.zona && z.tipo && z.destacado);
    return m.length ? ` ${m.length === 1 ? "Lesión mortal" : "Lesiones mortales"}: ${unirEs(m.map((z) => `${z.tipo.toLowerCase()} en ${zonaPorId(z.zona).nombre.toLowerCase()}`))}.` : "";
  };
  const HALLAZGOS = [
    "Herida por arma de fuego (entrada)", "Herida por arma de fuego (salida)", "Herida incisa", "Herida contusa",
    "Contusión", "Hematoma", "Fractura", "Quemadura", "Abrasión", "Marcas de ligadura", "Livideces", "Rigidez cadavérica", "Otro",
  ];
  return {
    id: "forense",
    nombre: "Defunción y autopsia",
    org: "Hospital Central · Medicina forense",
    intro: "Para los roles de defunción (CK). Rellena el acta durante el protocolo y genera los dos documentos: el <b>certificado de defunción</b> para funerarios o familiares y el <b>informe de autopsia</b> con los hallazgos. El anuncio /ems sale ya relleno.",
    protocolo: "forense",
    colores: { acento: "#4A5560", acentoSuave: "#ECEFF1", orgCab: "#CFD8DC", chipTinta: "#2E3840" },
    tituloFacultativo: "Médico forense",
    etiquetaFirma: "MÉDICO FORENSE",
    tituloResumen: "Conclusiones médico-legales",
    textoGenerar: "Generar documentos",
    campoFecha: "fecha_muerte", campoNombre: "nombre",
    documentos: [
      {
        id: "defuncion", nombre: "Certificado de defunción", titulo: "CERTIFICADO DE DEFUNCIÓN",
        org: "HOSPITAL CENTRAL · MEDICINA FORENSE", subtitulo: "Acta oficial de fallecimiento",
        prefijo: "DEF", etiquetaNumero: "Nº DE ACTA", archivo: "Certificado_defuncion",
        secciones: ["fallecido", "constatacion", "causa", "destino"], ocultar: ["rcp"], resumen: false,
        fechaCabecera: (v) => fechaHoraTexto(v.fecha_muerte),
        tituloDeclaracion: "Certificación",
        declaracion: (v) => {
          const a = art(v);
          return `El médico forense que suscribe certifica que ${a.D} ${v.nombre || "—"}${edadEn(v.nacimiento, v.fecha_muerte) ? `, de ${edadEn(v.nacimiento, v.fecha_muerte)}` : ""}, falleció el ${fechaHoraTexto(v.fecha_muerte).replace(" · ", " a las ")}${v.lugar ? ` en ${v.lugar}` : ""}. Se constató la ausencia de pulso y signos vitales tras maniobras de reanimación sin respuesta. Causa inmediata de la muerte: ${minus(v.causa_inmediata) || "—"}.${mortales(v)} Manera de muerte: ${minus(v.manera) || "—"}.`;
        },
        nota: "Se expide el presente certificado para su entrega a los servicios funerarios o a la familia.",
      },
      {
        id: "autopsia", nombre: "Informe de autopsia", titulo: "INFORME DE AUTOPSIA",
        org: "HOSPITAL CENTRAL · MEDICINA FORENSE", subtitulo: "Examen externo, interno y conclusiones",
        prefijo: "AUT", etiquetaNumero: "Nº DE INFORME", archivo: "Informe_autopsia",
        fechaCabecera: (v) => fechaHoraTexto(v.fecha_muerte),
        nota: "Documento médico-legal reservado. Copia oficial archivada en el Hospital Central.",
      },
    ],
    secciones: [
      { id: "fallecido", titulo: "Datos del fallecido", campos: [
        { id: "nombre", tipo: "texto", etiqueta: "Nombre y apellidos", req: true, ancho: true, doc: "titular", placeholder: "Nombre y apellidos del fallecido" },
        { id: "nacimiento", tipo: "fecha", etiqueta: "Fecha de nacimiento" },
        { id: "edad", tipo: "calculado", etiqueta: "Edad", calc: (v) => edadEn(v.nacimiento, v.fecha_muerte) },
        { id: "sexo", tipo: "select", etiqueta: "Sexo", opciones: ["Masculino", "Femenino"], valor: "Masculino" },
        { id: "identidad", tipo: "check", etiqueta: "Identidad comprobada mediante el DNI", etiquetaDoc: "Identidad", textoSi: "Comprobada con DNI", valor: true },
        { id: "dni", tipo: "imagen", etiqueta: "DNI del fallecido", opcional: true, lateral: true, pieDoc: "DNI del fallecido", ayuda: "Haz el recorte del DNI y pégalo aquí. Sale junto a los datos en el certificado y en el informe." },
      ] },
      { id: "constatacion", titulo: "Constatación de la muerte", campos: [
        { id: "fecha_muerte", tipo: "fechahora", etiqueta: "Fecha y hora de la muerte", req: true, valor: "ahora" },
        { id: "lugar", tipo: "texto", etiqueta: "Lugar del fallecimiento", placeholder: "Ej.: Vinewood Hills, vía pública" },
        { id: "rcp", tipo: "chips", etiqueta: "Maniobras de reanimación", opciones: ["Atropina 1,5 mg IV", "RCP 10-15 segundos", "Descarga de 400 J"], valor: ["Atropina 1,5 mg IV", "RCP 10-15 segundos", "Descarga de 400 J"], ayuda: "Sin respuesta: se certifica la muerte y se traslada a la morgue." },
      ] },
      { id: "externo", titulo: "Examen externo", campos: [
        { id: "temperatura", tipo: "numero", etiqueta: "Temperatura corporal", unidad: "°C", min: 10, maxv: 42, paso: 0.1 },
        { id: "muestras_sup", tipo: "check", etiqueta: "Muestras de superficie tomadas", etiquetaDoc: "Muestras de superficie", textoSi: "Tomadas", valor: true },
        { id: "hallazgos_ext", tipo: "zonas", etiqueta: "Hallazgos y lesiones", tipos: HALLAZGOS, textoTipo: "Hallazgo", destacar: { etiqueta: "Lesión mortal", doc: "Mortal" }, maximo: 10, ayuda: "Se numeran igual en la figura del informe. Marca «Lesión mortal» en las que causaron la muerte: salen en rojo." },
        { id: "ext_desc", tipo: "area", etiqueta: "Otros hallazgos externos", opcional: true },
      ] },
      { id: "interno", titulo: "Examen interno", campos: [
        { id: "hallazgos_int", tipo: "area", etiqueta: "Hallazgos internos", placeholder: "Órganos afectados, hemorragias, trayectorias…" },
        { id: "objetos", tipo: "texto", etiqueta: "Objetos extraídos", opcional: true, placeholder: "Ej.: dos proyectiles de 9 mm" },
        { id: "muestras", tipo: "chips", etiqueta: "Muestras para análisis", opciones: ["Sangre", "Tejidos", "Contenido gástrico", "Toxicología"] },
        { id: "cierre", tipo: "check", etiqueta: "Cierre de incisiones con sutura continua e higiene del cuerpo", etiquetaDoc: "Cierre e higiene", textoSi: "Realizados", valor: true },
      ] },
      { id: "causa", titulo: "Causa de la muerte", campos: [
        { id: "causa_inmediata", tipo: "texto", etiqueta: "Causa inmediata", req: true, ancho: true, placeholder: "Ej.: shock hipovolémico" },
        { id: "causa_intermedia", tipo: "texto", etiqueta: "Causa intermedia", opcional: true, ancho: true, placeholder: "Ej.: hemorragia interna masiva" },
        { id: "causa_fundamental", tipo: "texto", etiqueta: "Causa fundamental", opcional: true, ancho: true, placeholder: "Ej.: heridas por arma de fuego en tórax" },
        { id: "manera", tipo: "segmentos", etiqueta: "Manera de muerte", req: true, opciones: ["Natural", "Accidental", "Homicida", "Suicida", "Indeterminada"], columnas: 5 },
      ] },
      { id: "destino", titulo: "Destino del cuerpo", campos: [
        { id: "destino", tipo: "select", etiqueta: "Destino", opciones: ["Cementerio Municipal", "Crematorio Municipal"], valor: "Cementerio Municipal" },
        { id: "entregado", tipo: "select", etiqueta: "Acta entregada a", opciones: ["Servicios funerarios", "Familiares"], valor: "Servicios funerarios" },
        { id: "receptor", tipo: "texto", etiqueta: "Nombre de quien recibe", opcional: true },
      ] },
    ],
    resumen(v) {
      const a = art(v), f = [];
      const ext = (v.hallazgos_ext || []).filter((z) => z.zona && z.tipo);
      f.push(`Se realiza autopsia a ${a.D} ${v.nombre || "—"}${v.identidad ? ", identificad" + a.o + " mediante su DNI" : ""}.`);
      if (v.temperatura) f.push(`Temperatura corporal de ${v.temperatura} °C a la exploración.`);
      if (ext.length) f.push(`En el examen externo se objetivan ${ext.length === 1 ? "un hallazgo" : `${ext.length} hallazgos`}: ${unirEs(ext.slice(0, 5).map((z) => `${z.tipo.toLowerCase()} en ${zonaPorId(z.zona).nombre.toLowerCase()}`))}.`);
      const mort = (v.hallazgos_ext || []).map((z, i) => ({ ...z, n: i + 1 })).filter((z) => z.zona && z.tipo && z.destacado);
      if (mort.length) f.push(`${mort.length === 1 ? "Se considera mortal la lesión" : "Se consideran mortales las lesiones"} ${unirEs(mort.map((z) => `nº ${z.n} (${z.tipo.toLowerCase()} en ${zonaPorId(z.zona).nombre.toLowerCase()})`))}.`);
      if (v.hallazgos_int) f.push(`Examen interno: ${minus(v.hallazgos_int).replace(/\.$/, "")}.`);
      if (v.objetos) f.push(`Se extraen ${minus(v.objetos).replace(/\.$/, "")} para su análisis.`);
      const causas = [v.causa_inmediata && `causa inmediata ${minus(v.causa_inmediata)}`, v.causa_intermedia && `causa intermedia ${minus(v.causa_intermedia)}`, v.causa_fundamental && `causa fundamental ${minus(v.causa_fundamental)}`].filter(Boolean);
      if (causas.length) f.push(`Se establece como ${unirEs(causas)}.`);
      if (v.manera) f.push(`Manera de muerte: ${minus(v.manera)}.`);
      f.push(`El cuerpo se entrega a ${v.entregado === "Familiares" ? "los familiares" : "los servicios funerarios"} con destino al ${v.destino || "Cementerio Municipal"}.`);
      return f.join(" ");
    },
    mensajes(v) {
      const a = art(v);
      const restos = v.destino === "Crematorio Municipal" ? "serán incinerados en el Crematorio Municipal" : "descansarán en el Cementerio Municipal";
      return [{ etiqueta: "Anuncio de fallecimiento (/ems)", texto: `/ems [ÚLTIMA HORA] El Hospital Central confirma que ${a.ciud} ${v.nombre || "(Nombre del paciente)"} ha fallecido. Sus restos ${restos}. Que en paz descanse.` }];
    },
    ejemplo: {
      nombre: "Marcus Hale", nacimiento: "1990-11-05", sexo: "Masculino", lugar: "Paleto Bay, carretera del muelle",
      temperatura: "35.2",
      hallazgos_ext: [
        { zona: "torax", tipo: "Herida por arma de fuego (entrada)", desc: "Orificio de 0,9 cm con anillo contuso.", destacado: true },
        { zona: "espalda", tipo: "Herida por arma de fuego (salida)", desc: "Orificio irregular de 2 cm." },
        { zona: "antebrazo_i", tipo: "Abrasión", desc: "" },
      ],
      hallazgos_int: "Trayectoria de delante atrás que atraviesa el lóbulo inferior del pulmón izquierdo. Hemotórax masivo.",
      objetos: "Fragmento de proyectil de 9 mm", muestras: ["Sangre", "Toxicología"],
      causa_inmediata: "Shock hipovolémico", causa_intermedia: "Hemotórax masivo", causa_fundamental: "Herida por arma de fuego en tórax",
      manera: "Homicida", destino: "Cementerio Municipal", entregado: "Servicios funerarios", receptor: "Funeraria Los Santos",
    },
  };
})();
