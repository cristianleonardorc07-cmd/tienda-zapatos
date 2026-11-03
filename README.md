# NOVA KICKS

Tienda de calzado en React + Vite, JavaScript y CSS responsive. Catálogo de demostración con 24 productos, favoritos y carrito locales, y pedidos por WhatsApp. Sin pagos en línea, registro, backend ni servicios de pago.

## Desarrollo

Requiere Node.js 20.19+ o 22.12+ (validado con Node 24) y npm.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Configurar la tienda

Copia `.env.example` a `.env.local` y establece `VITE_WHATSAPP_NUMBER` con el número colombiano real, código 57 y diez dígitos, sin espacios ni signo +. Sin esta configuración, el formulario explica que el envío no está habilitado. `VITE_INSTAGRAM_URL` es opcional. Reinicia Vite o recompila después de cambiar variables. Estas variables son públicas: no incluyas secretos.

Los productos están en `src/data/products.json`: identificador, referencia, categoría, precio COP, precio anterior opcional, imágenes, descripción, tallas EU, colores, disponibilidad y etiquetas. Cada variante se distingue por producto, talla y color; el carrito permite de 1 a 20 unidades por variante. Antes de vender, reemplaza **todos** los datos e imágenes de ejemplo, ajusta promociones y disponibilidad, elimina los avisos de demostración y añade las condiciones comerciales reales. Las imágenes locales de tutorial son ilustrativas (origen y notas en `public/images/ATTRIBUTION.md`); las vistas adicionales no corresponden necesariamente al mismo modelo. Se sirven desde `public/images/`. Puedes sustituirlas por archivos en `public/images/` usando rutas `/images/archivo.jpg`.

El diseño sirve las fuentes DM Sans y Barlow Condensed localmente mediante Fontsource, con alternativas del sistema. No requiere servicios externos para renderizar el catálogo. Los datos del cliente no se persisten: solo componen el mensaje. Carrito y favoritos usan LocalStorage; el carrito no se vacía al abrir WhatsApp. Los precios del carrito se actualizan desde el catálogo al recargar. El envío y el pago se acuerdan con la tienda; abrir WhatsApp no confirma un pedido.

## Estructura

- `src/components/`: tarjetas, carrito, formulario y diálogo accesible.
- `src/pages/`: ficha de producto con galería, variantes y relacionados.
- `src/styles/`: diseño responsive y movimiento reducido.
- `src/data/`: catálogo JSON.
- `src/config/`: configuración de contacto.
- `src/utils/`: precios, persistencia y mensajes de pedido.
- `tests/`: integridad del catálogo y mensaje de WhatsApp.

Las fichas usan `?producto=nk-001`, compatible con navegación atrás/adelante y alojamiento estático.

## Cloudflare Pages

1. Conecta este repositorio en Cloudflare Pages, selecciona la rama que quieras publicar.
2. Comando de compilación: `npm run build`. Directorio de salida: `dist`. Directorio raíz: raíz del repositorio.
3. Usa Node 24 (`NODE_VERSION=24`) y configura `VITE_WHATSAPP_NUMBER`; opcionalmente `VITE_INSTAGRAM_URL`.
4. Publica y comprueba catálogo, ficha, carrito y el destinatario de WhatsApp. No se necesitan Functions, base de datos ni claves de API.

`public/_redirects` incluye el fallback de la aplicación. No se ha publicado automáticamente ni se ha vinculado una cuenta de Cloudflare.

## Pruebas en navegador

Ejecuta `npx playwright install chromium` y `npm run test:e2e`. Si Chromium ya está instalado, puedes usar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Los flujos comprueban escritorio y móvil.

Para comprobar el formulario habilitado sin contactar WhatsApp, inicia otra instancia de Vite con un número ficticio:

```sh
VITE_WHATSAPP_NUMBER=570000000000 npm run dev -- --port 5174 --strictPort
# En otra terminal:
node tests/whatsapp-flow.mjs
```

El script intercepta `window.open`, verifica destinatario, mensaje y persistencia; no envía pedidos. Admite también `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` para Chromium del sistema.
