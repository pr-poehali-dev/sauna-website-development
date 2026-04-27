import Icon from "@/components/ui/icon";
import type { RoomConfig, WoodType, Direction, StoveType, Corner, DoorWall } from "./useRoomConfig";
import { getAutoPlacement } from "./useRoomConfig";

interface SidePanelProps {
  config: RoomConfig;
  onChange: (patch: Partial<RoomConfig>) => void;
  step: number;
  onStep: (s: number) => void;
}

const STEPS = [
  { icon: "Ruler",      label: "Размеры" },
  { icon: "TreePine",   label: "Дерево"  },
  { icon: "Layers",     label: "Добавки" },
  { icon: "Flame",      label: "Печь"    },
  { icon: "DoorOpen",   label: "Дверь"   },
];

function OptionCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left ${
        active ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/25"
      }`}>
      {children}
      {active && <Icon name="Check" size={13} className="text-gold ml-auto flex-shrink-0" />}
    </button>
  );
}

function Toggle({ active, onClick, icon, title, sub }: {
  active: boolean; onClick: () => void; icon: string; title: string; sub?: string;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 ${
        active ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/25"
      }`}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={active ? {background:"linear-gradient(135deg,#C9933A,#8A611A)"} : {background:"rgba(255,255,255,0.05)"}}>
        <Icon name={icon as "Flame"} size={14} className={active ? "text-coal" : "text-white/35"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold ${active ? "text-gold-light" : "text-white/70"}`}>{title}</div>
        {sub && <div className="text-white/35 text-xs truncate">{sub}</div>}
      </div>
      <div className={`w-10 h-5 rounded-full flex items-center px-0.5 flex-shrink-0 ${active ? "justify-end" : "justify-start"}`}
        style={{background: active ? "linear-gradient(135deg,#C9933A,#8A611A)" : "rgba(255,255,255,0.1)"}}>
        <div className="w-4 h-4 bg-white rounded-full shadow" />
      </div>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-heading text-xs tracking-[0.25em] uppercase text-white/30 mb-2">{children}</p>;
}

const WOOD_OPTIONS: { value: WoodType; label: string; desc: string; color: string }[] = [
  { value: "lipa",  label: "Липа",  desc: "Классика, мягкий аромат, светлый тон", color: "#F2E4BE" },
  { value: "olha",  label: "Ольха", desc: "Тёплый коричневый, не смолит",         color: "#D8A870" },
  { value: "abash", label: "Абаш",  desc: "Африканское, не нагревается, премиум", color: "#F8EED2" },
];

const CORNERS: { value: Corner; label: string; icon: string }[] = [
  { value: "front-left",  label: "Перед-лево",  icon: "ArrowUpLeft"    },
  { value: "front-right", label: "Перед-право", icon: "ArrowUpRight"   },
  { value: "back-left",   label: "Зад-лево",    icon: "ArrowDownLeft"  },
  { value: "back-right",  label: "Зад-право",   icon: "ArrowDownRight" },
];

const DOOR_WALLS: { value: DoorWall; label: string }[] = [
  { value: "front", label: "Передняя" },
  { value: "left",  label: "Левая"    },
  { value: "right", label: "Правая"   },
];

export default function SidePanel({ config, onChange, step, onStep }: SidePanelProps) {
  const { saltWall, juniperWalls } = getAutoPlacement(config);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Степпер */}
      <div className="flex items-center gap-0.5 mb-4 flex-shrink-0">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => onStep(i)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all"
            style={step === i ? {background:"rgba(201,147,58,0.12)", borderBottom:"2px solid #C9933A"} : {}}>
            <Icon name={s.icon as "Flame"} size={14}
              className={step === i ? "text-gold" : i < step ? "text-gold/50" : "text-white/20"} />
            <span className={`font-heading text-[9px] tracking-wider uppercase leading-none ${
              step === i ? "text-gold" : i < step ? "text-white/40" : "text-white/20"
            }`}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-0.5" style={{scrollbarWidth:"none"}}>

        {step === 0 && (
          <div className="space-y-3">
            <Label>Внутренние размеры</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["width",  "Ширина",  1,   8,   "лево–право"  ],
                ["depth",  "Глубина", 1,   8,   "перед–зад"   ],
                ["height", "Высота",  1.8, 3.5, "пол–потолок" ],
              ] as [keyof RoomConfig, string, number, number, string][]).map(([key,label,min,max,hint]) => (
                <div key={key as string}>
                  <label className="text-white/35 text-xs mb-1 block">{label} <span className="text-white/20">м</span></label>
                  <input type="number" min={min} max={max} step={0.1}
                    value={config[key] as number}
                    onChange={e => onChange({[key]: parseFloat(e.target.value) || min} as Partial<RoomConfig>)}
                    className="w-full px-2 py-2 rounded-lg border border-white/10 focus:border-gold/60 outline-none text-white text-sm font-bold font-heading"
                    style={{background:"rgba(26,18,8,0.7)"}} />
                  <p className="text-white/20 text-[10px] mt-0.5">{hint}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gold/15 px-3 py-2.5 space-y-1"
              style={{background:"rgba(201,147,58,0.05)"}}>
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-body">Площадь пола</span>
                <span className="text-gold font-bold font-heading">{(config.width*config.depth).toFixed(1)} м²</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-body">Объём</span>
                <span className="text-gold font-bold font-heading">{(config.width*config.depth*config.height).toFixed(1)} м³</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <Label>Порода дерева</Label>
            {WOOD_OPTIONS.map(w => (
              <OptionCard key={w.value} active={config.wood === w.value} onClick={() => onChange({wood: w.value})}>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-white/15" style={{background: w.color}} />
                <div>
                  <div className={`text-sm font-bold ${config.wood===w.value?"text-gold-light":"text-white/80"}`}>{w.label}</div>
                  <div className="text-white/35 text-xs leading-tight">{w.desc}</div>
                </div>
              </OptionCard>
            ))}
            <div className="pt-1">
              <Label>Укладка вагонки</Label>
              <div className="grid grid-cols-2 gap-2">
                {([["horizontal","Горизонталь","AlignHorizontalJustifyCenter"],
                   ["vertical",  "Вертикаль",  "AlignVerticalJustifyCenter"]] as [Direction,string,string][]).map(([val,label,icon]) => (
                  <button key={val} onClick={() => onChange({direction: val})}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                      config.direction===val ? "border-gold bg-gold/10 text-gold-light" : "border-white/10 hover:border-white/25 text-white/35"
                    }`}>
                    <Icon name={icon as "AlignHorizontalJustifyCenter"} size={18} />
                    <span className="font-heading text-xs tracking-wider">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label>Дополнения</Label>
            <Toggle active={config.salt} onClick={() => onChange({salt: !config.salt})}
              icon="Layers" title="Гималайская соль"
              sub={config.salt && saltWall
                ? `→ ${({back:"задняя стена",left:"левая стена",right:"правая стена"})[saltWall]}`
                : "Лечебный эффект, розовый цвет"} />
            <Toggle active={config.juniper} onClick={() => onChange({juniper: !config.juniper})}
              icon="TreePine" title="Можжевельник"
              sub={config.juniper && juniperWalls.length > 0
                ? `→ ${juniperWalls.map(w => ({back:"задняя",left:"левая",right:"правая"})[w]).join(", ")}`
                : "Панно из спилов, аромат леса"} />
            <Toggle active={config.light} onClick={() => onChange({light: !config.light})}
              icon="Lightbulb" title="LED подсветка"
              sub="Тёплое свечение у пола" />
            <Toggle active={config.benches} onClick={() => onChange({benches: !config.benches})}
              icon="LayoutList" title="Лавки (2 яруса)"
              sub="Вдоль задней стены" />
            {(config.salt || config.juniper) && (
              <div className="px-3 py-2.5 rounded-xl border border-gold/15 flex gap-2"
                style={{background:"rgba(201,147,58,0.05)"}}>
                <Icon name="Info" size={13} className="text-gold/50 mt-0.5 flex-shrink-0" />
                <p className="font-body text-xs text-white/45 leading-relaxed">
                  {config.salt && config.juniper
                    ? "Соль и можжевельник разместим на разных стенах автоматически."
                    : config.salt
                    ? "Соль — на задней стене, напротив входа."
                    : "Можжевельник — панно из плотных спилов на боковой стене."}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <Label>Тип печи</Label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => onChange({stoveEnabled: false})}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${
                  !config.stoveEnabled ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/20"}`}>
                <Icon name="X" size={16} className={!config.stoveEnabled ? "text-gold" : "text-white/25"} />
                <span className={`font-heading text-[10px] tracking-wider uppercase ${!config.stoveEnabled ? "text-gold-light" : "text-white/25"}`}>Нет</span>
              </button>
              {([["wood","Дровяная","Flame"],["electric","Электро","Zap"]] as [StoveType,string,string][]).map(([val,label,icon]) => (
                <button key={val} onClick={() => onChange({stoveEnabled: true, stoveType: val})}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${
                    config.stoveEnabled && config.stoveType===val ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/20"}`}>
                  <Icon name={icon as "Flame"} size={16}
                    className={config.stoveEnabled && config.stoveType===val ? "text-gold" : "text-white/25"} />
                  <span className={`font-heading text-[10px] tracking-wider uppercase ${
                    config.stoveEnabled && config.stoveType===val ? "text-gold-light" : "text-white/25"}`}>{label}</span>
                </button>
              ))}
            </div>

            {config.stoveEnabled && (
              <>
                <Label>Угол расположения</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CORNERS.map(c => (
                    <button key={c.value} onClick={() => onChange({stoveCorner: c.value})}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                        config.stoveCorner===c.value ? "border-gold bg-gold/10 text-gold-light font-bold" : "border-white/10 text-white/40 hover:border-white/25"
                      }`}>
                      <Icon name={c.icon as "ArrowUpLeft"} size={13} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <Label>Расположение двери</Label>
            {DOOR_WALLS.map(d => (
              <OptionCard key={d.value} active={config.doorWall===d.value} onClick={() => onChange({doorWall: d.value})}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={config.doorWall===d.value
                    ? {background:"linear-gradient(135deg,#C9933A,#8A611A)"}
                    : {background:"rgba(255,255,255,0.05)"}}>
                  <Icon name="DoorOpen" size={14} className={config.doorWall===d.value?"text-coal":"text-white/35"} />
                </div>
                <span className={`text-sm font-bold ${config.doorWall===d.value?"text-gold-light":"text-white/70"}`}>
                  {d.label} стена
                </span>
              </OptionCard>
            ))}
          </div>
        )}

      </div>

      {/* Навигация */}
      <div className="pt-3 flex gap-2 flex-shrink-0">
        {step > 0 && (
          <button onClick={() => onStep(step - 1)}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 font-heading text-xs tracking-widest uppercase transition-all">
            Назад
          </button>
        )}
        <button onClick={() => step < STEPS.length - 1 ? onStep(step + 1) : undefined}
          className={`flex-1 py-2.5 rounded-xl font-heading text-xs tracking-widest uppercase text-coal transition-all ${
            step === STEPS.length - 1 ? "opacity-40 cursor-default" : ""
          }`}
          style={{background:"linear-gradient(135deg,#C9933A,#8A611A)"}}>
          {step < STEPS.length - 1 ? "Далее" : "Готово"}
        </button>
      </div>
    </div>
  );
}
