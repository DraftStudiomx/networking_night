# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) en Vercel, Supabase (Postgres + auth por link mágico), Stripe Checkout (tarjeta + OXXO), Resend (correo), @react-pdf/renderer (PDF), `qrcode`. Dominio `networking.draftstudio.mx`. Repo `github.com/DraftStudiomx/networking_night`. Detalle completo en PLANEACION.md.

## Users

- **Asistentes:** miembros de BNI (Pioneros, Metamorfosis y otros capítulos de León/Guanajuato) y sus invitados (empresarios no miembros). Llegan por recomendación de boca en boca, por la promoción en las sesiones de los capítulos y por links compartidos en WhatsApp; la mayoría abre el sitio en el celular. Su trabajo: entender qué es el evento, decidir ir y comprar uno o varios boletos en pocos minutos.
- **Organizadores (5–6 personas):** ven ventas, asistentes, miembros contra invitados y boletos duplicados en un panel.
- **Staff de entrada (1–2 personas):** escanean QR desde el celular el día del evento.

## Product Purpose

Vender y validar los boletos de **Networking Night: Save the Date**, un evento empresarial de BNI con temática de boda falsa, y que el sitio haga sentir que vale la pena ir. Hay éxito cuando el evento llena su cupo (~200), cada asistente recibe su boleto con QR por correo y la entrada fluye sin boletos duplicados.

## Positioning

Es la "boda" entre **Pioneros**, el primer capítulo de BNI en todo México (20 años), y **Metamorfosis**, el capítulo más reciente de León: la trayectoria y lo nuevo se unen. Ningún otro evento puede contar esa historia; la temática de boda es la forma de celebrar una alianza de negocios, no una boda real.

## Operating Context

- Sábado 28 de noviembre de 2026, 4:00 pm, Salón Callejón Arroyo (Valle del Arroyo 217, Santa Gertrudis, León, Gto.). Dress code: formal de boda.
- Boleto único de $600 MXN, sin factura ni descuentos; compra múltiple; boletos transferibles.
- Pago con tarjeta u OXXO; el boleto llega por correo (PDF + link).
- El día del evento se escanean los QR en la entrada.

## Capabilities and Constraints

- Superficies: landing (Persuade), compra/checkout, página "mi boleto", PDF y correo del boleto, panel de admin (Operate), escáner de staff (Operate).
- Solo español.
- Sin Apple ni Google Wallet. Sin WhatsApp automatizado.
- Máximo 10 boletos por compra; nombre obligatorio por asistente; OXXO con ficha de 24 h, solo hasta el 26 de noviembre; venta con tarjeta abierta hasta el día del evento.
- Membresía en el formulario: miembro de BNI (con el nombre de su capítulo) o no miembro.
- La venta no tiene límite de boletos (el salón tiene mobiliario para 200, solo como referencia interna).
- El boleto incluye: cena taquiza, mesa de postres, brindis, DJ, barra fría, valet y entrega de reconocimientos (detalle en PLANEACION.md).
- Al referirse a Metamorfosis: "el capítulo más joven de León". **Nunca mencionar su antigüedad en años o meses.**
- Por definir: agenda, quiénes son los "novios", padrinos, fotos, fecha de cierre de la venta.

## Brand Commitments

- Marca **BNI**: logotipo rojo con el nombre del capítulo en gris debajo ("PIONEROS", "METAMORFOSIS"). El rojo y el logo deben seguir siendo reconocibles.
- Tono: **de boda, pero con el perfil de BNI**: celebración formal y elegante, con el carácter profesional de BNI.
- Debe evitarse: lo **cursi** (parecer una invitación de boda real), lo **corporativo** (parecer un evento más de BNI) y la **plantilla genérica** de eventos.

## Evidence on Hand

- Logos: `Assets/Logo_Pioneros.jpg`, `Assets/Logo_Metamorfosis.jpg` (JPG con fondo blanco; conviene recrearlos en SVG).
- Cifras públicas de BNI México (oct 2026): 249 capítulos, 8,029 networkers, +435,642 referencias, +$8,082 M en negocios cerrados. BNI fue fundado por el Dr. Ivan Misner en enero de 1985.
- No hay fotos, testimonios ni agenda todavía. No inventar fechas de fundación de los capítulos: están por confirmar.

## Product Principles

1. La historia de los dos capítulos es el corazón; la boda es la forma de contarla.
2. Comprar debe ser obvio y rápido desde el celular.
3. Profesional antes que cursi: la elegancia viene de BNI, la picardía de los textos.
4. Cada boleto se puede rastrear: siempre se sabe de quién es.
