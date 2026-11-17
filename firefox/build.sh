#!/bin/sh
# Baut das Paket fuer Firefox (Desktop + Android) aus extension/:
#   firefox/dist/songtreasures-akkordtoene-<version>.zip   zum Hochladen bei addons.mozilla.org
# Der Chrome-Ordner bleibt unveraendert; nur das Manifest im Paket bekommt die
# Firefox-Angaben (Kennung, Android, keine Datenerhebung).
set -e
cd "$(dirname "$0")"
EXT=../extension
OUT=dist
VERSION=$(python3 -c 'import json;print(json.load(open("../extension/manifest.json"))["version"])')
rm -rf "$OUT/pkg" && mkdir -p "$OUT/pkg"
cp "$EXT/glyphs.js" "$EXT/voice2.js" "$EXT/content.js" "$OUT/pkg/"
cp -R "$EXT/icons" "$OUT/pkg/icons"
python3 - <<'PY'
import json
m = json.load(open("../extension/manifest.json", encoding="utf-8"))
m["browser_specific_settings"] = {
    "gecko": {
        "id": "songtreasures-akkordtoene@kong003.github.io",
        "strict_min_version": "142.0",
        "data_collection_permissions": {"required": ["none"]},
    },
    "gecko_android": {"strict_min_version": "142.0"},
}
json.dump(m, open("dist/pkg/manifest.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
PY
ZIP="$OUT/songtreasures-akkordtoene-$VERSION.zip"
rm -f "$ZIP"
(cd "$OUT/pkg" && zip -q -r "../songtreasures-akkordtoene-$VERSION.zip" .)
echo "$ZIP"
