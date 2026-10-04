# VPA CRM · desglose de funcionalidades

Fuente: reunión del 3 de octubre y los cuatro libros de trabajo locales.

## Gestión de prospectos

- Base universal para consolidar los Excel sin perder archivo, hoja ni fila de origen.
- Razón social, nombre comercial, contacto y puesto.
- Teléfono, extensión, correo, sitio web y dirección.
- Ciudad, estado, giro/categoría y posibilidad de agregar nuevos sectores.
- Notas descriptivas y notas de conversación.
- Historial de llamadas, visitas, reuniones, correos y notas.
- Fecha de alta, última interacción y siguiente seguimiento.

## Embudo

Las cinco etapas acordadas son:

1. Clientes recibidos.
2. Clientes contactados.
3. Clientes interesados.
4. Clientes en espera.
5. Clientes no interesados.

Cada tarjeta debe mostrar prioridad, empresa, razón social, contacto, teléfono, categoría, seguimiento y alertas. La prioridad alta aparece primero, después media y finalmente baja.

## Espera y seguimiento

- Motivo de espera obligatorio al mover un prospecto a “en espera”.
- Motivos configurables, incluyendo “esperar a que seamos banco”.
- Descripción manual visible en tablero y detalle.
- Indicador visual para seguimiento activo, vencido o próximo.
- Recordatorios mensuales sin crear reuniones ficticias en el calendario.
- Alertas de clientes descuidados: seguimiento vencido, sin próxima acción o sin interacción reciente.
- Envío de un resumen de alertas a un chat existente de Teams.
- La automatización diaria requiere guardar la conexión Microsoft de forma segura y ejecutar un job programado.

## Búsqueda y filtros

- Búsqueda global por razón social, nombre comercial, contacto, teléfono, extensión, correo, sitio web, ciudad, estado, notas y fuente.
- Filtros por etapa, prioridad, industria, fuente, ubicación, fecha de seguimiento y motivo de espera.
- Orden por prioridad, siguiente seguimiento, última interacción, empresa y fecha de alta.
- Vista guardada para cada usuario como mejora posterior.

## Microsoft Teams / Microsoft Graph

- Conectar la cuenta Microsoft 365 del usuario mediante consentimiento delegado.
- Leer el calendario del usuario dentro del dashboard.
- Crear una cita con Teams desde el prospecto y guardar el ID, enlace y fecha en el CRM.
- Convención del asunto: número al inicio, empresa y contacto cuando exista.
- Mostrar chats de Teams y mensajes recientes en una vista vinculable al prospecto.
- Registrar una nota de CRM después de una conversación o reunión.
- Mandar notificaciones de seguimiento a un chat existente de Teams.
- El primer alcance será lectura de conversaciones; enviar mensajes desde el CRM requiere consentimiento adicional y una decisión de auditoría.

## Usuarios y seguridad

- Dos usuarios con la misma importancia.
- Login con usuario y contraseña mediante Supabase Auth.
- Cada usuario conecta su propia cuenta Microsoft 365.
- RLS para separar autenticación y datos; no se publican Excel, tokens ni secretos.

## Estado de implementación

- En construcción: interfaz visual, filtros, agenda y conector Graph.
- Pendiente externo: registrar la aplicación en Microsoft Entra ID, consentir permisos y configurar sus variables en `.env.local`.
- Pendiente de carga: staging, deduplicación y revisión de registros antes de insertar los prospectos reales.
