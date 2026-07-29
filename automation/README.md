# Automatización de ÚGJÜ RADIO

Este Worker consulta el estado público de Caster cada minuto.

- Exige dos comprobaciones positivas consecutivas antes de anunciar una transmisión.
- Envía una sola notificación cuando la radio pasa de dormida a habitada.
- No vuelve a avisar mientras la misma transmisión siga activa.
- Se rearma después de confirmar que la radio volvió a dormir.
- El mensaje se entrega en el idioma del suscriptor cuando OneSignal lo conoce.

## Datos que nunca deben guardarse en GitHub

La clave REST de OneSignal debe crearse en OneSignal y guardarse únicamente como secreto de Cloudflare con el nombre:

`ONESIGNAL_API_KEY`

## Configuración pendiente en Cloudflare

1. Crear un Worker.
2. Pegar el contenido de `worker.js`.
3. Crear un espacio KV y enlazarlo al Worker con el nombre `RADIO_STATE`.
4. Añadir `ONESIGNAL_API_KEY` como secreto cifrado.
5. Crear un Cron Trigger con la expresión `* * * * *`.
6. Ejecutar `/check` dos veces con la radio apagada y comprobar el resultado.
7. Encender la radio y verificar que, tras dos comprobaciones, llegue una sola notificación.

La automatización no estará activa hasta completar esos pasos.
