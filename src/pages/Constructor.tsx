import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import WallCanvas, { WallConfig } from "@/components/constructor/WallCanvas";
import ControlPanel from "@/components/constructor/ControlPanel";

const WALLS = [
  { id: "front",  label: "Передняя стена" },
  { id: "back",   label: "Задняя стена" },
  { id: "left",   label: "Левая стена" },
  { id: "right",  label: "Правая стена" },
];

const DEFAULT_CONFIG: WallConfig = {
  wood: "lipa",
  direction: "horizontal",
  salt: false,
  juniper: false,
  light: false,
};

// Авто-рекомендация по конфигурации
function getSuggestion(config: WallConfig): string | null {
  if (config.salt && config.juniper) return "💡 Совет: соль и можжевельник отлично сочетаются — разместите соль по центру, можжевельник по бокам.";
  if (config.salt && !config.light) return "💡 Совет: добавьте подсветку — она подчеркнёт переливы гималайской соли.";
  if (config.juniper && !config.light) return "💡 Совет: тёплая подсветка усилит аромат и визуал можжевельника.";
  if (config.light && config.wood === "abash") return "💡 Абаш со светлым тоном и подсветкой — классика премиум-парной.";
  if (config.wood === "olha" && config.direction === "vertical") return "💡 Ольха вертикально создаёт ощущение высоты — хороший выбор для низких потолков.";
  return null;
}

const SEND_LEAD_URL = "https://functions.poehali.dev/b7883b44-027e-4706-8bcd-bc9fc242b880";

