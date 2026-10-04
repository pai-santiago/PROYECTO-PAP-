# Configuración de Supabase para VPA CRM

## Diagnóstico actual

- El frontend tiene cliente Supabase de navegador, pero la pantalla todavía usa datos de revisión local.
- La migración base sólo tenía `prospects` e `interactions`, sin workspace, contactos múltiples, plantas, importaciones, deduplicación, calendario ni reglas de alertas.
- La migración complementaria es `supabase/migrations/20261003_vpa_crm_foundation.sql`.
- El endpoint REST del proyecto respondió `PGRST125` y el CLI local de Supabase no está instalado. No se aplicó ninguna migración ni se escribió en la base.

## Qué cubre la migración complementaria

- workspace y miembros para los dos usuarios;
- prospectos con RFC, múltiples contactos, ubicaciones y etiquetas configurables;
- trazabilidad completa de archivo, hoja, fila, checksum y JSON original;
- interacciones, tareas y enlaces a eventos de Microsoft;
- conexión de Microsoft por usuario, preparada para guardar sólo tokens cifrados;
- reglas de clientes descuidados y entregas idempotentes de notificaciones;
- RLS por pertenencia al workspace.

## Aplicación controlada

Antes de aplicar:

1. habilitar **Data API** en el proyecto correcto de Supabase;
2. confirmar que el proyecto es `hknngwkxpauqtoahpvrb` y no otro entorno;
3. crear/invitar exactamente a los dos usuarios en Supabase Auth;
4. revisar la migración y crear el workspace desde un entorno administrativo;
5. insertar las dos filas de `crm_workspace_members` con sus UUID reales;
6. aplicar primero `20261003_vpa_crm_base.sql` y después `20261003_vpa_crm_foundation.sql`;
7. ejecutar el importador autenticado usando `data/staging/prospects.ndjson`;
8. validar conteos, duplicados y permisos con ambos usuarios antes de activar notificaciones.

La clave pública no permite importar registros si las políticas RLS no autorizan al usuario. La clave secreta, si se usa para una operación administrativa, debe vivir sólo en el servidor y nunca en el navegador ni en Git.

