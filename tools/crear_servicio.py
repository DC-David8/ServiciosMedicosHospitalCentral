#!/usr/bin/env python3
"""
Crea (o regenera) la página y el manifiesto de un servicio a partir de tools/plantilla-servicio.html.

Uso:  python3 tools/crear_servicio.py <id> "<Título>" "<Nombre corto de la app>" "<Descripción>"
Ej.:  python3 tools/crear_servicio.py cirugia "Informe quirúrgico" "Cirugía" "Informe quirúrgico del Hospital Central."

Necesita js/servicios/<id>.js (el esquema) y el icono generado con tools/generar_iconos.py <id>.
"""
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "tools"))
from generar_iconos import etiquetas_head  # noqa: E402


def crear(sid, titulo, corto, descripcion):
    plantilla = open(os.path.join(RAIZ, "tools", "plantilla-servicio.html"), encoding="utf-8").read()
    manifest = f"manifest-{sid}.webmanifest"
    html = (plantilla.replace("{{ID}}", sid).replace("{{TITULO}}", titulo).replace("{{DESCRIPCION}}", descripcion)
            .replace("{{APPHEAD}}", etiquetas_head(sid, corto, manifest)))
    open(os.path.join(RAIZ, f"{sid}.html"), "w", encoding="utf-8").write(html)
    m = {
        "name": f"{titulo} · Hospital Central", "short_name": corto, "description": descripcion, "lang": "es",
        "start_url": f"./{sid}.html", "scope": "./", "display": "standalone", "orientation": "portrait",
        "background_color": "#0A1A2A", "theme_color": "#16304B",
        "icons": [
            {"src": f"assets/app/icon-{sid}-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": f"assets/app/icon-{sid}-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": f"assets/app/icon-{sid}-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    json.dump(m, open(os.path.join(RAIZ, manifest), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"✓ {sid}.html y {manifest}")


if __name__ == "__main__":
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    crear(*sys.argv[1:])
