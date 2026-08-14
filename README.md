# Distrito Brokers — sitio web

Sitio corporativo informativo. **No es un ecommerce ni un portal inmobiliario**: no hay
carrito, checkout, pagos, cuentas de usuario ni comparador. La conversión ocurre por
**WhatsApp, formulario y llamada**.

Construido a partir del diseño `Distrito Brokers Home.dc.html` (Claude Design). El
template original usa el runtime `<x-dc>` (`support.js`, React + `style-hover` +
`{{ props }}`); aquí está convertido a HTML/CSS estáticos, sin dependencias de
JavaScript de terceros.

## Estructura

```
site/
  index.html            Inicio  →  /
  nosotros/index.html   Nosotros →  /nosotros
  servicios/index.html  Servicios → /servicios
  propiedades/index.html Propiedades y desarrollos → /propiedades
  contacto/index.html   Contacto → /contacto
  404.html
  robots.txt
  assets/
    css/style.css       Sistema visual completo (tokens + componentes)
    js/main.js          Menú móvil, apariciones, formulario → WhatsApp, año
    img/favicon.svg
```

Las URLs son limpias (`/nosotros`, no `/nosotros.html`) gracias a
`html_handling: auto-trailing-slash` en `wrangler.jsonc`.

## Desarrollo

```bash
npx wrangler dev --port 8788
```

También está registrado como configuración `distrito-brokers` en `.claude/launch.json`.

## Deploy

```bash
npx wrangler deploy
```

## Datos de contacto (única fuente de verdad)

| Dato | Valor |
| --- | --- |
| WhatsApp | 33 1359 3919 → `https://wa.me/523313593919` |
| Teléfono | `tel:+523313593919` |
| Horario | 9:00 a 18:00 h |
| Correo | **No existe todavía.** No se muestra ninguno; la ficha de contacto dice "Pendiente de habilitar". |

Para cambiar el número, buscar y reemplazar `523313593919` y `33 1359 3919` en `site/`
(y `data-wa-number` en el formulario de contacto).

## Sistema visual

Todo vive en `assets/css/style.css`, organizado en 23 bloques numerados.

- **Color**: crema `#f4f1ec`, azul marino `#17324e` / `#102437` / `#0c1c2e`, verde
  WhatsApp `#1f7a52`, y los cuatro acentos del logotipo (oro `#c0883a`, azul `#2f5f9e`,
  terracota `#b25236`, verde `#4f8a52`).
- **Tipografía**: Newsreader (títulos), Archivo (texto), Space Mono (etiquetas).
- **Métrica**: contenedor 1360 px, gutter `clamp(20px,5vw,64px)`, secciones
  `clamp(72px,9vw,128px)`, radio 4 px, bordes de 1 px.

Componentes reutilizables: `.site-header` + `.mobile-nav`, `.site-footer`, `.wa-float`,
`.btn` (`--wa`, `--outline`, `--navy`, `--ghost`), `.eyebrow`, `.h-display/.h-section/
.h-sub/.h-card`, `.card`, `.choice`, `.prop`, `.flow`, `.ledger`, `.converge`, `.bento`,
`.step__num`, `.ph` (placeholder de imagen), `.notice`, `.form`, `.contact-panel`,
`.cta`.

Los acentos por instancia se pasan con una custom property inline:
`<article class="prop" style="--accent:#2f5f9e">`.

## Imágenes

Las fotografías viven en `site/assets/img/`. Son **imágenes de referencia**: ilustran
el tipo de vivienda y de acompañamiento que maneja Distrito Brokers, no desarrollos
propios. La página de propiedades lo dice de forma explícita en su aviso.

Cada foto se generó en dos tamaños (1x y `@2x`) recortada al aspecto de su slot, con
`sharp` a WebP calidad 72. Los originales están fuera del repositorio, en
`Desktop/Proyectos/Distrito brokers/`. El script de generación queda documentado en
el historial; para rehacerlo basta con `sharp().resize(w, h, {fit:'cover',
position:'attention'}).webp({quality:72})`.

Peso total del set: **1.7 MB** para 40 archivos (los originales sumaban ~10 MB), y
cada página carga sólo los suyos. Todas llevan `width`/`height` para reservar espacio,
`srcset`/`sizes`, `loading="lazy"` salvo la primera de cada página, y `alt` descriptivo.

El marco `.ph` conserva la trama diagonal del diseño detrás de la imagen, así que
sigue funcionando como espacio reservado mientras la foto carga o si algún slot se
queda sin `<img>`. Para sustituir una foto basta con cambiar el `src`/`srcset`: la
proporción y la posición en la retícula no cambian.

En el bento del inicio el texto va sobre la fotografía; lo resuelven un velo crema
(`.bento__item::after`) y un respaldo sólido bajo la etiqueta de esquina, que
garantizan el contraste sea cual sea la imagen que se cargue.

## Contenido de demostración

`/propiedades` publica seis fichas de **ejemplo**, marcadas con la etiqueta
"Ejemplo" y con todos los campos en "Por confirmar". No hay nombres comerciales,
precios, ubicaciones, metros cuadrados, recámaras ni amenidades inventados; las
fotografías son de referencia y no corresponden a ningún desarrollo concreto. La
estructura (`.prop` + `.prop__meta`) está lista para alimentarse desde un CMS.

Tampoco se inventaron años de experiencia, número de clientes, premios,
certificaciones ni testimonios: la sección de testimonios del Inicio es un
*empty state* explícito, igual que en el diseño.

## Pendientes al publicar

1. `sitemap.xml` y la línea `Sitemap:` de `robots.txt` — requieren el dominio final.
2. Canonicals: hoy son relativos (`/nosotros/`); conviene volverlos absolutos.
3. Correo electrónico, cuando exista.
4. Fotografía de desarrollos propios, para sustituir las imágenes de referencia.
5. Testimonios reales.
6. **Definir el logotipo.** El archivo `Logotipo.png` de la carpeta de assets dice
   *"Smart Living Brokers"*, un nombre distinto al del sitio. El header y el footer
   siguen usando el isotipo de cuatro casillas y el lockup tipográfico
   "Distrito · Brokers" del diseño original. Hay que confirmar cuál es la marca
   correcta antes de publicar.
