#!/usr/bin/env python3
"""
Genera los iconos de pantalla de inicio y las pantallas de arranque (iPhone) de cada servicio.

Uso (desde la raíz del repositorio, necesita Pillow):
    python3 tools/generar_iconos.py            # todos los servicios
    python3 tools/generar_iconos.py parte      # solo uno

Para un servicio nuevo: añade una entrada en SERVICIOS (id, insignia y textos de arranque),
ejecuta el script y enlaza los archivos en la página (ver README, "Añadir un servicio").
Los archivos se guardan en assets/app/: icon-<id>-180/192/512.png, icon-<id>-maskable-512.png
y splash-<id>-<ancho>x<alto>.png.
"""
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "assets", "app")
LOGO = os.path.join(RAIZ, "assets", "logo-ems.png")

NAVY, NAVY2 = (22, 48, 75), (10, 26, 42)
ROJO, ORO, GRIS = (215, 38, 46), (201, 165, 74), (84, 96, 110)

# id: insignia (o None), color de la insignia, línea superior, título y subtítulo de la pantalla de arranque
SERVICIOS = {
    "hub":       dict(insignia=None,       titulo="SERVICIOS MÉDICOS", sub="Salud mental · Urgencias · Forense"),
    "psico":     dict(insignia="psi",      titulo="PSICOTÉCNICO",      sub="LSPD · LSSD · FBI"),
    "admin":     dict(insignia="candado",  titulo="EVALUADORES",       sub="Banco de preguntas"),
    "parte":     dict(insignia="parte",    titulo="PARTE DE LESIONES", sub="Servicio de Urgencias"),
    # Próximamente: arranque=False hasta que exista la página (solo se generan los iconos)
    "defuncion": dict(insignia="defuncion", titulo="DEFUNCIÓN",        sub="Medicina Forense", arranque=False),
    "autopsia":  dict(insignia="autopsia", titulo="AUTOPSIA",          sub="Medicina Forense", arranque=False),
}

# Pantallas de iPhone en vertical: (ancho CSS, alto CSS, densidad)
PANTALLAS = [(440, 956, 3), (420, 912, 3), (402, 874, 3), (430, 932, 3), (393, 852, 3), (428, 926, 3),
             (390, 844, 3), (375, 812, 3), (414, 896, 3), (414, 896, 2), (414, 736, 3), (375, 667, 2)]


def fuente(peso, px):
    candidatas = {
        "bold": ["/usr/share/fonts/opentype/inter/Inter-Bold.otf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "C:/Windows/Fonts/arialbd.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"],
        "semi": ["/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "C:/Windows/Fonts/arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"],
        "simbolo": ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "C:/Windows/Fonts/arialbd.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"],
    }[peso]
    for ruta in candidatas:
        if os.path.exists(ruta):
            return ImageFont.truetype(ruta, int(px))
    return ImageFont.load_default()


def fondo(w, h):
    sw, sh = max(1, w // 8), max(1, h // 8)
    g = Image.new("RGB", (sw, sh))
    px = g.load()
    cx, cy, r = sw / 2, sh * 0.46, math.hypot(sw, sh) * 0.55
    for y in range(sh):
        for x in range(sw):
            t = min(1, math.hypot(x - cx, y - cy) / r)
            px[x, y] = tuple(int(NAVY[i] * (1 - t) + NAVY2[i] * t) for i in range(3))
    return g.resize((w, h), Image.BICUBIC).convert("RGBA")


def poner_logo(img, lado, cx, cy):
    logo = Image.open(LOGO).convert("RGBA").resize((lado, lado), Image.LANCZOS)
    sombra = Image.new("RGBA", img.size, (0, 0, 0, 0))
    s = Image.new("RGBA", logo.size, (0, 0, 0, 255))
    s.putalpha(logo.getchannel("A").point(lambda v: int(v * 0.55)))
    sombra.paste(s, (int(cx - lado / 2), int(cy - lado / 2 + lado * 0.035)), s)
    img.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(lado * 0.03)))
    img.paste(logo, (int(cx - lado / 2), int(cy - lado / 2)), logo)


