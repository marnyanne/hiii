import React, { useState, useMemo, useRef, useEffect } from "react";
import { Sparkles, Moon, Sun, Compass, RotateCcw, Wand2 } from "lucide-react";

/* ---------------------------------------------------------
   DECK DATA
--------------------------------------------------------- */

const MAJOR = [
  ["The Fool", "New beginnings, a leap of faith, unlimited potential.", "Recklessness, hesitation, a leap not yet taken."],
  ["The Magician", "Resourcefulness, willpower, turning intention into action.", "Untapped talent, manipulation, scattered focus."],
  ["The High Priestess", "Intuition, the unseen, quiet inner knowing.", "Disconnection from instinct, secrets kept too long."],
  ["The Empress", "Abundance, nurturing, creativity coming to life.", "Neglect, creative block, smothering care."],
  ["The Emperor", "Structure, authority, steady discipline.", "Rigidity, control issues, instability beneath the order."],
  ["The Hierophant", "Tradition, shared belief, learning from established paths.", "Questioning convention, breaking from doctrine."],
  ["The Lovers", "A meaningful choice, alignment of values, union.", "Misalignment, a choice avoided, imbalance in a bond."],
  ["The Chariot", "Willpower, forward motion, victory through focus.", "Lack of direction, aggression, losing control of the reins."],
  ["Strength", "Quiet courage, patience, taming difficulty with compassion.", "Self-doubt, forcing an issue, depleted resolve."],
  ["The Hermit", "Introspection, solitude with purpose, inner guidance.", "Isolation, withdrawing too far, avoiding the answer within."],
  ["Wheel of Fortune", "Cycles turning, change arriving, fate in motion.", "Resistance to change, a cycle repeating, bad timing."],
  ["Justice", "Truth, fairness, cause meeting effect.", "Imbalance, avoidance of accountability, an unresolved matter."],
  ["The Hanged Man", "A pause, seeing from a new angle, surrender.", "Stalling, resisting a needed shift in view."],
  ["Death", "An ending that clears space, transformation.", "Fear of change, clinging to what has already closed."],
  ["Temperance", "Balance, patience, blending opposites into harmony.", "Excess, discord, impatience with the process."],
  ["The Devil", "Attachment, a bind of one's own making, temptation.", "Loosening a grip, reclaiming power, breaking a pattern."],
  ["The Tower", "Sudden upheaval, a false structure collapsing.", "Averted disaster, delayed reckoning, fear of change."],
  ["The Star", "Hope renewed, quiet faith after hardship.", "Discouragement, disconnection from hope."],
  ["The Moon", "Uncertainty, the subconscious, things not yet clear.", "Confusion lifting, hidden fears surfacing to be named."],
  ["The Sun", "Clarity, joy, things working out openly.", "Clouded joy, delayed success, temporary gloom."],
  ["Judgement", "A reckoning, awakening, answering a call.", "Self-doubt, avoiding a necessary reflection."],
  ["The World", "Completion, wholeness, a cycle fulfilled.", "Unfinished business, a delayed sense of closure."],
];

const SUITS = [
  { name: "Wands", domain: "action, ambition, and creative fire", reversedDomain: "stalled momentum, burnout, or misdirected drive" },
  { name: "Cups", domain: "emotion, connection, and intuition", reversedDomain: "guarded feeling, emotional imbalance, or old hurt resurfacing" },
  { name: "Swords", domain: "thought, conflict, and truth-telling", reversedDomain: "confusion, overthinking, or a truth avoided" },
  { name: "Pentacles", domain: "the material world, work, and the body", reversedDomain: "instability, overwork, or neglected foundations" },
];

