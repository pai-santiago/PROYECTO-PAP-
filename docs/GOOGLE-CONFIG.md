# Conexión de Google con VPA CRM

El CRM usa un único flujo OAuth de Google para conectar la cuenta del usuario. En esta primera versión se solicitan únicamente perfil básico y eventos de Google Calendar; las credenciales nunca deben subirse al repositorio.

## Configuración local

1. Entra a [Google Cloud Console](https://console.cloud.google.com/), crea o selecciona un proyecto y habilita **Google Calendar API**.
2. Configura la pantalla de consentimiento OAuth. Para localhost puede mantenerse en modo de prueba y agregar tu cuenta como usuario de prueba.
3. En **APIs y servicios → Credenciales**, crea un **OAuth client ID** de tipo **Aplicación web**.
4. En **Authorized redirect URIs** agrega exactamente:

   `http://localhost:3000/api/google/callback`

5. Copia el client ID y el client secret en `.env.local`:

   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
   ```

6. Reinicia `npm run dev` y pulsa **Conectar Google** en el CRM.

La URI debe coincidir exactamente con la registrada: esquema, host, puerto y ruta. El backend guarda el token en cookies httpOnly para el entorno local y crea eventos en el calendario principal con Google Meet cuando la API lo permite.

## Alcance actual

- Login/consentimiento con Google.
- Lectura de eventos de los próximos 31 días.
- Creación de eventos con invitado y enlace de Google Meet.
- Desconexión local revocando las cookies del CRM.

Gmail, Drive y Google Chat no se habilitan todavía porque requieren permisos adicionales. Se agregarán como módulos independientes y con consentimiento incremental, evitando pedir acceso a información que el CRM aún no utiliza.

