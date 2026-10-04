# Estudio frontend de VPA CRM

Fecha: 3 de octubre de 2026.

## Alcance

Este estudio cubre únicamente frontend: arquitectura de información, jerarquía visual, interacción del Kanban, búsqueda y filtros, ficha de prospecto, agenda, alertas, conversaciones, estados vacíos, responsive y accesibilidad.

No evalúa base de datos, OAuth, permisos de Teams, modelo de Supabase ni rendimiento de consultas.

## Evidencia revisada

- `app/page.tsx`: navegación, vistas, filtros, modales, agenda, conversaciones y alertas.
- `app/globals.css` y `app/overrides.css`: layout, responsive, estados visuales y componentes.
- `app/layout.tsx`: carga de estilos globales.
- `docs/CRM-BENCHMARK.md`: patrones de CRM comparables.
- Verificación local: la página y la hoja CSS responden HTTP 200 y la hoja contiene las clases principales del layout.

## Límite de evidencia

No hubo navegador automatizado disponible para capturar una pantalla nueva durante este estudio. Por eso no afirmo validación visual final, cumplimiento WCAG ni comportamiento real de teclado/touch. Esas comprobaciones deben hacerse después de la siguiente iteración con una captura de escritorio y otra móvil.

## Diagnóstico ejecutivo

La estructura funcional ya existe, pero el frontend todavía presenta demasiados destinos posibles antes de definir “qué debo hacer hoy”. El tablero es útil como inventario, pero el producto debe orientar la acción: llamar, registrar interacción, agendar, reactivar o explicar por qué un prospecto está en espera.

