# Servicios Médicos · Hospital Central (EMS)

Herramientas web para el rol del Hospital Central en el servidor de FiveM **Jerarquía RP**. Desde un portal se elige el servicio y cada uno genera su documento oficial del hospital en **PNG o PDF**.

| Área | Servicio | Página | Estado |
|---|---|---|---|
| Salud Mental y Evaluación Psicológica | Psicotécnico policial (LSPD, LSSD, FBI) | `psicotecnico.html` | Activo |
| Urgencias | Parte médico de lesiones | `parte.html` | Activo |
| Medicina Forense | Certificado de defunción | `defuncion.html` | Próximamente |
| Medicina Forense | Informe de autopsia | `autopsia.html` | Próximamente |

El portal (`index.html`) se dibuja a partir de `js/servicios.js`. Cambiar el estado de un servicio a `"activo"` lo hace aparecer como disponible.

---

## Psicotécnico policial

1. **Datos** · Facción (Los Santos Police Department, Los Santos Sheriff Department o Federal Bureau of Investigation), nombre, ID/placa, rango oficial de su facción (o uno escrito a mano), fecha de nacimiento y sexo del agente. Datos del evaluador (nombre, cargo del Hospital Central y firma), fechas de evaluación y emisión, y validez del certificado (6, 12 o 24 meses).
2. **Examen** · **10, 20, 30, 40, 50 o 60 preguntas**, repartidas por igual entre 6 competencias. Preguntas y respuestas se barajan en cada examen.
3. **Resultado** · Puntuación global y por competencia, veredicto APTO / NO APTO y **criterio redactado automáticamente** (editable).
4. **Certificado** · Certificado de aptitud con los colores de la facción, descargable en PNG o PDF.

### Banco de preguntas

60 situaciones basadas en las **normativas vigentes de Jerarquía RP** (General, Policial, Organizaciones Criminales, Secuestros, Robos, Puntos Calientes y Vehículos de Guerra), dentro y fuera del rol. 10 por competencia: estabilidad emocional, manejo del estrés, toma de decisiones, trabajo en equipo, integridad y ética, y autocontrol y uso de la fuerza.

Cada respuesta puntúa de 0 a 3: **3** correcta, **2** aceptable, **1** poco adecuada o error de normativa, **0** conducta grave (cuenta como incompatible). La longitud de las respuestas está equilibrada para que la correcta no se adivine por ser la más larga.

**APTO** si: puntuación global ≥ 70 %, ninguna competencia < 50 % y como máximo 1 respuesta incompatible por cada 20 preguntas. Umbrales en `js/evaluacion.js` → `CRITERIOS`.

### Acceso evaluadores

`admin.html` (enlace en el pie del portal y del psicotécnico), protegido con contraseña: las 60 preguntas con la puntuación de cada respuesta, buscador, filtro por competencia y glosario de códigos radiales y DEFCON.

**Cambiar la contraseña:** `echo -n "NuevaContraseña" | sha256sum` y sustituye el resultado en `js/admin.js` → `CLAVE_SHA256`.

> Es una web estática: la contraseña evita miradas casuales, pero no es seguridad real.

## Parte médico de lesiones

Parte que el hospital entrega a un paciente agredido para que presente su denuncia.

1. **Paciente:** nombre, nacimiento (calcula la edad), sexo y teléfono.
2. **Hechos que refiere:** fecha, lugar, presunto agresor (agente de la ley con facción e identificación, civil o desconocido), mecanismo y relato.
3. **Exploración física:** hasta 8 lesiones con zona, tipo y gravedad, numeradas sobre una figura frontal y posterior. Pruebas y tratamiento aplicado.
4. **Estado psicológico y daño moral:** síntomas, intensidad y seguimiento psicológico.
5. **Valoración médico-legal:** días de curación, días impeditivos y pronóstico automáticos (editables) y juicio clínico redactado solo.
6. **Facultativo:** nombre, cargo y firma (se recuerdan entre servicios).

Los hechos se recogen *según manifiesta el paciente*: el parte certifica las lesiones, no quién las causó. Días orientativos por tipo de lesión en `js/parte.js` → `TIPOS_LESION`.

---

## Añadir un servicio nuevo (por ejemplo, certificado de defunción)

