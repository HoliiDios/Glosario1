# Legal Glossary · Glosario Jurídico

Aplicación web profesional de referencia jurídica con búsqueda lingüística inteligente y navegación tipo diccionario.

## Características principales

- Dataset académico local con **51 términos legales** (penal, civil, procesal, constitucional y derechos humanos).
- Motor de búsqueda robusto con:
  - normalización de acentos y mayúsculas,
  - coincidencia parcial,
  - coincidencia por sinónimos,
  - lematización heurística de verbos (conjugado → infinitivo),
  - fuzzy search con Levenshtein.
- Priorización de resultados:
  1. exacto,
  2. infinitivo,
  3. sinónimo,
  4. fuzzy.
- Motor de acrónimos configurable y multivalor (`HR`, `DDHH`, `ONU`, `CIDH`, etc.).
- Routing SPA:
  - `/` búsqueda,
  - `/term/:slug` ficha terminológica.

## Stack

- React + TypeScript + Vite
- React Router
- Datos y lógica en frontend (sin backend)

## Estructura

- `src/components/*`: componentes reutilizables de UI.
- `src/data/terms.ts`: base terminológica jurídica.
- `src/data/acronyms.ts`: configuración de acrónimos.
- `src/utils/searchEngine.ts`: motor de búsqueda, ranking y normalización.
- `src/pages/*`: páginas principales.

## Ejecución

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
