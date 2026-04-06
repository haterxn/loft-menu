import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const banquetSets = [
  {
    id: 1, price: 590, variant: 1,
    cold: ['Asorti din carne Carmez','Asorti din cașcaval Loft','Ardei cu feta și bacon','Rulouri de vinete cu cașcaval','Bruschete de 3 tipuri','Asorti de fructe de mare','Salată caeser cu carne de pui','Salată caldă cu carne de pui'],
    cold_ru: ['Ассорти из мяса Кармез','Ассорти из сыра Лофт','Перец с фетой и беконом','Рулеты из баклажанов с сыром','Брускетты 3 видов','Ассорти из морепродуктов','Салат Цезарь с курицей','Тёплый салат с курицей'],
    hot: ['Cârnățel','Frigărui de porc','Frigărui de pui','Cartofi copți la cuptor','Legume la grătar','Carne de porc Norocel'],
    hot_ru: ['Колбаски','Шашлык из свинины','Шашлык из курицы','Запечённый картофель','Овощи гриль','Свинина Норочел'],
    dessert: ['Baba cu sos'], dessert_ru: ['Баба с соусом'],
  },
  {
    id: 2, price: 590, variant: 2,
    cold: ['Asorti din carne Carmez','Asorti tirin și porceto','Asorti din cașcaval Loft','Ardei feta cu bacon','Rulouri din vinete','Limba soacrei','Asorti de fructe de mare','Salată caeser cu carne de pui','Salată Coloroso'],
    cold_ru: ['Ассорти из мяса Кармез','Ассорти тирин и порчето','Ассорти из сыра Лофт','Перец с фетой и беконом','Рулеты из баклажанов','Язык свекрови','Ассорти из морепродуктов','Салат Цезарь с курицей','Салат Колоросо'],
    hot: ['Platou Vânătoresc'], hot_ru: ['Охотничье плато'],
    dessert: ['Clătite cu brânză','Clătite cu vișină','Clătite cu halva'], dessert_ru: ['Блинчики с творогом','Блинчики с вишней','Блинчики с халвой'],
  },
  {
    id: 3, price: 780, variant: 1,
    cold: ['Ruladă cu fistic','Ruladă din piept de pui','Prosciutto','Asorti din cașcaval','Clătite Black','Măsline, olive, lămâie','Ardei feta cu bacon','Melanzania','Salată Șef','Salată caldă cu carne de pui'],
    cold_ru: ['Рулет с фисташкой','Рулет из куриной грудки','Прошутто','Ассорти из сыра','Блинчики Блэк','Маслины, оливки, лимон','Перец с фетой и беконом','Меланзания','Салат Шеф','Тёплый салат с курицей'],
    hot: ['Coaste de porc','Ruladă Saltiboca','Mici','Bile de cașcaval','Legume la grătar','Pui cu spanac','Somon cu broccoli'],
    hot_ru: ['Свиные рёбрышки','Рулет Сальтибока','Мичи','Сырные шарики','Овощи гриль','Курица со шпинатом','Лосось с брокколи'],
    dessert: ['Clătite cu brânză / vișină / halva'], dessert_ru: ['Блинчики с творогом / вишней / халвой'],
  },
  {
    id: 4, price: 780, variant: 2,
    cold: ['Natureli','Asorti din cașcaval Loft','Ardei cu feta și bacon','Bufalino','Roșii în stil italian','Asorti de fructe de mare','Salată cocktail din creveți','Salată caldă cu carne de pui'],
    cold_ru: ['Натурели','Ассорти из сыра Лофт','Перец с фетой и беконом','Буфалино','Томаты по-итальянски','Ассорти из морепродуктов','Салат-коктейль из креветок','Тёплый салат с курицей'],
    hot: ['Platou cu ciolan de porc','Somon în sos de caviar'], hot_ru: ['Плато со свиной рулькой','Лосось в икорном соусе'],
    dessert: ['Baba cu sos'], dessert_ru: ['Баба с соусом'],
  },
  {
    id: 5, price: 990, variant: 1,
    cold: ['Mușchi de porc la cuptor','Ruladă cu fistic','Ruladă Imperial','Ardei feta cu bacon','Asorti de cașcaval Italian','Asorti de carne Carmez','Ruladă cu spanac','Răcitură','Brie în pane','Bile de cașcaval','Salată Verona','Salată caldă cu carne de vită'],
    cold_ru: ['Свиная вырезка запечённая','Рулет с фисташкой','Рулет Империал','Перец с фетой и беконом','Ассорти итальянских сыров','Ассорти из мяса Кармез','Рулет со шпинатом','Холодец','Бри в панировке','Сырные шарики','Салат Верона','Тёплый салат с говядиной'],
    hot: ['Vită cu sos de vișine','Somon Wellington','Iepure în sos de smântână'], hot_ru: ['Говядина в вишнёвом соусе','Лосось Веллингтон','Кролик в сметанном соусе'],
    dessert: ['Clătite cu brânză / vișină / halva'], dessert_ru: ['Блинчики с творогом / вишней / халвой'],
  },
  {
    id: 6, price: 990, variant: 2,
    cold: ['Natureli','Ruladă cu prune','Asorti de fructe de mare Extra','Asorti de cașcavaluri Loft','Asorti de carne Italiano','Răcitură din limbă de vită','Ardei feta cu bacon','Limba soacrei + canape','Salată Noroc','Salată caldă cu carne de pui'],
    cold_ru: ['Натурели','Рулет с черносливом','Ассорти из морепродуктов Экстра','Ассорти из сыра Лофт','Ассорти из мяса Итальяно','Холодец из говяжьего языка','Перец с фетой и беконом','Язык свекрови + канапе','Салат Норок','Тёплый салат с курицей'],
    hot: ['Platou: porc, pui, vită','Somon cu sos de icre'], hot_ru: ['Плато: свинина, курица, говядина','Лосось в соусе из икры'],
    dessert: ['Clătite cu brânză / vișină / halva'], dessert_ru: ['Блинчики с творогом / вишней / халвой'],
  },
];

