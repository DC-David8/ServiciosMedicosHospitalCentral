/*
 * Registro de servicios del Hospital Central.
 * El portal (index.html) se dibuja a partir de esta lista.
 *
 * Para añadir un servicio: crea su página, añade aquí una entrada con estado "activo"
 * (o "pronto" para anunciarlo) y genera su icono con tools/generar_iconos.py.
 */

const AREAS = [
  { id: "salud-mental", nombre: "Salud Mental y Evaluación Psicológica" },
  { id: "urgencias", nombre: "Urgencias" },
  { id: "forense", nombre: "Medicina Forense" },
];

const SERVICIOS_HOSPITAL = [
  {
    id: "psicotecnico", area: "salud-mental", estado: "activo",
    nombre: "Psicotécnico policial",
    desc: "Examen de 10 a 60 preguntas basado en la normativa del servidor para agentes de LSPD, LSSD y FBI.",
    documento: "Certificado de aptitud",
    href: "psicotecnico.html", icono: "assets/app/icon-psico-192.png",
  },
  {
    id: "parte", area: "urgencias", estado: "activo",
    nombre: "Parte médico de lesiones",
    desc: "Lesiones, daño moral y valoración médico-legal para que el paciente presente su denuncia.",
    documento: "Parte de lesiones",
    href: "parte.html", icono: "assets/app/icon-parte-192.png",
  },
  {
    id: "defuncion", area: "forense", estado: "pronto",
    nombre: "Certificado de defunción",
    desc: "Identificación del fallecido, causa, fecha y circunstancias de la muerte.",
    documento: "Certificado de defunción",
    href: "defuncion.html", icono: "assets/app/icon-defuncion-192.png",
  },
  {
    id: "autopsia", area: "forense", estado: "pronto",
    nombre: "Informe de autopsia",
    desc: "Examen externo e interno, hallazgos, data de la muerte y conclusiones médico-legales.",
    documento: "Informe de autopsia",
    href: "autopsia.html", icono: "assets/app/icon-autopsia-192.png",
  },
];
