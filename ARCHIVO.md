# Cómo publicar una emisión en ARCHIVO

La web encuentra automáticamente las emisiones públicas de Internet Archive.
No hace falta editar el sitio ni GitHub.

## Al subir cada emisión

1. Crear un item de tipo **Audio** en Internet Archive.
2. Subir un solo archivo MP3 por emisión.
3. Completar **Creator** exactamente como `ÚGJÜ RADIO`.
4. Completar **Title** con el título que debe aparecer en la web.
5. Completar **Date** con la fecha real de la emisión.
6. Publicar y esperar a que Internet Archive termine de procesar el item.

ARCHIVO consulta Internet Archive cada vez que se abre, ordena las emisiones
desde la más reciente y obtiene automáticamente el MP3, el título, la fecha y
la duración. La indexación de un item nuevo puede tardar algunos minutos.

Si Internet Archive no responde, la página utiliza el último catálogo guardado
en el navegador. En una primera visita sin conexión utiliza
`archive-fallback.json` como respaldo mínimo.

## Reproducción

- Abrir ARCHIVO no interrumpe la radio en vivo.
- Pulsar ESCUCHAR detiene el vivo y reproduce la emisión elegida.
- El archivo sigue sonando al volver a la casa, cambiar de aplicación o bloquear
  la pantalla, según las capacidades del sistema operativo y el navegador.
- Al volver a la casa se muestra el título del archivo activo y un control para
  pausarlo o reanudarlo.
- DETENER descarta por completo el archivo actual. Si se elige otra emisión, la
  anterior se detiene y es reemplazada; nunca quedan dos archivos activos.
- Al terminar una emisión, el reproductor de ARCHIVO se cierra y descarta el
  audio finalizado.
- Mientras suena un archivo, el estado del vivo se sigue comprobando. Si no hay
  transmisión, no se muestra ningún aviso del vivo; si comienza una, aparece el
  cartel EN EL AIRE sin interrumpir el archivo.
- Si hay una transmisión activa, VOLVER A LA RADIO EN VIVO detiene el archivo,
  restaura los controles e inicia el vivo de FreeSHOUTcast en la misma acción.
