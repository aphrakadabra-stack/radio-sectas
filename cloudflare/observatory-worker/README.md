# ÚGJÜ RADIO — Observatorio privado

Cuenta actividad agregada sin cookies, identidad, IP guardada, país, agente de
usuario ni huella del dispositivo. Sólo acepta una lista cerrada de eventos,
detalles breves y duraciones redondeadas a 15 segundos.

## Activación

1. Sustituir `ACCOUNT_ID` en `wrangler.jsonc`.
2. Crear dos secretos de Cloudflare: `OBSERVATORY_DASHBOARD_TOKEN` para abrir
   el panel y `ANALYTICS_API_TOKEN` con permiso de lectura de Account Analytics.
3. Desplegar el Worker.
4. Escribir su endpoint `/event` en la meta `ugju-observatory` de `index.html`
   y `quedarse.html`. Mientras la meta está vacía no se envía ningún dato.

Los datos de Analytics Engine caducan según la retención configurada por
Cloudflare. No se debe añadir un identificador de usuario o sesión a los blobs.

El endpoint público de FreeSHOUTcast usado por ÚGJÜ sólo informa `isOnline`,
`isPremium` y `name` cuando está dormido; por ahora no ofrece un conteo público
verificable de oyentes. Ese número debe quedar como “no disponible” hasta que el
panel privado del proveedor exponga una API documentada.
