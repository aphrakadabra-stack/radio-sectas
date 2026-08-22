# Seguridad de ÚGJÜ RADIO

La web pública es estática y no debe contener contraseñas, tokens privados,
claves de API ni datos personales. Los identificadores públicos del cliente de
OneSignal no son secretos; su clave REST sí lo es y debe existir únicamente en
los secretos cifrados de Cloudflare.

## Antes de publicar

- Revisar `git diff --cached` y confirmar que no haya credenciales ni archivos
  locales.
- Guardar secretos de Workers con el almacén de secretos de Cloudflare; nunca
  en `wrangler.jsonc`, JavaScript, documentación o capturas.
- Mantener el Observatorio limitado a eventos enumerados y datos agregados. No
  añadir IP, correo, nombre, identificadores de dispositivo, URL completa,
  texto escrito por visitantes ni huellas persistentes.
- Conservar la validación de origen, tamaño, evento, detalle, ruta y duración
  del endpoint `/event`.
- Probar la Content Security Policy en las cuatro páginas después de añadir un
  proveedor externo. Ampliar sólo la directiva necesaria y sólo al dominio
  exacto requerido.

## Cuenta y repositorio (configuración manual)

- Activar 2FA resistente a phishing (passkey o llave física) en GitHub y
  conservar los códigos de recuperación fuera del equipo.
- Revisar sesiones, claves SSH, passkeys, aplicaciones OAuth y tokens; revocar
  lo desconocido o que ya no se use.
- En GitHub, usar el mínimo número de colaboradores con permiso de escritura.
- En **Settings → Actions → General**, fijar `Workflow permissions` en
  **Read repository contents permission** y permitir acciones sólo de fuentes
  de confianza. Actualmente el repositorio no contiene workflows.
- Activar alertas de Dependabot, secret scanning y push protection cuando el
  plan de GitHub los ofrezca.
- Proteger la rama publicada: exigir pull request, impedir force-push y exigir
  aprobación antes de desplegar si se incorporan colaboradores.
- Mantener HTTPS obligatorio en GitHub Pages.

## Si aparece una credencial en Git

Revocarla y reemplazarla primero. Borrarla del último archivo no basta porque
puede seguir en el historial. Después, limpiar el historial con una herramienta
adecuada y coordinar la actualización de todos los clones.

Los reportes de seguridad deben enviarse de forma privada al propietario del
repositorio, sin abrir un issue público con detalles explotables.