const RANKS = [
  ["Ace", "a fresh spark"],
  ["Two", "a choice or a balance being weighed"],
  ["Three", "early growth, the first sign something is working"],
  ["Four", "a pause to steady what's been built"],
  ["Five", "friction, competition, or a test"],
  ["Six", "cooperation, relief, or a return to harmony"],
  ["Seven", "a moment to assess before committing further"],
  ["Eight", "movement, momentum, a shift in pace"],
  ["Nine", "nearing the finish, close to what's wanted"],
  ["Ten", "an arc reaching its full weight"],
  ["Page", "a message, a student's curiosity, a small beginning"],
  ["Knight", "pursuit, motion toward a goal, single-mindedness"],
  ["Queen", "mature, inward mastery"],
  ["King", "mature, outward command"],
];

function buildDeck() {
  const deck = [];
  MAJOR.forEach(([name, up, rev]) => {
    deck.push({ name, arcana: "major", upright: up, reversed: rev, accent: "#A8556B" });
  });
  const accents = { Wands: "#C97B3D", Cups: "#5C7A96", Swords: "#7A8496", Pentacles: "#6B7A4F" };
  SUITS.forEach((suit) => {
    RANKS.forEach(([rank, ranktheme]) => {
      const name = `${rank} of ${suit.name}`;
      deck.push({
        name,
        arcana: "minor",
        upright: `${ranktheme[0].toUpperCase() + ranktheme.slice(1)}, in the realm of ${suit.domain}.`,
        reversed: `${ranktheme[0].toUpperCase() + ranktheme.slice(1)}, turned inward as ${suit.reversedDomain}.`,
        accent: accents[suit.name],
      });
    });
  });
  return deck;
}

const DECK = buildDeck();

/* ---------------------------------------------------------
   SPREADS
--------------------------------------------------------- */

const SPREADS = {
  single: {
    label: "Single Card",
    subtitle: "One card, straight clarity",
    positions: ["The heart of it"],
  },
  three: {
    label: "Three Card",
    subtitle: "Past · Present · Future",
    positions: ["Past", "Present", "Future"],
  },
  relationship: {
    label: "Relationship Cross",
    subtitle: "Five cards on a bond between two people",
    positions: ["You", "Them", "The connection", "The challenge", "Where it's heading"],
  },
  celtic: {
    label: "Celtic Cross",
    subtitle: "Ten cards, the full picture",
    positions: [
      "The heart of the matter",
      "What crosses it",
      "The foundation",
      "The recent past",
      "What crowns it",
      "What's ahead",
      "How you see it",
      "Outside influences",
      "Hopes and fears",
      "Where it's headed",
    ],
  },
  yesno: {
    label: "Yes / No",
    subtitle: "Three cards, weighed together",
    positions: ["First voice", "Second voice", "Deciding voice"],
  },
};

