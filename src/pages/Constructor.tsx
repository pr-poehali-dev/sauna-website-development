import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useRoomConfig } from "@/components/constructor/useRoomConfig";
import RoomSetup from "@/components/constructor/RoomSetup";
import IsoCanvas from "@/components/constructor/IsoCanvas";
import SidePanel from "@/components/constructor/SidePanel";

const SEND_LEAD_URL = "https://functions.poehali.dev/b7883b44-027e-4706-8bcd-bc9fc242b880";

export default function Constructor() {
  const navigate = useNavigate();
  const { config, update, setupDone, setSetupDone } = useRoomConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // ── Скачать PNG ──
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "sauna-room.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ── Отправить заявку ──
  const handleSendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const woodLabel = { lipa: "Липа", olha: "Ольха", abash: "Абаш" }[config.wood];
    const dirLabel = config.direction === "horizontal" ? "горизонталь" : "вертикаль";
    const extras = [
      config.salt && "гималайская соль",
      config.juniper && "можжевельник",
      config.light && "LED подсветка",
      config.stoveEnabled && `${config.stoveType === "wood" ? "дровяная" : "электро"} печь (${config.stoveCorner})`,
    ].filter(Boolean).join(", ");

    const message = [
      `Конфигурация парилки из конструктора:`,
      `Размеры: ${config.width}м × ${config.depth}м × ${config.height}м (ш×г×в)`,
      `Площадь: ${(config.width * config.depth).toFixed(1)} м²`,
      `Дерево: ${woodLabel}, укладка: ${dirLabel}`,
      extras ? `Дополнения: ${extras}` : "",
      `Дверь: ${{ front: "передняя", left: "левая", right: "правая" }[config.doorWall]} стена`,
    ].filter(Boolean).join("\n");

    try {
      await fetch(SEND_LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, message }),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen font-body text-white" style={{ background: "#0D0904" }}>

      {/* Модальное окно размеров при первом входе */}
      {!setupDone && (
        <RoomSetup config={config} onUpdate={update} onDone={() => setSetupDone(true)} />
      )}

      {/* Шапка */}
      <div
        className="sticky top-0 z-40 px-4 md:px-6 py-3 flex items-center gap-3 border-b border-gold/10"
        style={{ background: "rgba(13,9,4,0.97)", backdropFilter: "blur(8px)" }}
      >
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-gold/50 hover:text-gold transition-colors">
          <Icon name="ArrowLeft" size={16} />
          <span className="font-heading text-xs tracking-widest uppercase hidden sm:block">Главная</span>
        </button>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
            <Icon name="Flame" size={11} className="text-coal" />
          </div>
          <span className="font-heading text-sm font-bold tracking-widest text-gold-light">Конструктор парилки</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSetupDone(false)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all font-heading text-xs tracking-wider uppercase"
          >
            <Icon name="Ruler" size={13} />
            Размеры
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-all font-heading text-xs tracking-wider uppercase"
          >
            <Icon name="Download" size={13} />
            <span className="hidden sm:block">PNG</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-heading text-xs tracking-wider uppercase text-coal"
            style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}
          >
            <Icon name="Send" size={13} />
            <span className="hidden sm:block">Заявка</span>
          </button>
        </div>
      </div>

      {/* Основной layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-52px)]">

        {/* Канвас — центр */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
          <div className="w-full max-w-4xl">
            <IsoCanvas ref={canvasRef} config={config} />
          </div>

          {/* Авто-подсказка */}
          {(config.salt || config.juniper || config.light) && (
            <div
              className="mt-3 max-w-2xl w-full px-4 py-2.5 rounded-xl border border-gold/20 font-body text-sm text-white/60 flex items-start gap-2"
              style={{ background: "rgba(201,147,58,0.07)" }}
            >
              <Icon name="Lightbulb" size={15} className="text-gold/60 mt-0.5 flex-shrink-0" />
              <span>
                {config.salt && !config.light && "Подсветка LED усилит переливы гималайской соли — попробуйте включить."}
                {config.salt && config.light && !config.juniper && "Отличное сочетание! Можжевельник добавит природный аромат."}
                {config.salt && config.juniper && config.light && "Максимальный комфорт: соль, можжевельник и подсветка — премиум-решение."}
                {!config.salt && config.juniper && "Можжевельник создаёт атмосферу леса. Соль добавит целебный эффект."}
                {!config.salt && !config.juniper && config.light && "Подсветка придаёт мягкость. Добавьте соль или можжевельник для полного эффекта."}
              </span>
            </div>
          )}
        </div>

        {/* Панель настроек — справа */}
        <div
          className="lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-gold/10 overflow-y-auto"
          style={{ background: "rgba(26,18,8,0.6)" }}
        >
          <div className="p-4">
            <SidePanel config={config} onChange={update} />
          </div>
        </div>
      </div>

      {/* Модальное окно заявки */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(13,9,4,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div className="w-full max-w-md rounded-2xl border border-gold/20 p-8"
            style={{ background: "rgba(44,31,14,0.97)" }}>
            {sent ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
                  <Icon name="CheckCheck" size={26} className="text-coal" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gold-light">Заявка отправлена!</h3>
                <p className="font-body text-white/60 text-sm">Сергей свяжется с вами и обсудит конфигурацию парилки.</p>
                <button onClick={() => { setSent(false); setShowForm(false); }}
                  className="font-heading text-sm tracking-widest uppercase px-6 py-2.5 border border-gold/40 text-gold hover:bg-gold hover:text-coal rounded transition-all">
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
                  <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition-colors">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <form onSubmit={handleSendLead} className="space-y-4">
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-1.5 block">Ваше имя</label>
                    <input type="text" required placeholder="Александр" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20"
                      style={{ background: "rgba(26,18,8,0.6)" }} />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-1.5 block">Телефон</label>
                    <input type="tel" required placeholder="+7 900 000-00-00" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
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
