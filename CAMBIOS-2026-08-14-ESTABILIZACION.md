# Cambios y pruebas — estabilización de ÚGJÜ RADIO

## Backup

- Commit `1ef43a9`: instantánea del código en `1d04d1a` y copia verificable de
  `Audio Hijack 4/Sessions.plist` antes de cualquier cambio.
- No se modificó la sesión activa ni se copiaron credenciales al repositorio.

## Emisión

- Se comprobó la topología de `ÚGJÜ RADIO` en Audio Hijack.
- Se comprobó BUTT 1.47.0, reconexión forzada a 1 segundo y ausencia de log.
- Se documentó la prueba Broadcast/BUTT y una planilla de controles horarios.
- La sesión real queda intacta hasta completar la prueba controlada con las
  credenciales privadas de FreeSHOUTcast.

## Estado web/PWA

- El estado ya no se deduce del stream, que puede responder audio estando
  dormido. Usa exclusivamente `metadata.online`.
- Consulta cada 30 segundos con límite de espera de 10 segundos.
- Revalida al recuperar red, foco, visibilidad y al reanudar una página/PWA.
- Un fallo de red momentáneo no convierte una emisión confirmada en dormida.

## Observatorio

- Worker y cliente preparados, apagados hasta despliegue.
- Lista cerrada de eventos; sin cookies, identidad, IP almacenada, país,
  user-agent ni fingerprint.
- Duraciones redondeadas a 15 segundos y limitadas a una hora por evento.
- Origen restringido a la web oficial y resumen protegido por clave.
- FreeSHOUTcast no expuso oyentes en su respuesta pública probada estando
  dormido; no se inventa ese dato.

## FUEGOS

- Indicadores convertidos en botones accesibles para no depender del swipe.
- Swipe conserva umbral deliberado, predominio horizontal, exclusión de
  instrumentos y márgenes reservados al sistema.
- Se preservó la resolución y reaparición de Los Nueve Puntos.
- Revisión conceptual documentada fuego por fuego.

## Pruebas realizadas

- Validación sintáctica de todos los JavaScript modificados y Workers.
- `git diff --check`, sin errores de whitespace.
- Pruebas de contrato del Observatorio: evento válido `204`, origen ajeno `403`,
  evento no permitido `400`, resumen sin clave `401`.
- Prueba local en navegador: radio dormida, apertura de FUEGOS, siete botones
  accesibles y navegación directa a La Piedra.
- Consulta real de metadata: `online: false` y respuesta sin caché persistente.

## Pendiente operativo

- Duplicar la sesión desde la interfaz de Audio Hijack, ingresar credenciales
  privadas en Broadcast y ejecutar las pruebas de 15 min, 2 h y 10 h.
- Activar log en BUTT para una prueba comparable.
- Iniciar sesión en Cloudflare, crear los dos secretos del Observatorio,
  desplegarlo y entonces completar las metas vacías de la web.
- Probar el cambio real dormida → al aire desde la PWA móvil; localmente sólo se
  pudo verificar el estado dormido porque no había una emisión activa.
