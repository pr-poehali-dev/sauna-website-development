import Icon from "@/components/ui/icon";
import type { RoomConfig } from "./useRoomConfig";

interface RoomSetupProps {
  config: RoomConfig;
  onUpdate: (patch: Partial<RoomConfig>) => void;
  onDone: () => void;
}

export default function RoomSetup({ config, onUpdate, onDone }: RoomSetupProps) {
  const isValid = config.width >= 1 && config.depth >= 1 && config.height >= 1.8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(13,9,4,0.97)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-lg rounded-2xl border border-gold/20 p-8"
        style={{ background: "rgba(44,31,14,0.97)" }}>

        {/* Шапка */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}>
            <Icon name="Ruler" size={18} className="text-coal" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-white">Размеры парилки</h2>
            <p className="font-body text-white/40 text-sm">Введите внутренние размеры помещения</p>
          </div>
        </div>

        {/* Схема-подсказка */}
        <div className="mb-6 rounded-xl border border-gold/10 p-4 flex justify-center"
          style={{ background: "rgba(26,18,8,0.5)" }}>
          <svg width="200" height="130" viewBox="0 0 200 130">
            {/* Изометрическая схема */}
            <polygon points="100,10 180,50 180,100 100,130 20,100 20,50" fill="none" stroke="rgba(201,147,58,0.3)" strokeWidth="1" />
            <polygon points="100,10 180,50 100,90 20,50" fill="rgba(201,147,58,0.06)" stroke="rgba(201,147,58,0.4)" strokeWidth="1.5" />
            <polygon points="20,50 100,90 100,130 20,100" fill="rgba(201,147,58,0.04)" stroke="rgba(201,147,58,0.3)" strokeWidth="1" />
            <polygon points="180,50 100,90 100,130 180,100" fill="rgba(201,147,58,0.08)" stroke="rgba(201,147,58,0.3)" strokeWidth="1" />
            {/* Стрелки размеров */}
            <text x="100" y="6" fill="#C9933A" fontSize="9" textAnchor="middle">Глубина</text>
            <text x="195" y="78" fill="#C9933A" fontSize="9" textAnchor="start">Шир.</text>
            <text x="8" y="78" fill="#C9933A" fontSize="9" textAnchor="end">H</text>
          </svg>
        </div>

        {/* Поля */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { key: "width" as const, label: "Ширина", unit: "м", min: 1, max: 6, hint: "лево–право" },
            { key: "depth" as const, label: "Глубина", unit: "м", min: 1, max: 6, hint: "перед–зад" },
            { key: "height" as const, label: "Высота", unit: "м", min: 1.8, max: 3, hint: "пол–потолок" },
          ].map(({ key, label, unit, min, max, hint }) => (
            <div key={key}>
              <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-1 block">{label}</label>
              <div className="relative">
                <input
                  type="number" min={min} max={max} step={0.1}
                  value={config[key]}
                  onChange={e => onUpdate({ [key]: parseFloat(e.target.value) || min })}
                  className="w-full px-3 py-2.5 pr-7 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-heading text-white text-base font-bold"
                  style={{ background: "rgba(26,18,8,0.7)" }}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-body text-white/30 text-xs">{unit}</span>
              </div>
              <p className="font-body text-white/25 text-xs mt-1">{hint}</p>
            </div>
          ))}
        </div>

        {/* Площадь */}
        <div className="mb-6 px-4 py-3 rounded-xl border border-gold/15 flex items-center gap-3"
          style={{ background: "rgba(201,147,58,0.06)" }}>
          <Icon name="LayoutGrid" size={16} className="text-gold/60" />
          <span className="font-body text-white/50 text-sm">
            Площадь пола: <span className="text-gold font-bold">{(config.width * config.depth).toFixed(1)} м²</span>
            {" · "}Объём: <span className="text-gold font-bold">{(config.width * config.depth * config.height).toFixed(1)} м³</span>
          </span>
        </div>

        <button
          onClick={onDone}
          disabled={!isValid}
          className="w-full font-heading text-sm font-bold tracking-widest uppercase py-4 rounded-xl text-coal disabled:opacity-40 transition-all"
          style={{ background: "linear-gradient(135deg,#C9933A,#8A611A)" }}
        >
          Перейти к конструктору
        </button>
      </div>
    </div>
  );
}