export default function Constructor() {
  const navigate = useNavigate();
  const [activeWall, setActiveWall] = useState(0);
  const [configs, setConfigs] = useState<WallConfig[]>(WALLS.map(() => ({ ...DEFAULT_CONFIG })));
  const [sizes, setSizes] = useState(WALLS.map((_, i) => ({ w: i < 2 ? 3.0 : 2.4, h: 2.2 })));
  const [form, setForm] = useState({ name: "", phone: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // refs для всех 4 canvas (для скачивания)
  const canvasRefs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
  ];

  const updateConfig = useCallback((i: number, c: WallConfig) => {
    setConfigs((prev) => prev.map((v, idx) => (idx === i ? c : v)));
  }, []);

  const updateSize = useCallback((i: number, w: number, h: number) => {
    setSizes((prev) => prev.map((v, idx) => (idx === i ? { w, h } : v)));
  }, []);

  // Скачать PNG всех 4 стен на одном изображении
  const handleDownload = () => {
    const CWIDTH = 420;
    const CHEIGHT = 260;
    const GAP = 16;
    const PAD = 24;
    const TITLE_H = 48;

    const out = document.createElement("canvas");
    out.width = PAD * 2 + CWIDTH * 2 + GAP;
    out.height = PAD * 2 + TITLE_H + CHEIGHT * 2 + GAP;
    const ctx = out.getContext("2d")!;

    // фон
    ctx.fillStyle = "#1A1208";
    ctx.fillRect(0, 0, out.width, out.height);

    // заголовок
    ctx.fillStyle = "#C9933A";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Конфигурация парильного помещения — Сауна&Sauna", out.width / 2, PAD + 22);
    ctx.strokeStyle = "rgba(201,147,58,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, PAD + 30);
    ctx.lineTo(out.width - PAD, PAD + 30);
    ctx.stroke();

    const positions = [
      [PAD, PAD + TITLE_H],
      [PAD + CWIDTH + GAP, PAD + TITLE_H],
      [PAD, PAD + TITLE_H + CHEIGHT + GAP],
      [PAD + CWIDTH + GAP, PAD + TITLE_H + CHEIGHT + GAP],
    ];

    canvasRefs.forEach((ref, i) => {
      if (ref.current) {
        const [dx, dy] = positions[i];
        ctx.drawImage(ref.current, dx, dy, CWIDTH, CHEIGHT);
      }
    });

    const link = document.createElement("a");
    link.download = "sauna-constructor.png";
    link.href = out.toDataURL("image/png");
    link.click();
  };

  const handleSendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const summary = configs.map((c, i) => {
      const s = sizes[i];
      const extras = [c.salt && "гим.соль", c.juniper && "можжевельник", c.light && "подсветка"].filter(Boolean).join(", ");
      return `${WALLS[i].label}: ${s.w}×${s.h}м, ${c.wood}, ${c.direction === "horizontal" ? "горизонт." : "вертикаль"}${extras ? `, ${extras}` : ""}`;
    }).join("\n");

    try {
      await fetch(SEND_LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          message: `Конфигурация из конструктора:\n${summary}`,
        }),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const suggestion = getSuggestion(configs[activeWall]);

  return (
    <div className="min-h-screen font-body text-white" style={{ background: "#0D0904" }}>

      {/* Шапка */}
      <div
        className="sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center gap-4 border-b border-gold/10"
        style={{ background: "rgba(13,9,4,0.97)", backdropFilter: "blur(8px)" }}
      >
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gold/60 hover:text-gold transition-colors">
          <Icon name="ArrowLeft" size={18} />
          <span className="font-heading text-xs tracking-widest uppercase hidden sm:block">Главная</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
            <Icon name="Flame" size={12} className="text-coal" />
          </div>
          <span className="font-heading text-sm font-bold tracking-widest text-gold-light">Конструктор парилки</span>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-all font-heading text-xs tracking-wider uppercase"
          >
            <Icon name="Download" size={14} />
            <span className="hidden sm:block">Скачать PNG</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-heading text-xs tracking-wider uppercase text-coal"
            style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}
          >
            <Icon name="Send" size={14} />
            <span className="hidden sm:block">Оставить заявку</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* Левая колонка: превью + редактор */}
        <div className="space-y-5">

          {/* Превью всех 4 стен */}
          <div>
            <p className="font-heading text-xs tracking-[0.3em] uppercase text-white/30 mb-3">Все стены</p>
            <div className="grid grid-cols-2 gap-3">
              {WALLS.map((wall, i) => (
                <button
                  key={wall.id}
                  onClick={() => setActiveWall(i)}
                  className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                    activeWall === i ? "ring-2 ring-gold scale-[1.01]" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <WallCanvas
                    config={configs[i]}
                    wallWidth={sizes[i].w}
                    wallHeight={sizes[i].h}
                    label={wall.label}
                    canvasRef={canvasRefs[i]}
                  />
                  {activeWall === i && (
                    <div className="absolute top-7 right-2 bg-gold text-coal text-xs font-heading font-bold px-2 py-0.5 rounded">
                      Редактируется
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Активная стена — крупно */}
          <div>
            <p className="font-heading text-xs tracking-[0.3em] uppercase text-white/30 mb-3">
              Редактируемая стена
            </p>
            <div className="rounded-2xl overflow-hidden border border-gold/20" style={{ background: "rgba(44,31,14,0.3)" }}>
              <WallCanvas
                config={configs[activeWall]}
                wallWidth={sizes[activeWall].w}
                wallHeight={sizes[activeWall].h}
                label={WALLS[activeWall].label}
              />
            </div>

            {/* Подсказка */}
            {suggestion && (
              <div
                className="mt-3 px-4 py-3 rounded-xl border border-gold/30 font-body text-sm text-white/70"
                style={{ background: "rgba(201,147,58,0.08)" }}
              >
                {suggestion}
              </div>
            )}
          </div>

          {/* Выбор активной стены */}
          <div className="flex gap-2 flex-wrap">
            {WALLS.map((wall, i) => (
              <button
                key={wall.id}
                onClick={() => setActiveWall(i)}
                className={`font-heading text-xs tracking-widest uppercase px-4 py-2 rounded-lg border transition-all duration-200 ${
                  activeWall === i
                    ? "border-gold text-coal font-bold"
                    : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                }`}
                style={activeWall === i ? { background: "linear-gradient(135deg,#C9933A,#8A611A)" } : {}}
              >
                {wall.label}
              </button>
            ))}
          </div>
        </div>

        {/* Правая колонка: панель управления */}
        <div
          className="rounded-2xl border border-gold/15 p-5"
          style={{ background: "rgba(44,31,14,0.4)", backdropFilter: "blur(8px)" }}
        >
          <div className="mb-5">
            <p className="font-heading text-sm font-bold text-gold-light tracking-wide">{WALLS[activeWall].label}</p>
            <p className="font-body text-white/40 text-xs mt-0.5">Настройте параметры</p>
          </div>
          <ControlPanel
            config={configs[activeWall]}
            onChange={(c) => updateConfig(activeWall, c)}
            wallWidth={sizes[activeWall].w}
            wallHeight={sizes[activeWall].h}
            onSizeChange={(w, h) => updateSize(activeWall, w, h)}
          />
        </div>
      </div>

      {/* Модальное окно заявки */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(13,9,4,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gold/20 p-8"
            style={{ background: "rgba(44,31,14,0.95)" }}
          >
            {sent ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                  <Icon name="CheckCheck" size={26} className="text-coal" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gold-light">Заявка отправлена!</h3>
                <p className="font-body text-white/60 text-sm">Сергей свяжется с вами и обсудит конфигурацию.</p>
                <button
                  onClick={() => { setSent(false); setShowForm(false); }}
                  className="font-heading text-sm tracking-widest uppercase px-6 py-2.5 border border-gold/40 text-gold hover:bg-gold hover:text-coal rounded transition-all"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-white">Оставить заявку</h3>
                    <p className="font-body text-white/40 text-sm mt-1">Отправим конфигурацию мастеру</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition-colors">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <form onSubmit={handleSendLead} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-1.5 block">Ваше имя</label>
                    <input
                      type="text" required placeholder="Александр"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20"
                      style={{ background: "rgba(26,18,8,0.6)" }}
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-1.5 block">Телефон</label>
                    <input
                      type="tel" required placeholder="+7 900 000-00-00"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20"
                      style={{ background: "rgba(26,18,8,0.6)" }}
                    />
                  </div>
                  <button
                    type="submit" disabled={sending}
                    className="w-full font-heading text-sm font-bold tracking-widest uppercase py-4 rounded-lg text-coal disabled:opacity-60 transition-all"
                    style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}
                  >
                    {sending ? "Отправляем..." : "Отправить конфигурацию"}
                  </button>
                  <p className="font-body text-white/25 text-xs text-center">
                    Вместе с заявкой отправим все настройки парилки
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}