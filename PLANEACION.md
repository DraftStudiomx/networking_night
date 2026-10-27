# Networking Night: Save the Date
### Pioneros & Metamorfosis · Planeación del sitio

> Estado: **planeación** (sin código todavía). Última actualización: 25 oct 2026 (ronda 2 de decisiones).
> Lo que sigue abierto está en la sección 13, **Radar de pendientes**.
> Sitio: `networking.draftstudio.mx` · Repo: `github.com/DraftStudiomx/networking_night`

---

## 1. Concepto

Evento empresarial de BNI con temática de **boda falsa**: la unión entre
**Pioneros**, el primer capítulo de BNI en todo México (20 años), y
**Metamorfosis**, el capítulo más reciente de León.

Idea central: *la experiencia y lo nuevo se unen*. El sitio es un **landing
de evento** (no una invitación de boda literal) con lenguaje y estética de boda.

| Dato | Valor |
|---|---|
| Nombre | Networking Night: Save the Date |
| Fecha | Sábado 28 de noviembre de 2026 |
| Hora | 3:00 pm |
| Lugar | Salón Callejón Arroyo. Valle del Arroyo 217, Santa Gertrudis, 37547 León de los Aldama, Gto. |
| Mapa | https://share.google/uOkEFeiKjo0m9a98l |
| Hora de cierre | Por definir |
| Dress code | Formal de boda |
| Estacionamiento | Valet parking incluido |
| Cupo | Mobiliario para 200 invitados, pero **la venta no tiene límite**. No se muestra cupo en el sitio ni hay lista de espera. |
| Precio | $600 MXN, precio único, sin factura, sin descuentos, **no reembolsable, transferible** |
| Idioma | Español |

### Qué incluye el boleto
- Salón de eventos con limpieza antes, durante y después, y amenidades en baños.
- Mesa de novios, mantelería y loza completa (plato, botanero, pastelero, cubiertos, vaso, copa y servilleta de tela).
- **Valet parking.**
- **DJ** por 5 horas.
- **Barra fría** por 6 horas: refrescos, agua mineral y hielo.
- 7 meseros y carpa exterior.
- **Brindis** para todos.
- **Cena estilo taquiza**. (La mesa de postres se quitó el 27 oct 2026; la sustituye algo por definir.)
- **Entrega de reconocimientos** a miembros destacados.
- Más sorpresas y dinámicas (detalles por definir).

> Para el sitio se redacta como experiencia ("cena taquiza, brindis, DJ, barra fría, valet"), no como lista de proveedor.

---

## 2. Secciones del landing

1. **Save the Date (portada)**: nombre, fecha, lugar, cuenta regresiva, botón "Confirmar asistencia" (comprar).
2. **Los novios**: por ahora, los capítulos como novios (versión básica). Pioneros, el primer capítulo de BNI en México, y Metamorfosis, el capítulo más reciente de León. Logo y link al directorio de cada uno:
   - Pioneros: https://bnimexico.com/es-MX/chapterdetail?chapterId=92GOJr%2FdTHOKWhsvUG58dw%3D%3D&name=BNI+Pioneros+Le%C3%B3n
   - Metamorfosis: https://metamorfosis.draftstudio.mx/
3. **Nuestra historia**: línea de tiempo (ver sección 3).
4. **La recepción**: fecha, hora, dirección, mapa, valet y botón "Agregar al calendario".
5. **Qué incluye**: cena taquiza, brindis, DJ, barra fría, valet, reconocimientos.
6. **Programa**: por definir. Mientras tanto, la sección no se muestra o dice "Programa próximamente".
7. **Código de vestimenta**: formal de boda.
8. **Mesa de regalos**: en lugar de regalos, cada capítulo comparte su **referencia ideal** y los **aliados que busca**. El mejor regalo es conectar a un novio con alguien de tu red. Contenido por definir (ver radar).
9. **R.S.V.P. / Boletos**: compra.
10. **Preguntas frecuentes**: qué incluye, valet, transferencia de boleto (no reembolsable), pago en OXXO (hasta el 26 de nov), compra el mismo día, a quién contactar.
11. **Pie de página**: contacto de los organizadores y aviso de privacidad.

Sin fotos por ahora: el sitio se sostiene con diseño y tipografía.

---

## 3. "Nuestra historia": borrador de línea de tiempo

> Investigado en línea el 25 oct 2026. El copywriting final lo hacen ustedes.

