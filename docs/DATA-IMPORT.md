# Importación local de la cartera comercial

## Estado

La extracción se ejecutó el 3 de octubre de 2026 con `scripts/import_workbooks.py`.
Los resultados se guardan únicamente en `data/staging/`, una ruta excluida de Git porque contiene información comercial privada.

Archivos generados:

- `data/staging/prospects.ndjson`: una fila normalizada por registro de origen.
- `data/staging/manifest.json`: conteos, cobertura, checksums, hojas excluidas y grupos de posibles duplicados.
- `data/staging/duplicate-groups.csv`: grupos para revisión antes de consolidar organizaciones.

## Conteo extraído

| Fuente | Registros | Tratamiento |
| --- | ---: | --- |
| `Clientes potenciales.xlsx` | 101 | Cartera manual de las 9 hojas de segmentos; se excluyeron `Análisis Comercial` y `Notas`, además de filas plantilla. |
| `Prospectos_Masari_Merida_220.xlsx` | 13 | Se conservaron los 13 prospectos con empresa identificable; se excluyeron 207 filas plantilla (`Prospecto Yucatán 14`…`220`). |
| `IMMEX_MAYO2023-DIRECTORIO_20230609-20230609.xlsx` | 18,928 | Se conservaron programas y plantas como filas de origen; las plantas deberán consolidarse como ubicaciones de una organización. |
| `Hoja de TRABAJO Masari.xlsx` | 288 | Sólo `Lu Prosp`, `Prosp`, `P.Puebla`, `P.Sergio`, `MRR 1`, `MRR 2` y `MRR 3`; se excluyeron finanzas, empleados, vacaciones, operaciones y cotizaciones. |
| **Total** | **19,330** | Filas válidas antes de consolidación/deduplicación. |

La vista local consolida estas filas en aproximadamente 6,759 tarjetas únicas por empresa. Las filas fuente no se borran: se conservan en `prospects.ndjson` y se indican en cada tarjeta consolidada.

## Reglas de calidad

- Nunca se elimina el valor original: queda en `raw`.
- Se extraen teléfonos, correos y URLs desde campos combinados sin destruir el texto de contacto.
- La etapa se conserva inicialmente como `clientes recibidos`; `suggested_stage` sólo es una sugerencia basada en el estado y notas originales, no una decisión automática irreversible.
- La prioridad `Alta`, `Media` y `Baja` se normaliza a `alta`, `media` y `baja`.
- Los textos con carácter de reemplazo (`�`) reciben la bandera `encoding_mojibake` para revisión; no se inventan acentos.
- Los grupos de duplicados son esperados en IMMEX porque una empresa puede tener varios programas y plantas. Se deben consolidar en una organización con varias ubicaciones.

## Siguiente paso de datos

Cuando la migración de Supabase esté aplicada y exista el workspace, el proceso deberá:

1. crear un `crm_import_batches` por archivo;
2. crear o enlazar un prospecto por `dedupe_key`;
3. crear contactos y ubicaciones relacionadas;
4. guardar cada fila en `crm_import_rows` con su JSON original;
5. marcar duplicados y registros ambiguos como `needs_review`, nunca borrarlos;
6. generar etiquetas de industria y motivos de espera a partir de los valores originales.

