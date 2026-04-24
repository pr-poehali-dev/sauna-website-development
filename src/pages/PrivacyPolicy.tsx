import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-coal font-body text-white">
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4 border-b border-gold/10"
        style={{ background: "rgba(13,9,4,0.95)", backdropFilter: "blur(8px)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gold/60 hover:text-gold transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="font-heading text-sm tracking-widest uppercase">Назад</span>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
          >
            <Icon name="Flame" size={12} className="text-coal" />
          </div>
          <span className="font-heading text-sm font-bold tracking-widest text-gold/60">САУНА&amp;SAUNA</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="font-heading text-xs tracking-[0.4em] uppercase text-gold font-medium">Правовые документы</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mt-3">
            Политика конфиденциальности
          </h1>
          <div
            className="w-16 h-px mt-4"
            style={{ background: "linear-gradient(90deg, transparent, #C9933A, transparent)" }}
          />
          <p className="font-body text-white/40 text-sm mt-4">
            Дата последнего обновления: 24 апреля 2026 г.
          </p>
        </div>

        <div className="space-y-10 font-body text-white/70 leading-relaxed">

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки персональных данных пользователей
              сайта компании «Сауна&amp;Sauna» (Махов Сергей, г. Новосибирск) в соответствии с Федеральным законом
              от 27.07.2006 № 152-ФЗ «О персональных данных».
            </p>
            <p className="mt-3">
              Используя сайт и отправляя форму обратной связи, вы выражаете согласие с условиями настоящей Политики.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">2. Оператор персональных данных</h2>
            <div
              className="rounded-xl border border-gold/20 p-5 space-y-2"
              style={{ background: "rgba(44,31,14,0.4)" }}
            >
              <p><span className="text-white/40">Наименование:</span> <span className="text-white">Компания «Сауна&amp;Sauna»</span></p>
              <p><span className="text-white/40">Руководитель:</span> <span className="text-white">Махов Сергей</span></p>
              <p><span className="text-white/40">Регион деятельности:</span> <span className="text-white">Новосибирск, Горный Алтай</span></p>
              <p><span className="text-white/40">Телефон:</span>{" "}
                <a href="tel:+79130036579" className="text-gold hover:text-gold-light transition-colors">+7 913 003-65-79</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">3. Какие данные мы собираем</h2>
            <p>При заполнении формы обратной связи на сайте мы собираем следующие персональные данные:</p>
            <ul className="mt-3 space-y-2 list-none">
              {["Имя (фамилия, имя или псевдоним)", "Номер телефона", "Текст сообщения / описание проекта"].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Мы не собираем специальные категории персональных данных (сведения о здоровье, расовой принадлежности,
              политических взглядах и т.п.).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">4. Цели обработки данных</h2>
            <p>Персональные данные обрабатываются исключительно в следующих целях:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Связь с вами для уточнения деталей проекта и записи на консультацию",
                "Подготовка коммерческого предложения по отделке бани или сауны",
                "Ответы на ваши вопросы",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">5. Правовое основание обработки</h2>
            <p>
              Обработка персональных данных осуществляется на основании согласия субъекта персональных данных
              (п. 1 ч. 1 ст. 6 Федерального закона № 152-ФЗ). Нажимая кнопку «Записаться на консультацию»,
              вы даёте явное согласие на обработку указанных вами данных.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">6. Хранение и защита данных</h2>
            <p>
              Мы принимаем необходимые организационные и технические меры для защиты ваших персональных данных
              от несанкционированного доступа, изменения, раскрытия или уничтожения.
            </p>
            <p className="mt-3">
              Данные хранятся на территории Российской Федерации в соответствии с требованиями ст. 18.1
              Федерального закона № 152-ФЗ и не передаются третьим лицам без вашего согласия, за исключением
              случаев, предусмотренных действующим законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">7. Передача данных третьим лицам</h2>
            <p>
              Ваши персональные данные не продаются, не передаются и не раскрываются третьим лицам в коммерческих целях.
              Данные могут быть переданы только по требованию уполномоченных государственных органов в случаях,
              установленных законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">8. Срок хранения данных</h2>
            <p>
              Персональные данные хранятся в течение срока, необходимого для достижения целей их обработки,
              а также в течение срока, установленного применимым законодательством. После достижения целей
              обработки данные уничтожаются или обезличиваются.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">9. Права субъекта персональных данных</h2>
            <p>В соответствии с Федеральным законом № 152-ФЗ вы вправе:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Получить информацию об обработке ваших персональных данных",
                "Потребовать уточнения, блокирования или уничтожения данных",
                "Отозвать согласие на обработку персональных данных в любой момент",
                "Обжаловать действия оператора в Роскомнадзор",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Для реализации своих прав обратитесь к нам по телефону{" "}
              <a href="tel:+79130036579" className="text-gold hover:text-gold-light transition-colors">
                +7 913 003-65-79
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">10. Cookies и аналитика</h2>
            <p>
              Сайт использует Яндекс.Метрику для сбора обезличенной статистики посещаемости в целях улучшения
              работы сайта. Яндекс.Метрика может использовать файлы cookie. Вы можете отключить сохранение cookie
              в настройках вашего браузера, однако это может повлиять на работу отдельных функций сайта.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-gold-light mb-3 tracking-wide">11. Изменения политики</h2>
            <p>
              Мы оставляем за собой право вносить изменения в настоящую Политику. Актуальная версия всегда
              доступна на данной странице. Продолжение использования сайта после внесения изменений означает
              ваше согласие с обновлённой редакцией.
            </p>
          </section>

        </div>

        <div
          className="mt-12 rounded-xl border border-gold/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: "rgba(44,31,14,0.4)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #C9933A, #8A611A)" }}
          >
            <Icon name="ShieldCheck" size={18} className="text-coal" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-gold-light">Вопросы по обработке данных</p>
            <p className="font-body text-white/50 text-sm mt-0.5">
              Свяжитесь с нами по телефону{" "}
              <a href="tel:+79130036579" className="text-gold hover:text-gold-light transition-colors">
                +7 913 003-65-79
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="py-6 px-6 border-t border-gold/10 mt-8" style={{ background: "#0D0904" }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-white/25 text-xs text-center">
            © 2025 Компания Сауна&amp;Sauna · Новосибирск · Горный Алтай
          </p>
          <button
            onClick={() => navigate("/")}
            className="font-heading text-xs text-gold/50 hover:text-gold transition-colors tracking-wider uppercase"
          >
            На главную
          </button>
        </div>
      </footer>
    </div>
  );
}
