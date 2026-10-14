# Servicios Médicos · Hospital Central (EMS)

Herramientas web para el rol del Hospital Central en el servidor de FiveM **Jerarquía RP**. Desde un portal se elige el servicio y cada uno genera su documento oficial del hospital en **PNG o PDF**.

| Área | Servicio | Página | Documento |
|---|---|---|---|
| Salud Mental y Evaluación Psicológica | Psicotécnico policial (LSPD, LSSD, FBI) | `psicotecnico.html` | Certificado de aptitud |
| Urgencias y Rescate | Parte médico de lesiones | `parte.html` | Parte de lesiones |
| Urgencias y Rescate | Búsqueda y rescate | `rescate.html` | Informe de operación |
| Cirugía | Cirugía general | `cirugia.html` | Informe quirúrgico |
| Ginecología y Obstetricia | Consulta de ginecología | `ginecologia.html` | Informe de consulta |
| Medicina Forense | Defunción y autopsia (CK) | `forense.html` | Certificado de defunción + Informe de autopsia |

Todos los documentos ocupan **una sola página**. Cada servicio tiene dos pestañas: **Documento** (formulario y generación) y **Protocolo IC** (los pasos registrados por el hospital, con cada comando `/me`, `/do`, `/e` o `/ems` listo para copiar). Los servicios que lo piden generan además el mensaje **/ems** ya relleno (anuncio de fallecimiento, aviso de salida de rescate).

### Home (centro de servicios)

`index.html` + `js/home.js`. Cabecera con luces de ambulancia, ECG en movimiento, reloj y botón de **turno** (cuenta el tiempo en servicio). Debajo:

- **Baldosas** de colores con cada servicio (color, nombre corto y palabras de búsqueda en `js/servicios.js`) y **buscador** (tecla `/`; Intro abre el primero).
- **Recientes:** los últimos 8 documentos generados en ese navegador. *Abrir* vuelve al servicio con todos los datos cargados (DNI incluido) y, al regenerarlo, mantiene el mismo número. Lo gestiona `js/recientes.js`.
- **Tu ficha:** nombre, cargo y firma del facultativo; es la misma que rellenan todos los servicios.
- **Comandos /ems** de los protocolos, listos para copiar.

### Rellenado rápido

Para escribir lo menos posible durante el rol, cirugía, ginecología, búsqueda y rescate y el parte de lesiones tienen:

- **Casos frecuentes:** botones que rellenan el formulario con un caso típico (bala en abdomen, rinoplastia, control de embarazo, senderista perdido, golpes en una detención…). No tocan los datos del paciente, las fechas, el equipo de rescate ni el facultativo; después solo se cambia lo que sea distinto.
- **Frases rápidas:** debajo de las áreas de texto, botones con frases típicas. Un clic añade la frase y otro la quita; el texto sigue siendo editable.
- **Listas en lugar de texto:** zona intervenida, diagnóstico, cambio estético, objetos extraídos y diagnóstico ginecológico se eligen de una lista, con «Otro (escribir)» para lo que no esté.
- **Parte de lesiones:** sugerencias de descripción según el tipo de cada lesión y frases para el lugar y el relato. Cambiar el estado de un servicio a `"activo"` lo hace aparecer como disponible.

---

## Psicotécnico policial

1. **Datos** · Facción (Los Santos Police Department, Los Santos Sheriff Department o Federal Bureau of Investigation), nombre, ID/placa, rango oficial de su facción (o uno escrito a mano), fecha de nacimiento y sexo del agente. Datos del evaluador (nombre, cargo del Hospital Central y firma), fechas de evaluación y emisión, y validez del certificado (6, 12 o 24 meses).
2. **Evaluación física** · Tensión, reflejos, pulso máximo y a los 30 s, saturación y test de sustancias (etapas 1-3 del protocolo). Aparecen en la ficha del certificado; un test positivo da NO APTO.
3. **Examen** · **10, 20, 30, 40, 50 o 60 preguntas**, repartidas por igual entre 6 competencias. Preguntas y respuestas se barajan en cada examen.
4. **Resultado** · Puntuación global y por competencia, veredicto APTO / NO APTO y **criterio redactado automáticamente** (editable).
5. **Certificado** · Certificado de aptitud con los colores de la facción, descargable en PNG o PDF.

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

