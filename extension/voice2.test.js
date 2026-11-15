// node extension/voice2.test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const { harmonyBelow, v2Midi } = require("./voice2.js");

// parseChord aus content.js (alles vor dem Zeichenteil, ohne DOM)
const src = fs.readFileSync(path.join(__dirname, "content.js"), "utf8");
const ctx = vm.createContext({});
vm.runInContext(src.slice(0, src.indexOf("// ---- Zeichnen")), ctx);
const parseChord = (s) => ctx.parseChord(s);

const L = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
// Notenname -> Stufe (E4 = 0): "G4", "F#4", "Bb3"
const note = (s) => {
  const [, l, a, o] = /^([A-G])([#b]?)(\d)$/.exec(s);
  return { n: (o - 4) * 7 + L[l] - 2, acc: a === "#" ? 1 : a === "b" ? -1 : 0 };
};
const name = ({ n, acc }) => {
  const li = (((n + 2) % 7) + 7) % 7;
  return "CDEFGAB"[li] + (acc > 0 ? "#" : acc < 0 ? "b" : "") + (4 + Math.floor((n + 2) / 7));
};
const run = (mel, chord, keyAcc = {}, prev = null) =>
  harmonyBelow(note(mel), { chord: chord && parseChord(chord), keyAcc, prev });

const cases = [
  // [Melodie, Akkord, Tonart, erwartet, angepasst?]
  ["G4", "C", {}, "E4", false],           // kleine Terz? nein: grosse Terz, Akkordton
  ["E5", "C", {}, "C5", false],
  ["C5", "Am", {}, "A4", false],          // kleine Terz
  ["A4", "F", {}, "F4", false],
  ["F5", "Bdim", {}, "D5", false],
  ["D5", "C", {}, "B4", false],           // Durchgang: parallel, auch wenn B nicht zum Akkord passt
  ["A4", "D", {}, "F#4", true],           // D-Dur-Akkord in C-Dur: F statt F#
  ["E5", "A", {}, "C#5", true],
  ["D5", "Gm", {}, "Bb4", true],
  ["F#4", "D", {}, "D4", false],
  ["G4", null, { F: 1 }, "E4", false],    // ohne Akkord: nur diatonisch
  ["B4", null, { F: 1 }, "G4", false],
  ["D5", null, { F: 1 }, "B4", false],
  ["E5", null, { F: 1 }, "C5", false],
  ["A4", null, { F: 1 }, "F#4", false],   // Tonart mit F#: F# ist die diatonische Terz
];
for (const [mel, ch, key, exp, adj] of cases) {
  const r = run(mel, ch, key);
  assert.equal(name(r), exp, `${mel} ueber ${ch}: ${name(r)} statt ${exp}`);
  assert.equal(r.adjusted, adj, `${mel} ueber ${ch}: adjusted`);
}

// Nie Halbton-/Einklang-Reibung zu einer Akkordton-Melodie, nie ueber der Melodie
const chords = ["C", "Dm", "Em", "F", "G", "Am", "Bdim", "C7", "D7", "G7", "A7", "E7", "Fmaj7", "Bb", "Gm", "Cm", "F#m", "D", "A", "E"];
for (const ch of chords) {
  const parsed = parseChord(ch);
  for (const t of parsed.notes) {
    for (let oct = 4; oct <= 5; oct++) {
      const mel = { n: (oct - 4) * 7 + t.li - 2, acc: t.acc };
      const h = harmonyBelow(mel, { chord: parsed, keyAcc: {} });
      const d = v2Midi(mel.n, mel.acc) - v2Midi(h.n, h.acc);
      assert.ok(d >= 2 && d <= 7, `${ch}: Abstand ${d} bei ${name(mel)} -> ${name(h)}`);
    }
  }
}
console.log("ok");
