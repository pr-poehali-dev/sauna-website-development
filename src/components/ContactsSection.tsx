import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

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

const SEND_LEAD_URL = "https://functions.poehali.dev/b7883b44-027e-4706-8bcd-bc9fc242b880";

export default function ContactsSection() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const contactSection = useInView();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SEND_LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setSent(true);
      setForm({ name: "", phone: "", message: "" });
    } catch {
      setError("Не удалось отправить заявку. Позвоните нам по телефону.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                  Основатель и руководитель компании Сауна&amp;Sauna. Более 10 лет создаём бани мечты в Новосибирске и Горном Алтае.
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
                    {error && (
                      <p className="font-body text-red-400 text-sm text-center">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full font-heading text-sm font-bold tracking-widest uppercase py-4 rounded-lg transition-all duration-300 hover:opacity-90 text-coal disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
                    >
                      {loading ? "Отправляем..." : "Записаться на консультацию"}
                    </button>
                    <p className="font-body text-white/30 text-xs text-center">
                      Нажимая кнопку, вы соглашаетесь на обработку персональных данных в соответствии с{" "}
                      <Link to="/privacy" className="underline hover:text-gold/60 transition-colors">
                        Политикой конфиденциальности
                      </Link>
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
          <div className="flex flex-col items-center gap-1">
            <p className="font-body text-white/25 text-xs text-center">© 2025 Компания Сауна&amp;Sauna · Новосибирск · Горный Алтай</p>
            <Link to="/privacy" className="font-body text-white/20 hover:text-gold/50 text-xs transition-colors underline">
              Политика конфиденциальности
            </Link>
          </div>
          <a href="tel:+79130036579" className="font-heading text-sm text-gold/60 hover:text-gold transition-colors tracking-wider">
            +7 913 003-65-79
          </a>
        </div>
      </footer>
    </>
  );
}