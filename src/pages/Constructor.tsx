import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useRoomConfig } from "@/components/constructor/useRoomConfig";
import RoomSetup from "@/components/constructor/RoomSetup";
import IsoCanvas, { type IsoCanvasHandle } from "@/components/constructor/IsoCanvas";
import SidePanel from "@/components/constructor/SidePanel";
import { renderRoom } from "@/components/constructor/IsoCanvas";

const SEND_LEAD_URL = "https://functions.poehali.dev/b7883b44-027e-4706-8bcd-bc9fc242b880";

type ViewMode = "iso" | "front" | "back" | "left" | "right" | "top" | "ceiling";
const VIEW_TABS: { key: ViewMode; label: string; icon: string }[] = [
  { key: "iso",     label: "3D",      icon: "Box"                 },
  { key: "front",   label: "Перед",   icon: "RectangleHorizontal" },
  { key: "back",    label: "Зад",     icon: "RectangleHorizontal" },
  { key: "left",    label: "Лево",    icon: "RectangleVertical"   },
  { key: "right",   label: "Право",   icon: "RectangleVertical"   },
  { key: "top",     label: "План",    icon: "LayoutGrid"          },
  { key: "ceiling", label: "Потолок", icon: "ArrowUpFromLine"     },
];

export default function Constructor() {
  const navigate = useNavigate();
  const { config, update, setupDone, setSetupDone } = useRoomConfig();
  const canvasRef = useRef<IsoCanvasHandle>(null);
  const [step, setStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("iso");

  const [showFinish, setShowFinish] = useState(false);
  const [finishPhone, setFinishPhone] = useState("");
  const [finishPhoneSubmitted, setFinishPhoneSubmitted] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState<"contact" | "channel" | "done">("contact");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [channel, setChannel] = useState<"whatsapp" | "telegram" | "viber" | "email" | "call">("whatsapp");
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
    const views: ViewMode[] = ["iso", "front", "back", "left", "right", "top", "ceiling"];
    const viewNames: Record<ViewMode, string> = { iso:"3D вид", front:"Передняя стена", back:"Задняя стена", left:"Левая стена", right:"Правая стена", top:"План (вид сверху)", ceiling:"Вид потолка (снизу вверх)" };

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
      config.salt    ? ["Гималайская соль", `2 полосы 20 см × ${config.saltPanelHeight} м`] : null,
      config.juniper ? ["Можжевельник",     `потолок ${config.juniperPanelWidth}×${config.juniperPanelDepth} м`] : null,
      config.light   ? ["LED подсветка",   "полок + подспинник" + (config.salt?" + соль":"") + (config.juniper?" + можжевельник":"")] : null,
      config.benches ? ["Полки",           "нижний 100 см (h=45) / верхний 70 см (h=90) + подспинник 115 см"] : null,
      config.stoveEnabled ? ["Печь", `${config.stoveType === "wood" ? "Дровяная" : "Электрокаменка"} · угол: ${{ "front-left":"перед-лево","front-right":"перед-право","back-left":"зад-лево","back-right":"зад-право" }[config.stoveCorner]}`] : null,
      ["Дверь", `${({front:"передняя",left:"левая",right:"правая"})[config.doorWall]} стена · 70×190 см, закалённое стекло`],
      config.masterName ? ["Мастер", config.masterName] : null,
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

    const masterStr = config.masterName || "будет назначен";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Проект парилки</title>
    <style>
      *{box-sizing:border-box}
      body{margin:0;font-family:'Georgia',serif;background:#FDF6EC}
      @page{margin:12mm}
      @media print{.no-print{display:none}}
      .cover{background:linear-gradient(135deg,#1A1208 0%,#3A2010 60%,#1A1208 100%);padding:40px;border-radius:0;page-break-after:always}
      .spec-table td{padding:7px 14px;font-size:13px;border-bottom:1px solid #e8d8c0}
      .view-page{page-break-after:always;padding:20px}
      h2.view-title{font-family:Georgia,serif;color:#8A611A;margin:0 0 10px;font-size:15px;border-bottom:2px solid #C9933A;padding-bottom:6px}
    </style></head><body>

    <!-- Обложка -->
    <div class="cover">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="color:#C9933A;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">Индивидуальный проект</div>
          <h1 style="color:#F8EED2;margin:0 0 6px;font-size:28px;font-weight:normal">Парилка мечты</h1>
          <p style="color:#A0845A;margin:0;font-size:14px">${config.width}×${config.depth}×${config.height} м · ${woodLabel}</p>
        </div>
        <div style="text-align:right">
          <div style="color:#A0845A;font-size:11px">${new Date().toLocaleDateString("ru-RU")}</div>
          <div style="color:#C9933A;font-size:12px;margin-top:4px">Мастер: ${masterStr}</div>
        </div>
      </div>
      <div style="margin-top:28px;border-top:1px solid rgba(201,147,58,0.3);padding-top:20px">
        <table style="width:100%;border-collapse:collapse">
          ${specRows.map(([k,v2])=>`<tr>
            <td style="color:#A0845A;padding:5px 0;font-size:13px;width:200px">${k}</td>
            <td style="color:#F8EED2;padding:5px 0;font-size:13px;font-weight:bold">${v2}</td>
          </tr>`).join("")}
        </table>
      </div>
      <div style="margin-top:24px;padding:16px;background:rgba(201,147,58,0.1);border-radius:8px;border:1px solid rgba(201,147,58,0.2)">
        <p style="color:#C9933A;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">Атмосфера</p>
        <p style="color:#D4B88A;font-size:13px;margin:0;line-height:1.6">
          ${config.salt && config.juniper ? "Максимум пользы: розовый свет соли, хвойный аромат можжевельника и мягкое тепло дерева — полное погружение в оздоровительный ритуал." :
            config.salt ? "Перламутровое свечение гималайской соли наполняет воздух минералами и создаёт неповторимую атмосферу." :
            config.juniper ? "Можжевельник при нагреве выделяет фитонциды — природный антисептик и сильнейший ароматерапевтический эффект." :
            "Классическая парилка из отборного дерева — чистота форм, тепло и уют."}
        </p>
      </div>
    </div>

    <!-- Виды -->
    ${pagesHtml}
    <script>window.onload=()=>window.print()</script>
    </body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // ── Текст конфигурации ──
  const buildConfigText = () => {
    const woodLabel = { lipa: "Липа", olha: "Ольха", kedr: "Кедр", abash: "Абаш" }[config.wood] ?? config.wood;
    const saltWallLabel = { back: "задняя стена", left: "левая стена", right: "правая стена" }[config.saltWall];
    const vol = config.width * config.depth * config.height;
    const recTemp = config.stoveType === "electric"
      ? Math.round(Math.min(90, 65 + vol * 2))
      : Math.round(Math.min(100, 70 + vol * 2));
    const extras = [
      config.salt    && `гималайская соль (${saltWallLabel}, 2 вертикальные полосы 20см × ${config.saltPanelHeight}м)`,
      config.juniper && `можжевельник на потолке (${config.juniperPanelWidth}×${config.juniperPanelDepth} м)`,
      config.light   && "LED подсветка (полок + подспинник" + (config.salt ? " + соль" : "") + (config.juniper ? " + можжевельник" : "") + ")",
      config.benches && "полки на всю стену (нижний 100см/h45, верхний 70см/h90) + подспинник h115",
      config.stoveEnabled && `${config.stoveType === "wood" ? "дровяная" : "электро"} печь, угол: ${{ "front-left":"перед-лево","front-right":"перед-право","back-left":"зад-лево","back-right":"зад-право" }[config.stoveCorner]}`,
    ].filter(Boolean).join("\n  ");
    const giftLabels: Record<string, string> = {
      ladle: "Ковш деревянный", hat: "Фирменная шапка", broom: "Банный веник",
      towel: "Фирменное полотенце", "aroma-set": "Набор ароматов (5 шт)", thermometer: "Термометр+гигрометр",
    };
    const giftsStr = (config.gifts || []).map(g => giftLabels[g]).filter(Boolean).join(", ");
    return [
      `=== КОНФИГУРАЦИЯ ПАРИЛКИ ===`,
      `Размеры: ${config.width}м × ${config.depth}м × ${config.height}м`,
      `Площадь пола: ${(config.width * config.depth).toFixed(1)} м²`,
      `Объём: ${vol.toFixed(1)} м³`,
      `Рекомендуемая t°: ${recTemp}°C`,
      `Дерево: ${woodLabel} (${config.direction === "horizontal" ? "горизонталь" : "вертикаль"})`,
      `Дверь: ${{ front:"передняя", left:"левая", right:"правая" }[config.doorWall]} стена (стекло 70×190, короб ольховый)`,
      extras ? `Добавки:\n  ${extras}` : "",
      giftsStr ? `Подарки: ${giftsStr}` : "",
      `===`,
      form.name ? `Имя: ${form.name}` : "",
      form.phone ? `Телефон: ${form.phone}` : "",
      config.masterName ? `Мастер: ${config.masterName}` : "",
    ].filter(Boolean).join("\n");
  };

  // ── Отправить через мессенджер/почту ──
  const handleSend = async () => {
    const text = buildConfigText();
    const encoded = encodeURIComponent(text);
    const phone = form.phone.replace(/\D/g, "");

    if (channel === "whatsapp") {
      window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    } else if (channel === "telegram") {
      window.open(`https://t.me/share/url?url=&text=${encoded}`, "_blank");
    } else if (channel === "viber") {
      window.open(`viber://forward?text=${encoded}`, "_blank");
    } else if (channel === "email") {
      window.open(`mailto:?subject=Конфигурация парилки&body=${encoded}`, "_blank");
    } else if (channel === "call") {
      window.open(`tel:${phone}`);
    }

    // Параллельно отправляем на бэк
    setSending(true);
    try {
      await fetch(SEND_LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, channel, message: text, master: config.masterName || "" }),
      });
    } finally { setSending(false); }

    setFormStep("done");
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
            <SidePanel config={config} onChange={update} step={step} onStep={setStep} onFinish={() => setShowFinish(true)} />
          </div>
        </div>
      </div>

      {/* ── Финальный экран — получить проект ── */}
      {showFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(13,9,4,0.95)", backdropFilter: "blur(16px)" }}>
          <div className="w-full max-w-2xl">

            {!finishPhoneSubmitted ? (
              <div className="rounded-2xl border border-gold/20 overflow-hidden"
                style={{ background: "rgba(26,18,8,0.98)" }}>

                {/* Превью 3D */}
                <div className="relative">
                  <canvas
                    ref={el => {
                      if (!el) return;
                      const ctx2 = el.getContext("2d");
                      if (ctx2) renderRoom(ctx2, config, el.width, el.height, "iso");
                    }}
                    width={860} height={340}
                    className="w-full"
                    style={{ maxHeight: "280px", objectFit: "contain", background: "#0D0904" }}
                  />
                  <div className="absolute inset-0 flex items-end p-4"
                    style={{ background: "linear-gradient(to top, rgba(26,18,8,0.9) 0%, transparent 60%)" }}>
                    <div>
                      <p className="font-heading text-xl font-bold text-gold-light">Ваш проект готов</p>
                      <p className="font-body text-sm text-white/50">
                        {config.width}×{config.depth}×{config.height} м · {({lipa:"Липа",olha:"Ольха",abash:"Абаш"})[config.wood]}
                        {config.salt ? " · Гим. соль" : ""}{config.juniper ? " · Можжевельник" : ""}
                        {config.stoveEnabled ? ` · ${config.stoveType === "wood" ? "Дровяная печь" : "Электрокаменка"}` : ""}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowFinish(false)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <Icon name="X" size={16} />
                  </button>
                </div>

                {/* Форма */}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                      <Icon name="Lock" size={18} className="text-coal" />
                    </div>
                    <div>
                      <p className="font-heading text-base font-bold text-white">Оставьте телефон — получите PDF</p>
                      <p className="font-body text-sm text-white/45 mt-0.5">Пакет чертежей со всеми видами и спецификацией</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="+7 900 000-00-00"
                      value={finishPhone}
                      onChange={e => setFinishPhone(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20 text-sm"
                      style={{ background: "rgba(13,9,4,0.7)" }}
                    />
                    <button
                      disabled={!finishPhone.trim() || finishPhone.length < 7}
                      onClick={async () => {
                        setFinishPhoneSubmitted(true);
                        // Отправляем лид и сразу генерим PDF
                        try {
                          await fetch(SEND_LEAD_URL, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: "Из конструктора",
                              phone: finishPhone,
                              channel: "pdf-download",
                              message: buildConfigText(),
                            }),
                          });
                        } catch (e) { console.warn(e); }
                        handleDownloadPdf();
                      }}
                      className="px-5 py-3 rounded-xl font-heading text-sm font-bold tracking-widest uppercase text-coal disabled:opacity-40 flex items-center gap-2 transition-all"
                      style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                      <Icon name="Download" size={15} />
                      PDF
                    </button>
                  </div>

                  <p className="font-body text-white/20 text-xs text-center mt-3">
                    Также можно скачать PNG или отправить проект мастеру
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button onClick={handleDownloadPng}
                      className="flex-1 py-2.5 rounded-xl border border-gold/25 text-gold/70 hover:bg-gold/10 font-heading text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5">
                      <Icon name="Image" size={12} />PNG
                    </button>
                    <button onClick={() => { setShowFinish(false); setShowForm(true); }}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white font-heading text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5">
                      <Icon name="Send" size={12} />Отправить мастеру
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Успех */
              <div className="rounded-2xl border border-gold/20 p-8 flex flex-col items-center text-center gap-5"
                style={{ background: "rgba(26,18,8,0.98)" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                  <Icon name="CheckCheck" size={36} className="text-coal" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-gold-light">PDF скачивается!</h3>
                  <p className="font-body text-white/50 text-sm mt-2 leading-relaxed">
                    Мастер свяжется с вами по номеру <b className="text-white/80">{finishPhone}</b> и уточнит детали по вашей парилке.
                  </p>
                </div>
                <div className="w-full space-y-2">
                  <button onClick={() => { setShowFinish(false); setFinishPhoneSubmitted(false); setFinishPhone(""); }}
                    className="w-full py-3 rounded-xl font-heading text-sm font-bold tracking-widest uppercase text-coal"
                    style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                    Вернуться в конструктор
                  </button>
                  <button onClick={() => { setShowFinish(false); setFinishPhoneSubmitted(false); setFinishPhone(""); setShowForm(true); }}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white font-heading text-xs tracking-widest uppercase transition-all">
                    Отправить мастеру в мессенджер
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модалка заявки */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(13,9,4,0.92)", backdropFilter: "blur(12px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setFormStep("contact"); } }}>
          <div className="w-full max-w-md rounded-2xl border border-gold/20 p-6"
            style={{ background: "rgba(44,31,14,0.97)" }}>

            {/* Шапка */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {/* Индикатор шагов */}
                {(["contact","channel","done"] as const).map((s, i) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all ${
                    s === formStep ? "w-8 bg-gold" : i < ["contact","channel","done"].indexOf(formStep) ? "w-4 bg-gold/40" : "w-4 bg-white/10"
                  }`} />
                ))}
              </div>
              <button onClick={() => { setShowForm(false); setFormStep("contact"); }}
                className="text-white/30 hover:text-white transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* ШАГ 1 — Контакты */}
            {formStep === "contact" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">Ваши контакты</h3>
                  <p className="font-body text-white/40 text-sm mt-1">Шаг 1 из 2 — имя и телефон</p>
                </div>

                {/* Превью конфигурации */}
                <div className="rounded-xl border border-gold/15 px-3 py-3 space-y-1"
                  style={{ background: "rgba(201,147,58,0.05)" }}>
                  <p className="font-heading text-xs tracking-widest uppercase text-white/30 mb-2">Ваш проект</p>
                  {[
                    [`${config.width}×${config.depth}×${config.height} м`, "Ruler"],
                    [{ lipa:"Липа", olha:"Ольха", abash:"Абаш" }[config.wood], "TreePine"],
                    [[config.salt&&"соль", config.juniper&&"можжевельник", config.light&&"LED", config.benches&&"лавки"].filter(Boolean).join(", ") || "без добавок", "Layers"],
                    [config.stoveEnabled ? (config.stoveType==="wood"?"Дровяная печь":"Электрокаменка") : "без печи", "Flame"],
                  ].map(([val, icon]) => (
                    <div key={icon as string} className="flex items-center gap-2">
                      <Icon name={icon as "Ruler"} size={12} className="text-gold/50 flex-shrink-0" />
                      <span className="font-body text-xs text-white/60">{val as string}</span>
                    </div>
                  ))}
                </div>

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
                <button
                  disabled={!form.name.trim() || !form.phone.trim()}
                  onClick={() => setFormStep("channel")}
                  className="w-full font-heading text-sm font-bold tracking-widest uppercase py-3.5 rounded-lg text-coal disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                  Далее — выбрать способ связи
                </button>
              </div>
            )}

            {/* ШАГ 2 — Канал связи */}
            {formStep === "channel" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">Способ связи</h3>
                  <p className="font-body text-white/40 text-sm mt-1">Шаг 2 из 2 — куда отправить проект</p>
                </div>

                <div className="space-y-2">
                  {([
                    ["whatsapp", "WhatsApp",  "MessageCircle", "#25D366", "Проект придёт вам в чат"],
                    ["telegram", "Telegram",  "Send",          "#2AABEE", "Откроется чат с конфигурацией"],
                    ["viber",    "Viber",     "Phone",         "#7360F2", "Отправка через Viber"],
                    ["email",    "Email",     "Mail",          "#C9933A", "Письмо с деталями проекта"],
                    ["call",     "Позвонить", "PhoneCall",     "#8A8A8A", "Просто наберём ваш номер"],
                  ] as [typeof channel, string, string, string, string][]).map(([val, label, icon, color, hint]) => (
                    <button key={val} onClick={() => setChannel(val)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        channel === val ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/25"
                      }`}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: channel === val ? color + "33" : "rgba(255,255,255,0.05)" }}>
                        <Icon name={icon as "Send"} size={17} style={{ color: channel === val ? color : "rgba(255,255,255,0.3)" }} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-bold text-sm ${channel === val ? "text-white" : "text-white/60"}`}>{label}</div>
                        <div className="text-white/30 text-xs">{hint}</div>
                      </div>
                      {channel === val && <Icon name="Check" size={14} className="text-gold flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setFormStep("contact")}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 font-heading text-xs tracking-widest uppercase transition-all">
                    Назад
                  </button>
                  <button onClick={handleSend} disabled={sending}
                    className="flex-[2] py-3 rounded-xl font-heading text-sm font-bold tracking-widest uppercase text-coal disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                    {sending ? "Отправляем..." : "Отправить проект"}
                  </button>
                </div>
              </div>
            )}

            {/* ШАГ 3 — Готово */}
            {formStep === "done" && (
              <div className="flex flex-col items-center text-center gap-4 py-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                    <Icon name="Flame" size={32} className="text-coal" />
                  </div>
                  <div className="absolute -top-1 -right-1 text-2xl">✨</div>
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-gold-light">
                    Поздравляем, {form.name}!
                  </h3>
                  <p className="font-body text-white/60 text-sm mt-2 leading-relaxed max-w-xs">
                    Вы на полпути к своему тёплому уголку мечты 🌿
                    <br /><br />
                    {config.masterName
                      ? <>Мастер <b className="text-gold">{config.masterName}</b> уже видит ваш проект и скоро выйдет на связь.</>
                      : "Скоро с вами свяжется мастер — он лично разберёт каждую деталь вашей будущей парилки."
                    }
                  </p>
                  <div className="mt-3 px-4 py-2.5 rounded-xl border border-gold/15 text-white/35 text-xs font-body"
                    style={{ background: "rgba(201,147,58,0.05)" }}>
                    Проект отправлен через {{ whatsapp:"WhatsApp", telegram:"Telegram", viber:"Viber", email:"Email", call:"звонок" }[channel]} 🔥
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={handleDownloadPdf}
                    className="flex-1 py-2.5 rounded-xl border border-gold/35 text-gold hover:bg-gold/10 font-heading text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5">
                    <Icon name="FileText" size={13} />PDF
                  </button>
                  <button onClick={() => { setShowForm(false); setFormStep("contact"); }}
                    className="flex-1 py-2.5 rounded-xl font-heading text-xs tracking-widest uppercase text-coal"
                    style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                    В конструктор
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}