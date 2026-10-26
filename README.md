# Networking Night · Pioneros & Metamorfosis

Sitio de boletos para el evento BNI del 28 de noviembre de 2026.
Planeación completa en [PLANEACION.md](PLANEACION.md); producto en [PRODUCT.md](PRODUCT.md).

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y llena los valores
npm run dev
```

Sin llaves de Supabase/Stripe el landing funciona y la compra responde "La venta en línea abre muy pronto".
`/api/dev/pdf` descarga un PDF de boleto de ejemplo (solo en desarrollo; necesita `TICKET_SIGNING_SECRET`).

## Puesta en marcha

1. **Supabase:** crea el proyecto y ejecuta `supabase/migrations/001_init.sql` en el SQL Editor. Copia URL, anon key y service role key.
2. **Stripe** (cuenta de Ernesto, modo prueba primero):
   - Activa **OXXO** en Settings → Payment methods.
   - Crea un webhook a `https://networking.draftstudio.mx/api/stripe/webhook` con los eventos
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed` y `checkout.session.expired`. Copia el signing secret.
3. **Resend:** verifica el dominio `networking.draftstudio.mx` (registros DNS en Vercel) y crea una API key.
4. **Vercel:** importa el repo, agrega las variables de `.env.example` y conecta `networking.draftstudio.mx`.
5. **Acceso de organizadores (Supabase Auth):**
   - Authentication → URL Configuration: Site URL `https://networking.draftstudio.mx` y agrega `https://networking.draftstudio.mx/auth/callback` (y `http://localhost:3000/auth/callback` para pruebas) a Redirect URLs.
   - Authentication → SMTP: usa Resend como SMTP (el correo de Supabase por defecto solo manda unos pocos por hora).
   - Da de alta a cada organizador en la tabla `staff` (`role` = `admin` o `staff`):
     ```sql
     insert into staff (email, role) values ('correo@ejemplo.com', 'admin');
     ```

6. **Supabase sin pausas:** el plan gratis pausa un proyecto tras 7 días sin consultas. `vercel.json` programa
   `/api/cron/keepalive` una vez al día (9:00 am de León) para evitarlo. Solo agrega `CRON_SECRET` en las variables de Vercel.

7. **Recordatorios:** `/api/cron/reminders` corre del 24 al 27 de noviembre a las 10:00 am de León y manda
   hasta 60 correos por día (Resend gratis permite 100 al día, contando los de compra; ajustable con `REMINDER_BATCH`).
   Cada dirección recibe uno solo: el invitado con correo propio recibe su boleto y el comprador el resto de su compra.
   Los ya enviados quedan en `settings.reminders_sent`. Para ensayar en local:
   `curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/reminders?now=2026-11-24T10:00:00-06:00"`.
   Vista previa del correo: `/api/dev/email?to=tu@correo&kind=recordatorio`.

## Después del evento

1. Descarga los asistentes desde el panel (**Exportar a Excel**) y, si quieres un respaldo completo, en Supabase:
   Database → Backups, o Table Editor → exportar cada tabla a CSV.
2. Quita el cron (borra `vercel.json` o el proyecto en Vercel) para que no reactive la base.
3. En Supabase: Project Settings → General → **Pause project** (conserva datos y libera el lugar) o
   **Delete project** (borra todo de forma permanente).

En desarrollo, `/admin?demo=1` y `/staff?demo=1` muestran las pantallas con datos de ejemplo sin iniciar sesión.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Landing |
| `/comprar` | Formulario de compra → Stripe Checkout |
| `/gracias` | Confirmación después del pago |
| `/pedido/[token]` | "Mis boletos" del comprador: ver, descargar PDF, transferir |
| `/boleto/[token]` | Boleto individual con QR (lo que abre el QR) |
| `/aviso-de-privacidad` | Aviso de privacidad |
| `/api/stripe/webhook` | Confirma pagos, emite boletos y envía correos |
| `/acceso` | Entrada de organizadores con enlace al correo |
| `/admin` | Panel: resumen, capítulos, repetidos, asistentes, exportar, alta manual, abrir/cerrar venta |
| `/staff` | Escáner de la entrada (cámara + búsqueda manual) |