| Año | Hito | Fuente |
|---|---|---|
| 1985 | El Dr. Ivan Misner funda BNI en California (enero de 1985). | bnimexico.com |
| 2006 | BNI llega a México: **Carlos Medina Plascencia**, leonés, encabeza BNI México desde 2006. Nace **Pioneros** en León, el primer capítulo del país. | Tec de Monterrey (perfil Mérito EXATEC 2026), Editorial Océano, podcast "BNI México celebra 20 años". Que Pioneros sea el primero lo dicen ustedes; en línea no hay fecha exacta. |
| Hoy | BNI México: **249 capítulos, 8,029 networkers, +435,642 referencias, +$8,082 M en negocios cerrados**. BNI en el mundo: 77 países, +10,900 grupos. | bnimexico.com (cifras a oct 2026) |
| 2025 | Nace **Metamorfosis**, el capítulo más reciente de León (18 miembros en su directorio). | metamorfosis.draftstudio.mx. El año se deduce de lo que ustedes dijeron; en línea no aparece. |
| 28 nov 2026 | *La boda:* Networking Night. | — |

⚠️ Mostrar "2025" en la línea de tiempo deja ver la antigüedad de
Metamorfosis. Alternativa: poner "Hoy" o "El capítulo más reciente" en lugar
del año (ver radar).

---

## 4. Compra de boletos

### Flujo
1. El comprador elige la **cantidad de boletos (1 a 10)**.
2. Captura sus datos y **el nombre de cada asistente** (ver abajo).
3. Paga con **Stripe Checkout**: tarjeta o **OXXO**.
4. Pago confirmado (webhook) → se genera **un QR único por boleto** → se envía un correo con PDF + link a "mis boletos".
5. **OXXO:**
   - La ficha vence en **24 horas**. Si no se paga, el pedido expira (como la venta no tiene límite, no aparta cupo; solo evita boletos sin pagar).
   - OXXO solo se ofrece **hasta el jueves 26 de noviembre**, dos días antes del evento. Después, solo tarjeta.
6. **La venta sigue abierta hasta el mismo día del evento** con tarjeta.

### Datos del comprador
- Nombre completo\*
- Correo\*
- WhatsApp\*
- ¿Eres miembro de BNI?\* → **Soy miembro · No soy miembro**
  - Si es miembro, aparece **¿De qué capítulo?\*** (texto libre, sin sugerencias).
- Acepto el aviso de privacidad\*

(26 oct 2026: se quitaron empresa, giro, "¿quién te invitó?", "referencia ideal", las opciones Pioneros/Metamorfosis/Otro y el campo de ciudad.)

### Datos de cada asistente (uno por boleto)
- **Nombre completo\*** (obligatorio para todos los boletos)
- ¿Es miembro de BNI?\* → Es miembro (¿de qué capítulo?) · No es miembro
- Correo (opcional; si se pone, el asistente recibe su propio boleto)
- El boleto 1 se llena con los datos del comprador; se puede cambiar si el comprador no asiste.

### Boletos múltiples y transferencia
- Cada boleto tiene su propio QR, un código corto (ej. `NN-4F7K`) y el nombre de su asistente.
- **No reembolsable, transferible:** desde "mis boletos" el comprador cambia el nombre (y correo) del asistente; el nuevo asistente recibe su boleto y el QR anterior queda inválido.
- Las estadísticas de miembros e invitados se calculan con los datos de cada asistente.

---

## 5. Pagos: Stripe vs Mercado Pago

Costo por boleto de **$600** (las comisiones llevan IVA aparte, 16%):

| Pasarela | Comisión | Por boleto (con IVA) | Neto | 200 boletos (comisión total) |
|---|---|---|---|---|
| **Stripe**, tarjeta nacional | 3.6% + $3 | **$28.54** | $571.46 | ~$5,708 |
| Stripe, OXXO / métodos locales\* | 4% + $3 | $31.32 | $568.68 | — |
| Mercado Pago, al instante | 3.49% + $4 | $28.93 | $571.07 | ~$5,786 |
| Mercado Pago, a 7 días | 3.19% + $4 | $26.84 | $573.16 | ~$5,368 |
| Mercado Pago, a 30 días | 2.95% + $4 | $25.17 | $574.83 | ~$5,034 |

\* Stripe no publica una tarifa específica para OXXO; aplica la de "métodos locales".

**Conclusión:** Stripe **no es más barato**. Es prácticamente igual a Mercado
Pago "al instante", y Mercado Pago a 30 días ahorra ~$3 por boleto
(~$670 en 200 boletos).

**Recomendación: Stripe**, porque la diferencia es mínima y a cambio da:
- Checkout alojado y probado, con modo de prueba completo.
- OXXO, Apple Pay y Google Pay en el mismo checkout.
- Webhooks confiables para generar el boleto automáticamente.
- Depósitos a la CLABE de Nu.

