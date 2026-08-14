# Automatización de ÚGJÜ RADIO

Este Worker consulta cada minuto el estado explícito `online` publicado por el
Worker de metadatos de ÚGJÜ, cuya fuente es Free-ShoutCast.

- Exige dos comprobaciones positivas consecutivas antes de anunciar una transmisión.
- Envía una sola notificación cuando la radio pasa de dormida a habitada.
- No vuelve a avisar mientras la misma transmisión siga activa.
- Se rearma después de confirmar que la radio volvió a dormir.
- El mensaje se entrega en el idioma del suscriptor cuando OneSignal lo conoce.

## Datos que nunca deben guardarse en GitHub

La clave REST de OneSignal debe crearse en OneSignal y guardarse únicamente como secreto de Cloudflare con el nombre:

`ONESIGNAL_API_KEY`

## Configuración de producción

El Worker de producción se llama `ugju-radio-automation` y está configurado con:

1. El espacio KV `ugju-radio-state`, enlazado como `RADIO_STATE`.
2. El secreto cifrado `ONESIGNAL_API_KEY` (nunca se guarda aquí).
3. Un Cron Trigger cada minuto: `*/1 * * * *`.

Antes de un cambio futuro, validar que el Worker conserve el secreto y el enlace KV. Después del despliegue, encender la radio y comprobar que, tras dos comprobaciones, llegue una sola notificación.

La detección no usa la respuesta del stream: ese endpoint puede entregar audio
aunque no haya una transmisión activa y dejar el estado atascado en `live`.
