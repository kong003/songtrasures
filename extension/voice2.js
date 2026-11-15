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

// Zeichnet die zweite Stimme in die Melodiesysteme (je Notenkopf ein Kopf darunter).
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

// Schalter unten rechts; der Zustand wird gemerkt.
function setupVoiceToggle() {
  const KEY = "st-voice2";
  let on = true;
  try { on = localStorage.getItem(KEY) !== "0"; } catch { /* egal */ }
  const root = document.documentElement;
  const style = document.createElement("style");
  style.textContent = 'html[data-st-v2="0"] [data-st-v2el]{display:none}';
  document.head.append(style);
  const btn = document.createElement("button");
  btn.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:99999;padding:6px 10px;" +
    "font:13px sans-serif;border:1px solid #888;border-radius:6px;background:#fff;color:#000;opacity:.85";
  const apply = () => {
    root.setAttribute("data-st-v2", on ? "1" : "0");
    btn.textContent = on ? "2. Stimme: an" : "2. Stimme: aus";
  };
  btn.addEventListener("click", () => {
    on = !on;
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* egal */ }
    apply();
  });
  apply();
  document.body.append(btn);
}

if (typeof module !== "undefined") module.exports = { harmonyBelow, v2Midi };