La inspiración correcta no es copiar GoHighLevel completo. Es adoptar su lógica de tarjetas configurables y bandeja contextual, combinarla con la línea de tiempo de Pipedrive/Salesforce y mantener una interfaz mucho más pequeña para dos usuarios. ([HighLevel Opportunity Cards](https://help.gohighlevel.com/support/solutions/articles/155000003910-customize-opportunity-cards-in-board-view), [HighLevel Conversations](https://help.gohighlevel.com/support/solutions/articles/48001214153-workflow-action-edit-conversation), [Pipedrive Activity Calendar](https://www.pipedrive.com/en/features/activity-calendar), [Salesforce Activity Timeline](https://help.salesforce.com/s/articleView?id=ind.lsc_activity_timeline.htm&language=en_US&type=5))

## Lo que está bien encaminado

1. El Kanban usa las cinco etapas reales del negocio.
2. La prioridad tiene orden explícito y no depende únicamente del color.
3. La búsqueda contempla teléfono, correo, contacto, ciudad, fuente y notas.
4. Agenda, conversaciones y alertas ya están separadas como módulos reconocibles.
5. El modal centrado conserva el contexto del tablero mejor que un cambio de página.
6. Los estados de integración de Teams tienen una intención clara: conectado o pendiente.

## Hallazgos priorizados

### P0 — La pantalla inicial no responde “¿qué hago ahora?”

- Problema: el usuario entra directo al inventario del pipeline, aunque su necesidad principal es no olvidar llamadas y seguimientos.
- Riesgo: demasiados prospectos visibles y poca orientación diaria.
- Recomendación: crear `Mi día` como vista inicial con tres bloques: `Hoy`, `Vencidos` y `Sin próxima acción`. El Kanban debe quedar como segunda vista de trabajo.
- Criterio de éxito: en menos de 5 segundos el usuario identifica su siguiente acción.

### P0 — La tarjeta mezcla información de identificación y contacto

- Problema: mostrar empresa, razón social, industria, teléfono y correo en el mismo bloque produce tarjetas de alturas distintas y ruido visual.
- Recomendación: limitar la tarjeta a cinco señales: nombre comercial, razón social corta, prioridad, próxima acción y un contacto principal. El teléfono/correo completo vive en la ficha.
- Mejora: añadir un menú “Campos de tarjeta” para elegir hasta siete campos, siguiendo el patrón de HighLevel.

### P0 — La ficha debe ser una central de acción, no un resumen

- Problema: la ficha muestra información, pero el usuario todavía debe decidir dónde registrar una llamada o ver el historial.
- Recomendación: dividirla en pestañas claras: `Resumen`, `Actividad`, `Teams` y `Campos`. Mantener arriba una barra fija con `Registrar llamada`, `Agendar Teams`, `Añadir nota` y `Mover etapa`.
- Criterio de éxito: cualquier acción frecuente se realiza sin cerrar la ficha.

### P1 — El filtro avanzado está separado del trabajo diario

- Problema: abrir un panel para cada ajuste agrega fricción, especialmente para revisar alta prioridad o seguimiento vencido.
- Recomendación: mantener chips persistentes bajo la búsqueda: `Alta`, `Vencidos`, `Sin acción`, `En espera`, `Mi fuente`. El panel avanzado queda para filtros menos frecuentes.
- Mejora: permitir vistas guardadas como `Mi cartera`, `IMMEX`, `Mérida` y `Esperando ser banco`.

### P1 — Alertas sin explicación operativa suficiente

- Problema: “cliente descuidado” es correcto como concepto, pero el usuario necesita ver qué acción resolvería la alerta.
- Recomendación: cada alerta debe incluir motivo + acción: `Vencido → reagendar`, `Sin acción → crear llamada`, `Sin interacción → registrar contacto`.
- Mejora: contador de alertas no leídas, fecha del último envío a Teams y prevención visual de duplicados.

### P1 — Agenda y Kanban no comparten suficiente contexto

- Problema: Agenda se percibe como módulo separado, aunque una reunión solo tiene sentido vinculada a un prospecto.
- Recomendación: en cada evento mostrar prospecto, etapa, prioridad y botón `Abrir ficha`. En la ficha mostrar también la próxima reunión y enlace de Teams.

### P1 — Conversaciones necesita una composición más clara

- Problema: lista de chats + mensajes es un buen inicio, pero falta saber a qué prospecto pertenece la conversación.
- Recomendación: usar tres paneles en desktop: lista de chats, conversación y contexto del prospecto. En móvil, convertirlos en navegación por pasos.
- Regla: ningún mensaje debe mostrarse sin una opción visible de `Relacionar con prospecto`.

### P1 — Falta de estados de carga, error y confirmación

- Problema: varias llamadas `fetch` fallan silenciosamente y las acciones de agenda/Teams no comunican suficiente estado.
- Recomendación: añadir skeletons, banners de error, reintentar, toast de éxito y estado `Sincronizando`. No usar únicamente cambios de color.

### P2 — Accesibilidad y teclado

- Riesgos a revisar: foco visible en botones, Escape para cerrar modales, foco atrapado dentro de modales, orden de lectura, `aria-label` para iconos, contraste de textos secundarios y navegación horizontal del Kanban.
- Recomendación: validar con teclado y zoom 200%; no declarar cumplimiento WCAG hasta hacer esa prueba.

### P2 — Responsive

- Problema potencial: cinco columnas con ancho mínimo obligan a desplazamiento horizontal, que puede ser correcto para desktop pero poco evidente en móvil.
- Recomendación: en móvil cambiar a selector de etapa + lista vertical, o permitir deslizar columnas con indicador visible. No esconder la navegación sin ofrecer una barra móvil equivalente.

## Arquitectura frontend propuesta

### Navegación

1. `Mi día`
2. `Pipeline`
3. `Agenda`
4. `Conversaciones`
5. `Alertas`
6. `Configuración`

### Mi día

- saludo y fecha;
- tarjetas de vencidos, hoy y sin próxima acción;
- lista de 5 acciones prioritarias;
- eventos de Teams del día;
- resumen de actividad de los dos usuarios.

### Ficha de prospecto

- encabezado persistente con empresa, etapa, prioridad y próxima acción;
- acciones rápidas;
- resumen de empresa y contacto;
- timeline cronológica;
- Teams relacionado;
- campos editables y origen del Excel.

### Sistema visual

- usar color fuerte solo para prioridad, riesgo y estados de sincronización;
- texto principal oscuro y secundarios con contraste suficiente;
- una escala de espaciado consistente;
- botones primarios para acciones irreversibles o de alto valor;
- iconos siempre acompañados de texto cuando la acción no sea obvia;
- evitar que la tarjeta sea una mini-ficha completa.

## Plan de mejoras frontend

### Primera iteración

- `Mi día` como pantalla inicial.
- Rediseño de tarjetas con campos configurables.
- Ficha con pestañas y barra de acciones.
- Timeline visual de actividades.
- Chips de filtros rápidos.
- Estados de carga, error, éxito y sincronización.

### Segunda iteración

- Vista de tres paneles para conversaciones.
- Agenda con eventos vinculados a prospectos.
- Alertas con acción recomendada.
- Vistas guardadas.
- Responsive móvil por etapa/lista.

### Tercera iteración

- Configuración visual por usuario.
- Densidad compacta/cómoda.
- Reportes visuales.
- Accesibilidad validada con teclado, zoom y lector de pantalla.

## Veredicto

El frontend debe evolucionar de “tablero de registros” a “centro diario de decisiones”. La mejora de mayor impacto no es agregar más colores ni más campos: es mostrar la siguiente acción correcta, con contexto suficiente y sin obligar al usuario a abandonar la ficha.
