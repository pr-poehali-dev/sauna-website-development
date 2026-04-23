import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/1478c925-ea13-412b-95a6-92e1287462ec/files/a3ad89f5-da15-43e0-a223-3b1d4b4f3f73.jpg";
const DESIGNER_IMG = "https://cdn.poehali.dev/projects/1478c925-ea13-412b-95a6-92e1287462ec/files/0681b515-ecb7-492b-9798-47c44af5def8.jpg";

const RUSTIC_PHOTOS = [
  "https://cdn.poehali.dev/files/22a09e90-119d-464b-ad33-27fff10dc618.jpg",
  "https://cdn.poehali.dev/files/b5aa6f34-0e56-4571-b178-2ad3e08abc1a.jpg",
  "https://cdn.poehali.dev/files/6da2bc42-e853-4fbb-a3f1-358d3f50226f.jpg",
  "https://cdn.poehali.dev/files/6adc7b4f-7e0c-4054-a267-c87c0545b860.jpg",
];

const PREMIUM_PHOTOS = [
  "https://cdn.poehali.dev/files/4679f019-fa42-42fa-92ca-7eac0e78ae1e.jpg",
  "https://cdn.poehali.dev/files/253ab709-2e31-43a1-968c-1d3131c5d749.jpg",
  "https://cdn.poehali.dev/files/82014c81-3478-45da-9e0e-20720f729b66.jpg",
  "https://cdn.poehali.dev/files/cd2f0528-d5ae-490d-b7ed-1ff9cdebada9.jpg",
  "https://cdn.poehali.dev/files/ce0e742c-6ef1-4596-ac54-44861a0dffbd.jpg",
];

const CLASSIC_PHOTOS = [
  "https://cdn.poehali.dev/files/5ab52df4-0e03-4f60-838c-917c06e35d22.jpg",
  "https://cdn.poehali.dev/files/d3de9fb7-5e99-4db3-9a7a-2cb4c89e022a.jpg",
  "https://cdn.poehali.dev/files/c107c9c1-ec37-4d0b-bef7-50034b237f9b.jpg",
];

const portfolioItems = [
  {
    id: 1,
    title: "Классические",
    subtitle: "Традиционная финская баня",
    desc: "Липа, ольха, дровяная печь. Проверенные временем решения с многолетним комфортом.",
    img: CLASSIC_PHOTOS[0],
    tag: "Классик",
    photos: CLASSIC_PHOTOS,
  },
  {
    id: 2,
    title: "Леший",
    subtitle: "Рустикальный стиль под старину",
    desc: "Грубо тёсаный брус, состаренное дерево, кованые детали. Атмосфера дремучего леса.",
    img: RUSTIC_PHOTOS[0],
    tag: "Рустикал",
    photos: RUSTIC_PHOTOS,
  },
  {
    id: 3,
    title: "Премиум",
    subtitle: "Дизайнерская парная",
    desc: "Гималайская соль, абаш, электрокаменка. Люксовая эстетика для ценителей.",
    img: PREMIUM_PHOTOS[0],
    tag: "Дизайн",
    photos: PREMIUM_PHOTOS,
  },
];

const stats = [
  { value: "10+", label: "лет опыта" },
  { value: "200+", label: "объектов" },
  { value: "3", label: "стиля отделки" },
  { value: "2", label: "региона" },
];

