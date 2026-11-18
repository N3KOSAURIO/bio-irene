# Bio link · Irene Mendoza

Página de enlaces con agendamiento de citas directo desde la página.

- Sitio: https://irenemendoza.biolnk.si
- Publicado con GitHub Pages (rama `main`, raíz del repo)
- Dominio: registro CNAME `irenemendoza` → `n3kosaurio.github.io` en la zona `biolnk.si` (Hostinger)

## Cómo funciona el agendamiento

`app.js` arma el mensaje con nombre, servicio, fecha, hora y nota; el botón
«Enviar por WhatsApp» abre `wa.me/573124363853` con ese texto ya escrito.
No hay backend ni base de datos: la confirmación es la conversación de WhatsApp.

Enlaces de Instagram, TikTok, Servicios y Galería quedan en `#` (avisando
«Muy pronto») hasta que existan sus destinos.

## Archivos

- `index.html` — estructura y metadatos sociales
- `styles.css` — estilos (móvil primero)
- `app.js` — validación, vista previa del mensaje y enlace a WhatsApp
- `assets/` — imágenes optimizadas (WebP + favicon + og)
