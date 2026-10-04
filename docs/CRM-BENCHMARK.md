# Benchmark de CRM para VPA

Fecha del estudio: 3 de octubre de 2026.

## Conclusión ejecutiva

VPA no necesita convertirse en un CRM genérico. Su ventaja debe ser un “cockpit” de seguimiento para una operación comercial de dos usuarios, con Microsoft 365/Teams como fuente de agenda y una base de prospectos proveniente de Excel.

El patrón más importante del mercado es unir tres cosas en el mismo registro: estado del pipeline, actividad histórica y próxima acción. Pipedrive llama la atención sobre los recordatorios, actividades vencidas y oportunidades que se enfrían; Salesforce concentra tareas, reuniones, llamadas y correos en una línea de tiempo; HubSpot conecta pipeline, conversaciones, secuencias y calendario; HighLevel une oportunidades, conversaciones, calendarios y workflows. ([Pipedrive Activities](https://www.pipedrive.com/en/features/activities-goals), [Salesforce Activity Timeline](https://help.salesforce.com/s/articleView?id=ind.lsc_activity_timeline.htm&language=en_US&type=5), [HubSpot Sales](https://knowledge.hubspot.com/get-started/generate-sales), [HighLevel Opportunities](https://help.gohighlevel.com/support/solutions/48000449589))

La recomendación para VPA es priorizar la memoria operativa: qué se sabe del cliente, qué ocurrió, quién debe hacer qué y cuándo. Las funciones de marketing masivo, IA conversacional y omnicanalidad pueden esperar hasta que los datos y el seguimiento básico sean confiables.

## Comparativo funcional

| Capacidad | HighLevel | HubSpot | Pipedrive | Zoho | Salesforce | Decisión para VPA |
|---|---|---|---|---|---|---|
| Pipeline visual | Oportunidades por pipeline | Deals por pipeline | Pipeline centrado en actividades | Múltiples pipelines | Pipeline Inspection | Mantener Kanban de 5 etapas y priorización visual |
| Tarjeta configurable | Permite seleccionar campos visibles en cada tarjeta | Campos y asociaciones en el registro | Campos personalizados por etapa | Campos y layouts configurables | Objetos y layouts | Añadir “Configurar tarjeta” con máximo 7 campos relevantes |
| Línea de tiempo | Conversaciones y actividades | Registro CRM y conversaciones | Actividades ligadas a persona/organización/deal | Actividades y recordatorios | Activity Timeline | Convertir historial de llamadas, visitas, Teams y notas en el centro de la ficha |
| Agenda | Calendarios y workflows de citas | Sincronización de Google/Outlook y reuniones | Calendario de actividades y sync Outlook | Calendario, reuniones y recordatorios | Outlook/Google y Calendar | Microsoft Graph como fuente; cada evento debe volver al prospecto |
| Conversaciones | Inbox multicanal con filtros | Conversations Inbox y secuencias | Email sync, Sales Inbox e integraciones | Omnicanal | Email, actividad y colaboración | Teams primero; chat, contexto del prospecto y nota CRM juntos |
| Automatización | Workflows, triggers y re-entry | Sequences y workflows | Follow-up, automations y deal rotting | Reglas de workflow y alertas | Flows y señales priorizadas | Motor pequeño de reglas: vencido, sin acción, sin interacción y prioridad alta |
| Reportes | Funnel, conversaciones y campañas | Funnel, actividades y forecast | Actividades, metas y conversiones | Dashboards y scoring | Forecast, pipeline y objetivos | Panel diario: pendientes, clientes fríos, reuniones y conversiones |
| Complejidad | Alta, muy configurable | Media/alta | Baja/media | Media/alta | Alta | Mantener dos clics para la acción principal y ocultar administración avanzada |

## Patrones que debemos adoptar

### 1. La ficha debe ser un centro de acción

No basta con mostrar datos de contacto. La ficha ideal debe mostrar:

- encabezado con empresa, etapa, prioridad y próxima acción;
- botón para llamar o abrir correo;
- botón para crear evento de Teams;
- línea de tiempo cronológica;
- conversación relacionada;
- motivo de espera y fecha de reactivación;
- edición rápida sin perder el contexto del Kanban.

### 2. Cada prospecto abierto necesita una próxima acción

La regla de VPA debe ser más estricta que un CRM genérico: si el prospecto está recibido, contactado, interesado o en espera, debe existir una siguiente acción o un motivo de espera. Un prospecto sin ambas cosas entra en “descuidados”.

### 3. “Clientes descuidados” debe ser una señal, no otra lista

La alerta debe explicar por qué aparece y ofrecer una acción inmediata:

- seguimiento vencido → reagendar;
- sin próxima acción → crear llamada/reunión;
- sin interacción reciente → abrir ficha y registrar contacto;
- alta prioridad sin actividad → destacar en el resumen diario.

### 4. Tarjetas configurables

HighLevel permite elegir qué campos aparecen en cada Opportunity Card y limita la tarjeta a un conjunto pequeño de campos visibles. VPA debe permitir elegir entre razón social, nombre comercial, teléfono, contacto, prioridad, etapa, industria, próxima acción, origen y motivo de espera. La tarjeta no debe convertirse en una tabla saturada. ([HighLevel Customize Opportunity Cards](https://help.gohighlevel.com/support/solutions/articles/155000003910-customize-opportunity-cards-in-board-view))

### 5. Inbox con contexto

HighLevel separa lista, conversación y contexto del contacto, con filtros y contador de no leídos. Para VPA la versión correcta es más pequeña: chats de Teams a la izquierda, conversación al centro y prospecto relacionado a la derecha. ([HighLevel Conversations](https://help.gohighlevel.com/support/solutions/articles/48001214153-workflow-action-edit-conversation))

## Plan de producto recomendado

### Ahora

1. Aplicar el modelo Supabase y persistir el alta de prospectos.
2. Importar Excel mediante staging, deduplicación y trazabilidad.
3. Crear la línea de tiempo de actividades.
4. Hacer obligatoria la próxima acción o motivo de espera.
5. Terminar OAuth de Microsoft Graph y cargar el calendario real.
6. Relacionar evento/chat de Teams con un prospecto.

### Siguiente iteración

1. Configurador de tarjetas del Kanban.
2. Vista “Mi día” con llamadas, reuniones y clientes descuidados.
3. Reglas configurables de alertas y horario de notificación.
4. Resumen diario en Teams, con idempotencia para no duplicar mensajes.
5. Historial de cambios: quién movió etapa, cambió prioridad o editó notas.

### Después

1. Reportes de conversión por industria, fuente y etapa.
2. Importación recurrente de nuevos directorios.
3. Scoring explicable basado en prioridad, interacción y actividad.
4. Plantillas de seguimiento y secuencias.
5. Integraciones adicionales solo si aparecen en el flujo real.

## Decisiones de diseño

- Acción principal visible: “Nueva actividad”, no “editar registro”.
- Una sola ficha para empresa, contacto, actividad y conversación.
- El Kanban muestra señales; la ficha explica el contexto.
- El color se usa para prioridad y riesgo, no para decorar.
- Los estados de Teams deben ser explícitos: no conectado, conectado, token vencido, permiso insuficiente o sincronizando.
- No se deben enviar notificaciones automáticas hasta elegir destino, regla, horario y mecanismo de deduplicación.

## Fuente y límites del estudio

El benchmark usa documentación pública de los proveedores. No se realizó una prueba con cuentas de pago ni se debe interpretar la tabla como una comparación de precios. Las diferencias de plan, permisos y disponibilidad pueden cambiar; antes de contratar un producto se debe validar el plan exacto.
