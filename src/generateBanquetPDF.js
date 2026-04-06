export default function generateBanquetPDF({ restaurantName, banquetSets, priceTiers, sectionLabels, services, lang, accentColor = '#B8945F' }) {
  const t = (set, field) => lang === 'ru' && set[field + '_ru'] ? set[field + '_ru'] : set[field];

  const svcList = (lang === 'ru' ? services.ru : services.ro).join(' \u2022 ');
  const desc = lang === 'ru'
    ? 'Готовые банкетные сеты — в каждой ценовой категории 2 варианта на выбор'
    : 'Seturi de banchet — câte 2 variante la alegere în fiecare categorie de preț';

  let html = '';

  priceTiers.forEach(tier => {
    const sets = banquetSets.filter(s => s.price === tier.price);
    const label = lang === 'ru' ? tier.label_ru : tier.label_ro;
    const tdesc = (lang === 'ru' ? tier.desc_ru : tier.desc_ro) + ' — ' + (lang === 'ru' ? '2 варианта на выбор' : '2 variante la alegere');

    sets.forEach(set => {
      const varLabel = lang === 'ru' ? `Вариант ${set.variant}` : `Varianta ${set.variant}`;
      const coldItems = t(set, 'cold');
      const hotItems = t(set, 'hot');
      const dessertItems = t(set, 'dessert');

      const coldMid = Math.ceil(coldItems.length / 2);

      html += `
        <div class="set-block">
          <div class="tier-bar">${label}</div>
          <div class="tier-desc">${tdesc}</div>
          <div class="variant-header">
            <span class="variant-price">${set.price} MDL</span>
            <span class="variant-label">${varLabel}</span>
          </div>

          <div class="section-title">${sectionLabels.cold[lang]}</div>
          <div class="two-col">
            <ul>${coldItems.slice(0, coldMid).map(i => `<li>${i}</li>`).join('')}</ul>
            <ul>${coldItems.slice(coldMid).map(i => `<li>${i}</li>`).join('')}</ul>
          </div>

          <div class="section-title">${sectionLabels.hot[lang]}</div>
          <ul class="dish-list">${hotItems.map(i => `<li>${i}</li>`).join('')}</ul>

          <div class="section-title">${sectionLabels.dessert[lang]}</div>
          <ul class="dish-list">${dessertItems.map(i => `<li>${i}</li>`).join('')}</ul>

          <div class="services">
            <strong>${lang === 'ru' ? 'Дополнительные услуги:' : 'Servicii adiționale:'}</strong>
            ${svcList}
          </div>
        </div>
      `;
    });
  });

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${restaurantName} — ${lang === 'ru' ? 'Банкетное меню' : 'Menu Banchet'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: A4;
    margin: 15mm 18mm;
  }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #2C2C2C;
    font-size: 9pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header {
    text-align: center;
    padding-bottom: 14px;
    border-bottom: 2px solid ${accentColor};
    margin-bottom: 18px;
  }

  .header h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28pt;
    font-weight: 700;
    letter-spacing: 4px;
    color: #2C2C2C;
    margin-bottom: 2px;
  }

  .header .subtitle {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-style: italic;
    font-size: 11pt;
    color: ${accentColor};
    margin-bottom: 6px;
  }

  .header .desc {
    font-size: 8pt;
    color: #888;
  }

  .set-block {
    page-break-inside: avoid;
    margin-bottom: 16px;
  }

  .tier-bar {
    background: ${accentColor};
    color: white;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 13pt;
    font-weight: 700;
    text-align: center;
    padding: 6px 0;
    border-radius: 4px;
    margin-bottom: 4px;
  }

  .tier-desc {
    text-align: center;
    font-size: 7.5pt;
    color: #999;
    margin-bottom: 8px;
  }

  .variant-header {
    background: #F5F3EE;
    padding: 5px 12px;
    border-radius: 3px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .variant-price {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 12pt;
    font-weight: 700;
    color: #444;
  }

  .variant-label {
    font-size: 7pt;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #999;
  }

  .section-title {
    font-size: 8pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${accentColor};
    margin: 8px 0 4px;
    padding-bottom: 2px;
    border-bottom: 1px solid #eee;
  }

  .two-col {
    display: flex;
    gap: 20px;
  }

  .two-col ul {
    flex: 1;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    padding: 1px 0;
    font-size: 8.5pt;
    color: #444;
  }

  li::before {
    content: "\\2022\\00a0\\00a0";
    color: ${accentColor};
  }

  .dish-list {
    columns: 2;
    column-gap: 20px;
  }

  .services {
    margin-top: 6px;
    padding: 5px 10px;
    background: #F8F6F2;
    border-radius: 3px;
    font-size: 7.5pt;
    color: #888;
  }

  .services strong {
    color: ${accentColor};
    font-size: 7pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .footer {
    text-align: center;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 2px solid ${accentColor};
    font-size: 7pt;
    color: #bbb;
  }

  @media print {
    .no-print { display: none; }
  }

  .print-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 28px;
    background: ${accentColor};
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .print-btn:hover { opacity: 0.9; }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">
    ${lang === 'ru' ? 'Скачать PDF' : 'Descarcă PDF'}
  </button>

  <div class="header">
    <h1>${restaurantName}</h1>
    <div class="subtitle">Menu Banchet</div>
    <div class="desc">${desc}</div>
  </div>

  ${html}

  <div class="footer">${restaurantName} &mdash; ${lang === 'ru' ? 'Банкетное меню' : 'Menu Banchet'}</div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onafterprint = () => URL.revokeObjectURL(url);
  } else {
    // Popup blocked — fallback: open via link click
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