def insignia(img, tipo, cx, cy, r):
    d = ImageDraw.Draw(img)
    borde = max(2, int(r * 0.12))
    if tipo == "candado":
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=ORO, outline=(255, 255, 255), width=borde)
        bw, bh = r * 0.95, r * 0.72
        bx, by = cx - bw / 2, cy - bh * 0.15
        t = max(2, int(r * 0.16))
        d.arc((cx - r * 0.33, by - r * 0.62, cx + r * 0.33, by + r * 0.1), 180, 360, fill=NAVY2, width=t)
        d.line((cx - r * 0.33 + t / 2 - 1, by - r * 0.26, cx - r * 0.33 + t / 2 - 1, by + 2), fill=NAVY2, width=t)
        d.line((cx + r * 0.33 - t / 2, by - r * 0.26, cx + r * 0.33 - t / 2, by + 2), fill=NAVY2, width=t)
        d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=r * 0.12, fill=NAVY2)
        d.ellipse((cx - r * 0.09, by + bh * 0.3, cx + r * 0.09, by + bh * 0.3 + r * 0.18), fill=ORO)
    elif tipo == "psi":
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(26, 154, 214), outline=(255, 255, 255), width=borde)
        f = fuente("simbolo", r * 1.25)
        w = d.textlength("Ψ", font=f)
        bb = d.textbbox((0, 0), "Ψ", font=f)
        d.text((cx - w / 2, cy - (bb[1] + bb[3]) / 2), "Ψ", font=f, fill=(255, 255, 255))
    elif tipo in ("parte", "defuncion", "autopsia"):
        color_borde = ROJO if tipo == "parte" else GRIS
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255), outline=color_borde, width=borde)
        if tipo == "autopsia":
            t = max(2, int(r * 0.16))
            lr = r * 0.36
            lx, ly = cx - r * 0.12, cy - r * 0.12
            d.ellipse((lx - lr, ly - lr, lx + lr, ly + lr), outline=NAVY2, width=t)
            d.line((lx + lr * 0.7, ly + lr * 0.7, cx + r * 0.52, cy + r * 0.52), fill=NAVY2, width=int(t * 1.4))
            return
        w, h = r * 0.92, r * 1.12
        x0, y0 = cx - w / 2, cy - h / 2 + r * 0.06
        t = max(2, int(r * 0.1))
        d.rounded_rectangle((x0, y0, x0 + w, y0 + h), radius=r * 0.12, outline=NAVY2, width=t)
        d.rounded_rectangle((cx - w * 0.28, y0 - r * 0.12, cx + w * 0.28, y0 + r * 0.14), radius=r * 0.06, fill=NAVY2)
        cs, ccx, ccy = r * 0.2, cx, y0 + h * 0.42
        color_cruz = ROJO if tipo == "parte" else NAVY2
        if tipo == "parte":
            d.rectangle((ccx - cs * 0.32, ccy - cs, ccx + cs * 0.32, ccy + cs), fill=color_cruz)
            d.rectangle((ccx - cs, ccy - cs * 0.32, ccx + cs, ccy + cs * 0.32), fill=color_cruz)
        else:  # defunción: lazo de luto
            d.line((ccx - cs * 0.7, ccy + cs, ccx + cs * 0.4, ccy - cs * 0.9), fill=NAVY2, width=int(t * 1.3))
            d.line((ccx + cs * 0.7, ccy + cs, ccx - cs * 0.4, ccy - cs * 0.9), fill=NAVY2, width=int(t * 1.3))
            d.ellipse((ccx - cs * 0.42, ccy - cs * 1.2, ccx + cs * 0.42, ccy - cs * 0.45), outline=NAVY2, width=t)
        for k in (0.72, 0.86):
            d.line((x0 + w * 0.2, y0 + h * k, x0 + w * 0.8, y0 + h * k), fill=NAVY2, width=max(1, int(t * 0.8)))


