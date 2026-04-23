import { useRef, useState, useEffect } from "react";

const HERO_IMG = "https://cdn.poehali.dev/projects/1478c925-ea13-412b-95a6-92e1287462ec/files/a3ad89f5-da15-43e0-a223-3b1d4b4f3f73.jpg";
const RUSTIC_IMG = "https://cdn.poehali.dev/projects/1478c925-ea13-412b-95a6-92e1287462ec/files/98165ce3-f195-4e96-8f84-ea24ca49ea53.jpg";
const DESIGNER_IMG = "https://cdn.poehali.dev/projects/1478c925-ea13-412b-95a6-92e1287462ec/files/0681b515-ecb7-492b-9798-47c44af5def8.jpg";

const portfolioItems = [
  {
    id: 1,
    title: "Классические",
    subtitle: "Традиционная финская баня",
    desc: "Липа, ольха, дровяная печь. Проверенные временем решения с многолетним комфортом.",
    img: HERO_IMG,
    tag: "Классик",
  },
  {
    id: 2,
    title: "Леший",
    subtitle: "Рустикальный стиль под старину",
    desc: "Грубо тёсаный брус, состаренное дерево, кованые детали. Атмосфера дремучего леса.",
    img: RUSTIC_IMG,
    tag: "Рустикал",
  },
  {
    id: 3,
    title: "Премиум",
    subtitle: "Дизайнерская парная",
    desc: "Гималайская соль, абаш, электрокаменка. Люксовая эстетика для ценителей.",
    img: DESIGNER_IMG,
    tag: "Дизайн",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

interface PortfolioSectionProps {
  scrollTo: (id: string) => void;
}

export default function PortfolioSection({ scrollTo }: PortfolioSectionProps) {
  const [activePortfolio, setActivePortfolio] = useState(0);
  const portfolioSection = useInView();

  return (
    <section id="portfolio" className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #C9933A 0%, transparent 50%)" }}
      />

      <div className="max-w-6xl mx-auto">
        <div
          ref={portfolioSection.ref}
          className={`text-center mb-16 transition-all duration-700 ${
            portfolioSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="font-heading text-xs tracking-[0.4em] uppercase text-gold font-medium">Наши работы</span>
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-white mt-3 tracking-tight">ПОРТФОЛИО</h2>
          <div
            className="w-16 h-px mx-auto mt-4"
            style={{ background: "linear-gradient(90deg, transparent, #C9933A, transparent)" }}
          />
        </div>

        <div className="flex justify-center gap-2 mb-12">
          {portfolioItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setActivePortfolio(i)}
              className={`font-heading text-sm tracking-widest uppercase px-5 py-2.5 rounded transition-all duration-300 ${
                activePortfolio === i
                  ? "text-coal font-bold"
                  : "text-white/50 border border-white/10 hover:border-gold/40 hover:text-gold"
              }`}
              style={activePortfolio === i ? { background: "linear-gradient(135deg, #C9933A, #8A611A)" } : {}}
            >
              {item.tag}
            </button>
          ))}
        </div>

        <div
          className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gold/20"
          style={{ background: "rgba(44,31,14,0.6)", backdropFilter: "blur(12px)" }}
        >
          <div className="relative overflow-hidden" style={{ minHeight: "400px" }}>
            <img
              src={portfolioItems[activePortfolio].img}
              alt={portfolioItems[activePortfolio].title}
              className="w-full h-full object-cover transition-all duration-700"
              style={{ minHeight: "400px" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, transparent 50%, rgba(26,18,8,0.3) 100%)" }}
            />
            <div className="absolute top-4 left-4">
              <span
                className="font-heading text-xs tracking-[0.3em] uppercase px-3 py-1.5 rounded font-bold text-coal"
                style={{ background: "linear-gradient(135deg, #C9933A, #E8B96A)" }}
              >
                {portfolioItems[activePortfolio].tag}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center p-10 md:p-14">
            <h3 className="font-heading text-5xl font-bold text-gold-light tracking-tight">
              {portfolioItems[activePortfolio].title}
            </h3>
            <p className="font-heading text-lg text-white/50 mt-2 uppercase tracking-widest">
              {portfolioItems[activePortfolio].subtitle}
            </p>
            <div className="w-12 h-px my-6" style={{ background: "#C9933A" }} />
            <p className="font-body text-white/70 text-base leading-relaxed">
              {portfolioItems[activePortfolio].desc}
            </p>
            <button
              onClick={() => scrollTo("contacts")}
              className="mt-8 self-start font-heading text-sm font-semibold tracking-widest uppercase px-6 py-3 rounded transition-all duration-300 border border-gold text-gold hover:bg-gold hover:text-coal"
            >
              Хочу такую баню
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {portfolioItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setActivePortfolio(i)}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                activePortfolio === i ? "ring-2 ring-gold scale-[1.02]" : "opacity-50 hover:opacity-80"
              }`}
              style={{ height: "100px" }}
            >
              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0 flex items-end p-2"
                style={{ background: "linear-gradient(to top, rgba(26,18,8,0.8) 0%, transparent 100%)" }}
              >
                <span className="font-heading text-xs uppercase tracking-wider text-gold-light">{item.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
