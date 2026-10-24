# Ray Tracing Playground

Interactive paraxial ray tracing for lenses and mirrors, with a sandbox and a practice mode.

Open `index.html` in a browser (no build step). Works with mouse, keyboard and touch.

## Layout

- `index.html` – page structure
- `css/styles.css` – base styles; `css/layout.css` – app layout for phones and wide screens
- `js/` – plain scripts loaded in order: `config` → `toolbar` → `optics` → `render` → `panels` → `interaction` → `menus` → `io` → `construct` → `practice` → `ui` (selection, inspector, scene list, sheets) → `main`

## Using it

Tap anything on the canvas (or in the Scene list) to edit it. Tools sit in the dock: Move, Ray, Line, Construct, and + to add lenses, mirrors, objects or a free ray. Display and snapping switches are behind the layers button on the canvas.

## Touch

Long-press for the context menu, drag empty space with Move to pan, pinch to zoom. With the line and Mark tools, press, slide to the snap point and release.