A tener en cuenta:
- La cuenta va a nombre de **Ernesto Vázquez Lara** (persona física). **La abre el equipo** con su INE, RFC y CLABE Nu (esos datos no se comparten en el chat). La verificación **puede tardar**: conviene abrirla cuanto antes. Para construir solo se necesitan las llaves de **modo prueba**.
- El primer depósito tarda ~7 días; después, 2–3 días.
- **Comisión:** se absorbe. El boleto cuesta $600 limpio y quedan ~$571 netos.

---

## 6. Boleto (PDF + página en línea)

- Mismo marco de boleto del sitio: nombre del evento, fecha, hora, lugar, **QR**, código corto, número de boleto (ej. "2 de 3") y **nombre del asistente**.
- **Página "mi boleto"** (`/boleto/[token]`): muestra el QR, se puede guardar en la pantalla de inicio del celular, tiene botón para agregar al calendario (.ics) y permite transferir el boleto.
- **Wallet: no.** Ni Apple ni Google Wallet; la página "mi boleto" y el PDF cubren esa función.
- El QR contiene un token firmado (no adivinable). No se puede falsificar cambiando un número.

---

## 7. Correo

- Envío con **Resend** desde `Networking Night <boletos@networking.draftstudio.mx>`.
- **Sin reply-to.** En el pie del correo van los **contactos directos de los organizadores** (nombre + WhatsApp/correo).
- Correos del sistema:
  1. Pago pendiente OXXO (ficha).
  2. Boleto(s) confirmado(s), con PDF.
  3. Boleto transferido (al nuevo asistente).
  4. Recordatorio previo al evento.
- **Límite gratuito: 100 correos al día** (incluye los de compra). El recordatorio se divide en lotes, por ejemplo del **24 al 26 de noviembre**, dejando margen para compras de último momento.

**Aviso de privacidad:** responsable **Ernesto Vázquez Lara**, León, Gto.;
contacto `boletos@networking.draftstudio.mx`.

**Correos entrantes a `boletos@`:** Resend solo **envía**, así que se configura
un reenvío (por ejemplo ImprovMX, gratis) hacia **hey@draftstudio.mx** y otros
2 correos por definir. Hay que validar que los registros MX convivan con el
subdominio apuntando a Vercel.

---

## 8. Día del evento: escáner (`/staff`)

- Login para 1–2 personas de staff; usa la cámara del celular.
- Al escanear se muestra:
  - ✅ **Válido**: comprador, asistente (si hay), boleto 2 de 3, miembro de qué capítulo o invitado → se marca como ingresado.
  - ⚠️ **YA INGRESÓ a las 3:12 pm**, con los datos del boleto, quién lo escaneó y a qué hora.
  - ❌ **No válido / pago pendiente / no existe.**
- Búsqueda manual por nombre o código, por si un QR no se puede leer.
- **Cada escaneo queda registrado**, incluidos los rechazados.

---

## 9. Panel de administración (`/admin`)

Acceso con link mágico, solo para la lista autorizada (5–6 organizadores; uno de ellos es `hey@draftstudio.mx`, el resto por definir).

- **Resumen:** boletos vendidos (contra la referencia de 200 lugares de mobiliario, solo en el panel), ingresos brutos y netos estimados, pagos OXXO pendientes.
- **Desglose:** miembros de BNI agrupados por capítulo (Pioneros, Metamorfosis y los demás que escriban) contra invitados.
- **Asistentes:** tabla con búsqueda y filtros (capítulo, estado de pago, ingresó o no), exportable a Excel/CSV.
- **Alertas de duplicados:** cada intento de reingreso muestra **de quién es el boleto** (comprador y asistente), cuándo entró la primera vez, cuándo se intentó de nuevo y quién lo escaneó.
- **Detalle de boleto:** historial completo (compra, transferencias, escaneos) y opción de reenviar el correo.
- **Alta manual de boletos** (último recurso): cortesías o casos especiales.
- **Configuración:** fecha límite de OXXO y un interruptor para cerrar la venta manualmente si hiciera falta.

---

## 10. Identidad visual

**Dirección confirmada (25 oct 2026): «Retícula vienesa» con marco de boleto.**
Boceto de referencia: `.impeccable/mocks/decision/r2-hoffmann.html`.

