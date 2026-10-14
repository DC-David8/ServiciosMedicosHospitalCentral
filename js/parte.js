/*
 * Parte médico de lesiones — formulario, valoración automática y generación del documento.
 * Depende de: hospital.js, certificado.js (fuentes), documento.js, parte-cert.js, pdf.js, pegar-imagen.js, rapido.js, recientes.js.
 */

// Tipos de lesión y días de curación orientativos según gravedad [leve, moderada, grave]
const TIPOS_LESION = {
  "Contusión": { dias: [3, 7, 15] },
  "Hematoma": { dias: [5, 10, 20] },
  "Erosión / abrasión": { dias: [3, 7, 12] },
  "Herida inciso-contusa": { dias: [7, 12, 20], medico: true },
  "Marcas de contención (esposas)": { dias: [2, 5, 10] },
  "Esguince": { dias: [7, 15, 30], medico: true },
  "Luxación": { dias: [15, 30, 45], medico: true },
  "Fractura": { dias: [30, 45, 90], medico: true },
  "Quemadura": { dias: [7, 15, 30], medico: true },
  "Lesión por táser": { dias: [2, 4, 7] },
  "Herida por arma de fuego": { dias: [21, 45, 90], medico: true, reservado: true },
  "Traumatismo craneoencefálico": { dias: [7, 21, 60], medico: true, reservado: true },
  "Otra": { dias: [3, 7, 15] },
};
const GRAVEDADES = ["Leve", "Moderada", "Grave"];
const MECANISMOS = ["Golpes con puño", "Patadas", "Golpes con porra", "Uso de táser", "Empujón / caída", "Reducción contra el suelo", "Esposado con fuerza excesiva", "Disparo"];
const PRUEBAS = ["Radiografía", "TAC", "Ecografía", "Analítica"];
const TRATAMIENTOS = ["Cura local", "Sutura", "Inmovilización", "Analgesia", "Antiinflamatorios", "Hielo local", "Observación", "Derivación a psicología"];
const TRAT_MEDICO = ["Sutura", "Inmovilización"];
// Descripciones típicas que se sugieren al escribir la descripción de cada lesión
const DESC_LESION = {
  "Contusión": ["Tumefacción con eritema", "Zona enrojecida y dolorosa a la palpación", "Tumefacción de 3 cm"],
  "Hematoma": ["Hematoma violáceo de 4 cm", "Hematoma periorbitario", "Hematoma reciente, de color rojizo"],
  "Erosión / abrasión": ["Erosión superficial de 2 cm", "Abrasión por arrastre contra el suelo", "Excoriaciones lineales"],
  "Herida inciso-contusa": ["Herida de 2 cm de bordes irregulares", "Herida sangrante que precisa sutura"],
  "Marcas de contención (esposas)": ["Surco eritematoso circular", "Marcas rojizas por presión de las esposas", "Surco con pequeña erosión"],
  "Esguince": ["Inflamación y dolor al movimiento", "Limitación de la movilidad"],
  "Luxación": ["Deformidad e impotencia funcional", "Reducida en urgencias"],
  "Fractura": ["Deformidad y dolor intenso", "Confirmada por radiografía"],
  "Quemadura": ["Quemadura de primer grado", "Quemadura de segundo grado con ampollas"],
  "Lesión por táser": ["Dos puntos de impacto de los dardos", "Puntos de impacto con eritema alrededor"],
  "Herida por arma de fuego": ["Orificio de entrada de 1 cm", "Orificio de entrada y de salida", "Herida en sedal"],
  "Traumatismo craneoencefálico": ["Pérdida de conocimiento breve", "Mareo y cefalea tras el golpe"],
  "Otra": [],
};
const FRASES_RELATO = [
  "Fue reducido contra el suelo sin oponer resistencia.", "Le golpearon cuando ya estaba esposado.", "Le apretaron demasiado las esposas y se quejó del dolor.",
  "Le dispararon con el táser sin motivo aparente.", "Le golpearon con la porra.", "Le insultaron y le amenazaron.", "No le dijeron el motivo de la detención.",
  "Le agredieron varias personas en la calle.", "Perdió el conocimiento unos segundos.",
];
const FRASES_LUGAR = ["Comisaría de Mission Row", "Comisaría de Vespucci", "Comisaría de Sandy Shores", "Comisaría de Paleto Bay", "Legion Square", "Vía pública", "Su domicilio"];
// Casos frecuentes: rellenan hechos, lesiones, tratamiento y estado psicológico (no tocan paciente, fechas ni facultativo)
const CASOS_PARTE = [
  { nombre: "Golpes en una detención", desc: "Puñetazos, reducción y esposas apretadas",
    agresor: "agente", mecanismos: ["Golpes con puño", "Reducción contra el suelo", "Esposado con fuerza excesiva"],
    lesiones: [{ zona: "pomulo_d", tipo: "Contusión", gravedad: 1, desc: "Tumefacción con eritema" }, { zona: "rodilla_d", tipo: "Erosión / abrasión", gravedad: 0, desc: "Abrasión por arrastre contra el suelo" },
      { zona: "muneca_d", tipo: "Marcas de contención (esposas)", gravedad: 0, desc: "Surco eritematoso circular" }, { zona: "muneca_i", tipo: "Marcas de contención (esposas)", gravedad: 0, desc: "" }],
    pruebas: ["Radiografía"], trat: ["Cura local", "Analgesia", "Hielo local"], sintomas: ["Ansiedad", "Miedo a la autoridad", "Humillación / vergüenza"], intensidad: "moderada", seguimiento: true,
    relato: "Fue reducido contra el suelo sin oponer resistencia. Le golpearon cuando ya estaba esposado." },
  { nombre: "Uso de táser", desc: "Dardos en la espalda y caída al suelo",
    agresor: "agente", mecanismos: ["Uso de táser", "Empujón / caída"],
    lesiones: [{ zona: "espalda", tipo: "Lesión por táser", gravedad: 0, desc: "Dos puntos de impacto de los dardos" }, { zona: "codo_d", tipo: "Contusión", gravedad: 0, desc: "Zona enrojecida y dolorosa a la palpación" }],
    pruebas: [], trat: ["Cura local", "Observación"], sintomas: ["Ansiedad", "Miedo a la autoridad"], intensidad: "leve", seguimiento: false,
    relato: "Le dispararon con el táser sin motivo aparente." },
  { nombre: "Esposas apretadas", desc: "Marcas en ambas muñecas",
    agresor: "agente", mecanismos: ["Esposado con fuerza excesiva"],
    lesiones: [{ zona: "muneca_d", tipo: "Marcas de contención (esposas)", gravedad: 1, desc: "Surco con pequeña erosión" }, { zona: "muneca_i", tipo: "Marcas de contención (esposas)", gravedad: 0, desc: "Marcas rojizas por presión de las esposas" }],
    pruebas: [], trat: ["Cura local", "Hielo local"], sintomas: ["Humillación / vergüenza"], intensidad: "leve", seguimiento: false,
    relato: "Le apretaron demasiado las esposas y se quejó del dolor." },
  { nombre: "Golpes con porra", desc: "Hematomas en brazo y costado",
    agresor: "agente", mecanismos: ["Golpes con porra"],
    lesiones: [{ zona: "brazo_i", tipo: "Hematoma", gravedad: 1, desc: "Hematoma violáceo de 4 cm" }, { zona: "costillas_i", tipo: "Contusión", gravedad: 1, desc: "Zona enrojecida y dolorosa a la palpación" }],
    pruebas: ["Radiografía"], trat: ["Analgesia", "Antiinflamatorios", "Hielo local"], sintomas: ["Ansiedad", "Miedo a la autoridad", "Insomnio"], intensidad: "moderada", seguimiento: true,
    relato: "Le golpearon con la porra." },
  { nombre: "Pelea en la calle", desc: "Agresión de civiles: puñetazos y patadas",
    agresor: "civil", mecanismos: ["Golpes con puño", "Patadas"],
    lesiones: [{ zona: "ojo_i", tipo: "Hematoma", gravedad: 0, desc: "Hematoma periorbitario" }, { zona: "boca", tipo: "Herida inciso-contusa", gravedad: 0, desc: "Herida de 2 cm de bordes irregulares" },
      { zona: "costillas_d", tipo: "Contusión", gravedad: 1, desc: "Tumefacción con eritema" }],
    pruebas: ["Radiografía"], trat: ["Cura local", "Analgesia"], sintomas: ["Ansiedad", "Hipervigilancia"], intensidad: "leve", seguimiento: false,
    relato: "Le agredieron varias personas en la calle." },
  { nombre: "Herida de bala", desc: "Disparo en una pierna",
    agresor: "desconocido", mecanismos: ["Disparo"],
    lesiones: [{ zona: "muslo_d", tipo: "Herida por arma de fuego", gravedad: 1, desc: "Orificio de entrada y de salida" }],
    pruebas: ["Radiografía", "Analítica"], trat: ["Sutura", "Analgesia"], sintomas: ["Ansiedad", "Revive el suceso", "Insomnio"], intensidad: "moderada", seguimiento: true,
    relato: "" },
];
const SINTOMAS = ["Ansiedad", "Miedo a la autoridad", "Insomnio", "Llanto / labilidad emocional", "Humillación / vergüenza", "Hipervigilancia", "Revive el suceso", "Aislamiento social", "Irritabilidad"];