const services = {
  ro: ['Colaci', 'Selfie 360 / Selfie Box', 'Mascote la întâmpinare', 'Animatori'],
  ru: ['Колачи', 'Selfie 360 / Selfie Box', 'Ростовые куклы', 'Аниматоры'],
};

const priceTiers = [
  { price: 590, label_ru: 'Меню 590 MDL', label_ro: 'Menu 590 MDL', desc_ru: 'Классический банкетный сет', desc_ro: 'Set clasic de banchet' },
  { price: 780, label_ru: 'Меню 780 MDL', label_ro: 'Menu 780 MDL', desc_ru: 'Расширенный банкетный сет', desc_ro: 'Set extins de banchet' },
  { price: 990, label_ru: 'Меню 990 MDL', label_ro: 'Menu 990 MDL', desc_ru: 'Премиум банкетный сет', desc_ro: 'Set premium de banchet' },
];

const sectionLabels = {
  cold: { ru: 'Холодные закуски', ro: 'Masa rece' },
  hot: { ru: 'Горячие блюда', ro: 'Masa caldă' },
  dessert: { ru: 'Десерт', ro: 'Desert' },
};

const sectionIcons = {
  cold: '❄',
  hot: '🔥',
  dessert: '🍰',
};

const dishPhotos = {
  'Ассорти из мяса Кармез': 'DSCF3769.webp',
  'Ассорти из мяса Итальяно': 'DSCF3769.webp',
  'Ассорти из сыра Лофт': null,
  'Ассорти из сыра': null,
  'Ассорти итальянских сыров': null,
  'Перец с фетой и беконом': null,
  'Рулеты из баклажанов с сыром': 'DSCF3766.webp',
  'Рулеты из баклажанов': 'DSCF3766.webp',
  'Ассорти из морепродуктов': null,
  'Ассорти из морепродуктов Экстра': null,
  'Салат Цезарь с курицей': 'DSCF9541.webp',
  'Тёплый салат с курицей': 'DSCF9523.webp',
  'Тёплый салат с говядиной': null,
  'Салат Колоросо': null,
  'Ассорти тирин и порчето': null,
  'Язык свекрови': null,
  'Рулет с фисташкой': null,
  'Рулет из куриной грудки': 'DSCF3823.webp',
  'Прошутто': null,
  'Блинчики Блэк': null,
  'Маслины, оливки, лимон': null,
  'Меланзания': 'DSCF3775.webp',
  'Салат Шеф': null,
  'Натурели': null,
  'Буфалино': null,
  'Томаты по-итальянски': null,
  'Салат-коктейль из креветок': null,
  'Свиная вырезка запечённая': null,
  'Рулет Империал': null,
  'Рулет со шпинатом': 'DSCF3781.webp',
  'Холодец': null,
  'Бри в панировке': null,
  'Сырные шарики': null,
  'Салат Верона': null,
  'Рулет с черносливом': null,
  'Холодец из говяжьего языка': null,
  'Язык свекрови + канапе': null,
  'Салат Норок': null,
  // Hot
  'Колбаски': null,
  'Шашлык из свинины': null,
  'Шашлык из курицы': null,
  'Запечённый картофель': null,
  'Овощи гриль': 'DSCF3892.webp',
  'Свинина Норочел': null,
  'Охотничье плато': 'DSCF3837.webp',
  'Свиные рёбрышки': null,
  'Рулет Сальтибока': null,
  'Мичи': null,
  'Курица со шпинатом': null,
  'Лосось с брокколи': null,
  'Плато со свиной рулькой': null,
  'Лосось в икорном соусе': null,
  'Говядина в вишнёвом соусе': null,
  'Лосось Веллингтон': null,
  'Кролик в сметанном соусе': null,
  'Плато: свинина, курица, говядина': 'DSCF3841.webp',
  'Лосось в соусе из икры': null,
  // Desserts
  'Баба с соусом': null,
  'Блинчики с творогом': null,
  'Блинчики с вишней': null,
  'Блинчики с халвой': null,
  'Блинчики с творогом / вишней / халвой': null,
};