function suggestSpread(question) {
  const q = question.toLowerCase();
  if (/\b(should i|will (he|she|they|it|we)|yes or no|is it a good idea)\b/.test(q)) return "yesno";
  if (/\b(him|her|them|us|relationship|partner|boyfriend|girlfriend|marriage|ex\b|love)\b/.test(q)) return "relationship";
  if (q.split(/\s+/).length > 16 || /\b(everything|situation|what's going on|whole picture|life)\b/.test(q)) return "celtic";
  if (q.trim().length === 0) return "three";
  return "three";
}

/* ---------------------------------------------------------
   THEMES
--------------------------------------------------------- */

const THEMES = {
  brass: {
    label: "Celestial Brass",
    bg: "#14162A",
    bg2: "#1D2038",
    ink: "#F1E7D3",
    sub: "#B9AFC9",
    accent: "#C9A24B",
    cardBack: "linear-gradient(135deg, #1D2038 0%, #2A2D4C 100%)",
    cardFace: "#F1E7D3",
    cardFaceInk: "#20213A",
    line: "rgba(201,162,75,0.35)",
  },
  sakura: {
    label: "Sakura Bloom",
    bg: "#241722",
    bg2: "#33202F",
    ink: "#FBEAF0",
    sub: "#D7AFC1",
    accent: "#E88EA8",
    cardBack: "linear-gradient(135deg, #33202F 0%, #4A2A3F 100%)",
    cardFace: "#FBEAF0",
    cardFaceInk: "#3A1F30",
    line: "rgba(232,142,168,0.35)",
  },
  midnight: {
    label: "Midnight Ink",
    bg: "#0A0A0C",
    bg2: "#131316",
    ink: "#EDEDED",
    sub: "#9A9A9E",
    accent: "#8F8FA3",
    cardBack: "linear-gradient(135deg, #131316 0%, #1C1C22 100%)",
    cardFace: "#EDEDED",
    cardFaceInk: "#131316",
    line: "rgba(143,143,163,0.35)",
  },
};

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

function shuffledDraw(n) {
  const idx = DECK.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, n).map((i) => ({
    ...DECK[i],
    reversed: Math.random() < 0.28,
  }));
}

/* ---------------------------------------------------------
   COMPASS LOADER
--------------------------------------------------------- */

function CompassLoader({ accent }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ animation: "spin 3.5s linear infinite" }}>
      <circle cx="32" cy="32" r="29" fill="none" stroke={accent} strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="20" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.35" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="32"
          y1="6"
          x2="32"
          y2={deg % 90 === 0 ? "12" : "10"}
          stroke={accent}
          strokeWidth="1"
          transform={`rotate(${deg} 32 32)`}
          opacity={deg % 90 === 0 ? 0.9 : 0.4}
        />
      ))}
      <polygon points="32,14 36,32 32,50 28,32" fill={accent} opacity="0.85" />
    </svg>
  );
}

/* ---------------------------------------------------------
   CARD
--------------------------------------------------------- */

