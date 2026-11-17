# Firefox-Veröffentlichung (addons.mozilla.org)

Paket bauen: `sh firefox/build.sh` → `firefox/dist/songtreasures-akkordtoene-<version>.zip`

Einreichen: https://addons.mozilla.org/developers/ → "Submit a New Add-on" → "On this site"
(öffentlich, geprüft) oder "On your own" (nur signierte Datei zum selbst Verteilen).
Ein Firefox-Konto reicht, es ist kostenlos.

Die Add-on-Kennung steht fest im Paket (`songtreasures-akkordtoene@kong003.github.io`).
Sie lässt sich nach der ersten Veröffentlichung nicht mehr ändern.

## Angaben für das Formular

**Name:** SongTreasures Chord Staff & Harmony

**Summary (max. 250 Zeichen):**
Adds a chord staff and a harmony voice (a third below the melody) to the sheets on sheets.songtreasures.app. Choose what to show and the harmony color with the eye button next to Settings.

**Description:**
Adds two helpers to the sheet music on sheets.songtreasures.app (after you are signed in):

- Chord staff: a second staff under each line with every chord written as a block of stacked notes.
- Harmony: a note a third below the melody, fitted to the current chord, in a color you can choose.

Use the eye button next to the Settings button to turn each option on or off and to pick the harmony color. Your choices are remembered on your device.

This is an unofficial add-on and is not affiliated with SongTreasures. It only runs on sheets.songtreasures.app, reads the sheet that is shown on the page and draws the extra notes into it. It does not send any data anywhere.

**Kategorie:** Other (oder "Music")

**Datenschutz:** Keine Datenerhebung, keine Server (im Manifest: `data_collection_permissions: none`). Gespeichert wird nur die Auswahl (Anzeige an/aus, Farbe) im lokalen Speicher der Seite.

**Quellcode:** kein Build-Schritt, der Code im Paket ist der Quellcode (`extension/` im Repo
https://github.com/kong003/songtreasures).

**Hinweis:** Die Beschreibung sagt ausdrücklich, dass es nicht von SongTreasures stammt.
Frag vor der Veröffentlichung bei SongTreasures nach, ob sie damit einverstanden sind.

## Danach: Anleitung für Nutzer (Android)

1. Firefox aus dem Play Store installieren.
2. Die Seite des Add-ons öffnen und "Zu Firefox hinzufügen" tippen.
3. sheets.songtreasures.app öffnen, einloggen, Lied öffnen. Das Auge neben dem Zahnrad.
