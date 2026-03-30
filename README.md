# Glosario Jurídico

Aplicación web tipo diccionario jurídico con búsqueda lingüística avanzada.

## Características

- Búsqueda inteligente con motor de ranking por señales lingüísticas:
  1. Coincidencia exacta de lema/término
  2. Coincidencia por sinónimos
  3. Coincidencia morfológica (conjugación → infinitivo)
  4. Coincidencia parcial
  5. Coincidencia aproximada (Levenshtein + Dice trigram)
- Normalización robusta de acentos, mayúsculas, espacios y signos.
- Variantes de consulta (lemas, singularización básica, tokens).
- Reconocimiento de acrónimos configurable y multivalor (`HR`, `DDHH`, `ONU`).
- Páginas de detalle por término con ruta SPA: `/term/:slug`.
- Diseño minimalista y responsive inspirado en diccionario.
- Datos locales estructurados y reutilizables para futura API lingüística.

## Stack

- React + TypeScript + Vite
- React Router
- Datos locales JSON-like en módulos TypeScript

## Desarrollo

```bash
npm install
npm run dev
```

## Build producción

```bash
npm run build
npm run preview
```

## Estructura

- `src/lib/searchEngine.ts`: normalización, análisis de consulta, lematización, scoring híbrido y ranking.
- `src/data/terms.ts`: base de términos jurídicos.
- `src/data/acronyms.ts`: configuración de acrónimos multivalor.
- `src/components/*`: componentes reutilizables.
- `src/pages/*`: vistas de inicio y detalle.
