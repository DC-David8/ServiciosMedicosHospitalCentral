# Psicotécnico Hospital Central · EMS

Herramienta web para el rol del servidor: el personal del **Hospital Central (EMS)** realiza el examen psicotécnico a los agentes de **LSPD, LSSD y FBI** y genera el certificado oficial con el resultado.

## Qué hace

1. **Datos** · Facción (Los Santos Police Department, Los Santos Sheriff Department o Federal Bureau of Investigation), nombre, ID/placa, rango oficial de su facción (o uno escrito a mano), fecha de nacimiento y sexo del agente. Datos del evaluador (nombre, cargo del Hospital Central o uno escrito a mano, y firma), fechas de evaluación y emisión, y validez del certificado (6, 12 o 24 meses).
2. **Examen** · Eliges **10, 20, 30, 40, 50 o 60 preguntas**. Se reparten por igual entre las 6 competencias y el orden de preguntas y respuestas se baraja en cada examen.
3. **Resultado** · Puntuación global y por competencia, veredicto APTO / NO APTO y el **criterio redactado automáticamente**. El evaluador puede editar el texto y cambiar el resultado final si lo considera.
4. **Certificado** · Se genera el Certificado de Psicotécnico del Hospital Central con todos los datos, listo para **descargar en PNG o PDF**.

## Competencias evaluadas

| Competencia | Preguntas en el banco |
|---|---|
| Estabilidad emocional | 10 |
| Manejo del estrés | 10 |
| Toma de decisiones | 10 |
| Trabajo en equipo | 10 |
| Integridad y ética | 10 |
| Autocontrol y uso de la fuerza | 10 |

Las 60 preguntas son situaciones del servidor basadas en las **normativas vigentes de Jerarquía RP**: Normativa General, Policial, Organizaciones Criminales, Secuestros, Robos, Puntos Calientes y Vehículos de Guerra. Incluyen reglas dentro del rol (DEFCON, códigos, derechos del detenido, negociaciones, mínimos de agentes por robo…) y fuera del rol (fairplay, TS3 al estar abatido, vocabulario, adrenalinas en robos pactados, metagaming, uso del /ooc, duplicados…).

Cada pregunta tiene 4 respuestas puntuadas de 0 a 3:

- **3**: correcta según la normativa y el protocolo.
- **2**: aceptable.
- **1**: poco adecuada o error de normativa.
- **0**: conducta grave (abuso, corrupción, romper el rol, disparar sin justificación). Cuenta como respuesta incompatible.

La longitud de las respuestas está equilibrada para que la correcta no se pueda adivinar por ser la más larga.

> Si cambia la normativa del servidor, actualiza las preguntas afectadas en `js/preguntas.js`.

## Cómo se decide APTO / NO APTO

El agente es **APTO** si cumple las tres condiciones:

- Puntuación global de **70 % o más**.
- Ninguna competencia por debajo del **50 %**.
- Como máximo **1 respuesta incompatible** por cada 20 preguntas (mínimo 1).

Los umbrales se cambian en `js/evaluacion.js` → `CRITERIOS`.

### Ejemplos de criterio generado

- **Apto (≥ 70 %)**: *El evaluado muestra un criterio general adecuado para el servicio. Destaca su coordinación y trabajo en equipo. Mantiene una base estable de actuación profesional.*
- **Apto (≥ 90 %)**: *La evaluada muestra un criterio excelente para el servicio. Destaca su templanza bajo presión, así como su integridad y apego al protocolo. Demuestra una actuación profesional sólida y fiable.*
- **No apto**: *El evaluado muestra un criterio insuficiente para el servicio en este momento. Presenta respuestas incompatibles con el protocolo de actuación. Se recomienda reforzar el autocontrol y el uso proporcional de la fuerza antes de una nueva evaluación.*

## Parte médico de lesiones

`parte.html` (enlace **Parte de lesiones** en la cabecera) genera el parte que el Hospital Central entrega a un paciente agredido para que presente su denuncia.

1. **Paciente:** nombre, DNI/ID, nacimiento (calcula la edad), sexo y teléfono.
2. **Hechos que refiere:** fecha, lugar, presunto agresor (agente de la ley con facción e identificación, civil o desconocido), mecanismo y relato del paciente.
3. **Exploración física:** hasta 8 lesiones con zona, tipo y gravedad. Se marcan numeradas sobre una figura frontal y posterior. Incluye pruebas y tratamiento aplicado.
4. **Estado psicológico y daño moral:** síntomas, intensidad y recomendación de seguimiento psicológico.
5. **Valoración médico-legal:** días de curación, días impeditivos y pronóstico se calculan solos (se pueden cambiar), y el juicio clínico se redacta automáticamente.
6. **Facultativo:** nombre, cargo, nº de colegiado y firma (se recuerdan junto con los del psicotécnico).