1. **Paciente:** nombre, nacimiento (calcula la edad), sexo, teléfono y **DNI** (opcional: se pega el recorte con Ctrl + V, se arrastra o se elige el archivo; sale en el parte junto a los datos).
2. **Hechos que refiere:** fecha, lugar, presunto agresor (agente de la ley con facción e identificación, civil o desconocido), mecanismo y relato.
3. **Exploración física:** hasta 8 lesiones con zona, tipo y gravedad, numeradas sobre una figura frontal y posterior. Pruebas y tratamiento aplicado.
4. **Estado psicológico y daño moral:** síntomas, intensidad y seguimiento psicológico.
5. **Valoración médico-legal:** días de curación, días impeditivos y pronóstico automáticos (editables) y juicio clínico redactado solo.
6. **Facultativo:** nombre, cargo y firma (se recuerdan entre servicios).

Los hechos se recogen *según manifiesta el paciente*: el parte certifica las lesiones, no quién las causó. Días orientativos por tipo de lesión en `js/parte.js` → `TIPOS_LESION`.

---

## Servicios con el motor común

Rescate, cirugía, ginecología y forense usan el mismo motor (`js/servicio.js` + `js/servicio-doc.js`). Cada uno se define en un esquema `js/servicios/<id>.js` con:

- **Secciones y campos**: `texto`, `area`, `fecha`, `fechahora`, `hora`, `numero`, `select`, `segmentos`, `chips`, `check`, `imagen` (se adjunta al documento: se puede elegir un archivo, arrastrarlo o **pegar un recorte** con Ctrl + V, por ejemplo el DNI capturado con Win + Shift + S; con `lateral: true` sale a la derecha del nombre y los datos, como el DNI; `lateral: { ancho, alto, textos: true }` cambia el tamaño y pone también los textos largos a su izquierda, como la ecografía), `calculado`, `zonas` (hallazgos sobre la figura corporal; con `destacar` cada hallazgo tiene una casilla, p. ej. *Lesión mortal*, y los marcados salen en rojo) y `equipo` (personal de la operación). Con `si: (v) => …` un campo o sección solo aparece cuando aplica.
- **Documentos**: uno o varios (forense genera dos con los mismos datos). Cada documento elige sus secciones (`secciones`), oculta campos (`ocultar`), cambia títulos (`titulos`) y puede mostrar en la figura solo los hallazgos destacados (`zonas: { id: { soloDestacados, escala } }`). Si el contenido no cabe, el documento pasa a una segunda página (el PDF las mantiene separadas y el PNG las une); con `unaPagina: true` antes se dibuja algo más pequeño (hasta el 78 %) para que quepa en una. Con `agrupar: true` los datos cortos se juntan en filas de tres (los medianos ocupan dos columnas) antes de los textos largos, los textos se limitan a 6 líneas (10 el resumen) y se puede reducir hasta el 72 %; `chipsEnLinea: true` escribe las etiquetas como texto.
- **Cadena de causas**: una sección con `cadena` muestra sus campos como a), b), c) en un recuadro, con otro campo destacado a la derecha (la manera de muerte en forense).
- **Rellenado rápido** (`js/rapido.js`): `frases` en campos `texto` y `area` (lista o función de los valores; `modoFrases: "reemplazar"` para valores sueltos), `otro: true` en `select`, fechas relativas (`"+30d"`), `casos: [{ nombre, desc, falta, valores }]` y `conservar: [ids]` (lo que un caso no toca).
- **Resumen automático** (`resumen(v)`), **mensajes /ems** (`mensajes(v)`), **validación extra** (`validar(v)`) y **ejemplo** (`ejemplo`, botón *Cargar ejemplo*).

Reglas del protocolo que comprueba la web:

- **Rescate:** dotación mínima según la zona (fácil acceso: 2 rescatistas con 1 especialista SAR; difícil acceso o mar: 3 con 2 especialistas; siempre un EMS de apoyo de rango Auxiliar o superior), motivo obligatorio para actuar en el Norte y piloto marcado si se usa helicóptero.
- **Psicotécnico:** un test de sustancias positivo da NO APTO.
- **Forense:** dos documentos de una página, ambos con el DNI del fallecido junto a sus datos. El **certificado de defunción** recoge la constatación con las maniobras de reanimación, la figura con solo las lesiones mortales, la cadena de causas, el destino del cuerpo y la certificación. El **informe de autopsia** recoge el examen externo con todos los hallazgos (los mortales en rojo), el examen interno, la cadena de causas y las conclusiones.

## Añadir un servicio nuevo

