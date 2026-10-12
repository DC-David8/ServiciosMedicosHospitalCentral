/*
 * Protocolos IC registrados por el Hospital Central (Discord del hospital).
 * Cada servicio muestra el suyo en la pestaña "Protocolo IC", con los comandos copiables.
 *
 * Formato de cada paso:
 *   "/me …", "/do …", "/e …", "/ems …"   → comando copiable
 *   { nota: "…" }                         → indicación fuera de personaje o de contexto
 *   { dice: "…" }                         → lo que el personaje dice en voz alta (IC)
 *   { opcion: "Título", pasos: [ … ] }    → rama alternativa del protocolo
 */

const PROTOCOLOS = {
  forense: {
    titulo: "Protocolo médico forense · Defunciones (CK)",
    etapas: [
      { titulo: "Constatación de muerte (RCP)", pasos: [
        "/do ¿Tendría pulso o signos vitales?", { nota: "Respuesta: no." },
        "/me procede a aplicar 1.5 mg de atropina intravenosa y carga el desfibrilador.",
        "/e cpr", { nota: "Realizar maniobras durante 10-15 segundos." },
        "/me aplica descarga de 400 J y observa el monitor.",
        "/do ¿Se vería alguna mejora en las constantes?", { nota: "Respuesta: no." },
        { nota: "Se solicita por OOC que el paciente tire de U, se le reanima y se traslada a la Morgue. [Final de reanimación]" },
      ] },
      { titulo: "Preparativos quirúrgicos", pasos: [
        "/me realiza el lavado clínico de manos y se coloca guantes y bata esterilizados.",
        "/me organiza el kit de instrumental forense y prepara la aspiradora quirúrgica.",
        "/do El instrumental y la mesa se encontrarían listos para el procedimiento legal.",
      ] },
      { titulo: "Identificación y examen externo", pasos: [
        "/me comprueba la identidad mediante el DNI y anota fecha/hora en el acta de defunción.",
        "/me toma la temperatura corporal y realiza un examen visual de la superficie del cuerpo.",
        "/do ¿Qué hallazgos principales se observarían en el examen externo del cuerpo?",
        "/me toma muestras de superficie y limpia el cuerpo con soluciones antisépticas.",
      ] },
      { titulo: "Procedimiento forense y limpieza", pasos: [
        "/me realiza las incisiones necesarias para el acceso a las cavidades y el estudio de órganos.",
        "/me procede a la identificación de la causa de muerte y la extracción de cualquier objeto extraño o tejido para análisis.",
        "/me utiliza la aspiradora quirúrgica para mantener el campo de trabajo limpio y despejado.",
        "/do Tras documentar los daños internos, se procedería al cierre clínico de las incisiones mediante sutura continua.",
        "/me higieniza el cuerpo eliminando cualquier rastro del procedimiento forense.",
      ] },
      { titulo: "Cierre y servicios funerarios", pasos: [
        "/me termina de rellenar el acta de defunción con las causas del fallecimiento y firma el documento.",
        "/do Se vería entrar al personal de servicios funerarios con el féretro para hacerse cargo del cuerpo.",
        "/do Los funerarios proceden a vestir al difunto, aplicar el maquillaje estético y prepararlo para el sepelio.",
        "/me entrega el acta firmada a los funerarios (o familiares) y archiva la copia oficial.",
        "/do El cuerpo es retirado de la morgue con destino al cementerio.",
        { nota: "A continuación se publica el anuncio (lo tienes ya relleno en la pestaña Documento) y termina el rol." },
        "/ems [ÚLTIMA HORA] El Hospital Central confirma que el ciudadano (Nombre del paciente) ha fallecido. Sus restos descansarán en el Cementerio Municipal. Que en paz descanse.",
      ] },
    ],
  },

  cirugia: {
    titulo: "Protocolo de cirugía general",
    etapas: [
      { titulo: "Preparativos", pasos: [
        { nota: "Equipa el uniforme de quirófano antes de empezar." },
        "/me realiza el lavado quirúrgico de manos con jabón antiséptico y se coloca guantes estériles.",
        "/me organiza el instrumental necesario en la mesa auxiliar y prepara la aspiradora quirúrgica.",
        "/me coloca al paciente en la camilla y procede a desinfectar la zona a tratar con yodo.",
        "/do ¿Se encontraría el paciente ya preparado y la zona esterilizada para comenzar?",
      ] },
      { titulo: "Monitoreo y anestesia", pasos: [
        "/me conecta el monitor de constantes y coloca la mascarilla de oxígeno al paciente.",
        "/me suministra la dosis de anestesia total (Propofol) a través de la vía intravenosa.",
        "/do ¿Se verían los signos vitales estables y al paciente entrar en sueño profundo?",
      ] },
      { titulo: "Procedimiento", pasos: [
        { opcion: "Cirugía estética / reconstructiva (cambio de físico)", pasos: [
          "/me realiza pequeñas incisiones en las zonas a remodelar utilizando el bisturí de precisión.",
          "/me procede a la remodelación de tejidos y aplicación de soluciones estéticas según el deseo del paciente.",
          "/do ¿Se empezaría a notar el cambio en los rasgos/físico del paciente de manera exitosa?",
        ] },
        { opcion: "Cirugía de salud / traumática (lesiones)", pasos: [
          "/me realiza una incisión profunda para acceder al área afectada por el traumatismo.",
          "/me utiliza las pinzas y el aspirador para limpiar la zona y reparar los tejidos u órganos dañados.",
          "/do ¿Se lograría estabilizar la lesión interna sin complicaciones graves?",
        ] },
      ] },
      { titulo: "Cierre y sutura", pasos: [
        { opcion: "Si fue cirugía de salud", pasos: [
          "/me procede a coser la herida capa por capa con hilo de seda o grapas quirúrgicas.",
          "/do ¿Cuántos puntos serían necesarios para cerrar la incisión?", { nota: "Se responde con /dados. Anota el resultado en el informe." },
        ] },
        { opcion: "Si fue cirugía estética", pasos: [
          "/me utiliza sutura intradérmica (invisible) para evitar cicatrices y aplica cremas regeneradoras.",
          "/do ¿Se vería un acabado limpio y sin imperfecciones en la piel?",
        ] },
      ] },
      { titulo: "Reanimación y postoperatorio", pasos: [
        "/me administra el fármaco para despertar al paciente y retira los equipos de monitoreo.",
        "/do ¿El paciente abriría los ojos presentando una recuperación estable?",
        { nota: "Traslada al paciente a hospitalización para que repose. Ya en la habitación, informa del éxito de la operación y rellena el informe médico (con foto del DNI)." },
      ] },
    ],
  },

  ginecologia: {
    titulo: "Protocolo de ginecología y obstetricia",
    etapas: [
      { titulo: "Consulta y triaje", pasos: [
        { nota: "Recibe a la paciente en el consultorio y hazle una breve entrevista sobre su historial clínico." },
        "/do ¿La paciente acude por un chequeo de rutina, por molestias o por seguimiento de embarazo?",
        "/me procede a tomar las constantes vitales básicas (tensión y peso) y las anota en la ficha.",
        "/me indica a la paciente que se coloque la bata clínica para preservar su privacidad durante la exploración.",
      ] },
      { titulo: "Exploración diagnóstica (ecografía)", pasos: [
        { nota: "Se usa el ecógrafo para revisar el estado interno o el desarrollo del bebé. Es indoloro y visual." },
        { dice: "Vamos a aplicar un poco de gel conductor. Está algo frío, pero nos permitirá ver en el monitor que todo esté en orden." },
        "/me aplica gel hipoalergénico sobre la zona abdominal y desliza el transductor del ecógrafo.",
        "/me ajusta el monitor para que la paciente pueda observar la imagen en tiempo real.",
        "/do ¿Qué se observaría en la pantalla?", { nota: "Ej.: desarrollo fetal normal, quiste pequeño o útero sano." },
        "/me toma capturas de la ecografía para adjuntarlas al informe médico.",
      ] },
      { titulo: "Diagnóstico y procedimiento", pasos: [
        { opcion: "A · Seguimiento de embarazo", pasos: [
          { dice: "Todo se ve excelente. El desarrollo es el adecuado para el tiempo de gestación. ¿Quiere escuchar los latidos?" },
          "/me activa el Doppler del ecógrafo para amplificar el sonido del corazón del feto.",
          "/do ¿Se escucharía un latido rápido y fuerte a través de los altavoces del equipo?",
          "/me entrega una copia de la ecografía a la paciente y le receta las vitaminas/ácido fólico necesarios.",
        ] },
        { opcion: "B · Revisión de salud / molestias", pasos: [
          { dice: "Hemos detectado el origen de su molestia. No es nada grave, pero necesitaremos ponerle un tratamiento preventivo." },
          "/me realiza una toma de muestras rápida y segura para enviar al laboratorio de análisis.",
          "/me prescribe el tratamiento farmacológico adecuado para remitir la inflamación o el dolor.",
          "/do ¿Se vería a la paciente más tranquila tras recibir la explicación y el tratamiento?",
        ] },
      ] },
      { titulo: "Finalización y alta", pasos: [
        { dice: "Ya puedes retirarte el gel con estas toallitas que te entrego ahora y ya puedes cambiarte." },
        "/me entrega las toallitas para limpiar el gel sobrante y permite que la paciente se cambie de ropa.",
        "/me finaliza el informe médico y programa la siguiente cita de revisión en el calendario.",
      ] },
    ],
  },

  psicotecnico: {
    titulo: "Protocolo de pruebas psicotécnicas",
    etapas: [
      { titulo: "Evaluación biométrica", pasos: [
        "/me activa el monitor de constantes y coloca el manguito de presión y el pulsioxímetro.",
        "/do ¿Mostraría el paciente signos de arritmia o tensión fuera de los rangos legales (120/80)?",
        "/me realiza un examen de agudeza visual periférica y reactividad pupilar con la linterna.",
        "/e holster6",
        "/do ¿Sus reflejos oculares son inmediatos y coordinados?",
      ] },
      { titulo: "Test de estrés cardiopulmonar", pasos: [
        { nota: "Sácalo al pasillo o a un área abierta y actúa con autoridad médica. Indícale por OOC: /e gym4 para jumping jacks y /e pushup para flexiones." },
        { dice: "Bien, en reposo cualquiera es apto. Pero en la calle tendrá que correr con 10 kilos de equipo encima. Vamos a estresar ese corazón. ¡Dame 20 flexiones explosivas y 10 jumping jacks ahora! ¡Ya!" },
        "/me activa el cronómetro táctico de su reloj y mantiene la vista fija en la expansión torácica del paciente.",
        "/do ¿Se observaría una técnica limpia o empezaría a presentar disnea (dificultad para respirar) prematura?",
        { nota: "Espera a que termine la animación." },
        "/me le coloca el pulsioxímetro en el índice nada más terminar",
        { dice: "Inspire profundo." },
        "/do El monitor marcaría un pico de 145 lpm con una saturación de oxígeno del 98%.",
        "/me observa el descenso de las pulsaciones durante 30 segundos para evaluar la recuperación cardíaca.",
        "/do ¿A cuánto bajarían las pulsaciones tras el medio minuto de descanso? (Normal: 95-100 lpm).",
        { dice: "Buena recuperación. Su corazón vuelve a la calma rápido, eso es vital para mantener la puntería tras una carrera. Volvamos dentro." },
      ] },
      { titulo: "Screening de sustancias", pasos: [
        "/me realiza una punción rápida en el dedo para obtener una gota de sangre.",
        "/me introduce la muestra en un cartucho de reactivos para detección de estupefacientes.",
        "/do ¿El test marcaría negativo en todas las bandas de sustancias psicotrópicas?",
        "/me limpia y coloca un apósito pequeño en el dedo del paciente.",
      ] },
      { titulo: "Test de percepción y estabilidad", pasos: [
        "/me saca tres láminas del test de Rorschach (manchas de tinta) y se las muestra una a una.",
        { dice: "Dígame lo primero que ve en estas imágenes. Sea honesto, evaluamos su subconsciente bajo presión." },
        "/me toma notas en su tablet sobre la velocidad de respuesta y la coherencia del sujeto.",
        { nota: "Aquí se realiza el examen de preguntas de esta web." },
      ] },
      { titulo: "Dictamen y firma", pasos: [
        "/me procesa los datos en el sistema y genera el código QR de autenticidad.",
        "/do En la tablet se leería: ESTADO: APTO | PERFIL: ESTABLE | LICENCIA: AUTORIZADA.",
        "/me le hace entrega del certificado médico oficial con el sello holográfico del hospital.",
        { dice: "Felicidades. Físicamente está perfecto y su mente es de acero. Espero verle con el uniforme pronto. No me haga arrepentirme de esta firma. Le mandaremos por correo el certificado, no lo pierda." },
      ] },
    ],
  },

  rescate: {
    titulo: "Protocolo de búsqueda y rescate",
    intro: [
      "Búsqueda: procedimiento ordenado y estructurado para encontrar a una víctima en una emergencia, cumpliendo las normas de seguridad en beneficio del afectado y del rescatista.",
      "Rescate: operaciones necesarias para trasladar a una persona desde un lugar siniestrado hasta uno seguro para su posterior atención.",
    ],
    etapas: [
      { titulo: "Seguridad y análisis de riesgo", pasos: [
        { nota: "El oficial a cargo evalúa el lugar afectado y los posibles puntos de búsqueda y rescate. La seguridad del personal es lo primero: se siguen todos los procedimientos preestablecidos." },
        { nota: "Al recibir el aviso, analiza el lugar del siniestro: zona montañosa de difícil acceso, mar o lugar de alto riesgo para los rescatistas. Actúa según ese análisis." },
      ] },
      { titulo: "Dotación según la zona", pasos: [
        { opcion: "Montaña de fácil acceso (camino de tierra o lugar para aterrizar)", pasos: [
          { nota: "Coordinación por radio. Obligatorio 2 rescatistas: 1 especialista en Búsqueda y Rescate, acompañado y apoyado por un EMS de rango Auxiliar o superior." },
        ] },
        { opcion: "Montaña de difícil acceso o mar (sin lugar para aterrizar)", pasos: [
          { nota: "Coordinación por radio. Obligatorio 3 rescatistas: 2 especialistas en Búsqueda y Rescate, acompañados y apoyados por un EMS de rango Auxiliar o superior." },
        ] },
        { nota: "En cualquier caso, una vez coordinado el grupo, actuar con la mayor brevedad y eficacia, anteponiendo la seguridad de rescatistas y víctimas." },
      ] },
      { titulo: "Aviso obligatorio", pasos: [
        "/ems Grupo de Búsqueda y Rescate de camino a parcela XXXX",
        { nota: "Sustituye XXXX por la parcela o el nombre de la montaña. En la pestaña Documento lo tienes ya relleno." },
      ] },
      { titulo: "Búsqueda y rescate", pasos: [
        { nota: "Primer paso: en la zona, busca a los afectados con cualquier herramienta disponible: análisis del terreno, huellas, marcas o las cámaras del helicóptero (térmica, escaneo y zoom)." },
        { nota: "Segundo paso: con las víctimas localizadas, aplica los primeros auxilios. Si requieren extracción, se realiza y se trasladan únicamente al Hospital." },
      ] },
      { titulo: "Consideraciones", pasos: [
        { nota: "Solo se realizan rescates en el NORTE cuando no están los EMS Norte o cuando nos solicitan apoyo." },
        { nota: "Solo puede pilotar el helicóptero quien tenga el rango Piloto. Quien incumpla esto será degradado." },
      ] },
    ],
  },
};

