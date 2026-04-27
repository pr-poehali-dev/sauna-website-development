import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useRoomConfig } from "@/components/constructor/useRoomConfig";
import RoomSetup from "@/components/constructor/RoomSetup";
import IsoCanvas, { type IsoCanvasHandle } from "@/components/constructor/IsoCanvas";
import SidePanel from "@/components/constructor/SidePanel";
import { renderRoom } from "@/components/constructor/IsoCanvas";

const SEND_LEAD_URL = "https://functions.poehali.dev/b7883b44-027e-4706-8bcd-bc9fc242b880";

type ViewMode = "iso" | "front" | "back" | "left" | "right" | "top";
const VIEW_TABS: { key: ViewMode; label: string; icon: string }[] = [
  { key: "iso",   label: "3D",      icon: "Box"         },
  { key: "front", label: "Перед",   icon: "RectangleHorizontal" },
  { key: "back",  label: "Зад",     icon: "RectangleHorizontal" },
  { key: "left",  label: "Лево",    icon: "RectangleVertical"   },
  { key: "right", label: "Право",   icon: "RectangleVertical"   },
  { key: "top",   label: "План",    icon: "LayoutGrid"  },
];

export default function Constructor() {
  const navigate = useNavigate();
  const { config, update, setupDone, setSetupDone } = useRoomConfig();
  const canvasRef = useRef<IsoCanvasHandle>(null);
  const [step, setStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("iso");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // ── Скачать PNG текущего вида ──
  const handleDownloadPng = () => {
    const url = canvasRef.current?.getViewDataURL(viewMode);
    if (!url) return;
    const a = document.createElement("a");
    a.download = `sauna-${viewMode}.png`;
    a.href = url;
    a.click();
  };

  // ── Скачать PDF-пакет (все виды) ──
  const handleDownloadPdf = async () => {
    const views: ViewMode[] = ["iso", "front", "back", "left", "right", "top"];
    const viewNames = { iso:"3D вид", front:"Передняя стена", back:"Задняя стена", left:"Левая стена", right:"Правая стена", top:"План (вид сверху)" };

    // Генерируем все изображения через canvas
    const images: { name: string; dataUrl: string }[] = views.map(v => {
      const tmp = document.createElement("canvas");
      tmp.width = 860; tmp.height = 520;
      const ctx = tmp.getContext("2d");
      if (ctx) renderRoom(ctx, config, 860, 520, v);
      return { name: viewNames[v], dataUrl: tmp.toDataURL("image/png") };
    });

    // Генерируем HTML-документ для печати
    const woodLabel = { lipa: "Липа", olha: "Ольха", abash: "Абаш" }[config.wood];
    const dirLabel = config.direction === "horizontal" ? "горизонталь" : "вертикаль";
    const specRows = [
      ["Размеры (ш×г×в)", `${config.width}м × ${config.depth}м × ${config.height}м`],
      ["Площадь пола",    `${(config.width * config.depth).toFixed(1)} м²`],
      ["Объём",           `${(config.width * config.depth * config.height).toFixed(1)} м³`],
      ["Порода дерева",   woodLabel],
      ["Укладка вагонки", dirLabel],
      config.salt    ? ["Гималайская соль", "есть"] : null,
      config.juniper ? ["Можжевельник",     "панно"] : null,
      config.light   ? ["LED подсветка",   "есть"] : null,
      config.benches ? ["Лавки",           "2 яруса"] : null,
      config.stoveEnabled ? ["Печь", `${config.stoveType === "wood" ? "дровяная" : "электро"} (${config.stoveCorner})`] : null,
      ["Дверь", `${({front:"передняя",left:"левая",right:"правая"})[config.doorWall]} стена`],
    ].filter(Boolean) as [string, string][];

    const specHtml = specRows.map(([k,v2]) =>
      `<tr><td style="padding:6px 12px;color:#555;border-bottom:1px solid #eee">${k}</td>
       <td style="padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee">${v2}</td></tr>`
    ).join("");

    const pagesHtml = images.map(img =>
      `<div style="page-break-after:always;padding:24px;">
        <h2 style="font-family:sans-serif;color:#8A611A;margin-bottom:12px;font-size:16px">${img.name}</h2>
        <img src="${img.dataUrl}" style="width:100%;border-radius:8px;border:1px solid #e0c060"/>
      </div>`
    ).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Конфигурация парилки</title>
    <style>
      body{margin:0;font-family:sans-serif;background:#fff}
      @page{margin:10mm}
      @media print{.no-print{display:none}}
    </style></head><body>
    <div style="padding:24px 24px 0">
      <h1 style="font-family:sans-serif;color:#3A2010;margin:0 0 4px">Конфигурация парилки</h1>
      <p style="color:#888;margin:0 0 20px;font-size:13px">Дата: ${new Date().toLocaleDateString("ru-RU")}</p>
      <table style="border-collapse:collapse;width:100%;max-width:480px">${specHtml}</table>
    </div>
    ${pagesHtml}
    <script>window.onload=()=>window.print()</script>
    </body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // ── Отправить заявку ──
  const handleSendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const woodLabel = { lipa: "Липа", olha: "Ольха", abash: "Абаш" }[config.wood];
    const extras = [
      config.salt && "гималайская соль",
      config.juniper && "можжевельник",
      config.light && "LED подсветка",
      config.benches && "лавки",
      config.stoveEnabled && `${config.stoveType === "wood" ? "дровяная" : "электро"} печь (${config.stoveCorner})`,
    ].filter(Boolean).join(", ");
    const message = [
      `Конфигурация парилки:`,
      `Размеры: ${config.width}м × ${config.depth}м × ${config.height}м`,
      `Площадь: ${(config.width * config.depth).toFixed(1)} м²`,
      `Дерево: ${woodLabel}, ${config.direction === "horizontal" ? "горизонталь" : "вертикаль"}`,
      extras ? `Добавки: ${extras}` : "",
      `Дверь: ${{ front:"передняя", left:"левая", right:"правая" }[config.doorWall]} стена`,
    ].filter(Boolean).join("\n");
    try {
      await fetch(SEND_LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, message }),
      });
      setSent(true);
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen font-body text-white" style={{ background: "#0D0904" }}>

      {!setupDone && (
        <RoomSetup config={config} onUpdate={update} onDone={() => setSetupDone(true)} />
      )}

      {/* Шапка */}
      <div className="sticky top-0 z-40 px-4 py-2.5 flex items-center gap-2 border-b border-gold/10"
        style={{ background: "rgba(13,9,4,0.97)", backdropFilter: "blur(8px)" }}>
        <button onClick={() => navigate("/")} className="text-gold/40 hover:text-gold transition-colors p-1">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
            <Icon name="Flame" size={11} className="text-coal" />
          </div>
          <span className="font-heading text-sm font-bold tracking-widest text-gold-light hidden sm:block">Конструктор парилки</span>
        </div>

        {/* Вкладки видов */}
        <div className="ml-2 flex items-center gap-0.5 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}>
          {VIEW_TABS.map(t => (
            <button key={t.key} onClick={() => setViewMode(t.key)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-heading text-[10px] tracking-wider uppercase transition-all whitespace-nowrap ${
                viewMode === t.key ? "bg-gold/15 text-gold border border-gold/40" : "text-white/30 hover:text-white/60"
              }`}>
              <Icon name={t.icon as "Box"} size={11} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setSetupDone(false)}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-white hover:border-white/30 transition-all font-heading text-[10px] tracking-widest uppercase">
            <Icon name="Ruler" size={12} />Размеры
          </button>
          <button onClick={handleDownloadPng}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gold/35 text-gold hover:bg-gold/10 transition-all font-heading text-[10px] tracking-widest uppercase">
            <Icon name="Image" size={12} />
            <span className="hidden sm:block">PNG</span>
          </button>
          <button onClick={handleDownloadPdf}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gold/35 text-gold hover:bg-gold/10 transition-all font-heading text-[10px] tracking-widest uppercase">
            <Icon name="FileText" size={12} />
            <span className="hidden sm:block">PDF</span>
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-heading text-[10px] tracking-widest uppercase text-coal"
            style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
            <Icon name="Send" size={12} />
            <span className="hidden sm:block">Заявка</span>
          </button>
        </div>
      </div>

      {/* Основной layout */}
      <div className="flex flex-col lg:flex-row" style={{ height: "calc(100vh - 48px)" }}>

        {/* Канвас */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden min-w-0">
          <div className="w-full max-w-4xl">
            <IsoCanvas ref={canvasRef} config={{ ...config }} key={viewMode} />
          </div>

          {/* Подсказка */}
          {(config.salt || config.juniper || config.light) && viewMode === "iso" && (
            <div className="mt-3 max-w-2xl w-full px-4 py-2 rounded-xl border border-gold/15 font-body text-xs text-white/50 flex items-start gap-2"
              style={{ background: "rgba(201,147,58,0.06)" }}>
              <Icon name="Info" size={13} className="text-gold/50 mt-0.5 flex-shrink-0" />
              <span>
                {config.salt && config.juniper && config.light
                  ? "Максимальный комфорт: соль, можжевельник и LED подсветка."
                  : config.salt && config.juniper
                  ? "Отличное сочетание — соль и можжевельник на разных стенах."
                  : config.salt
                  ? "Подсветка LED усилит перламутровое свечение соли."
                  : config.juniper
                  ? "Можжевельник даёт сильный аромат хвои при нагреве."
                  : "LED подсветка создаёт мягкую расслабляющую атмосферу."}
              </span>
            </div>
          )}
        </div>

        {/* Панель мастера */}
        <div className="lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-gold/10 flex flex-col"
          style={{ background: "rgba(26,18,8,0.6)", maxHeight: "calc(100vh - 48px)" }}>
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <SidePanel config={config} onChange={update} step={step} onStep={setStep} />
          </div>
        </div>
      </div>

      {/* Модалка заявки */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(13,9,4,0.92)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-md rounded-2xl border border-gold/20 p-8"
            style={{ background: "rgba(44,31,14,0.97)" }}>
            {sent ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                  <Icon name="CheckCheck" size={26} className="text-coal" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gold-light">Заявка отправлена!</h3>
                <p className="font-body text-white/60 text-sm">Мастер свяжется с вами и обсудит конфигурацию парилки.</p>
                <button onClick={() => { setSent(false); setShowForm(false); }}
                  className="font-heading text-sm tracking-widest uppercase px-6 py-2.5 border border-gold/40 text-gold hover:bg-gold hover:text-coal rounded-lg transition-all">
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-white">Оставить заявку</h3>
                    <p className="font-body text-white/40 text-sm mt-1">Конфигурация отправится мастеру</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-white/35 hover:text-white transition-colors">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <form onSubmit={handleSendLead} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-1.5 block">Ваше имя</label>
                    <input type="text" required placeholder="Александр" value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20"
                      style={{ background: "rgba(26,18,8,0.6)" }} />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-1.5 block">Телефон</label>
                    <input type="tel" required placeholder="+7 900 000-00-00" value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20"
                      style={{ background: "rgba(26,18,8,0.6)" }} />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full font-heading text-sm font-bold tracking-widest uppercase py-4 rounded-lg text-coal disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
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