1. **Esquema:** copia uno de `js/servicios/` (por ejemplo `cirugia.js`) como `js/servicios/<id>.js` y adapta campos, documento, resumen y ejemplo.
2. **Protocolo:** añade sus pasos en `js/protocolos.js` (clave = `protocolo` del esquema).
3. **Icono:** añade el servicio en `tools/generar_iconos.py` → `SERVICIOS` y ejecuta `python3 tools/generar_iconos.py <id>`.
4. **Página:** `python3 tools/crear_servicio.py <id> "<Título>" "<Nombre corto>" "<Descripción>"` crea `<id>.html` y su manifiesto a partir de `tools/plantilla-servicio.html`.
5. **Portal:** añádelo en `js/servicios.js` con `estado: "activo"` (o `"pronto"` para anunciarlo).

## Añadir a la pantalla de inicio (iPhone / Android)

Cada página se instala como app con su propio icono y pantalla de arranque: **Hospital Central** (portal), **Psicotécnico** (Ψ), **Parte médico** (portapapeles), **Rescate** (salvavidas), **Cirugía** (tijeras), **Ginecología** (♀), **Forense** (acta) y **Evaluadores** (candado). En iPhone: Safari → Compartir → **Añadir a pantalla de inicio**. Desde la app instalada, las descargas abren el menú Compartir.

> Si ya tenías un acceso creado antes de un cambio de icono, bórralo y vuelve a añadirlo.

## Estructura

```
├── index.html                 Home (centro de servicios)
├── psicotecnico.html          Psicotécnico policial (+ admin.html, acceso evaluadores)
├── parte.html                 Parte médico de lesiones
├── rescate.html, cirugia.html, ginecologia.html, forense.html   Servicios del motor común
├── manifest*.webmanifest      Manifiestos de app web (uno por página)
├── css/styles.css             Estilos de todas las páginas (claro y oscuro)
├── js/servicios.js            Registro de servicios y áreas del portal
├── js/servicios/<id>.js       Esquema de cada servicio del motor común
├── js/servicio.js             Motor: formulario, pestañas, mensajes y descargas
├── js/servicio-doc.js         Motor: dibujo del documento y paginación
├── js/protocolos.js           Protocolos IC del hospital con comandos copiables
├── js/hospital.js             Compartido: cargos, descargas, edad, vista previa
├── js/documento.js            Compartido: cabecera, firma, pie y utilidades de los documentos
├── js/certificado.js          Fuentes y utilidades de dibujo + certificado del psicotécnico
├── js/pdf.js                  PDF de una o varias páginas sin librerías externas
├── js/pegar-imagen.js         Campos de imagen: archivo, recorte pegado (Ctrl + V) o arrastrado
├── js/rapido.js               Casos frecuentes y frases rápidas
├── js/recientes.js            Documentos recientes (Home) y reabrirlos
├── js/home.js                 Home: baldosas, buscador, turno, recientes, ficha y comandos
├── js/preguntas.js, js/evaluacion.js, js/app.js, js/admin.js   Psicotécnico
├── js/parte.js, js/parte-cert.js                                Parte de lesiones (y figura corporal)
├── tools/generar_iconos.py    Iconos y pantallas de arranque
├── tools/crear_servicio.py    Crea la página y el manifiesto de un servicio
├── tools/plantilla-servicio.html
└── assets/                    Logo EMS, sello, escudos de facciones, iconos de app y fuente de la firma
```

Sin servidor ni dependencias: HTML, CSS y JavaScript puros. Se publica con GitHub Pages (**Settings → Pages**, rama `main`, carpeta `/ (root)`).

## Personalizar

- **Preguntas del psicotécnico:** `js/preguntas.js` (bloques `{ c, t, o }`).
- **Cargos del hospital:** `js/hospital.js` → `CARGOS`.
- **Rangos de cada facción:** `js/app.js` → `RANGOS`.
- **Servicios y áreas del portal:** `js/servicios.js`.
- **Tipografías de los documentos:** Fraunces (títulos) y Questrial (texto), de Google Fonts, y Pinyon Script (firma caligráfica), alojada en `assets/fuentes/` (licencia SIL OFL) para que la firma salga siempre aunque Google Fonts no cargue. Se cambian en `js/certificado.js` (`FUENTE_TITULO`, `FUENTE_TEXTO`, `FUENTE_FIRMA`).
- **Colores de los documentos médicos:** `js/documento.js` → `DOC_COLORES`.
- **Logo, sello y escudos:** reemplaza los PNG de `assets/` y `assets/facciones/` manteniendo el nombre, y vuelve a ejecutar `tools/generar_iconos.py`.

---

Proyecto de rol. Hospital Central, LSPD, LSSD y FBI son facciones del servidor; no representa a ninguna institución real.
