import Icon from "@/components/ui/icon";
import type { WallConfig, WoodType, Direction } from "./WallCanvas";

const WOODS: { value: WoodType; label: string; desc: string; color: string }[] = [
  { value: "lipa",  label: "Липа",  desc: "Классика, светлый тон", color: "#E8D5A3" },
  { value: "olha",  label: "Ольха", desc: "Тёплый коричневый",     color: "#C4956A" },
  { value: "abash", label: "Абаш",  desc: "Африканский, светлый",  color: "#F0E0B8" },
];

interface ControlPanelProps {
  config: WallConfig;
  onChange: (c: WallConfig) => void;
  wallWidth: number;
  wallHeight: number;
  onSizeChange: (w: number, h: number) => void;
}

export default function ControlPanel({ config, onChange, wallWidth, wallHeight, onSizeChange }: ControlPanelProps) {
  const set = (patch: Partial<WallConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-6">

      {/* Размеры */}
      <div>
        <p className="font-heading text-xs tracking-widest uppercase text-white/40 mb-3">Размер стены</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="font-body text-white/40 text-xs mb-1 block">Ширина (м)</label>
            <input
              type="number"
              min={1} max={12} step={0.1}
              value={wallWidth}
              onChange={(e) => onSizeChange(parseFloat(e.target.value) || 1, wallHeight)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white text-sm"
              style={{ background: "rgba(26,18,8,0.6)" }}
            />
          </div>
          <div className="flex-1">
            <label className="font-body text-white/40 text-xs mb-1 block">Высота (м)</label>
            <input
              type="number"
              min={1} max={4} step={0.1}
              value={wallHeight}
              onChange={(e) => onSizeChange(wallWidth, parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white text-sm"
              style={{ background: "rgba(26,18,8,0.6)" }}
            />
          </div>
        </div>
      </div>

      {/* Порода дерева */}
      <div>
        <p className="font-heading text-xs tracking-widest uppercase text-white/40 mb-3">Порода дерева</p>
        <div className="space-y-2">
          {WOODS.map((w) => (
            <button
              key={w.value}
              onClick={() => set({ wood: w.value })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                config.wood === w.value
                  ? "border-gold bg-gold/10"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="w-7 h-7 rounded-md flex-shrink-0 border border-white/20" style={{ background: w.color }} />
              <div className="text-left">
                <div className={`font-heading text-sm font-bold tracking-wide ${config.wood === w.value ? "text-gold-light" : "text-white/80"}`}>
                  {w.label}
                </div>
                <div className="font-body text-white/40 text-xs">{w.desc}</div>
              </div>
              {config.wood === w.value && (
                <Icon name="Check" size={14} className="text-gold ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Направление вагонки */}
      <div>
        <p className="font-heading text-xs tracking-widest uppercase text-white/40 mb-3">Направление вагонки</p>
        <div className="grid grid-cols-2 gap-2">
          {([["horizontal", "Горизонталь", "AlignHorizontalJustifyCenter"], ["vertical", "Вертикаль", "AlignVerticalJustifyCenter"]] as [Direction, string, string][]).map(
            ([val, label, icon]) => (
              <button
                key={val}
                onClick={() => set({ direction: val })}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-lg border transition-all duration-200 ${
                  config.direction === val
                    ? "border-gold bg-gold/10 text-gold-light"
                    : "border-white/10 hover:border-white/30 text-white/50"
                }`}
              >
                <Icon name={icon as "AlignHorizontalJustifyCenter"} size={20} />
                <span className="font-heading text-xs tracking-wider">{label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Дополнения */}
      <div>
        <p className="font-heading text-xs tracking-widest uppercase text-white/40 mb-3">Дополнения</p>
        <div className="space-y-2">
          {[
            { key: "salt" as const,    label: "Гималайская соль",  desc: "Панно по центру стены",        icon: "Layers" },
            { key: "juniper" as const, label: "Можжевельник",      desc: "Рейки по краям стены",          icon: "TreePine" },
            { key: "light" as const,   label: "Подсветка LED",     desc: "Плинтус + боковое свечение",    icon: "Lightbulb" },
          ].map(({ key, label, desc, icon }) => (
            <button
              key={key}
              onClick={() => set({ [key]: !config[key] })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                config[key]
                  ? "border-gold bg-gold/10"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  config[key] ? "text-coal" : "text-white/40"
                }`}
                style={config[key] ? { background: "linear-gradient(135deg,#C9933A,#8A611A)" } : { background: "rgba(255,255,255,0.05)" }}
              >
                <Icon name={icon as "Layers"} size={15} />
              </div>
              <div className="text-left">
                <div className={`font-heading text-sm font-bold tracking-wide ${config[key] ? "text-gold-light" : "text-white/70"}`}>
                  {label}
                </div>
                <div className="font-body text-white/40 text-xs">{desc}</div>
              </div>
              <div
                className={`ml-auto w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5 ${
                  config[key] ? "justify-end" : "justify-start"
                }`}
                style={{ background: config[key] ? "linear-gradient(135deg,#C9933A,#8A611A)" : "rgba(255,255,255,0.1)" }}
              >
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