El parte se descarga en PNG o PDF. Los hechos se recogen *según manifiesta el paciente*: el parte certifica las lesiones y su compatibilidad con lo que se refiere, no quién las causó. Los días de curación por tipo de lesión se ajustan en `js/parte.js` → `TIPOS_LESION`.

## Acceso evaluadores

En el pie de la web hay un enlace **Acceso evaluadores** (`admin.html`) protegido con contraseña. Muestra:

- Las 60 preguntas con sus 4 respuestas ordenadas de mejor a peor y su puntuación (correcta, aceptable, poco adecuada o incompatible).
- Un buscador y un filtro por competencia.
- El glosario de códigos radiales, códigos especiales y niveles DEFCON de la Normativa Policial.

**Cambiar la contraseña:** calcula la huella SHA-256 de la nueva contraseña (en una terminal: `echo -n "NuevaContraseña" | sha256sum`) y sustitúyela en `js/admin.js` → `CLAVE_SHA256`.

> Es una web estática: la contraseña evita miradas casuales, pero no es seguridad real. Quien sepa abrir el código fuente puede leer `js/preguntas.js`.

## Añadir a la pantalla de inicio (iPhone / Android)

Las dos páginas se pueden instalar como app:

- **Psicotécnico** (`index.html`): icono del EMS.
- **Parte médico** (`parte.html`): icono del EMS con un portapapeles médico.
- **Evaluadores** (`admin.html`): icono del EMS con un candado dorado.

Cada una tiene su manifiesto (`manifest.webmanifest`, `manifest-admin.webmanifest`), su icono de Apple y su pantalla de arranque para cada tamaño de iPhone (`assets/app/`). En iPhone: Safari → Compartir → **Añadir a pantalla de inicio**.

Desde la app instalada, los botones de descarga abren el menú Compartir para guardar el certificado en Archivos o Fotos, o enviarlo directamente.

> Si ya tenías el acceso creado antes de este cambio, bórralo y vuelve a añadirlo: iPhone guarda el icono antiguo.

## Estructura

```
├── index.html            Página principal
├── css/styles.css        Estilos (modo claro y oscuro)
├── js/preguntas.js       Banco de 60 preguntas y competencias
├── js/evaluacion.js      Selección, puntuación y redacción del criterio
├── js/certificado.js     Dibujo del certificado (canvas 1224 × 2016)
├── js/pdf.js             Exportación a PDF sin librerías externas
├── js/app.js             Flujo de la aplicación
├── admin.html / js/admin.js  Acceso evaluadores (banco completo y glosario)
├── parte.html            Parte médico de lesiones
├── js/parte.js           Formulario y valoración del parte
├── js/parte-cert.js      Dibujo del parte (figura corporal, secciones)
├── js/hospital.js        Cargos del hospital y descargas, compartido
├── manifest*.webmanifest  Manifiestos de app web
└── assets/               Logo EMS, sello oficial y escudos de las facciones (assets/facciones)
```

No necesita servidor ni dependencias: es HTML, CSS y JavaScript puros.

## Publicar en GitHub Pages

1. Crea el repositorio (por ejemplo `psicotecnico-hospital-central`) y sube todos los archivos tal cual.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Elige la rama `main` y la carpeta `/ (root)` y guarda.
4. En un par de minutos estará disponible en `https://TU-USUARIO.github.io/psicotecnico-hospital-central/`.

Desde terminal:

```bash
git init
git add .
git commit -m "Psicotécnico Hospital Central: examen y certificado"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/psicotecnico-hospital-central.git
git push -u origin main
```

## Personalizar

- **Añadir o editar preguntas**: `js/preguntas.js`. Copia un bloque `{ c, t, o }` y asigna la competencia en `c`.
- **Cargos del Hospital Central**: `js/app.js` → `CARGOS` (de Director/a General a En prácticas, con opción de escribir otro).
- **Rangos de cada facción**: `js/app.js` → `RANGOS`. El desplegable incluye la opción "Otro (escribir a mano)" para rangos que no estén en la lista.
- **Frases del criterio**: `js/preguntas.js` → `COMPETENCIAS` (fortaleza / refuerzo) y `js/evaluacion.js` → `redactarCriterio`.
- **Tipografías del certificado**: Fraunces (títulos), Questrial (texto) y Pinyon Script (firma), todas gratuitas de Google Fonts. Se cambian en `js/certificado.js` (`FUENTE_TITULO`, `FUENTE_TEXTO`, `FUENTE_FIRMA`) y en el enlace de fuentes de `index.html`.
- **Logo, sello y escudos**: reemplaza los PNG de `assets/` y `assets/facciones/` manteniendo el nombre.

---

Proyecto de rol. Hospital Central, LSPD, LSSD y FBI son facciones del servidor; no representa a ninguna institución real.
