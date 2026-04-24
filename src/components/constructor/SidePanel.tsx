import Icon from "@/components/ui/icon";
import type { RoomConfig, WoodType, Direction, StoveType, Corner, DoorWall } from "./useRoomConfig";
import { getAutoPlacement } from "./useRoomConfig";

interface SidePanelProps {
  config: RoomConfig;
  onChange: (patch: Partial<RoomConfig>) => void;
}

const WOODS: { value: WoodType; label: string; desc: string; color: string }[] = [
  { value: "lipa",  label: "Липа",  desc: "Классика, светлый тон", color: "#EFE0B2" },
  { value: "olha",  label: "Ольха", desc: "Тёплый коричневый",     color: "#D4A06A" },
  { value: "abash", label: "Абаш",  desc: "Африканский, премиум",  color: "#F5EAC8" },
];

const CORNERS: { value: Corner; label: string }[] = [
  { value: "front-left",  label: "Перед лево" },
  { value: "front-right", label: "Перед право" },
  { value: "back-left",   label: "Зад лево" },
  { value: "back-right",  label: "Зад право" },
];

const DOOR_WALLS: { value: DoorWall; label: string }[] = [
  { value: "front", label: "Передняя" },
  { value: "left",  label: "Левая" },
  { value: "right", label: "Правая" },
];

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
        active ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/25"
      }`}
    >
      {children}
      <div
        className={`ml-auto w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 ${active ? "justify-end" : "justify-start"}`}
        style={{ background: active ? "linear-gradient(135deg,#C9933A,#8A611A)" : "rgba(255,255,255,0.1)" }}
      >
        <div className="w-4 h-4 bg-white rounded-full shadow" />
      </div>
    </button>
  );
}

function Section({ title }: { title: string }) {
  return (
    <p className="font-heading text-xs tracking-[0.3em] uppercase text-white/30 mb-2.5 mt-5 first:mt-0">
      {title}
    </p>
  );
}

export default function SidePanel({ config, onChange }: SidePanelProps) {
  const { saltWall, juniperWalls } = getAutoPlacement(config);

  return (
    <div className="space-y-1 font-body">

      {/* Размеры */}
      <Section title="Размеры помещения" />
      <div className="grid grid-cols-3 gap-2">
        {([
          ["width", "Ширина", 1, 8],
          ["depth", "Глубина", 1, 8],
          ["height", "Высота", 1.8, 3.5],
        ] as [keyof RoomConfig, string, number, number][]).map(([key, label, min, max]) => (
          <div key={key as string}>
            <label className="text-white/35 text-xs mb-1 block">{label} м</label>
            <input
              type="number" min={min} max={max} step={0.1}
              value={config[key] as number}
              onChange={e => onChange({ [key]: parseFloat(e.target.value) || min } as Partial<RoomConfig>)}
              className="w-full px-2 py-2 rounded-lg border border-white/10 focus:border-gold/60 outline-none text-white text-sm font-bold font-heading"
              style={{ background: "rgba(26,18,8,0.7)" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 text-xs text-white/25 text-center">
        Площадь: <span className="text-gold/60">{(config.width * config.depth).toFixed(1)} м²</span>
        {" · "}Объём: <span className="text-gold/60">{(config.width * config.depth * config.height).toFixed(1)} м³</span>
      </div>

      {/* Порода */}
      <Section title="Порода дерева" />
      <div className="space-y-1.5">
        {WOODS.map(w => (
          <button
            key={w.value}
            onClick={() => onChange({ wood: w.value })}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200 ${
              config.wood === w.value ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/25"
            }`}
          >
            <div className="w-6 h-6 rounded-md flex-shrink-0 border border-white/20" style={{ background: w.color }} />
            <div className="text-left flex-1">
              <div className={`text-sm font-bold ${config.wood === w.value ? "text-gold-light" : "text-white/80"}`}>{w.label}</div>
              <div className="text-white/35 text-xs">{w.desc}</div>
            </div>
            {config.wood === w.value && <Icon name="Check" size={13} className="text-gold" />}
          </button>
        ))}
      </div>

      {/* Направление */}
      <Section title="Укладка вагонки" />
      <div className="grid grid-cols-2 gap-2">
        {([["horizontal","Горизонталь","AlignHorizontalJustifyCenter"],["vertical","Вертикаль","AlignVerticalJustifyCenter"]] as [Direction,string,string][]).map(
          ([val, label, icon]) => (
            <button
              key={val}
              onClick={() => onChange({ direction: val })}
              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all duration-200 ${
                config.direction === val ? "border-gold bg-gold/10 text-gold-light" : "border-white/10 hover:border-white/25 text-white/40"
              }`}
            >
              <Icon name={icon as "AlignHorizontalJustifyCenter"} size={18} />
              <span className="text-xs tracking-wide">{label}</span>
            </button>
          )
        )}
      </div>

      {/* Дополнения */}
      <Section title="Дополнения" />

      <Toggle active={config.salt} onClick={() => onChange({ salt: !config.salt })}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.salt ? "text-coal" : "text-white/35"}`}
          style={config.salt ? { background: "linear-gradient(135deg,#C9933A,#8A611A)" } : { background: "rgba(255,255,255,0.05)" }}>
          <Icon name="Layers" size={14} />
        </div>
        <div className="text-left">
          <div className={`text-sm font-bold ${config.salt ? "text-gold-light" : "text-white/70"}`}>Гималайская соль</div>
          {config.salt && saltWall && (
            <div className="text-xs text-white/35">→ {{back:"задняя",left:"левая",right:"правая"}[saltWall]} стена</div>
          )}
        </div>
      </Toggle>

      <Toggle active={config.juniper} onClick={() => onChange({ juniper: !config.juniper })}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.juniper ? "text-coal" : "text-white/35"}`}
          style={config.juniper ? { background: "linear-gradient(135deg,#C9933A,#8A611A)" } : { background: "rgba(255,255,255,0.05)" }}>
          <Icon name="TreePine" size={14} />
        </div>
        <div className="text-left">
          <div className={`text-sm font-bold ${config.juniper ? "text-gold-light" : "text-white/70"}`}>Можжевельник</div>
          {config.juniper && juniperWalls.length > 0 && (
            <div className="text-xs text-white/35">→ {juniperWalls.map(w=>({back:"задняя",left:"левая",right:"правая"}[w])).join(", ")}</div>
          )}
        </div>
      </Toggle>

      <Toggle active={config.light} onClick={() => onChange({ light: !config.light })}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.light ? "text-coal" : "text-white/35"}`}
          style={config.light ? { background: "linear-gradient(135deg,#C9933A,#8A611A)" } : { background: "rgba(255,255,255,0.05)" }}>
          <Icon name="Lightbulb" size={14} />
        </div>
        <div className="text-left">
          <div className={`text-sm font-bold ${config.light ? "text-gold-light" : "text-white/70"}`}>LED подсветка</div>
          <div className="text-xs text-white/35">Плинтус + боковое свечение</div>
        </div>
      </Toggle>

      {/* Печь */}
      <Section title="Печь" />
      <Toggle active={config.stoveEnabled} onClick={() => onChange({ stoveEnabled: !config.stoveEnabled })}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.stoveEnabled ? "text-coal" : "text-white/35"}`}
          style={config.stoveEnabled ? { background: "linear-gradient(135deg,#C9933A,#8A611A)" } : { background: "rgba(255,255,255,0.05)" }}>
          <Icon name="Flame" size={14} />
        </div>
        <div className="text-left">
          <div className={`text-sm font-bold ${config.stoveEnabled ? "text-gold-light" : "text-white/70"}`}>Добавить печь</div>
        </div>
      </Toggle>

      {config.stoveEnabled && (
        <div className="space-y-2 pl-1">
          {/* Тип печи */}
          <div className="grid grid-cols-2 gap-2">
            {([["wood","Дровяная","Flame"],["electric","Электро","Zap"]] as [StoveType,string,string][]).map(
              ([val, label, icon]) => (
                <button key={val} onClick={() => onChange({ stoveType: val })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                    config.stoveType === val ? "border-gold bg-gold/10 text-gold-light" : "border-white/10 hover:border-white/25 text-white/50"
                  }`}>
                  <Icon name={icon as "Flame"} size={14} />
                  {label}
                </button>
              )
            )}
          </div>
          {/* Угол */}
          <div>
            <label className="text-white/30 text-xs mb-1 block">Расположение угол</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CORNERS.map(c => (
                <button key={c.value} onClick={() => onChange({ stoveCorner: c.value })}
                  className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${
                    config.stoveCorner === c.value ? "border-gold bg-gold/10 text-gold-light" : "border-white/10 text-white/40 hover:border-white/25"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Дверь */}
      <Section title="Дверь" />
      <div className="grid grid-cols-3 gap-1.5">
        {DOOR_WALLS.map(d => (
          <button key={d.value} onClick={() => onChange({ doorWall: d.value })}
            className={`text-xs px-2 py-2 rounded-xl border transition-all ${
              config.doorWall === d.value ? "border-gold bg-gold/10 text-gold-light font-bold" : "border-white/10 text-white/40 hover:border-white/25"
            }`}>
            {d.label}
          </button>
        ))}
      </div>

    </div>
  );
}
