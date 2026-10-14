/*
 * Registro de servicios del Hospital Central.
 * El portal (index.html) se dibuja a partir de esta lista.
 *
 * Para añadir un servicio: crea su esquema en js/servicios/<id>.js, genera el icono
 * (tools/generar_iconos.py <id>) y la página (tools/crear_servicio.py), y añádelo aquí.
 * Con estado "pronto" aparece en gris como Próximamente. corto, color, areaCorta y claves (búsqueda) son para el Home.
 */

const AREAS = [
  { id: "salud-mental", nombre: "Salud Mental y Evaluación Psicológica" },
  { id: "urgencias", nombre: "Urgencias y Rescate" },
  { id: "cirugia", nombre: "Cirugía" },
  { id: "ginecologia", nombre: "Ginecología y Obstetricia" },
  { id: "forense", nombre: "Medicina Forense" },
];

const SERVICIOS_HOSPITAL = [
  {
    id: "psicotecnico", area: "salud-mental", estado: "activo",
    corto: "Psicotécnico", color: "#2A55B8", areaCorta: "Salud mental", claves: "psicotecnico examen policia lspd lssd fbi sheriff agente certificado aptitud",
    nombre: "Psicotécnico policial",
    desc: "Evaluación biométrica y examen de 10 a 60 preguntas basado en la normativa del servidor para LSPD, LSSD y FBI.",
    documento: "Certificado de aptitud",
    href: "psicotecnico.html", icono: "assets/app/icon-psico-192.png",
  },
  {
    id: "parte", area: "urgencias", estado: "activo",
    corto: "Parte de lesiones", color: "#C8232C", areaCorta: "Urgencias", claves: "parte lesiones denuncia golpes taser esposas porra agresion pelea bala disparo",
    nombre: "Parte médico de lesiones",
    desc: "Lesiones, daño moral y valoración médico-legal para que el paciente presente su denuncia.",
    documento: "Parte de lesiones",
    href: "parte.html", icono: "assets/app/icon-parte-192.png",
  },
  {
    id: "rescate", area: "urgencias", estado: "activo",
    corto: "Búsqueda y rescate", color: "#D55A0F", areaCorta: "Rescate", claves: "rescate busqueda sar montaña mar senderista barranco helicoptero naufrago desaparecido",
    nombre: "Búsqueda y rescate",
    desc: "Aviso /ems de salida, equipo con comprobación de la dotación mínima, búsqueda y víctimas.",
    documento: "Informe de operación",
    href: "rescate.html", icono: "assets/app/icon-rescate-192.png",
  },
  {
    id: "cirugia", area: "cirugia", estado: "activo",
    corto: "Cirugía general", color: "#0E7F81", areaCorta: "Cirugía", claves: "cirugia quirurgico operacion bala arma blanca fractura rinoplastia estetica rasgos",
    nombre: "Cirugía general",
    desc: "Cirugía de salud o traumática y cirugía estética: anestesia, procedimiento, cierre y postoperatorio.",
    documento: "Informe quirúrgico",
    href: "cirugia.html", icono: "assets/app/icon-cirugia-192.png",
  },
  {
    id: "ginecologia", area: "ginecologia", estado: "activo",
    corto: "Ginecología", color: "#B0175A", areaCorta: "Ginecología", claves: "ginecologia embarazo ecografia revision quiste infeccion obstetricia",
    nombre: "Consulta de ginecología",
    desc: "Revisión, molestias o seguimiento de embarazo, con la captura de la ecografía.",
    documento: "Informe de consulta",
    href: "ginecologia.html", icono: "assets/app/icon-ginecologia-192.png",
  },
  {
    id: "forense", area: "forense", estado: "activo",
    corto: "Defunción y autopsia", color: "#3E4A55", areaCorta: "Forense", claves: "forense autopsia defuncion ck muerte fallecido cadaver morgue",
    nombre: "Defunción y autopsia (CK)",
    desc: "Constatación de la muerte, examen externo e interno, causa y destino del cuerpo, con el anuncio /ems.",
    documento: "Certificado de defunción + Informe de autopsia",
    href: "forense.html", icono: "assets/app/icon-forense-192.png",
  },
];