def icono(sid, size, maskable=False):
    s = size * 4
    img = fondo(s, s)
    tipo = SERVICIOS[sid]["insignia"]
    frac = 0.56 if maskable else 0.74
    poner_logo(img, int(s * frac), s / 2, s / 2 * (0.97 if tipo else 1.0))
    if tipo:
        r = s * (0.11 if maskable else 0.15)
        off = s * (0.22 if maskable else 0.30)
        insignia(img, tipo, s / 2 + off, s / 2 + off, r)
    return img.resize((size, size), Image.LANCZOS).convert("RGB")


def splash(sid, w, h):
    cfg = SERVICIOS[sid]
    img = fondo(w, h)
    lado, cy = int(w * 0.40), h * 0.42
    poner_logo(img, lado, w / 2, cy)
    if cfg["insignia"]:
        insignia(img, cfg["insignia"], w / 2 + lado * 0.36, cy + lado * 0.36, lado * 0.17)
    d = ImageDraw.Draw(img)

    def centro(t, f, y, color, esp=0):
        ancho = sum(d.textlength(c, font=f) for c in t) + esp * (len(t) - 1)
        x = (w - ancho) / 2
        for c in t:
            d.text((x, y), c, font=f, fill=color)
            x += d.textlength(c, font=f) + esp

    y = cy + lado / 2 + w * 0.10
    centro("HOSPITAL CENTRAL · EMS", fuente("semi", w * 0.032), y, (242, 167, 171) if sid == "parte" else ORO, esp=w * 0.008)
    tf = fuente("bold", w * 0.075)
    while d.textlength(cfg["titulo"], font=tf) > w * 0.86:
        tf = fuente("bold", tf.size - 2)
    centro(cfg["titulo"], tf, y + w * 0.06, (234, 241, 248))
    centro(cfg["sub"], fuente("semi", w * 0.034), y + w * 0.06 + w * 0.11, (169, 188, 207))
    d.rectangle((0, h - int(h * 0.006), w, h), fill=ROJO)
    return img.convert("RGB").quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)


def generar(sid):
    pref = "icon" if sid == "hub" else f"icon-{sid}"
    for size in (180, 192, 512):
        icono(sid, size).save(os.path.join(SALIDA, f"{pref}-{size}.png"), optimize=True)
    icono(sid, 512, maskable=True).save(os.path.join(SALIDA, f"{pref}-maskable-512.png"), optimize=True)
    if SERVICIOS[sid].get("arranque") is False:
        print("✓", sid, "(solo iconos)")
        return
    spref = "splash" if sid == "hub" else f"splash-{sid}"
    for cw, ch, dpr in PANTALLAS:
        splash(sid, cw * dpr, ch * dpr).save(os.path.join(SALIDA, f"{spref}-{cw * dpr}x{ch * dpr}.png"), optimize=True)
    print("✓", sid)


def etiquetas_head(sid, titulo_app, manifest):
    """Devuelve las etiquetas <head> que necesita una página para instalarse como app."""
    pref = "icon" if sid == "hub" else f"icon-{sid}"
    spref = "splash" if sid == "hub" else f"splash-{sid}"
    lineas = [
        "<!-- App web (inicio en iPhone/Android) -->",
        f'<link rel="manifest" href="{manifest}">',
        '<meta name="theme-color" content="#16304B">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
        f'<meta name="apple-mobile-web-app-title" content="{titulo_app}">',
        f'<link rel="apple-touch-icon" href="assets/app/{pref}-180.png">',
        f'<link rel="icon" type="image/png" sizes="192x192" href="assets/app/{pref}-192.png">',
    ]
    for cw, ch, dpr in PANTALLAS:
        lineas.append(f'<link rel="apple-touch-startup-image" media="(device-width: {cw}px) and (device-height: {ch}px) '
                      f'and (-webkit-device-pixel-ratio: {dpr}) and (orientation: portrait)" href="assets/app/{spref}-{cw * dpr}x{ch * dpr}.png">')
    return "\n".join(lineas)


if __name__ == "__main__":
    ids = sys.argv[1:] or list(SERVICIOS)
    for sid in ids:
        if sid not in SERVICIOS:
            sys.exit(f"Servicio desconocido: {sid}. Opciones: {', '.join(SERVICIOS)}")
        generar(sid)
