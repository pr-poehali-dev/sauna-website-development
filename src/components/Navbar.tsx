import Icon from "@/components/ui/icon";

interface NavbarProps {
  activeSection: string;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  scrollTo: (id: string) => void;
}

const navItems = [
  { id: "home", label: "Главная" },
  { id: "portfolio", label: "Портфолио" },
  { id: "contacts", label: "Контакты" },
];

export default function Navbar({ activeSection, menuOpen, setMenuOpen, scrollTo }: NavbarProps) {
  return (
    <>
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
          {navItems.map((item) => (
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

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ background: "rgba(26,18,8,0.97)", backdropFilter: "blur(12px)" }}
        >
          {navItems.map((item) => (
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
    </>
  );
}
