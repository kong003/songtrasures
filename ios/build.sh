#!/bin/sh
# Baut aus der Chrome-Erweiterung zwei Dateien fuer Safari/iPad:
#   songtreasures-akkordtoene.user.js   fuer die App "Userscripts"
#   bookmarklet.txt                     fuer ein Lesezeichen in Safari
set -e
cd "$(dirname "$0")"
EXT=../extension
VERSION=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' "$EXT/manifest.json")

{
  echo "// ==UserScript=="
  echo "// @name        SongTreasures Akkordtöne"
  echo "// @description Zweite Notenzeile mit den Akkorden als Blocknoten"
  echo "// @version     $VERSION"
  echo "// @match       https://sheets.songtreasures.app/*"
  echo "// @run-at      document-end"
  echo "// ==/UserScript=="
  echo "(function () {"
  echo "'use strict';"
  cat "$EXT/glyphs.js"
  cat "$EXT/voice2.js" | grep -v '^if (typeof module'
  cat "$EXT/content.js"
  echo "})();"
} > songtreasures-akkordtoene.user.js

python3 - <<'PY'
import re, urllib.parse
src = open("songtreasures-akkordtoene.user.js", encoding="utf-8").read()
body = src.split("// ==/UserScript==\n", 1)[1]
body = re.sub(r"(?m)^\s*//.*$", "", body)      # Zeilenkommentare
body = re.sub(r"\n\s*\n+", "\n", body)
open("bookmarklet.txt", "w").write("javascript:" + urllib.parse.quote(body, safe="()!*'~._-"))
PY
node --check songtreasures-akkordtoene.user.js
ls -la songtreasures-akkordtoene.user.js bookmarklet.txt
