# ÚGJÜ RADIO — estabilización de emisión

## Estado comprobado (14 de agosto de 2026)

- Audio Hijack 4 conserva una sesión llamada `ÚGJÜ RADIO` con seis fuentes,
  mezcladores, ecualización, medidor, grabación y salidas. No contiene Broadcast.
- La copia previa de `Sessions.plist` está en el backup
  `2026-08-14-before-station-stabilization`.
- BUTT es 1.47.0. La reconexión forzada está activa con demora de 1 segundo y
  no hay archivo de log configurado.
- FreeSHOUTcast informa el estado explícito mediante la estación 91014. Su API
  pública, al probarla dormida, no expuso cantidad de oyentes.

## Decisión

No editar `Sessions.plist` a mano ni probar dos encoders simultáneos sobre el
mismo mountpoint. Audio Hijack debe evaluarse como emisor principal en una
duplicación visible de la sesión. BUTT queda intacto y listo como respaldo hasta
que Broadcast complete una prueba larga.

## Configuración segura de la prueba

1. En Audio Hijack, duplicar `ÚGJÜ RADIO` y nombrarla
   `ÚGJÜ RADIO — BROADCAST TEST`.
2. Añadir Broadcast después del último bloque común de mezcla/medición, en una
   rama paralela a Recorder y monitor. No retirarlos.
3. Copiar desde el panel de FreeSHOUTcast el host, puerto, contraseña y mountpoint
   directamente al bloque. No escribirlos en archivos del repositorio.
4. Igualar el formato que hoy funciona en BUTT: codec, bitrate, sample rate y
   canales. Guardar un preset privado del bloque dentro de Audio Hijack.
5. Detener BUTT antes de encender Broadcast. Confirmar señal en el medidor,
   luego conexión en el Status del bloque y finalmente `online: true` en
   `https://ugju-radio-metadata.ugjusectas.workers.dev/metadata`.

## Prueba de estabilidad

Registrar comienzo, fin y cada cambio de estado en `PRUEBA-EMISION.csv`.

1. Prueba corta de 15 minutos y escucha desde otra red.
2. Cortar Wi-Fi durante 20 segundos y verificar reconexión, continuidad web y
   nuevo tiempo de conexión.
3. Prueba de 2 horas.
4. Prueba de 10 horas con comprobaciones cada hora del bloque, metadata, audio
   remoto y contador del servidor.
5. Repetir una sesión comparable con BUTT y log habilitado.

Broadcast pasa a principal sólo si la prueba de 10 horas no presenta una caída
no recuperada y el audio remoto coincide con el estado publicado. BUTT se
conserva como respaldo manual durante al menos tres emisiones reales.

## Por qué se reinicia el tiempo de BUTT

El manual de BUTT define `online duration` como dato de la conexión en curso y
explica que, al perder conexión, intenta reconectar. Con reconexión forzada y
demora de un segundo, ver 1 hora después de haber iniciado 10 horas antes es
evidencia de que la conexión actual comenzó más tarde. Sin log no se puede saber
la hora ni la causa de la interrupción. Habilitar el log antes de la próxima
sesión larga convierte esa sospecha en un diagnóstico verificable.
