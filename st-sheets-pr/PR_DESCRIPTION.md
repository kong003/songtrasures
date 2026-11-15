## Display menu: chord staff and second voice

Adds an eye button next to Settings (same `icon-button` style, same row) that opens a **Display** dialog (built on `Modal`, like Settings) with:

- **Chord staff**: a second staff under each line with every chord as a block of stacked notes, like in printed chord sheets.
- **Second voice**: a note a third below the melody, drawn in the melody staff. It is the diatonic third by default (so major or minor depending on the key). If that note is not a tone of the current chord, it is adjusted to the nearest chord tone below the melody (3-4 semitones preferred, then a fourth, fifth, major second; semitone clashes are excluded). When the melody note itself is not a chord tone (passing or neighbour note) the second voice stays parallel.
- **Second voice color**: any color, with a reset button.

All three are remembered per device (`localStorage`, key `display`) and **off by default**.

### How it works

The sheet comes from the API as ready-made SVG, so the extras are drawn into that SVG in the browser, after the page is shown (`services/sheetOverlay`):

- `layout.ts` reads the structure of a page (systems, measures, chord symbols, key and time signature) from the renderer's `staffline` / `vf-*` groups.
- `chordStaff.ts` and `chords.ts` build the chord staff.
- `secondVoice.ts` picks and draws the second voice (copies of the page's own note heads, so the notes keep the sheet's look).
- `SvgViewer.vue` runs it after the existing size fix and redraws from the original SVG when an option changes. Drawn elements use the sheet's own line color.

`vue-tsc --noEmit` and `vite build` pass.

### Please check

- I could only test the drawing on a synthetic SVG that mimics the renderer's structure, not on a wide range of real sheets. Worth a look at multi-instrument sheets, other time signatures and sheets with several pages.
- The pitch of a note is read from the height of its note head; accidentals are recognized by their size. Double sharps/flats in the melody are not recognized.
- Doing this in the renderer instead would be more robust. This client-side version is meant as a start that works without backend changes.
