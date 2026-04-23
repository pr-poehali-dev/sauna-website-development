import { useRef, useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/1478c925-ea13-412b-95a6-92e1287462ec/files/a3ad89f5-da15-43e0-a223-3b1d4b4f3f73.jpg";

const stats = [
  { value: "10+", label: "лет опыта" },
  { value: "200+", label: "объектов" },
  { value: "3", label: "стиля отделки" },
  { value: "2", label: "региона" },
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

interface HeroSectionProps {
  scrollTo: (id: string) => void;
}

export default function HeroSection({ scrollTo }: HeroSectionProps) {
  const statsSection = useInView();

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="Sauna" className="w-full h-full object-cover opacity-40" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(26,18,8,0.6) 0%, rgba(26,18,8,0.3) 40%, rgba(26,18,8,0.85) 100%)" }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              background: i % 2 === 0 ? "#C9933A" : "#FF6B1A",
              left: `${10 + i * 11}%`,
              bottom: `${20 + (i % 3) * 12}%`,
              opacity: 0.4,
              animation: `float-up ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C9933A, transparent)" }}
      />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
        <div className="opacity-0 animate-fade-in">
          <span className="font-heading text-xs tracking-[0.4em] uppercase text-gold font-medium px-4 py-2 border border-gold/40 rounded-full">
            Новосибирск · Горный Алтай
          </span>
        </div>

        <h1
          className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold mt-8 leading-none opacity-0 animate-fade-in"
          style={{ animationDelay: "0.2s", letterSpacing: "-0.02em" }}
        >
          <span className="block text-white">БАНИ</span>
          <span
            className="block"
            style={{
              WebkitTextStroke: "1px #C9933A",
              color: "transparent",
              textShadow: "0 0 80px rgba(201,147,58,0.3)",
            }}
          >
            &amp; САУНЫ
          </span>
          <span className="block text-white">ПОД КЛЮЧ</span>
        </h1>

        <p
          className="font-body text-white/70 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          Профессиональная отделка от эконом до премиум. Классические, дизайнерские и рустикальные парные в стиле «Леший»
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          <button
            onClick={() => scrollTo("contacts")}
            className="font-heading text-sm font-semibold tracking-widest uppercase px-8 py-4 rounded transition-all duration-300 animate-glow-pulse text-coal"
            style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
          >
            Бесплатная консультация
          </button>
          <button
            onClick={() => scrollTo("portfolio")}
            className="font-heading text-sm font-semibold tracking-widest uppercase px-8 py-4 rounded border border-white/30 text-white hover:border-gold hover:text-gold transition-all duration-300"
          >
            Посмотреть работы
          </button>
        </div>
      </div>

      <div
        ref={statsSection.ref}
        className={`relative z-10 w-full max-w-4xl mx-auto mt-20 px-6 grid grid-cols-2 md:grid-cols-4 gap-px transition-all duration-700 ${
          statsSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ borderTop: "1px solid rgba(201,147,58,0.2)" }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="text-center py-6 px-4"
            style={{ borderRight: i < 3 ? "1px solid rgba(201,147,58,0.1)" : "none" }}
          >
            <div className="font-heading text-4xl font-bold text-gold-light">{s.value}</div>
            <div className="font-body text-white/50 text-sm mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollTo("portfolio")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/50 hover:text-gold transition-colors animate-bounce"
      >
        <Icon name="ChevronDown" size={32} />
      </button>
    </section>
  );
}