function Card({ card, position, revealed, theme, delay, onClick, size = "md" }) {
  const dims = size === "sm" ? { w: 92, h: 148 } : { w: 116, h: 186 };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: dims.w }}>
      <div
        style={{
          fontFamily: "'Work Sans', sans-serif",
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: theme.sub,
          textAlign: "center",
          minHeight: 28,
          lineHeight: 1.3,
        }}
      >
        {position}
      </div>
      <div
        onClick={onClick}
        style={{
          width: dims.w,
          height: dims.h,
          perspective: 800,
          cursor: onClick ? "pointer" : "default",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: `transform 0.7s cubic-bezier(0.4,0.1,0.2,1) ${delay}ms`,
            transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
            opacity: revealed === null ? 0 : 1,
          }}
        >
          {/* back */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              borderRadius: 10,
              background: theme.cardBack,
              border: `1px solid ${theme.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="60%" height="60%" viewBox="0 0 40 40">
              <rect x="1" y="1" width="38" height="38" fill="none" stroke={theme.accent} strokeWidth="0.6" opacity="0.6" />
              <circle cx="20" cy="20" r="12" fill="none" stroke={theme.accent} strokeWidth="0.6" opacity="0.8" />
              <circle cx="20" cy="20" r="4" fill={theme.accent} opacity="0.8" />
            </svg>
          </div>
          {/* face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: 10,
              background: theme.cardFace,
              border: `1px solid ${card.accent}55`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
              boxSizing: "border-box",
              rotate: card.reversed ? "180deg" : "0deg",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                border: `1px solid ${card.accent}66`,
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: card.accent,
                  opacity: 0.85,
                }}
              />
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: size === "sm" ? 12.5 : 14,
                  textAlign: "center",
                  color: theme.cardFaceInk,
                  lineHeight: 1.15,
                }}
              >
                {card.name}
              </div>
            </div>
          </div>
        </div>
      </div>
      {revealed && (
        <div
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 11,
            color: card.reversed ? theme.accent : theme.sub,
            textAlign: "center",
            minHeight: 14,
          }}
        >
          {card.reversed ? "Reversed" : "Upright"}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */

export default function TarotApp() {
  const [question, setQuestion] = useState("");
  const [spreadKey, setSpreadKey] = useState(null);
  const [themeKey, setThemeKey] = useState("brass");
  const [phase, setPhase] = useState("input"); // input -> shuffle -> reveal -> interpreting -> done
  const [cards, setCards] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [interpretation, setInterpretation] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const theme = THEMES[themeKey];
  const suggested = useMemo(() => suggestSpread(question), [question]);
  const activeSpreadKey = spreadKey || suggested;
  const spread = SPREADS[activeSpreadKey];

  useEffect(() => {
    if (phase !== "reveal") return;
    if (revealedCount >= cards.length) {
      const t = setTimeout(() => runInterpretation(), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealedCount((c) => c + 1), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, revealedCount, cards]);

  function startReading() {
    const n = SPREADS[activeSpreadKey].positions.length;
    const drawn = shuffledDraw(n);
    setCards(drawn);
    setRevealedCount(0);
    setInterpretation("");
    setError("");
    setPhase("shuffle");
    setTimeout(() => setPhase("reveal"), 1400);
  }

  async function runInterpretation() {
    setPhase("interpreting");
    try {
      const cardLines = cards
        .map((c, i) => {
          const meaning = c.reversed ? c.reversed : c.upright;
          return `${i + 1}. Position "${spread.positions[i]}": ${c.name}${c.reversed ? " (reversed)" : " (upright)"} — baseline meaning: ${meaning}`;
        })
        .join("\n");

      const prompt = `A person is doing a "${spread.label}" tarot reading (${spread.subtitle}).
Their question or focus: "${question.trim() || "(no specific question given — a general reading)"}"

The cards drawn, in position order:
${cardLines}

Write a warm, grounded, specific interpretation of this spread as it relates to their question. Weave the positions together into a cohesive narrative rather than a flat list — show how the cards speak to each other. Where a card is reversed, treat it as an inward or blocked expression of its theme, not simply "bad." Avoid generic fortune-telling filler and avoid being preachy. Keep it to 160-230 words. Do not use markdown headers. Plain prose, maybe 2-3 short paragraphs.`;

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), 25000);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      clearTimeout(timeout);

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("The response wasn't valid — the connection may have dropped mid-reply.");
      }

      if (!response.ok) {
        const msg = data?.error?.message || `Request failed (${response.status}).`;
        throw new Error(msg);
      }

      const text = (data.content || [])
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim();

      if (!text) {
        throw new Error("The reading came back empty.");
      }

      setInterpretation(text);
      setError("");
    } catch (e) {
      const detail = e?.name === "AbortError" ? "It took too long to respond." : e?.message || "Something went wrong.";
      setError(`Couldn't load the interpretation — ${detail} The cards above are still valid; you can read them yourself, or try again.`);
      setInterpretation("");
    } finally {
      setPhase("done");
    }
  }

  function reset() {
    setPhase("input");
    setCards([]);
    setRevealedCount(0);
    setInterpretation("");
    setError("");
    setSpreadKey(null);
  }

  const positions = spread.positions;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at top, ${theme.bg2} 0%, ${theme.bg} 60%)`,
        color: theme.ink,
        fontFamily: "'Work Sans', sans-serif",
        padding: "28px 16px 60px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap');
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${theme.sub}; opacity: 0.7; }
        button { font-family: inherit; }
        .tarot-chip {
          transition: all 0.15s ease;
        }
        .tarot-chip:focus-visible, .tarot-btn:focus-visible {
          outline: 2px solid ${theme.accent};
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Moon size={18} color={theme.accent} />
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "0.01em",
            }}
          >
            Card Table
          </div>
        </div>
        <div style={{ color: theme.sub, fontSize: 13.5, marginBottom: 26 }}>
          A quiet place to lay out the cards and see what they say.
        </div>

        {phase === "input" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: theme.sub }}>
                What's on your mind?
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question, or leave it open and just draw."
                rows={3}
                style={{
                  width: "100%",
                  marginTop: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${theme.line}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: theme.ink,
                  fontSize: 15,
                  fontFamily: "'Cormorant Garamond', serif",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: theme.sub }}>
                Spread {!spreadKey && question.trim() && <span style={{ color: theme.accent }}>· suggested</span>}
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {Object.entries(SPREADS).map(([key, s]) => {
                  const active = activeSpreadKey === key;
                  return (
                    <button
                      key={key}
                      className="tarot-chip"
                      onClick={() => setSpreadKey(key)}
                      style={{
                        padding: "9px 13px",
                        borderRadius: 999,
                        border: `1px solid ${active ? theme.accent : theme.line}`,
                        background: active ? `${theme.accent}22` : "transparent",
                        color: active ? theme.ink : theme.sub,
                        fontSize: 13,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{s.label}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 12.5, color: theme.sub, marginTop: 8 }}>{spread.subtitle}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: theme.sub }}>
                Deck style
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    className="tarot-chip"
                    onClick={() => setThemeKey(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: `1px solid ${themeKey === key ? t.accent : theme.line}`,
                      background: themeKey === key ? `${t.accent}22` : "transparent",
                      color: theme.ink,
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.accent, display: "inline-block" }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="tarot-btn"
              onClick={startReading}
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 20px",
                borderRadius: 12,
                border: "none",
                background: theme.accent,
                color: theme.bg,
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              <Sparkles size={17} />
              Shuffle &amp; draw
            </button>
          </div>
        )}

        {(phase === "shuffle" || phase === "reveal" || phase === "interpreting" || phase === "done") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 }}>
                  {spread.label}
                </div>
                {question.trim() && (
                  <div style={{ fontSize: 13, color: theme.sub, marginTop: 2, maxWidth: 480 }}>“{question.trim()}”</div>
                )}
              </div>
              <button
                onClick={reset}
                className="tarot-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: `1px solid ${theme.line}`,
                  color: theme.sub,
                  borderRadius: 999,
                  padding: "7px 11px",
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <RotateCcw size={13} /> New reading
              </button>
            </div>

            {phase === "shuffle" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "36px 0" }}>
                <CompassLoader accent={theme.accent} />
                <div style={{ color: theme.sub, fontSize: 13 }}>Shuffling the deck…</div>
              </div>
            )}

            {(phase === "reveal" || phase === "interpreting" || phase === "done") && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                {cards.map((c, i) => (
                  <Card
                    key={i}
                    card={c}
                    position={positions[i]}
                    revealed={i < revealedCount}
                    theme={theme}
                    delay={0}
                    size={cards.length > 5 ? "sm" : "md"}
                  />
                ))}
              </div>
            )}

            {phase === "interpreting" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: theme.sub, fontSize: 13, justifyContent: "center", padding: "10px 0" }}>
                <Wand2 size={15} color={theme.accent} />
                Reading the spread…
              </div>
            )}

            {phase === "done" && (
              <div
                style={{
                  marginTop: 4,
                  padding: "18px 20px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${theme.line}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Sun size={15} color={theme.accent} />
                  <div style={{ fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: theme.sub }}>
                    Reading
                  </div>
                </div>
                {error && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ color: theme.accent, fontSize: 13.5, lineHeight: 1.5 }}>{error}</div>
                    <button
                      className="tarot-btn"
                      onClick={runInterpretation}
                      style={{
                        alignSelf: "flex-start",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "transparent",
                        border: `1px solid ${theme.accent}`,
                        color: theme.accent,
                        borderRadius: 999,
                        padding: "8px 13px",
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      <RotateCcw size={13} /> Try the interpretation again
                    </button>
                  </div>
                )}
                {interpretation && (
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 17,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {interpretation}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 6, color: theme.sub, fontSize: 11, opacity: 0.7 }}>
          <Compass size={12} />
          For reflection, not prediction.
        </div>
      </div>
    </div>
  );
}
