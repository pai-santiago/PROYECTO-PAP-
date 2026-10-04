# VPA CRM

CRM independiente para centralizar prospectos, seguimiento comercial e historial de interacciones.

## Estado actual

- Tablero Kanban con las cinco etapas acordadas.
- Búsqueda por empresa, contacto y ciudad.
- Filtro por industria.
- Prioridad alta, media y baja.
- Ficha centrada con contacto, fuente, notas y siguiente seguimiento.
- Alta de prospectos con formulario CRM por secciones; la captura se refleja de inmediato en el Kanban durante la revisión local.
- Cliente de Supabase preparado en `lib/supabase/browser.ts`.
- Migración inicial y foundation de CRM en `supabase/migrations/`.
- Benchmark de CRM y roadmap en `docs/CRM-BENCHMARK.md`.
- Estudio exclusivo de frontend en `docs/FRONTEND-ESTUDIO.md`.
- Los cuatro Excel originales permanecen locales y están excluidos del repositorio.
- La extracción local completa se regenera con `python scripts/import_workbooks.py`; sus resultados quedan en `data/staging/` y también están excluidos del repositorio.
- El localhost lee `data/staging/prospects.ndjson` mediante `/api/prospects`; los registros ambiguos se muestran en `clientes recibidos`.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000>.

## Próximo paso

Revisar `docs/DB-SETUP.md`, habilitar Data API, confirmar el proyecto y la política de acceso para los dos usuarios, y después importar los prospectos mediante staging con deduplicación y trazabilidad de archivo/hoja/fila. La persistencia del formulario nuevo se conectará a Supabase al aplicar la migración.