1. **Página:** copia `parte.html` como plantilla (`defuncion.html`). Mantén la cabecera con el enlace `← Servicios`, la carga de scripts compartidos y la vista de documento con los botones de descarga.
2. **Documento:** crea `js/defuncion-cert.js` usando la base común `js/documento.js`:
   ```js
   const doc = crearDocumento(canvas);
   doc.cabecera({ logo, org: "HOSPITAL CENTRAL · MEDICINA FORENSE", titulo: "CERTIFICADO DE DEFUNCIÓN",
                  etiquetaNumero: "Nº DE CERTIFICADO", numero, fecha });
   let y = doc.titulo("DATOS DEL FALLECIDO", doc.inicio);
   // … secciones con doc.dato, doc.parrafo, doc.rect …
   doc.firma({ firma, nombre, cargo, etiqueta: "MÉDICO FORENSE", fechaEmision, sello });
   doc.pie({ referencia: numero });
   ```
   El número de documento sale de `numeroDocumento("DEF", fecha, nombre)`. La figura corporal con marcadores de `js/parte-cert.js` (`dibujarFigura`, `ZONAS`) sirve también para el informe de autopsia.
3. **Formulario:** crea `js/defuncion.js` con la lógica. Cargos del hospital (`CARGOS`), descargas (`descargarArchivo`, `lienzoAPng`) y PDF (`crearPdfDesdeCanvas`) ya están en `js/hospital.js` y `js/pdf.js`.
4. **Portal:** en `js/servicios.js`, cambia el servicio a `estado: "activo"`.
5. **Icono de inicio:** en `tools/generar_iconos.py` quita `arranque=False` del servicio, ejecuta `python3 tools/generar_iconos.py defuncion` y crea su `manifest-defuncion.webmanifest` (copia de `manifest-parte.webmanifest`). Las etiquetas `<head>` se obtienen con `etiquetas_head()` del mismo script.

## Añadir a la pantalla de inicio (iPhone / Android)

Cada página se instala como app con su propio icono y pantalla de arranque: **Hospital Central** (portal, EMS), **Psicotécnico** (Ψ), **Parte médico** (portapapeles) y **Evaluadores** (candado). En iPhone: Safari → Compartir → **Añadir a pantalla de inicio**. Desde la app instalada, las descargas abren el menú Compartir.

> Si ya tenías un acceso creado antes de un cambio de icono, bórralo y vuelve a añadirlo.

## Estructura

```
├── index.html                 Portal de servicios
├── psicotecnico.html          Psicotécnico policial
├── admin.html                 Acceso evaluadores del psicotécnico
├── parte.html                 Parte médico de lesiones
├── manifest*.webmanifest      Manifiestos de app web (uno por página)
├── css/styles.css             Estilos de todas las páginas (claro y oscuro)
├── js/servicios.js            Registro de servicios y áreas del portal
├── js/hospital.js             Compartido: cargos del hospital, descargas, vista previa
├── js/documento.js            Compartido: base de los documentos médicos (cabecera, firma, pie…)
├── js/certificado.js          Fuentes y utilidades de dibujo + certificado del psicotécnico
├── js/pdf.js                  Exportación a PDF sin librerías externas
├── js/preguntas.js            Banco de preguntas del psicotécnico
├── js/evaluacion.js           Puntuación y criterio del psicotécnico
├── js/app.js                  Flujo del psicotécnico
├── js/admin.js                Acceso evaluadores
├── js/parte.js                Formulario y valoración del parte
├── js/parte-cert.js           Dibujo del parte (figura corporal y secciones)
├── tools/generar_iconos.py    Generador de iconos y pantallas de arranque
└── assets/                    Logo EMS, sello, escudos de facciones e iconos de app
```

Sin servidor ni dependencias: HTML, CSS y JavaScript puros. Se publica con GitHub Pages (**Settings → Pages**, rama `main`, carpeta `/ (root)`).

## Personalizar

- **Preguntas del psicotécnico:** `js/preguntas.js` (bloques `{ c, t, o }`).
- **Cargos del hospital:** `js/hospital.js` → `CARGOS`.
- **Rangos de cada facción:** `js/app.js` → `RANGOS`.
- **Servicios y áreas del portal:** `js/servicios.js`.
- **Tipografías de los documentos:** Fraunces (títulos), Questrial (texto) y Pinyon Script (firma), de Google Fonts. Se cambian en `js/certificado.js` (`FUENTE_TITULO`, `FUENTE_TEXTO`, `FUENTE_FIRMA`).
- **Colores de los documentos médicos:** `js/documento.js` → `DOC_COLORES`.
- **Logo, sello y escudos:** reemplaza los PNG de `assets/` y `assets/facciones/` manteniendo el nombre, y vuelve a ejecutar `tools/generar_iconos.py`.

---

Proyecto de rol. Hospital Central, LSPD, LSSD y FBI son facciones del servidor; no representa a ninguna institución real.