/** Dibuja un protocolo dentro de un elemento, con botones para copiar cada comando. */
function pintarProtocolo(el, protocolo) {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const paso = (p) => {
    if (typeof p === "string") {
      const [, cmd, resto] = p.match(/^(\/\S+)\s*(.*)$/) || [null, "", p];
      return `<li class="pc-cmd"><code><b>${esc(cmd)}</b> ${esc(resto)}</code><button type="button" class="pc-copiar" data-texto="${esc(p)}" aria-label="Copiar comando">Copiar</button></li>`;
    }
    if (p.nota) return `<li class="pc-nota">${esc(p.nota)}</li>`;
    if (p.dice) return `<li class="pc-dice"><span>Dice</span>«${esc(p.dice)}»</li>`;
    if (p.opcion) return `<li class="pc-opcion"><span class="pc-opcion-tit">${esc(p.opcion)}</span><ul>${p.pasos.map(paso).join("")}</ul></li>`;
    return "";
  };
  el.innerHTML = `
    ${protocolo.intro ? protocolo.intro.map((t) => `<p class="pc-intro">${esc(t)}</p>`).join("") : ""}
    <ol class="pc-etapas">${protocolo.etapas.map((e, i) => `
      <li class="pc-etapa"><h3><span>${i + 1}ª etapa</span>${esc(e.titulo)}</h3><ul>${e.pasos.map(paso).join("")}</ul></li>`).join("")}
    </ol>`;
  el.addEventListener("click", async (ev) => {
    const b = ev.target.closest(".pc-copiar"); if (!b) return;
    await copiarTexto(b.dataset.texto, b);
  });
}

/** Copia un texto y avisa en el propio botón. */
async function copiarTexto(texto, boton) {
  let ok = false;
  try { await navigator.clipboard.writeText(texto); ok = true; } catch (e) {
    const ta = document.createElement("textarea"); ta.value = texto; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    ta.remove();
  }
  if (boton) {
    const antes = boton.textContent;
    boton.textContent = ok ? "Copiado" : "Selecciónalo";
    boton.classList.toggle("ok", ok);
    setTimeout(() => { boton.textContent = antes; boton.classList.remove("ok"); }, 1400);
  }
  return ok;
}
