# ST Sheets local webapp

This is a static copy of the SongTreasures Sheets browser frontend, with the existing SongTreasures Akkordtöne scripts loaded as part of the page. The copied frontend lives in `assets/`; the native chord and harmony integration is in `native/`. Static files, icons, and the offline service worker were copied from `sheets.songtreasures.app` on 15 November 2026.

## Run locally

From this directory, serve the static files:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173` in a browser. This only serves the static app files. Sign-in and sheet requests go directly from the browser to SongTreasures Firebase and `api.songtreasures.app`; this project has no application backend or database. Firebase keeps its sign-in state in the browser.

Band Sync is retained from the original app. Like the original, it writes the session code, Firebase user ID, collection, song number, transposition, and expiry to SongTreasures Firebase so other devices can follow the session. It does not upload sheet contents to this project's server.

If SongTreasures rejects sign-in or API requests from `localhost`, the service must authorize the app origin. Do not add a proxy server: that would route account tokens and song requests through another server.