- **Mundo:** boda de etiqueta al estilo de la Viena de 1900 (Josef Hoffmann / Wiener Werkstätte): fondo blanco galería, líneas negras, simetría estricta. Nada de flores, rosa ni corazones.
- **Paleta:** fondo `#F6F5F1`, página `#E9E7E1`, tinta `#141414`, gris `#5E5F62`, **rojo BNI `#C8102E`** solo en lo activo (botón de compra, "&", un anillo, el logo).
- **Tipografía (propuesta):** Forum para títulos (mayúsculas romanas espaciadas) y Josefin Sans para etiquetas y texto. Falta probarlas con los textos reales.
- **Marco:** cada superficie es un **boleto**: doble línea, esquinas recortadas en curva y medallón de anillos arriba. Una **línea de corte con muescas** separa la información del talón; el talón tiene la compra ("Admite · una · persona").
- **Motivos:** monograma «P & M» en círculo doble (encabezado) y anillos entrelazados, uno negro y otro rojo (separadores y botón). Sin íconos de cuadros.
- **Portada:** Save the Date → NETWORKING NIGHT → Pioneros & Metamorfosis → frase → anillos → fecha / hora / etiqueta → salón → cuenta regresiva → talón con "Aparta tu lugar · $600" y "Ver detalles".
- **Extensión:** las secciones del landing son compartimentos con el mismo lenguaje; el PDF y la página "mi boleto" usan el mismo marco de boleto; el panel de admin y el escáner llevan la marca más sobria.
- **Logos:** recrear en SVG el logo BNI con "PIONEROS" y "METAMORFOSIS" (los JPG de `Assets/` sirven de referencia; el de Pioneros trae ® y el de Metamorfosis no).
- Se construye directo en código (en esta sesión no hay generación de imágenes).

---

## 11. Arquitectura técnica

| Pieza | Herramienta |
|---|---|
| Framework | Next.js (App Router) en Vercel |
| Base de datos y auth | Supabase (Postgres + link mágico para admin y staff) |
| Pagos | Stripe Checkout + webhooks (tarjeta y OXXO) |
| Correo | Resend + React Email |
| PDF | @react-pdf/renderer |
| QR | `qrcode` (generar) y lector con la cámara en `/staff` |
| Dominio | `networking.draftstudio.mx` (DNS en Vercel) |
| Repo | github.com/DraftStudiomx/networking_night |

**Modelo de datos (resumen)**
- `orders`: comprador, cantidad (1–10), total, método (tarjeta / OXXO), estado (pendiente / pagado / expirado), vence (24 h para OXXO), id de Stripe.
- `tickets`: orden, código, token del QR, asistente (nombre obligatorio, membresía: pioneros / metamorfosis / otro / invitado, capítulo y ciudad si es otro, correo opcional), estado, fecha de ingreso.
- `scans`: boleto, resultado (válido / duplicado / inválido), quién escaneó, hora.
- `transfers`: historial de cambios de asistente.
- `admins`: correos autorizados y rol (admin / staff).
- `settings`: cupo, cierre de venta.

**Rutas**
- `/`: landing
- `/comprar` → Stripe → `/gracias`
- `/boleto/[token]`: mis boletos, QR, transferencia
- `/aviso-de-privacidad`
- `/staff`: escáner
- `/admin`: panel

---

## 12. Fases

| # | Fase | Contenido |
|---|---|---|
| 0 | Identidad visual | ✅ Confirmada. Pendiente: logos en SVG |
| 1 | Sitio visual | Landing completo con cuenta regresiva, historia, qué incluye y FAQ |
| 2 | Compra | Formulario con asistentes, Stripe (tarjeta + OXXO 24 h), webhooks |
| 3 | Boleto | QR, PDF, página "mi boleto", correo con Resend, transferencia |
| 4 | Panel admin | Resumen, desglose, asistentes, duplicados, export, alta manual |
| 5 | Escáner | `/staff` con cámara y registro de escaneos (antes del 28 nov) |
| 6 | Recordatorios | Correo de recordatorio en lotes del 24 al 26 de noviembre |

---

## 13. Radar de pendientes (pedir al equipo)

**Bloquean la puesta en línea**
- [ ] **Stripe:** el equipo abre la cuenta de Ernesto y comparte las llaves de **modo prueba** (y después las de producción).
- [ ] **Contactos de los organizadores** para el pie del correo y el sitio (nombre + WhatsApp/correo).
- [ ] **Correos de admin** (5–6; ya está `hey@draftstudio.mx`) y **staff de escáner** (1–2).
- [ ] **2 correos** a los que se reenvía `boletos@networking.draftstudio.mx`, además de `hey@`.

**Contenido del sitio (se puede lanzar con texto provisional)**
- [ ] **Hora de cierre** del evento.
- [ ] **Programa / agenda.**
- [ ] **"Los novios" y padrinos:** ¿personas o solo los capítulos? Por ahora, los capítulos.
- [ ] **Mesa de regalos:** referencia ideal y aliados que busca cada capítulo.
- [ ] **Sorpresas y dinámicas** del evento: detalles para el sitio.
- [ ] **Año de Metamorfosis en la línea de tiempo:** ¿mostrar "2025" o "Hoy"?
- [ ] **Fotos**, si más adelante hay.
- [ ] **Logos oficiales en SVG**, si existen (si no, se recrean).
