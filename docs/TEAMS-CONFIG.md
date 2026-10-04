# Conexión de Microsoft Teams

## Registro de la aplicación

1. Entra a Microsoft Entra admin center → App registrations → New registration.
2. Crea una aplicación tipo Web.
3. Agrega como redirect URI local:
   `http://localhost:3000/api/microsoft/callback`
4. En API permissions → Microsoft Graph → Delegated agrega:
   - `User.Read`
   - `Calendars.ReadWrite`
   - `Chat.Read`
   - `ChatMessage.Send`
   - `openid`, `profile`, `offline_access`
5. Crea un client secret y guárdalo solamente en `.env.local`.

## Variables locales

```env
MICROSOFT_TENANT_ID=common
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/microsoft/callback
```

## Alertas de clientes descuidados

El dashboard considera descuidado un prospecto cuando:

- tiene un seguimiento vencido;
- no tiene una próxima acción;
- o lleva más de 14 días sin interacción registrada.

No se avisa a prospectos en “clientes no interesados”. Desde la vista Alertas se elige un chat existente y se manda el resumen. La automatización diaria requiere guardar el vínculo de Microsoft de forma segura después de terminar el login de los dos usuarios; no se guardan tokens en el repositorio ni se mandan mensajes sin chat seleccionado.