const socials = [
  { name: "YouTube", icon: "Youtube", url: "https://www.youtube.com/@stylesauna" },
  { name: "ВКонтакте", icon: "MessageSquare", url: "https://vk.com/sauna54banya" },
  { name: "Telegram", icon: "Send", url: "https://t.me/sauna54banya" },
  { name: "МАХ", icon: "Tv2", url: "https://max.ru/id540134882258_biz" },
  { name: "Дзен", icon: "BookOpen", url: "https://dzen.ru/banya_54" },
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

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [activePortfolio, setActivePortfolio] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);

  const statsSection = useInView();
  const portfolioSection = useInView();
  const contactSection = useInView();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-coal font-body text-white overflow-x-hidden">

      {/* ── НАВИГАЦИЯ ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: "linear-gradient(to bottom, rgba(26,18,8,0.95) 0%, transparent 100%)", backdropFilter: "blur(8px)" }}
      >
        <button onClick={() => scrollTo("home")} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
          >
            <Icon name="Flame" size={16} className="text-coal" />
          </div>
          <span className="font-heading text-xl font-bold tracking-widest text-gold-light">SAUNA</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {[
            { id: "home", label: "Главная" },
            { id: "portfolio", label: "Портфолио" },
            { id: "contacts", label: "Контакты" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`font-heading text-sm tracking-widest uppercase transition-all duration-300 ${
                activeSection === item.id
                  ? "text-gold-light border-b border-gold"
                  : "text-white/60 hover:text-gold-light"
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="tel:+79130036579"
            className="font-heading text-sm tracking-wider px-4 py-2 rounded border border-gold text-gold hover:bg-gold hover:text-coal transition-all duration-300 font-semibold"
          >
            +7 913 003-65-79
          </a>
        </div>

        <button className="md:hidden text-gold" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={28} />
        </button>
      </nav>

      {/* Мобильное меню */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ background: "rgba(26,18,8,0.97)", backdropFilter: "blur(12px)" }}
        >
          {[
            { id: "home", label: "Главная" },
            { id: "portfolio", label: "Портфолио" },
            { id: "contacts", label: "Контакты" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="font-heading text-3xl font-bold tracking-widest uppercase text-white hover:text-gold-light transition-colors"
            >
              {item.label}
            </button>
          ))}
          <a href="tel:+79130036579" className="font-heading text-xl text-gold font-semibold tracking-wider mt-4">
            +7 913 003-65-79
          </a>
        </div>
      )}

      {/* ── HERO ── */}
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

      {/* ── ПОРТФОЛИО ── */}
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
                onClick={() => { setActivePortfolio(i); setActivePhoto(0); }}
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
                src={portfolioItems[activePortfolio].photos.length > 0 ? portfolioItems[activePortfolio].photos[activePhoto] : portfolioItems[activePortfolio].img}
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

          {portfolioItems[activePortfolio].photos.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {portfolioItems[activePortfolio].photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                    activePhoto === i ? "ring-2 ring-gold scale-[1.02]" : "opacity-50 hover:opacity-80"
                  }`}
                  style={{ height: "90px" }}
                >
                  <img src={photo} alt={`фото ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-4">
            {portfolioItems.map((item, i) => (
              <button
                key={i}
                onClick={() => { setActivePortfolio(i); setActivePhoto(0); }}
                className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                  activePortfolio === i ? "ring-2 ring-gold scale-[1.02]" : "opacity-50 hover:opacity-80"
                }`}
                style={{ height: "100px" }}
              >
                <img src={item.photos.length > 0 ? item.photos[0] : item.img} alt={item.title} className="w-full h-full object-cover" />
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

      {/* ── КОНТАКТЫ ── */}
      <section
        id="contacts"
        className="py-24 px-6 relative"
        style={{ background: "linear-gradient(180deg, #1A1208 0%, #0D0904 100%)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #C9933A, transparent)" }}
        />

        <div className="max-w-5xl mx-auto">
          <div
            ref={contactSection.ref}
            className={`text-center mb-16 transition-all duration-700 ${
              contactSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="font-heading text-xs tracking-[0.4em] uppercase text-gold font-medium">Свяжитесь с нами</span>
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-white mt-3">КОНТАКТЫ</h2>
            <div
              className="w-16 h-px mx-auto mt-4"
              style={{ background: "linear-gradient(90deg, transparent, #C9933A, transparent)" }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="font-heading text-2xl font-bold text-gold-light mb-4 tracking-wide">Сергей Махов</h3>
                <p className="font-body text-white/60 text-base">
                  Основатель и руководитель компании SAUNA. Более 10 лет создаём бани мечты в Новосибирске и Горном Алтае.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:+79130036579"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gold/20 hover:border-gold/50 transition-all duration-300 group"
                  style={{ background: "rgba(44,31,14,0.4)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
                  >
                    <Icon name="Phone" size={18} className="text-coal" />
                  </div>
                  <div>
                    <div className="font-heading text-xs tracking-widest uppercase text-white/40">Телефон</div>
                    <div className="font-heading text-lg font-bold text-gold-light group-hover:text-gold transition-colors">
                      +7 913 003-65-79
                    </div>
                  </div>
                </a>

                <div
                  className="flex items-center gap-4 p-4 rounded-xl border border-gold/20"
                  style={{ background: "rgba(44,31,14,0.4)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
                  >
                    <Icon name="MapPin" size={18} className="text-coal" />
                  </div>
                  <div>
                    <div className="font-heading text-xs tracking-widest uppercase text-white/40">Регионы работы</div>
                    <div className="font-heading text-base font-bold text-white">Новосибирск · Горный Алтай</div>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-heading text-xs tracking-[0.3em] uppercase text-white/40 mb-4">Наши соц. сети</p>
                <div className="flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-gold/40 transition-all duration-300 text-white/60 hover:text-white"
                    >
                      <Icon name={s.icon as "Youtube"} size={16} fallback="ExternalLink" />
                      <span className="font-heading text-xs tracking-wider uppercase">{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border border-gold/20 p-8"
              style={{ background: "rgba(44,31,14,0.5)", backdropFilter: "blur(12px)" }}
            >
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
                  >
                    <Icon name="CheckCheck" size={28} className="text-coal" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-gold-light">Заявка отправлена!</h3>
                  <p className="font-body text-white/60">Сергей свяжется с вами в ближайшее время для записи на консультацию.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="font-heading text-sm tracking-widest uppercase px-6 py-2.5 border border-gold/40 text-gold hover:bg-gold hover:text-coal rounded transition-all duration-300"
                  >
                    Отправить ещё
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="font-heading text-2xl font-bold text-white">Бесплатная консультация</h3>
                    <p className="font-body text-white/50 text-sm mt-1">Обсудим ваш проект онлайн — без обязательств</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-2 block">
                        Ваше имя
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Александр"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20 transition-colors duration-300"
                        style={{ background: "rgba(26,18,8,0.6)" }}
                      />
                    </div>
                    <div>
                      <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-2 block">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+7 900 000-00-00"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20 transition-colors duration-300"
                        style={{ background: "rgba(26,18,8,0.6)" }}
                      />
                    </div>
                    <div>
                      <label className="font-heading text-xs tracking-widest uppercase text-white/40 mb-2 block">
                        Расскажите о проекте
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Хочу баню 4×5м в рустикальном стиле..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-gold/60 outline-none font-body text-white placeholder-white/20 transition-colors duration-300 resize-none"
                        style={{ background: "rgba(26,18,8,0.6)" }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full font-heading text-sm font-bold tracking-widest uppercase py-4 rounded-lg transition-all duration-300 hover:opacity-90 text-coal"
                      style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
                    >
                      Записаться на консультацию
                    </button>
                    <p className="font-body text-white/30 text-xs text-center">
                      Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

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