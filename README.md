# PBP Cards

Web de cartas y rankings generada desde archivos estaticos.

## Flujo de actualizacion

1. Exporta la pestana `Puntuaciones atacantes` desde Google Sheets como CSV y guardala como `../PUNTUACIONES_ATACANTES.csv`.
2. Si agregas un jugador nuevo, revisa `../assets/asset-map.json` y agrega su pais, foto y club por temporada.
3. Genera las imagenes:

```bash
cd ../generator
npm run gen
```

4. Sincroniza los datos e imagenes con la web:

```bash
cd ../pbd-cards
npm run sync:data
```

El comando copia `../output/*.png` a `public/cards/` y crea `public/data/cards.json`.

Si `PUNTUACIONES_ATACANTES.csv` existe, el generador usa ese archivo. Si no existe, usa el `EXPORT.csv` viejo como respaldo.

El catalogo generado queda separado en:

- `public/data/cards.index.json`: indice liviano para filtros, rankings y VS.
- `public/data/card-details/*.json`: detalle por carta.
- `public/data/catalog.meta.json`: conteo, fuente y version de formula.

Para revisar la estrategia de crecimiento y cambios futuros de formula, lee `docs/scale-and-formula-architecture.md`.

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Verificacion

```bash
npm run lint
npm run build
```

## Deploy

Sube el proyecto `pbd-cards` a Vercel. La web ya no necesita variables de entorno ni Supabase para mostrar cartas.
