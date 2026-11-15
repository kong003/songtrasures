// ==UserScript==
// @name        SongTreasures Akkordtöne
// @description Zweite Notenzeile mit den Akkorden als Blocknoten
// @version     0.9.3
// @downloadURL https://raw.githubusercontent.com/kong003/songtrasures/main/ios/songtreasures-akkordtoene.user.js
// @updateURL   https://raw.githubusercontent.com/kong003/songtrasures/main/ios/songtreasures-akkordtoene.user.js
// @match       https://sheets.songtreasures.app/*
// @run-at      document-end
// ==/UserScript==
(function () {
'use strict';
// Glyphen (Pfaddaten) aus den von sheets.songtreasures.app gerenderten Notenblaettern.
// x/y/w/h ist die Bounding Box des Pfads; die Position wird beim Zeichnen darauf bezogen.
const GLYPHS = {
 "filled": {
  "x": 161.892,
  "y": 76.777,
  "w": 12.018,
  "h": 10.474,
  "d": "M161.89167999999998 82M169.24863999999997 76.77712C169.36095999999998 76.77712,169.52943999999997 76.77712,169.55751999999998 76.77712C169.55751999999998 76.77712,169.58559999999997 76.77712,169.58559999999997 76.77712C169.58559999999997 76.77712,169.75408 76.77712,169.89448 76.77712C172.42167999999998 76.91752,173.90991999999997 78.57424,173.90991999999997 80.65216C173.90991999999997 81.66304,173.57295999999997 82.81432,172.73055999999997 83.90944C171.12999999999997 86.0716,168.51855999999998 87.25096,166.24407999999997 87.25096C164.47503999999998 87.25096,162.95871999999997 86.54896,162.22863999999998 85.11688C162.004 84.55528,161.89167999999998 84.02176,161.89167999999998 83.43208C161.89167999999998 80.37136,165.31743999999998 76.97368,169.24863999999997 76.77712"
 },
 "open": {
  "x": 926.442,
  "y": 111.777,
  "w": 12.018,
  "h": 10.474,
  "d": "M926.4419096401583 117M933.7988696401583 111.77712C933.9111896401583 111.77712,934.0796696401583 111.77712,934.1077496401583 111.77712C934.1077496401583 111.77712,934.1358296401584 111.77712,934.1358296401584 111.77712C934.1358296401584 111.77712,934.3043096401583 111.77712,934.4447096401583 111.77712C936.9719096401583 111.91752,938.4601496401583 113.57424,938.4601496401583 115.65216C938.4601496401583 116.66304,938.1231896401583 117.81432,937.2807896401583 118.90944C935.6802296401584 121.0716,933.0687896401583 122.25096,930.7943096401583 122.25096C929.0252696401583 122.25096,927.5089496401583 121.54896,926.7788696401583 120.11688C926.5542296401583 119.55528,926.4419096401583 119.02176,926.4419096401583 118.43208C926.4419096401583 115.37136,929.8676696401583 111.97368,933.7988696401583 111.77712M936.7191896401583 113.32152C936.6068696401583 113.26536,936.4664696401583 113.23728,936.3260696401583 113.23728C935.4555896401583 113.23728,933.9954296401584 113.7708,932.5914296401584 114.72552C929.9799896401584 116.35416,927.8459096401583 118.74096,927.7616696401583 120.11688C927.7616696401583 120.11688,927.7616696401583 120.14496,927.7616696401583 120.14496C927.7616696401583 120.62232,928.0705496401583 120.81888000000001,928.6040696401583 120.81888000000001C929.7553496401583 120.81888000000001,931.8894296401584 119.83608,933.8550296401584 118.2636C935.8767896401583 116.66304,937.1684696401583 114.86592,937.1684696401583 113.93928C937.1684696401583 113.6304,937.0280696401583 113.37768,936.7191896401583 113.32152"
 },
 "whole": {
  "x": 922.586,
  "y": 96.777,
  "w": 17.382,
  "h": 10.474,
  "d": "M922.5863947584942 102M930.2803147584942 96.83328C930.5891947584942 96.77712,930.8980747584942 96.77712,931.2069547584941 96.77712C935.6435947584941 96.77712,939.3501547584942 98.74272,939.8836747584942 101.38224C939.9117547584942 101.63496,939.9679147584942 101.8596,939.9679147584942 102.02808C939.9679147584942 104.92032,936.1490347584942 107.25096,931.2350347584942 107.25096C926.3210347584942 107.25096,922.5863947584942 104.86416,922.5863947584942 102.02808C922.5863947584942 101.69112,922.6144747584942 101.35416,922.7267947584942 100.98912C923.4007147584941 98.7708,926.5456747584942 97.05792,930.2803147584942 96.83328M930.7015147584942 97.47912C930.5611147584942 97.45104,930.3645547584941 97.45104,930.2241547584941 97.45104C928.4551147584942 97.45104,927.3880747584942 98.96736,927.3880747584942 100.84872C927.3880747584942 101.8596,927.6969547584941 102.95472,928.3427947584942 104.04984C929.4098347584942 105.73464,930.9542347584942 106.57704,932.2739947584942 106.57704C933.3971947584942 106.57704,934.3799947584941 105.98736,934.8292747584942 104.75184C935.0258347584942 104.2464,935.1100747584942 103.74096,935.1100747584942 103.20744C935.1100747584942 100.68024,933.1725547584941 97.87224,930.7015147584942 97.47912"
 },
 "sharp": {
  "x": 111,
  "y": 72.308,
  "w": 8.837,
  "h": 29.412,
  "d": "M111 87M116.93712 72.36240000000001C117.0192 72.30768,117.04656 72.30768,117.156 72.30768C117.4296 72.30768,117.62112 72.41712,117.7032 72.66336L117.73056 72.74544L117.75792 76.3296L117.75792 79.94112L118.46928 79.7496C118.87968 79.64016,119.18064 79.6128,119.37216 79.6128C119.6184 79.6128,119.72784 79.69488,119.80992 79.91376C119.83727999999999 79.99584,119.83727999999999 80.62512,119.83727999999999 81.30912000000001C119.83727999999999 81.96576,119.83727999999999 82.64976,119.80992 82.67712C119.70048 82.95072,119.6184 82.97808,118.87968 83.1696C117.94944 83.41584,117.75792 83.4432,117.75792 83.4432C117.75792 83.4432,117.75792 84.15456,117.75792 85.2216C117.75792 85.60464,117.75792 86.01504,117.75792 86.4528L117.75792 89.40768L118.46928 89.21616C118.90704 89.10672,119.18064 89.07936,119.37216 89.07936C119.50896 89.07936,119.6184 89.10672,119.70048 89.21616C119.83727999999999 89.38032,119.83727999999999 89.35296,119.83727999999999 90.36528L119.83727999999999 90.77568L119.83727999999999 91.21344C119.83727999999999 92.22576,119.83727999999999 92.19839999999999,119.70048 92.3352C119.59103999999999 92.44463999999999,119.6184 92.44463999999999,118.35984 92.7456C118.08624 92.82768,117.84 92.90976,117.81264 92.90976L117.75792 92.90976L117.75792 96.54864L117.73056 100.21488L117.7032 100.32432C117.62112 100.5432,117.40224 100.65264,117.156 100.65264C116.99184 100.65264,116.7456 100.5432,116.63616 100.32432L116.6088 100.21488L116.6088 96.7128L116.6088 93.21072L116.58144 93.21072L115.95216 93.37488L114.77568 93.67584C114.47472 93.75792,114.20112 93.81264,114.20112 93.81264C114.1464 93.81264,114.1464 94.00416,114.1464 97.5336L114.1464 101.30928L114.11904 101.39135999999999C114.0096 101.61024,113.79072 101.71968,113.5992 101.71968C113.38032 101.71968,113.13408 101.61024,113.02464 101.39135999999999L112.99728 101.30928L112.99728 97.69776C112.99728 94.35984,112.99728 94.1136,112.96992 94.1136C112.96992 94.1136,112.96992 94.1136,112.96992 94.1136C112.66896 94.19568,111.62928 94.46928,111.51984 94.46928C111.2736 94.46928,111.10944 94.30512,111 94.1136C111 94.00416,111 94.00416,111 92.71824L111 91.43232L111.02736 91.32288C111.1368 91.04928,111.1368 91.04928,112.66896 90.66624L112.99728 90.58416L112.99728 87.60192C112.99728 84.83856,112.99728 84.64704,112.96992 84.64704C112.96992 84.64704,112.96992 84.64704,112.96992 84.64704C112.66896 84.72912,111.62928 84.97536,111.51984 84.97536C111.2736 84.97536,111.10944 84.83856,111 84.64704C111 84.5376,111 84.5376,111 83.25168L111 81.96576L111.02736 81.85632C111.1368 81.58272,111.1368 81.58272,112.66896 81.19968L112.99728 81.1176L112.99728 77.47872L112.99728 73.83984L113.02464 73.7304C113.13408 73.53888,113.38032 73.37472,113.5992 73.37472C113.68128 73.37472,113.736 73.42944,113.81808 73.4568C113.92752 73.48416,114.03696 73.62096,114.11904 73.7304L114.1464 73.83984L114.1464 77.34192L114.1464 80.81664L114.31056 80.81664C114.36528 80.78928,114.85776 80.67984,115.35024 80.5704L116.41728 80.24208L116.6088 80.21472L116.6088 76.49376L116.6088 72.74544L116.63616 72.66336C116.71824 72.55392,116.80032 72.41712,116.93712 72.36240000000001M116.6088 86.75376C116.6088 85.0848,116.6088 83.74416,116.6088 83.74416L116.6088 83.74416C116.58144 83.74416,116.30784 83.82624,115.97952 83.90832L114.77568 84.20928C114.47472 84.29136,114.20112 84.34608,114.20112 84.34608C114.1464 84.34608,114.1464 84.51024,114.1464 87.32832L114.1464 90.33792L114.31056 90.2832C114.36528 90.25584,114.85776 90.1464,115.35024 90.03696L116.41728 89.76336L116.6088 89.68128L116.6088 86.75376"
 },
 "flat": {
  "x": 110.425,
  "y": 107.708,
  "w": 7.442,
  "h": 23.557,
  "d": "M111 125M110.78112 107.73584C110.83584 107.70848000000001,110.89056 107.70848000000001,110.97264 107.70848000000001C111.21888 107.70848000000001,111.43776 107.81792,111.51984 108.0368C111.5472 108.14624,111.5472 108.14624,111.5472 114.52112L111.5472 120.95072L111.57456 120.86864C112.61424 119.99312,113.70864 119.55536000000001,114.74832 119.55536000000001C115.15872 119.55536000000001,115.56912 119.61008,115.97952 119.77424C117.21072 120.18464,117.86736 121.33376,117.86736 122.70176000000001C117.86736 123.41312,117.64848 124.20656,117.23808 125C116.63616 126.0944,115.87008 126.96992,113.736 128.88512L111.62928 130.8824C111.24624 131.26544,111.16416 131.26544,111 131.26544C110.75376 131.26544,110.53488 131.12864,110.4528 130.90976L110.42544 130.80032L110.42544 119.50064L110.42544 108.14624L110.4528 108.0368C110.53488 107.92736,110.64432 107.7632,110.78112 107.73584M114.0096 121.41584C113.90016 121.36112,113.736 121.36112,113.62656 121.36112C113.54448 121.36112,113.48976 121.36112,113.43504 121.36112C112.72368 121.47056,112.0944 121.90832,111.65664 122.61968L111.5472 122.8112L111.5472 126.01232L111.5472 129.26816L111.62928 129.15872C113.62656 126.96992,114.93984 124.4528,114.93984 122.78384L114.93984 122.72912C114.93984 121.90832,114.66624 121.55264,114.0096 121.41584"
 },
 "natural": {
  "x": 241.332,
  "y": 198.36,
  "w": 6.539,
  "h": 25.308,
  "d": "M241.33216 211M241.60575999999998 198.4144C241.68784 198.35968,241.71519999999998 198.35968,241.87936 198.35968C242.09823999999998 198.35968,242.28976 198.46912,242.39919999999998 198.71536L242.42656 198.79744L242.42656 202.08064C242.42656 203.91376,242.42656 205.3912,242.42656 205.3912C242.42656 205.3912,243.52095999999997 205.1176,244.80687999999998 204.78928C246.69472 204.32416,247.15983999999997 204.18736,247.35136 204.18736C247.46079999999998 204.18736,247.48816 204.21472,247.54288 204.24208C247.65231999999997 204.2968,247.76175999999998 204.40624,247.84384 204.51568L247.8712 204.62512L247.8712 213.90016L247.8712 223.25728L247.84384 223.33936C247.7344 223.55824,247.48816 223.66768,247.32399999999998 223.66768C247.07775999999998 223.66768,246.85888 223.55824,246.74944 223.33936L246.72207999999998 223.25728L246.72207999999998 219.86464C246.72207999999998 217.78528,246.72207999999998 216.49936,246.72207999999998 216.49936C246.69472 216.49936,245.62768 216.7456,244.34176 217.10128C242.48128 217.5664,241.9888 217.7032,241.79728 217.7032C241.68784 217.7032,241.68784 217.67584,241.60575999999998 217.62112C241.49632 217.59376,241.38688 217.48432,241.33216 217.37488L241.33216 217.2928L241.33216 208.04512L241.33216 198.79744L241.33216 198.71536C241.38688 198.60592,241.49632 198.46912,241.60575999999998 198.4144M246.72207999999998 210.39808C246.72207999999998 209.87824,246.72207999999998 209.41312,246.72207999999998 209.0848C246.72207999999998 207.90832,246.72207999999998 207.82624,246.69472 207.82624L246.69472 207.82624C246.69472 207.82624,245.70976 208.09984,244.56063999999998 208.34608L242.42656 208.89328L242.42656 211.49248C242.42656 212.88784,242.42656 214.06432,242.42656 214.06432L244.588 213.54448L246.72207999999998 212.99728L246.72207999999998 210.39808"
 },
 "dot": {
  "x": 222.928,
  "y": 80,
  "w": 4,
  "h": 4,
  "d": "M226.9279733333333 82 A2 2 0 0 0 222.9279733333333 82M222.9279733333333 82 A2 2 0 0 0 226.9279733333333 82"
 }
};
// Zweite Stimme: pro Melodienote eine Note darunter, grundsaetzlich eine
// diatonische Terz tiefer (Tonart-Vorzeichen, also je nach Stufe grosse oder
// kleine Terz). Passt dieser Ton nicht zum Akkord, wird er auf den
// naechstgelegenen Akkordton unterhalb der Melodie angepasst.
//
// Vorgehen (nach den ueblichen Regeln fuer Parallelterzen / automatische
// Harmonisierung):
//  1. Melodienote ist ein Akkordton und die diatonische Terz darunter auch:
//     Terz nehmen (Normalfall).
//  2. Melodienote ist ein Akkordton, die Terz aber nicht: unter den Akkordtoenen
//     1-5 Stufen unter der Melodie den besten waehlen. Bevorzugt kleine/grosse
//     Terz (3-4 Halbtoene), danach Quarte, Quinte, grosse Sekunde; Halbton-
//     reibung und Einklang sind ausgeschlossen. Dazu Strafe fuer jede
//     Abweichung von der diatonischen Terz (Stufen und Halbtoene) und ein
//     kleiner Aufpreis fuer grosse Spruenge gegenueber der vorigen 2. Stimme.
//  3. Melodienote ist kein Akkordton (Durchgang, Wechselnote ...): die
//     diatonische Terz bleibt, die zweite Stimme laeuft parallel mit.
//
// Stufen wie in content.js: E4 (untere Notenlinie im Violinschluessel) = 0.

const V2_PC = [0, 2, 4, 5, 7, 9, 11];
const V2_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
const v2Li = (n) => (((n + 2) % 7) + 7) % 7;
const v2Midi = (n, acc) => 12 * (5 + Math.floor((n + 2) / 7)) + V2_PC[v2Li(n)] + acc;

// Strafe nach Abstand in Halbtoenen zur Melodie (alles andere ist verboten).
const V2_BASE_COST = { 3: 0, 4: 0, 5: 1.5, 7: 2.5, 2: 3, 6: 4 };

// note: { n, acc }   ctx: { chord (parseChord oder null), keyAcc, prev }
// Ergebnis: { n, acc, adjusted }
function harmonyBelow(note, ctx = {}) {
  const { chord = null, keyAcc = {}, prev = null } = ctx;
  const dn = note.n - 2;
  const diat = { n: dn, acc: keyAcc[V2_NAMES[v2Li(dn)]] || 0 };
  if (!chord) return { ...diat, adjusted: false };

  const isTone = (n, acc) => chord.notes.some((t) => t.li === v2Li(n) && t.acc === acc);
  if (!isTone(note.n, note.acc)) return { ...diat, adjusted: false };
  if (isTone(diat.n, diat.acc)) return { ...diat, adjusted: false };

  const m = v2Midi(note.n, note.acc);
  const dm = v2Midi(diat.n, diat.acc);
  let best = null;
  let bestCost = Infinity;
  for (let n = note.n - 5; n <= note.n - 1; n++) {
    for (const t of chord.notes) {
      if (t.li !== v2Li(n)) continue;
      const pm = v2Midi(n, t.acc);
      const base = V2_BASE_COST[m - pm];
      if (base === undefined) continue;
      let cost = base + Math.abs(n - dn) + 0.5 * Math.abs(pm - dm);
      if (prev) cost += 0.1 * Math.abs(pm - v2Midi(prev.n, prev.acc));
      if (cost < bestCost) { bestCost = cost; best = { n, acc: t.acc }; }
    }
  }
  return best ? { ...best, adjusted: true } : { ...diat, adjusted: false };
}

// ---- Auslesen und Zeichnen (benutzt mk, stroke, glyph, GLYPHS aus content.js) ----

// Passt ein Vorzeichen-Pfad zu Kreuz, B oder Aufloesung? (Groesse relativ zu sp)
function v2AccidentalOf(b, k) {
  let best = null;
  let bestD = 4;  // hoechstens 0.4 Linienabstaende Abweichung
  for (const [name, acc] of [["sharp", 1], ["flat", -1], ["natural", 0]]) {
    const d = Math.hypot(b.width / k - GLYPHS[name].w, b.height / k - GLYPHS[name].h);
    if (d < bestD) { bestD = d; best = { name, acc }; }
  }
  return best;
}

const V2_COLOR = "#1565c0";

// Faerbt alles in g blau: gefuellte Flaechen und vorhandene Striche
function v2Tint(g) {
  for (const e of g.querySelectorAll("*")) {
    const fill = e.getAttribute("fill");
    const stroke = e.getAttribute("stroke");
    if (fill !== "none") { e.setAttribute("fill", V2_COLOR); e.style.setProperty("fill", V2_COLOR); }
    if (stroke && stroke !== "none") { e.setAttribute("stroke", V2_COLOR); e.style.setProperty("stroke", V2_COLOR); }
  }
}

// Zeichnet die zweite Stimme in die Melodiesysteme (je Notenkopf ein blauer Kopf darunter).
// systems: wie in annotate (el, y0, measures[{el}], chords[{chord,x}])
function drawSecondVoice(svg, systems, { sp, keyAcc }) {
  const k = sp / 10;
  const bb = (el) => { try { return el.getBBox(); } catch { return null; } };
  let prev = null;
  let carry = null;
  let drawn = 0;

  for (const s of systems) {
    const chords = [...s.chords].sort((a, b) => a.x - b.x);
    const yOf = (n) => s.y0 + 4 * sp - (n * sp) / 2;
    for (const m of s.measures) {
      const measureAcc = {};
      const notes = [...m.el.querySelectorAll(".vf-stavenote")]
        .map((el) => {
          // Pausen haben ebenfalls vf-notehead, sind aber nicht ~1 Linienabstand hoch
          const heads = [...el.querySelectorAll(".vf-notehead")]
            .map((h) => ({ el: h, b: bb(h) }))
            .filter((h) => h.b && h.b.width > 0 && h.b.height > 0.8 * sp && h.b.height < 1.25 * sp);
          return heads.length === 1 ? { el, head: heads[0] } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.head.b.x - b.head.b.x);

      for (const { el, head } of notes) {
        const hb = head.b;
        const cy = hb.y + hb.height / 2;
        const n = Math.round((s.y0 + 4 * sp - cy) / (sp / 2));
        const letter = V2_NAMES[v2Li(n)];

        let melAcc = null;
        for (const p of el.querySelectorAll(".vf-modifiers path, .vf-accidental path")) {
          const b = bb(p);
          const a = b && v2AccidentalOf(b, k);
          if (a) { melAcc = { ...a, b }; break; }
        }
        const acc = melAcc ? melAcc.acc : (measureAcc[n] ?? (keyAcc[letter] || 0));
        measureAcc[n] = acc;

        let chord = carry;
        for (const c of chords) { if (c.x <= hb.x + sp) chord = c.chord; else break; }

        const h = harmonyBelow({ n, acc }, { chord, keyAcc, prev });
        prev = h;

        const g = mk("g", { "data-st-v2el": "1" });
        const copy = head.el.cloneNode(true);
        const old = copy.getAttribute("transform");
        copy.setAttribute("transform", `translate(0 ${((n - h.n) * sp) / 2})` + (old ? ` ${old}` : ""));
        g.append(copy);

        const y = yOf(h.n);
        const ledgers = [];
        if (h.n <= -2) for (let l = -2; l >= h.n; l -= 2) ledgers.push(l);
        else if (h.n >= 10) for (let l = 10; l <= h.n; l += 2) ledgers.push(l);
        for (const l of ledgers) g.append(stroke(hb.x - 3 * k, yOf(l), hb.x + hb.width + 3 * k, yOf(l), 1));

        // Vorzeichen nur, wenn es von dem abweicht, was an der Stelle schon gilt
        const inEffect = measureAcc[h.n] ?? (keyAcc[V2_NAMES[v2Li(h.n)]] || 0);
        measureAcc[h.n] = h.acc;
        if (h.acc !== inEffect && Math.abs(h.acc) <= 1) {
          const name = h.acc > 0 ? "sharp" : h.acc < 0 ? "flat" : "natural";
          const w = GLYPHS[name].w * k;
          let ax = hb.x - 2.5 * k - w;
          if (melAcc) ax = Math.min(ax, melAcc.b.x - 1.5 * k - w);  // nicht auf das Vorzeichen der Melodie
          g.append(glyph(name, ax, y, k));
        }

        // Hals nach oben bis zur neuen Note verlaengern; bei Hals nach unten
        // geht er ohnehin an der neuen Note vorbei.
        const stem = el.querySelector(".vf-stem path");
        const sb = stem && bb(stem);
        if (sb && sb.x + sb.width / 2 > hb.x + hb.width / 2) {
          const sx = sb.x + sb.width / 2;
          g.append(stroke(sx, cy, sx, y, 1.5));
        }

        v2Tint(g);
        s.el.append(g);
        drawn++;
      }
      // Akkord am Taktende gilt im naechsten Takt weiter
      const last = chords.filter((c) => c.x < (m.x2 ?? Infinity)).pop();
      if (last) carry = last.chord;
    }
  }
  return drawn;
}

// Anzeige-Optionen (werden gemerkt): Akkordzeile und zweite Stimme
const ST_OPTS = { chords: true, voice: true };
const ST_OPTS_KEY = "st-options";
try { Object.assign(ST_OPTS, JSON.parse(localStorage.getItem(ST_OPTS_KEY) || "{}")); } catch { /* egal */ }

function applyOptions() {
  document.documentElement.setAttribute("data-st-v2", ST_OPTS.voice ? "1" : "0");
  document.querySelectorAll("svg").forEach((svg) => { if (svg.__stChordRow) svg.__stChordRow(ST_OPTS.chords); });
}

// Knopf "Anzeige" mit kleinem Menue (zwei Haken). Er wird in die Zeile direkt
// vor das Zahnrad eingefuegt und uebernimmt dessen Klassen, sodass er wie die
// Knoepfe der Seite aussieht und nichts ueberdeckt. Findet sich kein Zahnrad,
// sitzt er unten rechts.
function setupOptionsMenu() {
  const style = document.createElement("style");
  style.textContent = 'html[data-st-v2="0"] [data-st-v2el]{display:none}';
  document.head.append(style);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Anzeige";
  const corner = document.createElement("div");
  corner.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:99999";
  document.body.append(corner);

  const menu = document.createElement("div");
  menu.style.cssText = "display:none;position:fixed;z-index:99999;padding:8px 12px;background:#fff;color:#000;" +
    "font:14px sans-serif;border:1px solid #888;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.25)";
  for (const [key, label] of [["chords", "Akkordzeile (2. Notenzeile)"], ["voice", "Zweite Stimme (blau)"]]) {
    const row = document.createElement("label");
    row.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 0;white-space:nowrap";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!ST_OPTS[key];
    cb.style.cssText = "width:20px;height:20px";
    cb.addEventListener("change", () => {
      ST_OPTS[key] = cb.checked;
      try { localStorage.setItem(ST_OPTS_KEY, JSON.stringify(ST_OPTS)); } catch { /* egal */ }
      applyOptions();
    });
    row.append(cb, label);
    menu.append(row);
  }
  document.body.append(menu);

  const openMenu = (open) => {
    if (open) {
      const r = btn.getBoundingClientRect();
      menu.style.top = r.bottom + 6 + "px";
      menu.style.right = Math.max(8, window.innerWidth - r.right) + "px";
    }
    menu.style.display = open ? "block" : "none";
  };
  btn.addEventListener("click", (e) => { e.stopPropagation(); openMenu(menu.style.display === "none"); });
  document.addEventListener("click", (e) => { if (!menu.contains(e.target)) openMenu(false); });

  // Das Zahnrad: Knopf/Link, dessen Name oder Icon nach Einstellungen klingt
  const GEAR = /settings|einstellung|gear|cog|zahnrad/i;
  const findGear = () => {
    let best = null;
    for (const e of document.querySelectorAll("button,a,[role=button]")) {
      if (e === btn) continue;
      const r = e.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.width > 80 || r.height > 80 || r.top > 250) continue;
      const parts = [e, ...e.querySelectorAll("svg,i,span")].flatMap((x) => [
        x.getAttribute("aria-label"), x.getAttribute("title"), x.getAttribute("data-testid"), x.id,
        typeof x.className === "string" ? x.className : x.getAttribute("class"),
      ]);
      if (!GEAR.test(parts.filter(Boolean).join(" "))) continue;
      if (!best || r.right > best.r.right) best = { e, r };
    }
    return best && best.e;
  };
  const place = () => {
    const gear = findGear();
    if (gear) {
      if (btn.nextElementSibling !== gear) gear.parentElement.insertBefore(btn, gear);
      btn.className = gear.className;
      btn.style.cssText = "width:auto;min-width:0;padding:0 14px;white-space:nowrap;flex:none;margin-right:8px;" +
        "font-size:14px;cursor:pointer";
    } else if (btn.parentElement !== corner) {
      btn.className = "";
      btn.style.cssText = "padding:6px 12px;font:14px sans-serif;border:1px solid #888;border-radius:6px;" +
        "background:#fff;color:#000;opacity:.9";
      corner.append(btn);
    }
  };
  place();
  setInterval(place, 700);  // die Seite baut sich neu auf
  window.addEventListener("resize", () => openMenu(false));
  applyOptions();
}

// SongTreasures Sheets: fuegt unter jedes Notensystem ein zweites Notensystem
// mit den Akkorden als Blocknoten ein (wie in den Frihetsmodell-PDFs).
//
// Das Blatt ist ein einzelnes <svg>: pro Takt fuenf Linien (<path>), Taktstriche
// als <rect>, Schluessel/Vorzeichen/Noten als <g>, Akkordsymbole als <text>.

const NS = "http://www.w3.org/2000/svg";
const MARK = "data-st-chordstaff";
const LET = ["C", "D", "E", "F", "G", "A", "B"];
const NATPC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_ORDER = ["F", "C", "G", "D", "A", "E", "B"];
const FLAT_ORDER = ["B", "E", "A", "D", "G", "C", "F"];
const CHORD = /^([A-G])([#b]?)(maj|min|dim|aug|sus2|sus4|m|M|\+)?(\d+)?(add\d+)?(?:\/([A-G])([#b]?))?$/;

const accOf = (s) => (s === "#" ? 1 : s === "b" ? -1 : 0);

// Ziffernglyphen der Taktart (Breite x Hoehe, auf 0.1 gerundet), von der Seite
// ausgelesen. Jede Ziffer hat eine eigene Breite; die Zahl der Pfadbefehle
// aendert sich zwischen Versionen der Seite und taugt nicht als Merkmal.
const DIGITS = {
  "13.2x19.4": "2",
  "11.8x19.4": "3",
  "13.5x19.4": "4",
  "13.7x19.4": "6",
  "14.1x19.4": "8",
};
const BAR_KIND = {
  "2/4": "half",
  "3/4": "dotted",
  "4/4": "whole",
  "2/2": "whole",
  "3/8": "dottedQuarter",
  "6/8": "dotted",
  "9/8": "dottedWhole",
  "12/8": "dottedWhole",
  "6/4": "dottedWhole",
};
// Takt in Achteln, und welcher einzelne Notenwert welcher Dauer entspricht.
const BAR_UNITS = {
  "2/4": 4, "3/4": 6, "4/4": 8, "2/2": 8,
  "3/8": 3, "6/8": 6, "9/8": 9, "12/8": 12, "6/4": 12,
};
const COMPOUND = new Set(["3/8", "6/8", "9/8", "12/8"]);
const KIND_OF_EIGHTHS = { 2: "quarter", 3: "dottedQuarter", 4: "half", 6: "dotted", 8: "whole", 12: "dottedWhole" };

// Verteilt einen Takt (u Achtel) auf die Akkorde. Jeder Anteil muss ein
// einzelner Notenwert sein und ein Vielfaches von q (Viertel, im 6/8 punktierte
// Viertel); gewaehlt wird die Aufteilung, die den tatsaechlichen Anteilen am
// naechsten kommt. Liefert null, wenn keine passt.
function splitBar(fracs, u, q) {
  let best = null;
  let bestCost = Infinity;
  const rec = (i, left, acc, cost) => {
    if (i === fracs.length) {
      if (left === 0 && cost < bestCost) { bestCost = cost; best = [...acc]; }
      return;
    }
    const remaining = fracs.length - i - 1;
    for (let e = q; e <= left; e += q) {
      if (!KIND_OF_EIGHTHS[e]) continue;
      const rest = left - e;
      if (remaining === 0 ? rest !== 0 : rest < remaining * q) continue;
      acc.push(e);
      rec(i + 1, rest, acc, cost + Math.abs(e - fracs[i] * u));
      acc.pop();
    }
  };
  rec(0, u, [], 0);
  return best;
}

const glyphKey = (p) => {
  const n = (v) => Math.round(v * 10) / 10;
  return `${n(p.bb.width)}x${n(p.bb.height)}`;
};

// ---- Akkorde --------------------------------------------------------------

function parseChord(sym) {
  const m = CHORD.exec(sym.trim());
  if (!m) return null;
  const [, rl, ra, q = "", num = "", add = "", bl, ba] = m;
  let tones;
  if (q === "sus2") tones = [[0, 0], [1, 2], [4, 7]];
  else if (q === "sus4") tones = [[0, 0], [3, 5], [4, 7]];
  else if (q === "dim") tones = [[0, 0], [2, 3], [4, 6]];
  else if (q === "aug" || q === "+") tones = [[0, 0], [2, 4], [4, 8]];
  else if (q === "m" || q === "min") tones = [[0, 0], [2, 3], [4, 7]];
  else tones = [[0, 0], [2, 4], [4, 7]];
  const maj = q === "maj" || q === "M";
  if (num === "5") tones = [[0, 0], [4, 7]];
  else if (num === "6") tones.push([5, 9]);
  else if (num === "7") tones.push([6, maj ? 11 : q === "dim" ? 9 : 10]);
  else if (num === "9") tones.push([6, maj ? 11 : 10], [8, 14]);
  if (add === "add9") tones.push([8, 14]);

  const ri = LET.indexOf(rl);
  const rootPc = NATPC[rl] + accOf(ra);
  const spell = (li, pc) => {
    let acc = (((pc - NATPC[LET[li]]) % 12) + 12) % 12;
    if (acc > 6) acc -= 12;
    return acc;
  };
  const notes = tones.map(([off, semi]) => {
    const li = (ri + off) % 7;
    return { off, li, acc: spell(li, rootPc + semi) };
  });
  let bass = null;
  if (bl) {
    bass = { li: LET.indexOf(bl), acc: accOf(ba) };
    if (!notes.some((n) => n.li === bass.li && n.acc === bass.acc)) {
      notes.push({ off: ((bass.li - ri + 7) % 7) - 7, li: bass.li, acc: bass.acc });
    }
  }
  return { ri, notes, bass };
}

// Diatonische Stufe: E4 (untere Notenlinie im Violinschluessel) = 0.
const stepOf = (octave, li) => (octave - 4) * 7 + li - 2;

function voicings(ch) {
  const out = [];
  const want = (((ch.ri - 2) % 7) + 7) % 7;
  for (let n0 = -14; n0 <= 14; n0++) {
    if ((((n0 % 7) + 7) % 7) !== want) continue;
    let set = ch.notes.map((x) => ({ n: n0 + x.off, li: x.li, acc: x.acc }));
    set.sort((a, b) => a.n - b.n);
    for (let r = 0; r < set.length; r++) {
      const lo = set[0];
      if (!ch.bass || (lo.li === ch.bass.li && lo.acc === ch.bass.acc)) out.push(set.map((x) => ({ ...x })));
      set = set.slice(1).concat({ ...lo, n: lo.n + 7 });
      set.sort((a, b) => a.n - b.n);
    }
  }
  return out;
}

function pickVoicing(ch, prevMean) {
  const target = prevMean ?? 1.5;
  let best = null;
  let bestCost = Infinity;
  for (const v of voicings(ch)) {
    const lo = v[0].n;
    const hi = v[v.length - 1].n;
    if (lo < -5 || hi > 10) continue;
    // Bevorzugt zwischen C4 (-2) und G5 (7); weiter draussen nur mit Strafe,
    // damit Umkehrungen wie F#/A# oder C#m7/B nicht ganz wegfallen.
    const outside = Math.max(0, -2 - lo) + Math.max(0, hi - 7);
    const mean = v.reduce((s, x) => s + x.n, 0) / v.length;
    const cost = Math.abs(mean - target) + (hi - lo) * 0.05 + outside * 3;
    if (cost < bestCost) { bestCost = cost; best = v; }
  }
  return best;
}

// ---- Zeichnen -------------------------------------------------------------

function mk(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

// Zeichnet mit denselben Glyphen und Strichen wie die Seite selbst (GLYPHS,
// Hals 1.5 breit und 3.5 Linienabstaende lang, Hilfslinien 1 breit).
function glyph(name, x, yCenter, k) {
  const g = GLYPHS[name];
  return mk("path", {
    d: g.d,
    fill: "#000000",
    transform: `translate(${x} ${yCenter}) scale(${k}) translate(${-g.x} ${-(g.y + g.h / 2)})`,
  });
}

function stroke(x1, y1, x2, y2, width) {
  return mk("path", { d: `M${x1} ${y1}L${x2} ${y2}`, stroke: "#000000", "stroke-width": width, fill: "none" });
}

function drawBlock(svg, x, voicing, kind, ctx) {
  const { topY, sp, keyAcc, measureAcc } = ctx;
  const k = sp / 10;
  const yOf = (n) => topY + 4 * sp - (n * sp) / 2;
  // whole, dottedWhole: ganze Note; half, dotted: halbe (punktierte halbe);
  // quarter, dottedQuarter: Viertel (punktierte Viertel)
  const noStem = kind === "whole" || kind === "dottedWhole";
  const headName = noStem ? "whole" : kind === "quarter" || kind === "dottedQuarter" ? "filled" : "open";
  const hasDot = kind === "dotted" || kind === "dottedWhole" || kind === "dottedQuarter";
  const colW = GLYPHS.filled.w * k;
  const headW = GLYPHS[headName].w * k;

  // Sekunden: der obere Kopf kommt rechts neben den Hals
  const cols = [];
  voicing.forEach((v, i) => {
    cols.push(i > 0 && v.n - voicing[i - 1].n === 1 && cols[i - 1] === 0 ? 1 : 0);
  });

  // Vorzeichen nur, wenn der Ton von dem abweicht, was an dieser Stelle schon
  // gilt: Tonart-Vorzeichen (stehen am Zeilenanfang) oder ein Vorzeichen
  // derselben Hoehe im selben Takt.
  const accs = [];
  let accCount = 0;
  let extent = 0;
  voicing.forEach((v) => {
    const inEffect = measureAcc[v.n] ?? (keyAcc[LET[v.li]] || 0);
    measureAcc[v.n] = v.acc;
    if (v.acc === inEffect) { accs.push(null); return; }
    // Doppelkreuz als eigenes Zeichen (die Seite hat dafuer in den gesehenen
    // Liedern keine Glyphe), Doppel-B als zwei B.
    const name = v.acc > 1 ? "dsharp" : v.acc > 0 ? "sharp" : v.acc < 0 ? "flat" : "natural";
    const times = v.acc < -1 ? 2 : 1;
    const w = (name === "dsharp" ? 8 : GLYPHS[name].w) * k;
    const col = accCount % 2;
    accCount++;
    accs.push({ name, times, col, w });
    extent = Math.max(extent, 2.5 * k + w + col * (w + 1.5 * k) + (times - 1) * (w + 1));
  });
  // Genug Platz links, damit Vorzeichen nicht an Taktstrich, Taktart oder
  // Tonartvorzeichen stossen.
  x += Math.max(0, (ctx.left ?? 0) + 3 - (x - extent));

  const g = mk("g", { "data-st-chordel": "1" });
  voicing.forEach((v, i) => {
    const y = yOf(v.n);
    const hx = x + cols[i] * colW;
    // Hilfslinien
    const ledgers = [];
    if (v.n <= -2) for (let n = -2; n >= v.n; n -= 2) ledgers.push(n);
    else if (v.n >= 10) for (let n = 10; n <= v.n; n += 2) ledgers.push(n);
    for (const n of ledgers) g.append(stroke(hx - 3 * k, yOf(n), hx + headW + 3 * k, yOf(n), 1));

    g.append(glyph(headName, hx, y, k));

    const a = accs[i];
    if (a && a.name === "dsharp") {
      const cx = hx - 2.5 * k - a.w / 2 - a.col * (a.w + 1.5 * k);
      const r = 3.2 * k;
      g.append(mk("path", {
        d: `M${cx - r} ${y - r}L${cx + r} ${y + r}M${cx + r} ${y - r}L${cx - r} ${y + r}`,
        stroke: "#000000", "stroke-width": 2 * k, fill: "none",
      }));
    } else if (a) {
      const gl = GLYPHS[a.name];
      for (let t = 0; t < a.times; t++) {
        const ax = hx - 2.5 * k - a.w - a.col * (a.w + 1.5 * k) - t * (a.w + 1);
        g.append(mk("path", {
          d: gl.d,
          fill: "#000000",
          transform: `translate(${ax} ${y}) scale(${k}) translate(${-gl.x} ${-(gl.y + gl.h / 2)})`,
        }));
      }
    }
  });

  const lowY = yOf(voicing[0].n);
  const highY = yOf(voicing[voicing.length - 1].n);
  if (!noStem) {
    const sx = x + colW - 0.75 * k;
    g.append(stroke(sx, lowY, sx, highY - 3.5 * sp, 1.5));
  }
  if (hasDot) {
    const dx = x + headW + (cols.includes(1) ? colW : 0) + 4.5 * k;
    voicing.forEach((v) => {
      const y = yOf(v.n) - (v.n % 2 === 0 ? sp / 2 : 0);
      g.append(glyph("dot", dx, y, k));
    });
  }
  svg.append(g);
}

// ---- Auswertung des SVG ---------------------------------------------------

const r1 = (v) => Math.round(v * 10) / 10;

function annotate(svg) {
  if (svg.hasAttribute(MARK)) return;
  const vb = (svg.getAttribute("viewBox") || "").trim().split(/\s+/).map(Number);
  if (vb.length !== 4 || vb.some(Number.isNaN)) return;

  // Aufbau des SVG (VexFlow): pro System ein <g class="staffline"> mit den Takten
  // (<g class="vf-measure">: fuenf Linien, Taktstrich, am Zeilenanfang Schluessel,
  // Vorzeichen und Taktart, dazu die Notenelemente) und den Akkordtexten
  // (<g class="vf-text">). Daneben je ein <g class="vf-text measure-number">.
  const has = (el, cls) => !!el.classList && el.classList.contains(cls);
  const bbox = (el) => { try { return el.getBBox(); } catch { return null; } };

  const systems = [];
  let sp = 0;
  for (const sg of svg.children) {
    if (sg.tagName !== "g" || !has(sg, "staffline")) continue;
    const measures = [];
    let y0 = Infinity;
    let y4 = -Infinity;
    for (const me of sg.children) {
      if (!has(me, "vf-measure")) continue;
      let x = Infinity;
      let x2 = -Infinity;
      for (const p of me.children) {
        if (p.tagName !== "path") continue;
        const b = bbox(p);
        if (!b || b.height !== 0 || b.width <= 20) continue;  // Notenlinie
        x = Math.min(x, b.x);
        x2 = Math.max(x2, b.x + b.width);
        y0 = Math.min(y0, b.y);
        y4 = Math.max(y4, b.y);
      }
      if (Number.isFinite(x)) measures.push({ x, x2, el: me });
    }
    if (!measures.length) continue;
    measures.sort((a, b) => a.x - b.x);
    sp = (y4 - y0) / 4;
    systems.push({ el: sg, y0, measures, dy: 0, chords: [] });
  }
  if (!systems.length || !(sp > 3 && sp < 30)) return;

  for (const s of systems) {
    for (const c of s.el.children) {
      if (!has(c, "vf-text")) continue;
      for (const t of c.querySelectorAll("text")) {
        const chord = parseChord(t.textContent);
        const x = parseFloat(t.getAttribute("x"));
        const y = parseFloat(t.getAttribute("y"));
        if (chord && Number.isFinite(x) && Number.isFinite(y)) s.chords.push({ chord, x, y });
      }
    }
  }
  if (!systems.some((s) => s.chords.length)) return;
  svg.setAttribute(MARK, "1");
  try { svg.setAttribute("data-st-version", chrome.runtime.getManifest().version); } catch { /* nur Anzeige */ }

  // Oberste Ebene: die Systeme und alles andere (Taktzahlen, Titel ...)
  const items = [];
  for (const el of svg.children) {
    const bb = bbox(el);
    if (bb) items.push({ el, bb, sys: systems.findIndex((s) => s.el === el) });
  }
  const ADD = 8 * sp;
  // Was kein System ist und mehr als 1.5 Linienabstaende unter dem vorigen
  // System beginnt, gehoert zum naechsten (Taktzahlen stehen ueber dem System).
  const bandOf = (top) => {
    let s = 0;
    for (let k = 1; k < systems.length; k++) if (top >= systems[k - 1].y0 + 5.5 * sp) s = k;
    return s;
  };
  systems.forEach((s, k) => { s.dy = k * ADD; });

  // Vorspann (Schluessel, Vorzeichen, Taktart) und Taktstriche je System
  const clones = [];
  let keyAcc = {};
  let barKind = "whole";
  let barUnits = 8;
  let compound = false;
  systems.forEach((s, k) => {
    const first = s.measures[0];
    const prefix = [...first.el.children]
      .filter((c) => c.tagName === "g" && (has(c, "vf-clef") || has(c, "vf-keysignature") || has(c, "vf-timesignature")))
      .map((el) => ({ el, bb: bbox(el) }))
      .filter((p) => p.bb && p.bb.width > 0);
    s.prefixEnd = prefix.length ? Math.max(...prefix.map((p) => p.bb.x + p.bb.width)) : first.x;
    for (const p of prefix) {
      const c = p.el.cloneNode(true);
      const old = c.getAttribute("transform");
      c.setAttribute("transform", `translate(0 ${s.dy + 7 * sp})` + (old ? ` ${old}` : ""));
      clones.push(c);
    }
    for (const m of s.measures) {
      for (const r of m.el.children) {
        if (r.tagName !== "rect") continue;
        const b = bbox(r);
        if (!b || b.height < 3.5 * sp) continue;
        const c = r.cloneNode(false);
        c.setAttribute("y", String(b.y + s.dy + 7 * sp));
        c.removeAttribute("transform");
        clones.push(c);
      }
    }
    // Linien
    const x1 = Math.min(...s.measures.map((m) => m.x));
    const x2 = Math.max(...s.measures.map((m) => m.x2));
    for (let j = 0; j < 5; j++) {
      clones.push(mk("path", { d: `M${x1} ${s.y0 + s.dy + 7 * sp + j * sp} H${x2}`, stroke: "#000", "stroke-width": 1, fill: "none" }));
    }
    clones.push(mk("rect", { x: x1, y: s.y0 + s.dy, width: 1, height: 11 * sp, fill: "#000" }));

    if (k === 0) {
      // Vorzeichen: Anzahl der Zeichen und Kreuz/B aus der Lage des ersten Zeichens
      const keyEl = prefix.find((p) => has(p.el, "vf-keysignature"));
      const keyPaths = keyEl ? [...keyEl.el.querySelectorAll("path")] : [];
      if (keyPaths.length > 0) {
        const f = bbox(keyPaths[0]);
        if (f) {
          const centre = f.y + f.height / 2;
          const sharps = Math.abs(centre - s.y0) < Math.abs(centre - (s.y0 + 2 * sp));
          const order = sharps ? SHARP_ORDER : FLAT_ORDER;
          keyAcc = {};
          order.slice(0, Math.min(keyPaths.length, 7)).forEach((l) => { keyAcc[l] = sharps ? 1 : -1; });
        }
      }
      // Taktart aus den Ziffernglyphen (oben Zaehler, unten Nenner). Der Takt
      // wird mit einem einzigen Notenwert gefuellt, der der Taktart entspricht.
      const tsEl = prefix.find((p) => has(p.el, "vf-timesignature"));
      const ts = tsEl
        ? [...tsEl.el.querySelectorAll("path")].map((el) => ({ el, bb: bbox(el) })).filter((p) => p.bb)
        : [];
      const rowOf = (p) => (p.bb.y + p.bb.height / 2 < s.y0 + 2 * sp ? 0 : 1);
      const digits = [0, 1].map((r) => ts
        .filter((p) => rowOf(p) === r)
        .sort((a, b) => a.bb.x - b.bb.x)
        .map((p) => DIGITS[glyphKey(p)] ?? "?")
        .join(""));
      barKind = BAR_KIND[digits.join("/")] ?? barKind;
      barUnits = BAR_UNITS[digits.join("/")] ?? 0;
      compound = COMPOUND.has(digits.join("/"));
      if (!BAR_KIND[digits.join("/")] && ts.length === 2) {
        // Unbekannte Ziffern: gleich breit oben und unten wie 4/4, sonst 3/4
        barKind = Math.abs(ts[0].bb.width - ts[1].bb.width) < 0.5 ? "whole" : "dotted";
        barUnits = barKind === "whole" ? 8 : 6;
      }
    }
  });

  // Akkorde in Takte einordnen und zeichnen
  const out = [];
  let carry = null;
  let prevMean = null;
  systems.forEach((s, k) => {
    const sys = s.chords;
    s.measures.forEach((m, mi) => {
      const lo = mi === 0 ? Math.max(m.x, s.prefixEnd) : m.x;
      const inMeasure = sys.filter((c) => c.x >= m.x - 0.5 && c.x < m.x2).sort((a, b) => a.x - b.x);
      const width = m.x2 - lo;
      // Akkorde, die in diesem Takt erklingen, mit ihrer Dauer. Ohne eigenes
      // Symbol (oder wenn das erste erst spaeter kommt) gilt der vorige weiter.
      const entries = [];
      if (carry && (inMeasure.length === 0 || inMeasure[0].x - lo > 0.3 * width)) {
        entries.push({ chord: carry, x: lo });
      }
      inMeasure.forEach((c) => entries.push({ chord: c.chord, x: c.x }));
      if (entries.length === 0) return;
      // Der Takt wird immer ganz gefuellt: ein Akkord = ein Block mit dem Wert
      // des ganzen Taktes; wechselt der Akkord im Takt, bekommt jeder Akkord den
      // Notenwert, der seinem Anteil am naechsten kommt und alle zusammen
      // ergeben den Takt (z. B. 4/4 halbe + halbe).
      const spans = entries.map((e, i) => Math.max(1, (i + 1 < entries.length ? entries[i + 1].x : m.x2) - e.x));
      const total = spans.reduce((a, b) => a + b, 0);
      let parts = null;
      if (entries.length > 1 && barUnits > 0) {
        parts = splitBar(spans.map((sp_) => sp_ / total), barUnits, compound ? 3 : 2);
      }
      if (parts) {
        entries.forEach((e, i) => {
          out.push({
            k, mid: `${k}:${mi}`, left: lo, chord: e.chord, kind: KIND_OF_EIGHTHS[parts[i]],
            x: i === 0 ? lo + (mi === 0 ? 12 : 17) : e.x + 4,
          });
        });
      } else {
        // Ein Akkord (oder keine passende Aufteilung): der, der laenger erklingt
        let pick = entries[0];
        let best = -1;
        entries.forEach((e, i) => { if (spans[i] > best + 0.5) { best = spans[i]; pick = e; } });
        out.push({ k, mid: `${k}:${mi}`, x: lo + (mi === 0 ? 12 : 17), left: lo, chord: pick.chord, kind: barKind });
      }
      carry = entries[entries.length - 1].chord;
    });
  });

  // Verschieben und einfuegen
  const shifted = [];
  items.forEach((i) => {
    const band = i.sys >= 0 ? i.sys : bandOf(i.bb.y);
    let dy = systems[band].dy;
    // Nur reiner Text unter dem letzten System (Fusszeile, Strophen) rutscht
    // unter die neue Zeile.
    const textOnly = i.el.tagName === "text" || (i.el.querySelector("text") && !i.el.querySelector("path"));
    if (i.sys < 0 && band === systems.length - 1 && textOnly && i.bb.y > systems[band].y0 + 5 * sp) dy += ADD;
    if (dy) {
      const old = i.el.getAttribute("transform");
      const on = `translate(0 ${dy})` + (old ? ` ${old}` : "");
      i.el.setAttribute("transform", on);
      shifted.push({ el: i.el, off: old, on });
    }
  });
  const vbOff = vb.join(" ");
  vb[3] += systems.length * ADD;
  svg.setAttribute("viewBox", vb.join(" "));
  for (const c of clones) { c.setAttribute("data-st-chordel", "1"); svg.append(c); }
  // Akkordzeile ein-/ausblenden: Verschiebungen und viewBox zuruecknehmen
  const vbOn = vb.join(" ");
  svg.__stChordRow = (show) => {
    for (const it of shifted) {
      const v = show ? it.on : it.off;
      if (v == null) it.el.removeAttribute("transform"); else it.el.setAttribute("transform", v);
    }
    svg.setAttribute("viewBox", show ? vbOn : vbOff);
    for (const e of svg.querySelectorAll("[data-st-chordel]")) e.style.display = show ? "" : "none";
  };
  // Ein Vorzeichen gilt im Takt fuer dieselbe Tonhoehe weiter, ausserdem
  // stehen die Vorzeichen der Tonart schon am Zeilenanfang (keyAcc).
  let curMeasure = null;
  let measureAcc = {};
  for (const o of out) {
    const s = systems[o.k];
    const v = pickVoicing(o.chord, prevMean);
    if (!v) continue;
    prevMean = v.reduce((sum, x) => sum + x.n, 0) / v.length;
    if (o.mid !== curMeasure) { curMeasure = o.mid; measureAcc = {}; }
    drawBlock(svg, o.x, v, o.kind, { topY: s.y0 + s.dy + 7 * sp, sp, keyAcc, measureAcc, left: o.left });
  }

  // Zweite Stimme (Terz tiefer, an die Akkordtoene angepasst) in den Melodiesystemen
  try { drawSecondVoice(svg, systems, { sp, keyAcc }); } catch (e) { console.error("[voice 2]", e); }
  if (!ST_OPTS.chords) svg.__stChordRow(false);
}

// Beim Liedwechsel ist das neue SVG manchmal noch nicht ausgemessen (getBBox
// liefert 0) und es kommt danach keine weitere DOM-Aenderung. Deshalb pro SVG
// mehrere Versuche, zusaetzlich zum MutationObserver ein kurzer Poll.
const MAX_TRIES = 40;

// Nur Poll-Durchlaeufe zaehlen als Versuch (eine Aenderung der Seite loest
// viele Mutationen kurz hintereinander aus).
function scan(countTry) {
  document.querySelectorAll("svg").forEach((svg) => {
    if (svg.hasAttribute(MARK)) return;
    const tries = Number(svg.getAttribute("data-st-tries") || 0);
    if (tries >= MAX_TRIES) return;
    if (svg.querySelectorAll("*").length < 30) return;  // Icons
    if (countTry) svg.setAttribute("data-st-tries", String(tries + 1));
    try { annotate(svg); } catch (e) { console.error("[chord staff]", e); }
  });
}

setupOptionsMenu();
new MutationObserver(() => scan(false)).observe(document.body, { childList: true, subtree: true });
setInterval(() => scan(true), 300);
scan(false);
})();
