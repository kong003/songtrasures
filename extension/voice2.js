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

// Knopf unten rechts, darueber ein kleines Menue mit zwei Haken.
function setupOptionsMenu() {
  const style = document.createElement("style");
  style.textContent = 'html[data-st-v2="0"] [data-st-v2el]{display:none}';
  document.head.append(style);
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;top:8px;right:60px;z-index:99999;font:14px sans-serif;color:#000;text-align:right";
  const menu = document.createElement("div");
  menu.style.cssText = "display:none;margin-top:6px;padding:8px 12px;background:#fff;border:1px solid #888;" +
    "border-radius:8px;text-align:left;box-shadow:0 2px 8px rgba(0,0,0,.25)";
  const btn = document.createElement("button");
  btn.textContent = "Anzeige";
  btn.style.cssText = "padding:6px 12px;font:14px sans-serif;border:1px solid #888;border-radius:6px;background:#fff;color:#000;opacity:.9";
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
  btn.addEventListener("click", () => { menu.style.display = menu.style.display === "none" ? "block" : "none"; });
  box.append(btn, menu);
  document.body.append(box);

  // Neben das Zahnrad (Einstellungen) setzen: Element mit passendem Namen im
  // oberen Bildschirmbereich suchen und den Knopf links davon ausrichten. Wird
  // keins gefunden, bleibt er oben rechts. Die Seite baut sich neu auf, daher
  // regelmaessig nachziehen.
  const GEAR = /settings|einstellung|gear|cog|zahnrad|setting/i;
  const LOGIN = /^\s*(log\s?in|sign\s?in|anmelden|einloggen)\s*$/i;
  // Elemente der Kopfzeile: Zahnrad (nach Name) und Login (nach Text)
  const headerItems = () => {
    const out = [];
    for (const e of document.querySelectorAll("button,a,[role=button],svg,i,span,div")) {
      if (box.contains(e)) continue;
      const key = [e.getAttribute("aria-label"), e.getAttribute("title"), e.getAttribute("data-testid"),
        typeof e.className === "string" ? e.className : e.getAttribute("class"), e.id].filter(Boolean).join(" ");
      const isGear = GEAR.test(key);
      const isLogin = e.children.length <= 2 && LOGIN.test(e.textContent || "");
      if (!isGear && !isLogin) continue;
      const r = e.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.width > 200 || r.height > 120 || r.top > 150) continue;
      out.push({ r, isGear });
    }
    return out;
  };
  // Bezugszeile: das Zahnrad, sonst Login; links von allem in derselben Zeile
  const findAnchor = () => {
    const items = headerItems();
    if (!items.length) return null;
    const ref = (items.filter((x) => x.isGear)[0] || items[0]).r;
    const cy = ref.top + ref.height / 2;
    const row = items.map((x) => x.r).filter((r) => Math.abs(r.top + r.height / 2 - cy) < 25);
    return { cy, left: Math.min(...row.map((r) => r.left)) };
  };
  const place = () => {
    const a = findAnchor();
    if (a) {
      box.style.top = Math.max(0, a.cy - btn.offsetHeight / 2) + "px";
      box.style.right = Math.max(0, window.innerWidth - a.left + 8) + "px";
    } else {
      box.style.top = "8px";
      box.style.right = "60px";
    }
  };
  place();
  setInterval(place, 700);
  window.addEventListener("resize", place);
  applyOptions();
}

if (typeof module !== "undefined") module.exports = { harmonyBelow, v2Midi };
