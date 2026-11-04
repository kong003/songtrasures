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

  const g = mk("g", {});
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
  items.forEach((i) => {
    const band = i.sys >= 0 ? i.sys : bandOf(i.bb.y);
    let dy = systems[band].dy;
    // Nur reiner Text unter dem letzten System (Fusszeile, Strophen) rutscht
    // unter die neue Zeile.
    const textOnly = i.el.tagName === "text" || (i.el.querySelector("text") && !i.el.querySelector("path"));
    if (i.sys < 0 && band === systems.length - 1 && textOnly && i.bb.y > systems[band].y0 + 5 * sp) dy += ADD;
    if (dy) {
      const old = i.el.getAttribute("transform");
      i.el.setAttribute("transform", `translate(0 ${dy})` + (old ? ` ${old}` : ""));
    }
  });
  vb[3] += systems.length * ADD;
  svg.setAttribute("viewBox", vb.join(" "));
  for (const c of clones) svg.append(c);
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

new MutationObserver(() => scan(false)).observe(document.body, { childList: true, subtree: true });
setInterval(() => scan(true), 300);
scan(false);