function getDishPhoto(name) {
  if (dishPhotos[name]) return `/uploads/${dishPhotos[name]}`;
  return null;
}

function DishCard({ name, photoKey }) {
  const photo = getDishPhoto(photoKey || name);
  return (
    <div className="banquet-dish-card">
      <div className="banquet-dish-image">
        <div className="ratio-3-4">
          {photo ? (
            <img src={photo} alt={name} loading="lazy" />
          ) : (
            <div className="placeholder-icon">&#9827;</div>
          )}
        </div>
      </div>
      <div className="banquet-dish-name">{name}</div>
    </div>
  );
}

export default function BanquetPage() {
  const [lang, setLang] = useState('ru');
  const sectionRefs = useRef({});

  const t = (set, field) => lang === 'ru' && set[field + '_ru'] ? set[field + '_ru'] : set[field];

  const scrollTo = (price) => {
    const el = sectionRefs.current[price];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="menu-page">
      <header className="hero" style={{ paddingBottom: '30px' }}>
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === 'ro' ? 'active' : ''}`} onClick={() => setLang('ro')}>RO</button>
          <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
        </div>
        <div className="hero-ornament">&#10043; &#10043; &#10043;</div>
        <h1>NOROC</h1>
        <p className="hero-subtitle">Menu Banchet</p>
        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '8px' }}>
          {lang === 'ru'
            ? 'Готовые банкетные сеты — выберите ценовую категорию, в каждой 2 варианта'
            : 'Seturi de banchet — alegeți categoria de preț, câte 2 variante în fiecare'}
        </p>
      </header>

      {/* Price tier nav */}
      <nav className="category-tabs">
        {priceTiers.map(tier => (
          <button key={tier.price} className="cat-tab" onClick={() => scrollTo(tier.price)}>
            {tier.price} MDL
          </button>
        ))}
        <Link to="/" className="cat-tab back-tab" style={{ textDecoration: 'none' }}>
          {lang === 'ru' ? 'Основное меню' : 'Meniul principal'}
        </Link>
      </nav>

      {/* All tiers as sections */}
      <main className="menu-content banquet-content">
        {priceTiers.map(tier => {
          const sets = banquetSets.filter(s => s.price === tier.price);
          return (
            <section
              key={tier.price}
              className="banquet-tier-section"
              ref={el => (sectionRefs.current[tier.price] = el)}
            >
              <div className="section-header">
                <h2>{lang === 'ru' ? tier.label_ru : tier.label_ro}</h2>
                <div className="section-line" />
              </div>
              <p className="banquet-tier-desc">
                {lang === 'ru' ? tier.desc_ru : tier.desc_ro}
                {' \u2014 '}
                {lang === 'ru' ? '2 варианта на выбор' : '2 variante la alegere'}
              </p>

              {sets.map(set => (
                <div key={set.id} className="banquet-variant-block">
                  <div className="banquet-variant-header">
                    <span className="banquet-variant-badge">{set.price} MDL</span>
                    <h3 className="banquet-variant-title">
                      {lang === 'ru' ? `Вариант ${set.variant}` : `Varianta ${set.variant}`}
                    </h3>
                  </div>

                  {['cold', 'hot', 'dessert'].map(section => (
                    <div key={section} className="banquet-dish-section">
                      <div className="banquet-dish-section-header">
                        <span className="banquet-dish-section-icon">{sectionIcons[section]}</span>
                        <h4>{sectionLabels[section][lang]}</h4>
                      </div>
                      <div className="banquet-dishes-grid">
                        {t(set, section).map((item, i) => {
                          const ruName = set[section + '_ru'] ? set[section + '_ru'][i] : item;
                          return <DishCard key={i} name={item} photoKey={ruName} />;
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="banquet-card-services">
                    <h4>{lang === 'ru' ? 'Доп. услуги:' : 'Servicii adiționale:'}</h4>
                    <p>{(lang === 'ru' ? services.ru : services.ro).join(' \u2022 ')}</p>
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-name">NOROC</div>
        <div className="footer-info">
          <span>str. Decebal 131, Bălți, Moldova</span>
          <a href="tel:+37368821888">(+373) 688 21 888</a>
        </div>
        <p className="footer-copy">&copy; 2024 Restaurant NOROC</p>
      </footer>

      {/* WhatsApp Widget */}
      <a href="https://wa.me/37368821888" className="whatsapp-widget" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.056 31.2l6.04-1.94A15.91 15.91 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.318 22.594c-.39 1.1-1.932 2.014-3.168 2.28-.844.18-1.946.322-5.656-1.216-4.746-1.968-7.8-6.79-8.036-7.104-.226-.314-1.9-2.53-1.9-4.828s1.2-3.426 1.628-3.894c.428-.47.936-.586 1.248-.586.312 0 .624.002.898.016.288.014.674-.11 1.054.804.39.938 1.326 3.236 1.442 3.47.116.234.194.506.038.82-.156.312-.234.508-.468.782-.234.274-.492.612-.702.82-.234.234-.478.488-.206.958.274.468 1.216 2.006 2.61 3.252 1.792 1.6 3.302 2.096 3.77 2.33.468.234.742.194 1.016-.116.274-.312 1.17-1.366 1.482-1.836.312-.468.624-.39 1.054-.234.43.156 2.728 1.288 3.196 1.522.468.234.78.352.898.546.116.196.116 1.124-.274 2.224z"/>
        </svg>
      </a>
    </div>
  );
}
