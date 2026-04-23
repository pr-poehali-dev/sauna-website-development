import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PortfolioSection from "@/components/PortfolioSection";
import ContactsSection from "@/components/ContactsSection";

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "portfolio", "contacts"];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(s);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-coal font-body text-white overflow-x-hidden">
      <Navbar
        activeSection={activeSection}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        scrollTo={scrollTo}
      />

      <HeroSection scrollTo={scrollTo} />

      {/* ── О НАС ── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(90deg, #1A1208, #2C1F0E, #1A1208)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div
            className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
          >
            <Icon name="Award" size={28} className="text-coal" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-gold-light tracking-wide">Компания SAUNA — Сергей Махов</h2>
            <p className="font-body text-white/60 mt-2 text-base leading-relaxed">
              Работаем с материалами:{" "}
              <span className="text-gold">липа, ольха, абаш, гималайская соль, можжевельник</span>. Устанавливаем дровяные
              печи и электрокаменки. Каждый объект — уникальный проект.
            </p>
          </div>
        </div>
      </section>

      <PortfolioSection scrollTo={scrollTo} />

      <ContactsSection />

      {/* ── ФУТЕР ── */}
      <footer className="py-8 px-6 border-t border-gold/10" style={{ background: "#0D0904" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
            >
              <Icon name="Flame" size={12} className="text-coal" />
            </div>
            <span className="font-heading text-sm font-bold tracking-widest text-gold/60">SAUNA</span>
          </div>
          <p className="font-body text-white/25 text-xs text-center">© 2025 Компания SAUNA · Новосибирск · Горный Алтай</p>
          <a href="tel:+79130036579" className="font-heading text-sm text-gold/60 hover:text-gold transition-colors tracking-wider">
            +7 913 003-65-79
          </a>
        </div>
      </footer>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { opacity: 0.7; }
          100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