(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const OTRO = "__otro";
  const RECURSOS = window.RECURSOS || {
    logo: "assets/logo-ems.png", sello: "assets/sello-oficial.png",
    facciones: { LSPD: "assets/facciones/lspd.png", LSSD: "assets/facciones/lssd.png", FBI: "assets/facciones/fbi.png" },
  };
  const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const ahoraLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const radio = (n) => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const marcados = (n) => $$(`input[name="${n}"]:checked`).map((i) => i.value);

  let lesiones = [];
  let editado = { dias: false, impeditivos: false, pronostico: false, juicio: false };
  let datosParte = null;

  // ── Construcción de controles ──
  function chips(contenedor, nombre, lista) {
    $(contenedor).innerHTML = lista.map((t, i) =>
      `<label><input type="checkbox" name="${nombre}" id="${nombre}-${i}" value="${esc(t)}"><span>${esc(t)}</span></label>`).join("");
  }
  const opcionesZona = () => {
    const grupos = { F: [], P: [] };
    ZONAS.forEach((z) => grupos[z.v].push(z));
    return `<option value="" disabled selected>Zona</option>` +
      `<optgroup label="Vista frontal">${grupos.F.map((z) => `<option value="${z.id}">${esc(z.nombre)}</option>`).join("")}</optgroup>` +
      `<optgroup label="Vista posterior">${grupos.P.map((z) => `<option value="${z.id}">${esc(z.nombre)}</option>`).join("")}</optgroup>`;
  };
  const opcionesTipo = () => `<option value="" disabled selected>Tipo de lesión</option>` + Object.keys(TIPOS_LESION).map((t) => `<option>${esc(t)}</option>`).join("");

  function pintarLesiones() {
    const cont = $("#lista-lesiones");
    cont.innerHTML = lesiones.map((l, i) => `
      <div class="lesion" data-i="${i}">
        <span class="lesion-num">${i + 1}</span>
        <select class="l-zona" aria-label="Zona de la lesión ${i + 1}">${opcionesZona()}</select>
        <select class="l-tipo" aria-label="Tipo de la lesión ${i + 1}">${opcionesTipo()}</select>
        <select class="l-grav" aria-label="Gravedad de la lesión ${i + 1}">${GRAVEDADES.map((g, k) => `<option value="${k}">${g}</option>`).join("")}</select>
        <input class="l-desc" placeholder="Descripción (opcional): elige una sugerencia o escribe" aria-label="Descripción de la lesión ${i + 1}" maxlength="110">
        <button type="button" class="btn-quitar" aria-label="Quitar lesión ${i + 1}" title="Quitar">✕</button>
      </div>`).join("");
    $$("#lista-lesiones .lesion").forEach((row, i) => {
      const l = lesiones[i];
      if (l.zona) row.querySelector(".l-zona").value = l.zona;
      if (l.tipo) row.querySelector(".l-tipo").value = l.tipo;
      row.querySelector(".l-grav").value = String(l.gravedad);
      row.querySelector(".l-desc").value = l.desc || "";
      listaDesc(row, l.tipo);
    });
    $("#btn-anadir").disabled = lesiones.length >= 8;
    $("#ayuda-lesiones").textContent = lesiones.length
      ? `${lesiones.length} de 8 lesiones. Se numeran igual en la figura del parte.`
      : "Sin lesiones físicas registradas. Si solo hay daño psicológico, déjalo vacío.";
  }
  // Sugerencias de descripción según el tipo de lesión (datalist)
  function listaDesc(row, tipo) {
    const k = Object.keys(TIPOS_LESION).indexOf(tipo);
    const inp = row.querySelector(".l-desc");
    if (k >= 0 && (DESC_LESION[tipo] || []).length) inp.setAttribute("list", `dl-lesion-${k}`); else inp.removeAttribute("list");
  }
  function anadirLesion(l = { zona: "", tipo: "", gravedad: 0, desc: "" }) { lesiones.push(l); pintarLesiones(); recalcular(); }

  // ── Valoración automática ──
  function valoracionAuto() {
    const validas = lesiones.filter((l) => l.zona && l.tipo);
    const trat = marcados("trat");
    let dias = 0, maxG = -1, medico = trat.some((t) => TRAT_MEDICO.includes(t)), reservado = false;
    validas.forEach((l) => {
      const t = TIPOS_LESION[l.tipo];
      dias = Math.max(dias, t.dias[l.gravedad]);
      maxG = Math.max(maxG, l.gravedad);
      if (t.medico && l.gravedad > 0) medico = true;
      if (t.reservado && l.gravedad === 2) reservado = true;
    });
    if (validas.length > 2) dias = Math.round(dias * 1.15);
    const intens = radio("intensidad");
    if (!validas.length && intens !== "ninguna") dias = { leve: 7, moderada: 15, grave: 30 }[intens] || 0;
    const factor = [0.3, 0.5, 0.8][Math.max(0, maxG)];
    const impeditivos = validas.length ? Math.round(dias * factor) : (intens === "grave" ? Math.round(dias * 0.5) : 0);
    let pronostico = "Leve";
    if (reservado) pronostico = "Reservado";
    else if (maxG === 2) pronostico = "Grave";
    else if (medico || (intens === "grave" && maxG < 2)) pronostico = "Menos grave";
    return { dias, impeditivos, pronostico, medico, validas, maxG };
  }

  // Agrupa lesiones del mismo tipo: "marcas de contención en ambas muñecas", "contusión en pómulo derecho y mandíbula"
  function describirLesiones(lista) {
    const grupos = [];
    lista.forEach((l) => {
      const tipo = l.tipo.split(" (")[0].toLowerCase();
      let g = grupos.find((x) => x.tipo === tipo);
      if (!g) grupos.push((g = { tipo, zonas: [] }));
      g.zonas.push(l.zona);
    });
    return grupos.map((g) => {
      const nombres = [];
      const usadas = new Set();
      g.zonas.forEach((id) => {
        if (usadas.has(id)) return;
        const base = id.replace(/_(d|i)$/, "");
        const par = id.endsWith("_d") ? base + "_i" : id.endsWith("_i") ? base + "_d" : null;
        if (par && g.zonas.includes(par)) {
          usadas.add(id); usadas.add(par);
          const n = zonaPorId(id).nombre.replace(/ (derech|izquierd)[oa]$/, "").toLowerCase();
          const fem = /(derecha|izquierda)$/.test(zonaPorId(id).nombre);
          nombres.push(n.includes("/") ? `${n} (ambos lados)` : `${fem ? "ambas" : "ambos"} ${n.replace(/([aeiouáéó])$/, "$1s").replace(/([^s])$/, "$1es").replace(/eses$/, "es")}`);
        } else { usadas.add(id); nombres.push(zonaPorId(id).nombre.toLowerCase()); }
      });
      return `${g.tipo} en ${unir(nombres)}`;
    }).slice(0, 5);
  }

  const unir = (arr) => arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1];

  function redactarJuicio() {
    const a = valoracionAuto();
    const fem = $("#sexo").value === "F";
    const sujeto = fem ? "La paciente" : "El paciente";
    const frases = [];
    const dias = Number($("#dias").value || a.dias), imp = Number($("#impeditivos").value || 0);
    if (a.validas.length) {
      const desc = describirLesiones(a.validas);
      const resto = "";
      const n = a.validas.length;
      frases.push(`${sujeto} presenta ${n === 1 ? "una lesión" : `${n} lesiones`}: ${unir(desc)}${resto}.`);
      const mec = marcados("mecanismo");
      frases.push(mec.length
        ? `Las lesiones son compatibles con el mecanismo que refiere (${unir(mec.map((m) => m.toLowerCase()))}).`
        : "Las lesiones son compatibles con el mecanismo de agresión que refiere.");
      const trat = marcados("trat").filter((t) => t !== "Derivación a psicología");
      frases.push(a.medico
        ? `Precisaron para su sanidad de una primera asistencia facultativa y tratamiento médico${trat.length ? ` (${unir(trat.map((t) => t.toLowerCase()))})` : ""}.`
        : `Precisaron para su sanidad de una primera asistencia facultativa${trat.length ? ` (${unir(trat.map((t) => t.toLowerCase()))})` : ""}, sin necesidad de tratamiento médico posterior.`);
      frases.push(`Tiempo estimado de curación: ${dias} ${dias === 1 ? "día" : "días"}${imp ? `, de los cuales ${imp} impeditivos para sus ocupaciones habituales` : ", ninguno impeditivo"}.`);
    } else {
      frases.push(`${sujeto} no presenta lesiones físicas objetivables en el momento de la exploración.`);
    }
    const sint = marcados("sintoma"), intens = radio("intensidad");
    if (sint.length && intens !== "ninguna") {
      frases.push(`A nivel psicológico refiere ${unir(sint.map((s) => s.toLowerCase()))}, de intensidad ${intens}, compatible con una reacción de estrés agudo tras el suceso${$("#seguimiento").checked ? "; se recomienda seguimiento psicológico" : ""}.`);
    }
    const sec = $("#secuelas").value.trim();
    if (sec && !/^sin secuelas/i.test(sec)) frases.push(`Secuelas previsibles: ${sec.replace(/\.$/, "")}.`);
    const pr = $("#pronostico").value;
    frases.push(`Pronóstico: ${pr.toLowerCase()}${pr === "Reservado" ? ", pendiente de evolución" : ", salvo complicaciones"}.`);
    return frases.join(" ");
  }

  function recalcular() {
    const a = valoracionAuto();
    if (!editado.dias) $("#dias").value = a.dias;
    if (!editado.impeditivos) $("#impeditivos").value = a.impeditivos;
    if (!editado.pronostico) $("#pronostico").value = a.pronostico;
    if (!editado.juicio) $("#juicio").value = redactarJuicio();
    $("#auto-aviso").hidden = !(editado.dias || editado.impeditivos || editado.pronostico || editado.juicio);
    ayudaJuicio();
  }
  function ayudaJuicio() {
    const c = document.createElement("canvas").getContext("2d");
    c.font = `400 19px ${FUENTE_TEXTO}`;
    const n = partirTexto(c, $("#juicio").value, 1080).length;
    const el = $("#ayuda-juicio");
    el.textContent = n > 7 ? `Ocupa ${n} renglones; en el parte caben unos 7 y el resto se cortará.` : `Ocupa ${n} renglones en el parte. Puedes editarlo.`;
    el.style.color = n > 7 ? "var(--bad)" : "";
  }

  // ── Cargos del médico ──
  function iniciarMedico() {
    $("#cargo-sel").innerHTML = `<option value="" disabled selected>Selecciona el cargo</option>` +
      CARGOS.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("") + `<option value="${OTRO}">Otro (escribir a mano)</option>`;
    const ev = leer("psico-evaluador");
    if (ev) {
      $("#medico").value = ev.evaluador || ""; $("#firma").value = ev.firma || "";
      if (CARGOS.includes(ev.cargo)) $("#cargo-sel").value = ev.cargo;
      else if (ev.cargo) { $("#cargo-sel").value = OTRO; $("#cargo").value = ev.cargo; }
    }
    const alt = () => { $("#cargo").hidden = $("#cargo-sel").value !== OTRO; };
    alt();
    $("#cargo-sel").onchange = () => { $("#cargo-sel").removeAttribute("aria-invalid"); alt(); if (!$("#cargo").hidden) $("#cargo").focus(); };
  }
  const valorCargo = () => ($("#cargo-sel").value === OTRO ? $("#cargo").value.trim() : $("#cargo-sel").value || "");

  // ── Ejemplo ──
  function cargarEjemplo() {
    $("#nombre").value = "Marcus Reyes"; $("#nacimiento").value = "1996-04-12"; $("#sexo").value = "M"; $("#telefono").value = "555-0142";
    const h = new Date(); h.setHours(h.getHours() - 2); h.setMinutes(h.getMinutes() - h.getTimezoneOffset());
    $("#fecha-hechos").value = h.toISOString().slice(0, 16);
    $("#lugar").value = "Aparcamiento de Legion Square";
    $("#ag-agente").checked = true; alternarAgresor();
    $("#faccion-ag").value = "LSPD"; $("#ident-ag").value = "Placa 2608";
    $$('input[name="mecanismo"]').forEach((c) => (c.checked = ["Golpes con puño", "Esposado con fuerza excesiva"].includes(c.value)));
    $("#relato").value = "Durante un control fue reducido contra el capó del vehículo y golpeado en la cara cuando ya estaba esposado, sin oponer resistencia.";
    lesiones = [
      { zona: "pomulo_d", tipo: "Contusión", gravedad: 1, desc: "Tumefacción de 3 cm con eritema." },
      { zona: "ojo_d", tipo: "Hematoma", gravedad: 0, desc: "Hematoma periorbitario incipiente." },
      { zona: "muneca_d", tipo: "Marcas de contención (esposas)", gravedad: 0, desc: "Surco eritematoso circular." },
      { zona: "muneca_i", tipo: "Marcas de contención (esposas)", gravedad: 0, desc: "" },
    ];
    pintarLesiones();
    $$('input[name="prueba"]').forEach((c) => (c.checked = c.value === "Radiografía"));
    $$('input[name="trat"]').forEach((c) => (c.checked = ["Cura local", "Analgesia", "Hielo local", "Derivación a psicología"].includes(c.value)));
    $$('input[name="sintoma"]').forEach((c) => (c.checked = ["Ansiedad", "Miedo a la autoridad", "Insomnio", "Humillación / vergüenza"].includes(c.value)));
    $("#int-moderada").checked = true; $("#seguimiento").checked = true;
    $("#secuelas").value = "Sin secuelas previsibles";
    editado = { dias: false, impeditivos: false, pronostico: false, juicio: false };
    $$("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    $("#error-parte").hidden = true;
    recalcular(); marcarFrases($("#form-parte"));
  }

  function aplicarCaso(i) {
    const c = CASOS_PARTE[i];
    $(`input[name="agresor"][value="${c.agresor}"]`).checked = true; alternarAgresor();
    $$('input[name="mecanismo"]').forEach((x) => (x.checked = c.mecanismos.includes(x.value)));
    $$('input[name="prueba"]').forEach((x) => (x.checked = c.pruebas.includes(x.value)));
    $$('input[name="trat"]').forEach((x) => (x.checked = c.trat.includes(x.value) || (c.seguimiento && x.value === "Derivación a psicología")));
    $$('input[name="sintoma"]').forEach((x) => (x.checked = c.sintomas.includes(x.value)));
    $(`#int-${c.intensidad}`).checked = true; $("#seguimiento").checked = !!c.seguimiento;
    $("#relato").value = c.relato || "";
    $("#secuelas").value = "Sin secuelas previsibles";
    lesiones = c.lesiones.map((l) => ({ ...l }));
    editado = { dias: false, impeditivos: false, pronostico: false, juicio: false };
    $$("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    $("#error-parte").hidden = true;
    pintarLesiones(); recalcular(); marcarFrases($("#form-parte"));
    $$(".caso").forEach((x, k) => x.classList.toggle("activo", k === i));
    $("#casos-aviso").textContent = `Aplicado: ${c.nombre}. Revisa las zonas (el lado), la gravedad y el relato, y cambia lo que sea distinto.`;
  }

  function alternarAgresor() {
    const ag = radio("agresor") === "agente";
    $("#bloque-faccion").hidden = !ag;
  }

  // ── Generación ──
  function edad(nac, ref) {
    if (!nac) return null;
    const a = new Date(nac), b = new Date(ref || Date.now());
    let e = b.getFullYear() - a.getFullYear();
    if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) e--;
    return e >= 0 && e < 130 ? e : null;
  }
  const numeroParte = (fecha, nombre) => numeroDocumento("PML", fecha, nombre);

  async function generar(e) {
    e.preventDefault();
    const req = ["#nombre", "#fecha-asistencia", "#medico", "#cargo-sel"];
    const vacios = req.filter((s) => !$(s).value.trim());
    if ($("#cargo-sel").value === OTRO && !$("#cargo").value.trim()) vacios.push("#cargo");
    const sinContenido = !lesiones.some((l) => l.zona && l.tipo) && !(marcados("sintoma").length && radio("intensidad") !== "ninguna");
    const incompletas = lesiones.some((l) => (l.zona && !l.tipo) || (!l.zona && l.tipo));
    req.concat("#cargo").forEach((s) => $(s).toggleAttribute("aria-invalid", vacios.includes(s)));
    let msg = "";
    if (vacios.length) msg = "Completa los campos marcados en rojo.";
    else if (incompletas) msg = "Hay lesiones con la zona o el tipo sin elegir. Complétalas o quítalas.";
    else if (sinContenido) msg = "Registra al menos una lesión física o el estado psicológico del paciente.";
    if (msg) { $("#error-parte").textContent = msg; $("#error-parte").hidden = false; (vacios[0] ? $(vacios[0]) : $("#error-parte")).focus?.(); return; }
    $("#error-parte").hidden = true;

    const fa = $("#fecha-asistencia").value;
    guardar("psico-evaluador", { ...(leer("psico-evaluador") || {}), evaluador: $("#medico").value.trim(), cargo: valorCargo(), firma: $("#firma").value.trim() });
    const agente = radio("agresor") === "agente";
    datosParte = {
      numero: (datosParte && datosParte._clave === `${$("#nombre").value.trim()}|${fa}`) ? datosParte.numero : numeroParte(fa, $("#nombre").value.trim()),
      _clave: `${$("#nombre").value.trim()}|${fa}`,
      fechaAsistencia: fa,
      fechaEmision: fa.slice(0, 10),
      paciente: {
        nombre: $("#nombre").value.trim(), nacimiento: $("#nacimiento").value,
        edad: edad($("#nacimiento").value, fa), sexo: $("#sexo").value, telefono: $("#telefono").value.trim(),
        dni: fotos.valores.dni || "",
      },
      hechos: {
        fecha: $("#fecha-hechos").value, lugar: $("#lugar").value.trim(), tipoAgresor: radio("agresor"),
        faccion: agente ? $("#faccion-ag").value : "", identificacion: agente ? $("#ident-ag").value.trim() : "",
        mecanismos: marcados("mecanismo"), relato: $("#relato").value.trim(),
      },
      lesiones: lesiones.filter((l) => l.zona && l.tipo).map((l) => ({ ...l, zona: zonaPorId(l.zona) })),
      pruebas: marcados("prueba"),
      tratamiento: marcados("trat"),
      psico: { sintomas: radio("intensidad") === "ninguna" ? [] : marcados("sintoma"), intensidad: radio("intensidad"), seguimiento: $("#seguimiento").checked },
      valoracion: { dias: $("#dias").value, impeditivos: $("#impeditivos").value, pronostico: $("#pronostico").value, secuelas: $("#secuelas").value.trim() || "Sin secuelas previsibles", juicio: $("#juicio").value.trim() },
      medico: { nombre: $("#medico").value.trim(), cargo: valorCargo(), firma: $("#firma").value.trim() || $("#medico").value.trim() },
    };
    irA("parte");
    $("#aviso-descarga").hidden = true;
    guardarReciente({ id: datosParte.numero, servicio: "parte", titulo: "Parte de lesiones", nombre: datosParte.paciente.nombre, numero: datosParte.numero, href: "parte.html", datos: instantanea() });
    try { await dibujarParte($("#lienzo"), datosParte, RECURSOS); }
    catch (err) { $("#aviso-descarga").textContent = "No se pudieron cargar las imágenes. Comprueba que la carpeta assets está junto a parte.html."; $("#aviso-descarga").hidden = false; }
  }

  // ── Documentos recientes: copia de todo el formulario para poder reabrirlo desde el Home ──
  function instantanea() {
    const campos = {};
    $$("#form-parte input, #form-parte select, #form-parte textarea").forEach((el) => {
      if (!el.id || el.closest(".lesion") || el.type === "file") return;
      campos[el.id] = el.type === "checkbox" || el.type === "radio" ? el.checked : el.value;
    });
    return { campos, lesiones: lesiones.map((l) => ({ ...l })), editado: { ...editado }, numero: datosParte.numero, clave: datosParte._clave, dni: fotos.valores.dni || "" };
  }
  function restaurar(rec) {
    const d = rec.datos;
    Object.entries(d.campos || {}).forEach(([id, val]) => {
      const el = document.getElementById(id); if (!el || el.closest(".lesion")) return;
      if (el.type === "checkbox" || el.type === "radio") el.checked = !!val; else el.value = val;
    });
    $("#cargo").hidden = $("#cargo-sel").value !== OTRO;
    lesiones = (d.lesiones || []).map((l) => ({ ...l }));
    editado = { ...{ dias: false, impeditivos: false, pronostico: false, juicio: false }, ...(d.editado || {}) };
    datosParte = { numero: d.numero, _clave: d.clave }; // al volver a generar se mantiene el número
    pintarLesiones(); alternarAgresor(); recalcular(); marcarFrases($("#form-parte"));
    if (d.dni) blobDeDataUrl(d.dni).then((b) => fotos.asignar("dni", b, "DNI del parte guardado")).catch(() => {});
    $(".intro-parte").insertAdjacentHTML("afterend", `<p class="aviso-reciente" role="status">Reabierto: <b>${esc(rec.nombre)}</b> · ${esc(rec.numero)}. Cambia lo que necesites y vuelve a generarlo; se mantiene el mismo número.</p>`);
    history.replaceState(null, "", location.pathname);
  }

  function irA(paso) {
    $("#vista-form").hidden = paso !== "form";
    $("#vista-parte").hidden = paso !== "parte";
    $$(".pasos li").forEach((li) => { li.classList.toggle("activo", li.dataset.paso === paso); li.classList.toggle("hecho", paso === "parte" && li.dataset.paso === "form"); });
    window.scrollTo(0, 0);
  }
  const nombreArchivo = () => `Parte_lesiones_${datosParte.paciente.nombre.replace(/\s+/g, "_").replace(/[^\w\-áéíóúñÁÉÍÓÚÑ]/g, "")}_${datosParte.numero}`;
  function descargar(blob, nombre) {
    descargarArchivo(blob, nombre);
    if (enVistaPrevia()) { $("#aviso-descarga").textContent = "Esta vista previa no permite descargar archivos. En GitHub Pages las descargas funcionan con normalidad."; $("#aviso-descarga").hidden = false; }
  }

  // ── Arranque ──
  $("#campo-dni .ayuda").insertAdjacentHTML("beforebegin", campoImagenHTML("dni", "dni", "DNI del paciente"));
  const fotos = activarImagenes({ raiz: $("#form-parte"), activo: () => !$("#vista-form").hidden, claves: () => ["dni"] });
  // Rellenado rápido (js/rapido.js)
  $(".intro-parte").insertAdjacentHTML("afterend", casosHTML(CASOS_PARTE));
  $(".casos").addEventListener("click", (e) => { const b = e.target.closest("[data-caso]"); if (b) aplicarCaso(Number(b.dataset.caso)); });
  $("#frases-relato").innerHTML = frasesHTML("relato", FRASES_RELATO);
  $("#frases-lugar").innerHTML = frasesHTML("lugar", FRASES_LUGAR, "reemplazar");
  document.body.insertAdjacentHTML("beforeend", Object.keys(TIPOS_LESION).map((t, k) =>
    `<datalist id="dl-lesion-${k}">${(DESC_LESION[t] || []).map((d) => `<option value="${esc(d)}">`).join("")}</datalist>`).join(""));
  activarFrases($("#form-parte"));
  chips("#chips-mecanismo", "mecanismo", MECANISMOS);
  chips("#chips-prueba", "prueba", PRUEBAS);
  chips("#chips-trat", "trat", TRATAMIENTOS);
  chips("#chips-sintoma", "sintoma", SINTOMAS);
  $("#fecha-asistencia").value = ahoraLocal();
  iniciarMedico();
  lesiones = [{ zona: "", tipo: "", gravedad: 0, desc: "" }];
  pintarLesiones();
  alternarAgresor();
  recalcular();

  $("#btn-anadir").addEventListener("click", () => { anadirLesion(); $$("#lista-lesiones .l-zona").pop().focus(); });
  $("#lista-lesiones").addEventListener("change", (e) => {
    const row = e.target.closest(".lesion"); if (!row) return;
    const l = lesiones[Number(row.dataset.i)];
    if (e.target.matches(".l-zona")) l.zona = e.target.value;
    if (e.target.matches(".l-tipo")) { l.tipo = e.target.value; listaDesc(row, l.tipo); }
    if (e.target.matches(".l-grav")) l.gravedad = Number(e.target.value);
    recalcular();
  });
  $("#lista-lesiones").addEventListener("input", (e) => {
    if (!e.target.matches(".l-desc")) return;
    lesiones[Number(e.target.closest(".lesion").dataset.i)].desc = e.target.value;
  });
  $("#lista-lesiones").addEventListener("click", (e) => {
    const b = e.target.closest(".btn-quitar"); if (!b) return;
    lesiones.splice(Number(b.closest(".lesion").dataset.i), 1); pintarLesiones(); recalcular();
  });
  $$('input[name="agresor"]').forEach((r) => r.addEventListener("change", alternarAgresor));
  ["mecanismo", "trat", "sintoma", "intensidad"].forEach((n) => $$(`input[name="${n}"]`).forEach((c) => c.addEventListener("change", recalcular)));
  ["#seguimiento", "#sexo"].forEach((s) => $(s).addEventListener("change", recalcular));
  $("#secuelas").addEventListener("input", recalcular);
  [["#dias", "dias"], ["#impeditivos", "impeditivos"], ["#pronostico", "pronostico"]].forEach(([s, k]) =>
    $(s).addEventListener("input", () => { editado[k] = true; if (!editado.juicio) $("#juicio").value = redactarJuicio(); $("#auto-aviso").hidden = false; ayudaJuicio(); }));
  $("#juicio").addEventListener("input", () => { editado.juicio = true; $("#auto-aviso").hidden = false; ayudaJuicio(); });
  $("#btn-recalcular").addEventListener("click", () => { editado = { dias: false, impeditivos: false, pronostico: false, juicio: false }; recalcular(); });
  $("#btn-ejemplo").addEventListener("click", cargarEjemplo);
  $("#form-parte").addEventListener("input", (e) => e.target.removeAttribute("aria-invalid"));
  $("#form-parte").addEventListener("submit", generar);
  $("#btn-png").addEventListener("click", () => descargar(lienzoAPng($("#lienzo")), nombreArchivo() + ".png"));
  $("#btn-pdf").addEventListener("click", () => descargar(crearPdfDesdeCanvas($("#lienzo"), 612, 1008, `Parte médico de lesiones · ${datosParte.paciente.nombre}`), nombreArchivo() + ".pdf"));
  $("#btn-editar").addEventListener("click", () => irA("form"));
  $("#btn-nuevo").addEventListener("click", () => {
    $("#form-parte").reset();
    fotos.quitarTodas();
    $$(".caso").forEach((x) => x.classList.remove("activo")); $("#casos-aviso").textContent = "";
    $("#fecha-asistencia").value = ahoraLocal();
    iniciarMedico();
    lesiones = [{ zona: "", tipo: "", gravedad: 0, desc: "" }];
    editado = { dias: false, impeditivos: false, pronostico: false, juicio: false };
    datosParte = null;
    pintarLesiones(); alternarAgresor(); recalcular();
    irA("form"); $("#nombre").focus();
  });
  const rec = recienteDeLaDireccion();
  if (rec && rec.servicio === "parte" && rec.datos) restaurar(rec);
})();
