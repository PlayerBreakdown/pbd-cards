# Arquitectura de escala y formulas

Esta web debe poder crecer a miles de cartas sin convertir cada cambio de formula en un trabajo manual peligroso.

## Separacion recomendada

1. Datos crudos
   - Minutos, goles, asistencias y estadisticas de SofaScore/Transfermarkt.
   - Deben conservarse aunque cambie la formula.

2. Formula
   - Convierte datos crudos en `Score Gol`, `Score Pase creativo`, `Score Regate`, `Score Pase`, `Score Defensa` y `Total visual x2`.
   - Cada formula debe tener version estable, por ejemplo `pbp-v2`, `pbp-v3`.

3. Catalogo web
   - `public/data/cards.index.json`: indice liviano para busqueda, filtros, rankings y VS.
   - `public/data/card-details/*.json`: detalle individual bajo demanda.
   - `public/data/catalog.meta.json`: metadata global del catalogo.
   - `public/cards/*.webp`: cartas finales descargables/visibles.

## Regla importante

El `id` de una carta debe ser estable por jugador + temporada + serie:

```text
lionelmessi_pvpv1_2012
```

No debe cambiar solo porque cambie la formula. Si cambia la formula, se regeneran puntuaciones e imagenes, pero la URL de la carta idealmente permanece igual.

## Cuando haya miles de cartas

La pagina `/cards` ya pagina resultados y solo muestra 50 cartas por pagina. El indice debe seguir siendo liviano.

La pagina `/cards/[id]` no debe pre-generar todas las cartas si el catalogo crece demasiado. Por eso usa:

```text
PBP_STATIC_CARD_PAGE_LIMIT
```

Por defecto pre-renderiza hasta 500 paginas individuales. Las demas quedan disponibles bajo demanda.

## Cambio futuro de formula

Flujo recomendado:

1. Mantener los datos crudos en el Sheet o en una fuente equivalente.
2. Crear una nueva version de formula, por ejemplo `pbp-v3`.
3. Recalcular todas las filas.
4. Regenerar todas las cartas visuales.
5. Ejecutar `npm.cmd run sync:data`.
6. Revisar `public/data/catalog.meta.json` para confirmar version y conteo.
7. Ejecutar:

```bash
npm.cmd run audit:assets
npm.cmd run benchmark:cards
npm.cmd run build
```

## Riesgo principal

El riesgo no es filtrar 10.000 cartas en `/cards`; el benchmark actual indica que eso es viable. El riesgo real es:

- pre-generar demasiadas paginas individuales durante deploy;
- perder trazabilidad de que formula produjo cada carta;
- cambiar IDs y romper URLs antiguas;
- mezclar datos crudos con puntuaciones sin version.
