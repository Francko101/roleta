import React, { useEffect, useMemo, useRef, useState } from "react";

const MAX_ENTRIES = 500;
const LABEL_DISPLAY_LIMIT = 60;
const SIWRSOA_LOGO_SRC = "public/logo.png";
const STORAGE_KEY = "siwrsoa_roleta_data";

const COLOR_PALETTE = [
  "#3AA7D6",
  "#2F8CC4",
  "#1F6FB2",
  "#1E5AA6",
  "#1F4E9A",
  "#4FB6E5",
  "#6CC6EC",
  "#2B7FB8",
  "#1D4A8F",
  "#5ABBE8",
];

const DEFAULT_ENTRIES = [
  "ABROX Water Refilling Station",
  "AguaSol Water Refilling Station",
  "ALJUNS Water Refilling Station",
  "Aqua Doz Water Refilling Station",
  "Aqua King Water Refilling Station",
  "AQUA PISCES Water Refilling Station",
  "Aqua Star Refilling Station",
  "Aqua-Cris Water Refueling Station",
  "Aquajam Water Refilling Station",
  "Bhon-Bhon Refilling Station",
  "Cherith Water Refilling Station",
  "D'Lordia Water Refilling Station",
  "Don2 Lan Water Refilling Station",
  "EC Brothers",
  "Gabrean Water Refilling Station",
  "God's Gift Water Refilling Station",
  "Grains Multipurpose Cooperative",
  "H2O Pure Water Refilling Station",
  "Hidden Ridge Water Refilling Station",
  "HYDROMZ Water Refilling Station",
  "Island Fresh Water Refilling Station",
  "Island Crystallyn Water Refilling Station",
  "Jamillo Water Refilling Station",
  "Jecking Ozone Pure Alkaline Purified Mineral Water",
  "Jerah Refilling Station",
  "John Carl Water Refilling Station",
  "Joshshine Water Refilling Station",
  "JRP Aquaclear Water Refilling Station",
  "JS Water Refilling Station",
  "Jungle Spring Water Refilling Station",
  "Khing's Water Purification",
  "Kiwi Water Refilling Station",
  "La Jumilla Water Refilling Station",
  "LASSAH Water Refilling Station",
  "Purely Hydrated Water Refilling Station",
  "R & A Cabunita Refilling",
  "Rich Water Refilling Station",
  "Rock Mountain Drops Water Refilling Station",
  "Rubin Water Refilling Station",
  "Shaira Water Refilling Station",
  "Snowpi Water Refilling Station",
  "Titing Catubig Water Refilling Station",
  "WATER MED Refilling Station",
  "Yuan Water Refilling Station",
  "Zion's Dew Water Refilling Station",
  "Adjivani, Salima B.",
  "Boston, Dondon",
  "Talicud Living Water",
  "Dagcuta, Patrick",
  "Doctolero, Donald M.",
  "JCJ Refilling Station",
  "Daymoy Water Refilling Station",
  "TOMNET Water Refilling Station",
  "Jayelou Water Refilling Station",
  "Villa-abrille, Joseph Brian Luz",
  "Salima Adilani",
  "Montebon, Carmenchita",
  "Precious Drop Refilling Station",
];

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clampItems(items) {
  return items.map((item) => item.trim()).filter(Boolean).slice(0, MAX_ENTRIES);
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function getLabelSettings(count) {
  if (count <= 8) return { fontSize: 14, radiusFactor: 0.62, maxLength: 14 };
  if (count <= 12) return { fontSize: 11, radiusFactor: 0.7, maxLength: 10 };
  if (count <= 20) return { fontSize: 9, radiusFactor: 0.76, maxLength: 8 };
  if (count <= 40) return { fontSize: 7, radiusFactor: 0.82, maxLength: 6 };
  if (count <= 60) return { fontSize: 6, radiusFactor: 0.86, maxLength: 5 };
  return { fontSize: 5, radiusFactor: 0.88, maxLength: 4 };
}

function getShortLabel(item, maxLength) {
  return item.length > maxLength ? `${item.slice(0, maxLength)}…` : item;
}

function getWinningIndex(rotation, count) {
  const normalized = ((rotation % 360) + 360) % 360;
  const slice = 360 / count;
  const pointerAngle = (360 - normalized) % 360;
  return Math.floor(pointerAngle / slice) % count;
}

function Wheel({ items, rotation }) {
  const size = 440;
  const radius = 200;
  const center = size / 2;
  const sliceAngle = 360 / items.length;
  const labelSettings = getLabelSettings(items.length);
  const showLabels = true;
  const strokeWidth = items.length > 80 ? 0.5 : items.length > 40 ? 1 : 2;

  return (
    <div className="relative w-full max-w-[500px] aspect-square">
      <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[20px] border-r-[20px] border-t-[36px] border-l-transparent border-r-transparent border-t-slate-950 drop-shadow-xl" />
      </div>

      <div
        className="relative h-full w-full rounded-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 5s cubic-bezier(0.17, 0.67, 0.15, 1)",
        }}
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full drop-shadow-2xl">
          <defs>
            <filter id="glow-shadow">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodOpacity="0.28" />
            </filter>
          </defs>

          <circle cx={center} cy={center} r={radius + 10} fill="#0a1a33" opacity="0.15" />
          <circle cx={center} cy={center} r={radius} fill="#ffffff" filter="url(#glow-shadow)" />

          {items.map((item, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const midAngle = startAngle + sliceAngle / 2;
            const textPoint = polarToCartesian(center, center, radius * labelSettings.radiusFactor, midAngle);

            return (
              <g key={`${item}-${i}`}>
                <path
                  d={describeSlice(center, center, radius, startAngle, endAngle)}
                  fill={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  stroke="#ffffff"
                  strokeWidth={strokeWidth}
                />
                {showLabels && labelSettings.fontSize > 0 ? (
                  <text
                    x={textPoint.x}
                    y={textPoint.y}
                    fill="#ffffff"
                    fontSize={labelSettings.fontSize}
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${textPoint.x}, ${textPoint.y})`}
                  >
                    {getShortLabel(item, labelSettings.maxLength)}
                  </text>
                ) : null}
              </g>
            );
          })}

          <circle cx={center} cy={center} r="26" fill="#0a1a33" />
          <circle cx={center} cy={center} r="11" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
      {(title || subtitle) && (
        <div className="mb-4">
          {title ? <h2 className="text-xl font-bold text-white">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
        </div>
      )}
      {children}
    </div>
  );
}

export default function App() {
  const saved = loadFromStorage();
  const [entries, setEntries] = useState(saved?.entries || DEFAULT_ENTRIES);
  const [bulkText, setBulkText] = useState((saved?.entries || DEFAULT_ENTRIES).join("\n"));
  const [newEntry, setNewEntry] = useState("");
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState("");
  const [lastWinnerIndex, setLastWinnerIndex] = useState(null);
  const [winnerHistory, setWinnerHistory] = useState(saved?.winnerHistory || []);
  const [isSpinning, setIsSpinning] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const timeoutRef = useRef(null);

  const items = useMemo(() => clampItems(entries), [entries]);
  const largeListMode = items.length > LABEL_DISPLAY_LIMIT;

  useEffect(() => {
    saveToStorage({ entries, winnerHistory });
  }, [entries, winnerHistory]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function syncEntries(next) {
    const clean = clampItems(next);
    setEntries(clean);
    setBulkText(clean.join("\n"));
  }

  function addEntry() {
    const trimmed = newEntry.trim();
    if (!trimmed) return;
    syncEntries([...items, trimmed]);
    setNewEntry("");
  }

  function applyList() {
    const next = clampItems(bulkText.split("\n"));
    if (next.length >= 1) {
      setEntries(next);
      setWinner("");
      setLastWinnerIndex(null);
    }
  }

  function resetAll() {
    setEntries(DEFAULT_ENTRIES);
    setBulkText(DEFAULT_ENTRIES.join("\n"));
    setRotation(0);
    setWinner("");
    setLastWinnerIndex(null);
    setWinnerHistory([]);
    setIsSpinning(false);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
  }

  function spinWheel() {
    if (isSpinning || items.length < 1) return;

    setIsSpinning(true);
    setWinner("");
    setLastWinnerIndex(null);

    const currentEntries = [...items];
    const count = currentEntries.length;
    const selectedIndex = Math.floor(Math.random() * count);
    const sliceAngle = 360 / count;
    const centerOfSlice = selectedIndex * sliceAngle + sliceAngle / 2;
    const targetRotation = 360 - centerOfSlice;
    const currentNormalized = ((rotation % 360) + 360) % 360;
    const delta = (targetRotation - currentNormalized + 360) % 360;
    const nextRotation = rotation + 360 * 6 + delta;

    setRotation(nextRotation);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const finalIndex = getWinningIndex(nextRotation, count);
      const resolvedWinner = currentEntries[finalIndex] ?? currentEntries[selectedIndex];
      setWinner(resolvedWinner);
      setLastWinnerIndex(finalIndex);
      setWinnerHistory((prev) => [...prev, resolvedWinner]);
      setIsSpinning(false);
    }, 5000);
  }

  function removeWinner() {
    if (lastWinnerIndex === null) return;
    const next = items.filter((_, index) => index !== lastWinnerIndex);
    syncEntries(next);
    setWinner("");
    setLastWinnerIndex(null);
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#08172d] via-[#0f2e57] to-[#08172d] text-white ${fullscreenMode ? "p-4 md:p-6" : "p-6 md:p-10"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] bg-white/90 p-2 shadow-lg">
              <img src={SIWRSOA_LOGO_SRC} alt="SIWRSOA logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#6CC6EC]">SIWRSOA</p>
              <h1 className="text-2xl font-black leading-tight md:text-4xl">4th SIWRSOA General Assembly Grand Raffle</h1>
              <p className="mt-1 text-sm text-slate-300">Samal Island Water Refilling Station Operators Association</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFullscreenMode((prev) => !prev)}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15"
            >
              {fullscreenMode ? "Exit Compact Mode" : "Compact Event Mode"}
            </button>
            <button
              onClick={resetAll}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-slate-100"
            >
              Reset All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <Panel>
              <div className="flex flex-col items-center gap-6">
                <Wheel items={items.length > 0 ? items : ["No entries"]} rotation={rotation} />

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={spinWheel}
                    disabled={isSpinning || items.length < 1}
                    className="rounded-2xl bg-white px-8 py-4 text-base font-black text-slate-950 shadow-xl transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSpinning ? "Spinning..." : "Spin Now"}
                  </button>

                  {winner && lastWinnerIndex !== null ? (
                    <button
                      onClick={removeWinner}
                      className="rounded-2xl bg-rose-500 px-8 py-4 text-base font-black text-white shadow-xl transition hover:bg-rose-600"
                    >
                      Remove Winner
                    </button>
                  ) : null}
                </div>

                <div className="w-full max-w-xl rounded-[24px] border border-white/10 bg-white/10 px-6 py-5 text-center shadow-xl">
                  <p className="text-sm uppercase tracking-[0.22em] text-[#6CC6EC]">Winner Under Arrow</p>
                  <p className="mt-2 text-3xl font-black leading-tight md:text-4xl">{winner || "—"}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Remaining entries: {items.length}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {largeListMode ? `Compact wheel mode for ${items.length} entries` : "Label mode active"}
                    </span>
                  </div>
                </div>
              </div>
            </Panel>
          </section>

          <section className="space-y-6">
            <Panel title="Add Participant" subtitle="Add one participant quickly during the event.">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addEntry();
                  }}
                  placeholder="Type a participant name"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={addEntry}
                  className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-100"
                >
                  Add
                </button>
              </div>
            </Panel>

            <Panel title="Participant List" subtitle="Edit the full list below. One participant per line.">
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="min-h-[230px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                placeholder="One participant per line"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={applyList}
                  className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-100"
                >
                  Apply List
                </button>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Supports 1 to {MAX_ENTRIES} entries
                </div>
              </div>

              <div className="mt-5 grid max-h-[280px] gap-2 overflow-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length] }}
                      />
                      <p className="truncate text-sm text-white md:text-base">{item}</p>
                    </div>
                    <button
                      onClick={() => syncEntries(items.filter((_, i) => i !== index))}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Winner History" subtitle="Track all previously drawn winners.">
              <div className="grid max-h-[220px] gap-2 overflow-auto pr-1">
                {winnerHistory.length > 0 ? (
                  winnerHistory.map((name, index) => (
                    <div
                      key={`${name}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="truncate font-medium text-white">{name}</span>
                      <span className="ml-3 rounded-full bg-[#3AA7D6]/20 px-3 py-1 text-xs font-bold text-[#6CC6EC]">
                        Winner {index + 1}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    No winners yet.
                  </div>
                )}
              </div>
            </Panel>
          </section>
        </div>
      </div>
    </div>
  );
}
