import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'loft.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ru TEXT,
    image TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_ru TEXT,
    description TEXT,
    description_ru TEXT,
    price REAL NOT NULL,
    weight TEXT,
    image TEXT,
    available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    guests INTEGER,
    event_type TEXT,
    hall TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new'
  );
`);

// Migrate: add event_type column if missing
try {
  db.prepare("SELECT event_type FROM bookings LIMIT 1").get();
} catch {
  db.exec("ALTER TABLE bookings ADD COLUMN event_type TEXT");
}

// Create default admin if none exists
const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin').get();
if (adminExists.count === 0) {
  const hash = bcrypt.hashSync('loft2024', 10);
  db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', hash);
}

// Seed Loft Burger Bar menu if empty
const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (catCount.count === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, name_ru, sort_order) VALUES (?, ?, ?)');
  const insertItem = db.prepare('INSERT INTO menu_items (category_id, name, name_ru, description, description_ru, price, weight, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

  const cats = [
    { name: 'Холодные закуски', name_ru: 'Холодные закуски', items: [
      { name: 'Ассорти сырное итальянское', name_ru: 'Ассорти сырное итальянское', desc: 'бри, пикорино, пармезан, фонталь, моцарелла, мёд', desc_ru: 'бри, пикорино, пармезан, фонталь, моцарелла, мёд', price: 264, weight: '250/30g', img: 'loft_01.webp' },
      { name: 'Ассорти мясное Italiano', name_ru: 'Ассорти мясное Italiano', desc: 'унгуреск, компаньола, наполи-пиканте, прошутто', desc_ru: 'унгуреск, компаньола, наполи-пиканте, прошутто', price: 198, weight: '200/50g', img: 'loft_02.webp' },
      { name: 'Буфалино с песто', name_ru: 'Буфалино с песто', desc: 'сыр буффало, помидоры, соус песто', desc_ru: 'сыр буффало, помидоры, соус песто', price: 115, weight: '250g', img: 'loft_03.webp' },
      { name: 'Хумус с питой', name_ru: 'Хумус с питой', desc: 'пюре из нута, лепёшка', desc_ru: 'пюре из нута, лепёшка', price: 45, weight: '300g', img: 'loft_04.webp' },
      { name: 'Мужская услада', name_ru: 'Мужская услада', desc: 'сельдь, сало, хлеб чёрный, масло сливочное, горчица, лук, чеснок', desc_ru: 'сельдь, сало, хлеб чёрный, масло сливочное, горчица, лук, чеснок', price: 118, weight: '400g', img: 'loft_05.webp' },
      { name: 'Брушеты Лофт', name_ru: 'Брушеты Лофт', desc: 'брускетта с сёмгой, с перцем гриль и песто, с говядиной и соусом вител', desc_ru: 'брускетта с сёмгой, с перцем гриль и песто, с говядиной и соусом вител', price: 125, weight: '200g', img: 'loft_06.webp' },
      { name: 'Разносол', name_ru: 'Разносол', desc: 'помидоры маринованные, арбуз, черри, грибы маринованные', desc_ru: 'помидоры маринованные, арбуз, черри, грибы маринованные', price: 75, weight: '360g', img: 'loft_07.webp' },
      { name: 'Ассорти брускетты', name_ru: 'Ассорти брускетты', desc: 'чиабатта, сельдь, красный лук, бри, помидоры, креветки, говядина, черри, лосось, авокадо', desc_ru: 'чиабатта, сельдь, красный лук, бри, помидоры, креветки, говядина, черри, лосось, авокадо', price: 298, weight: '530g', img: 'loft_08.webp' },
    ]},
    { name: 'Тёплые закуски', name_ru: 'Тёплые закуски', items: [
      { name: 'Сыр Бри пане', name_ru: 'Сыр Бри пане', desc: 'сыр бри, панировочные сухари, персик консервированный, джем ягодный', desc_ru: 'сыр бри, панировочные сухари, персик консервированный, джем ягодный', price: 158, weight: '150/30g', img: 'loft_09.webp' },
      { name: 'Сырные шарики', name_ru: 'Сырные шарики', desc: 'сыр, мука, яйцо, чесночный соус', desc_ru: 'сыр, мука, яйцо, чесночный соус', price: 85, weight: '150/50g', img: 'loft_10.webp' },
      { name: 'Брокколи Арт-ланч', name_ru: 'Брокколи Арт-ланч', desc: 'брокколи, сыр пармезан, бекон, сливки', desc_ru: 'брокколи, сыр пармезан, бекон, сливки', price: 128, weight: '250g', img: 'loft_11.webp' },
      { name: 'Хачапури', name_ru: 'Хачапури', desc: 'сыр, тесто, яйца', desc_ru: 'сыр, тесто, яйца', price: 105, weight: '460g', img: 'loft_12.webp' },
    ]},
    { name: 'Салаты', name_ru: 'Салаты', items: [
      { name: 'Коктейль из креветок гриль', name_ru: 'Коктейль из креветок гриль', desc: 'микс салата, креветки, авокадо, помидоры черри, соус сладкий чили', desc_ru: 'микс салата, креветки, авокадо, помидоры черри, соус сладкий чили', price: 135, weight: '380g', img: 'loft_13.webp' },
      { name: 'Панзанелла', name_ru: 'Панзанелла', desc: 'микс салата, помидоры, огурец, перец болгарский, лук маринованный, багет, моцарелла', desc_ru: 'микс салата, помидоры, огурец, перец болгарский, лук маринованный, багет, моцарелла', price: 75, weight: '350g', img: 'loft_14.webp' },
      { name: 'Верона', name_ru: 'Верона', desc: 'микс салата, болгарский перец, сыр фета, бекон, куриная грудка, соус цезарь', desc_ru: 'микс салата, болгарский перец, сыр фета, бекон, куриная грудка, соус цезарь', price: 118, weight: '250g', img: 'loft_15.webp' },
      { name: 'Тёплый с курицей', name_ru: 'Тёплый с курицей', desc: 'баклажан, перец болгарский, лук, куриное мясо, соус BBQ', desc_ru: 'баклажан, перец болгарский, лук, куриное мясо, соус BBQ', price: 88, weight: '300g', img: null },
      { name: 'Тёплый с телятиной', name_ru: 'Тёплый с телятиной', desc: 'баклажан, перец болгарский, лук, говяжье мясо, соус BBQ', desc_ru: 'баклажан, перец болгарский, лук, говяжье мясо, соус BBQ', price: 130, weight: '250g', img: null },
      { name: 'Калороса', name_ru: 'Калороса', desc: 'лист салата, брокколи, шампиньоны, помидоры черри, куриная грудка, соус горчичный', desc_ru: 'лист салата, брокколи, шампиньоны, помидоры черри, куриная грудка, соус горчичный', price: 85, weight: '300g', img: 'loft_16.webp' },
    ]},
    { name: 'Первые блюда', name_ru: 'Первые блюда', items: [
      { name: 'Красный борщ', name_ru: 'Красный борщ', desc: 'картофель, капуста, морковь, лук', desc_ru: 'картофель, капуста, морковь, лук', price: 70, weight: '300g', img: 'loft_17.webp' },
      { name: 'Зама', name_ru: 'Зама', desc: 'курица домашняя, перец болгарский, морковь, лук, помидоры, сметана', desc_ru: 'курица домашняя, перец болгарский, морковь, лук, помидоры, сметана', price: 75, weight: '250g', img: 'loft_18.webp' },
      { name: 'Харчо', name_ru: 'Харчо', desc: 'вырезка говяжья, морковь, лук, помидоры, рис', desc_ru: 'вырезка говяжья, морковь, лук, помидоры, рис', price: 88, weight: '300g', img: 'loft_19.webp' },
      { name: 'Окрошка', name_ru: 'Окрошка', desc: 'картофель, огурцы, яйцо, ветчина, сметана, кефир, горчица', desc_ru: 'картофель, огурцы, яйцо, ветчина, сметана, кефир, горчица', price: 60, weight: '350g', img: 'loft_20.webp' },
      { name: 'Солянка', name_ru: 'Солянка', desc: 'охотничья колбаса, копченая куриная грудка, свиная рулька, копченая колбаса, салями, томатная паста', desc_ru: 'охотничья колбаса, копченая куриная грудка, свиная рулька, копченая колбаса, салями, томатная паста', price: 88, weight: '300g', img: 'loft_21.webp' },
    ]},
    { name: 'Гарниры', name_ru: 'Гарниры', items: [
      { name: 'Картофель гриль', name_ru: 'Картофель гриль', desc: 'картошка на гриле с розмарином', desc_ru: 'картошка на гриле с розмарином', price: 45, weight: '250g', img: null },
      { name: 'Картофель фри', name_ru: 'Картофель фри', desc: 'картошка фри, кетчуп, майонез', desc_ru: 'картошка фри, кетчуп, майонез', price: 35, weight: '150g', img: null },
      { name: 'Рис с кукурузой', name_ru: 'Рис с кукурузой', desc: 'рис, кукуруза', desc_ru: 'рис, кукуруза', price: 58, weight: '150g', img: null },
      { name: 'Овощи гриль', name_ru: 'Овощи гриль', desc: 'баклажан, кабачок, перец капи, шампиньоны, картофель', desc_ru: 'баклажан, кабачок, перец капи, шампиньоны, картофель', price: 75, weight: '260g', img: null },
    ]},
    { name: 'Пасты', name_ru: 'Пасты', items: [
      { name: 'Карбонара', name_ru: 'Карбонара', desc: 'спагетти, бекон, сливки, сыр пармезан, яйцо', desc_ru: 'спагетти, бекон, сливки, сыр пармезан, яйцо', price: 108, weight: '200g', img: 'loft_22.webp' },
      { name: 'С курицей и грибами', name_ru: 'С курицей и грибами', desc: 'фетучини, филе куриное, фасоль стручковая, сливки, сыр пармезан', desc_ru: 'фетучини, филе куриное, фасоль стручковая, сливки, сыр пармезан', price: 88, weight: '200g', img: 'loft_23.webp' },
      { name: 'Равиоли с креветками', name_ru: 'Равиоли с креветками', desc: 'креветки, чернило каракатицы, мука, яйцо, сыр, сливки', desc_ru: 'креветки, чернило каракатицы, мука, яйцо, сыр, сливки', price: 135, weight: '200g', img: 'loft_24.webp' },
      { name: 'Равиоли с курицей и шпинатом', name_ru: 'Равиоли с курицей и шпинатом', desc: 'шпинат, филе куриное, мука, яйцо, сыр, сливки', desc_ru: 'шпинат, филе куриное, мука, яйцо, сыр, сливки', price: 135, weight: '200g', img: 'loft_25.webp' },
      { name: 'Фунчоза', name_ru: 'Фунчоза', desc: 'фунчоза, филе курицы, морковь, перец, огурцы, кунжут', desc_ru: 'фунчоза, филе курицы, морковь, перец, огурцы, кунжут', price: 95, weight: '300g', img: 'loft_26.webp' },
    ]},
    { name: 'К пиву', name_ru: 'К пиву', items: [
      { name: 'Гренки с чесноком', name_ru: 'Гренки с чесноком', desc: 'чёрный хлеб, чеснок, соус чесночный', desc_ru: 'чёрный хлеб, чеснок, соус чесночный', price: 40, weight: '100g', img: 'loft_27.webp' },
      { name: 'Свиные ушки', name_ru: 'Свиные ушки', desc: 'ушки свиные, соус чесночный', desc_ru: 'ушки свиные, соус чесночный', price: 98, weight: '100g', img: 'loft_28.webp' },
      { name: 'Начос с сальсой', name_ru: 'Начос с сальсой', desc: 'начос, соус сальса', desc_ru: 'начос, соус сальса', price: 65, weight: '100g', img: 'loft_29.webp' },
      { name: 'Кальмары в панировке', name_ru: 'Кальмары в панировке', desc: 'кальмары в кляре, соус чесночный', desc_ru: 'кальмары в кляре, соус чесночный', price: 128, weight: '150g', img: 'loft_30.webp' },
      { name: 'Плато Айдахо', name_ru: 'Плато Айдахо', desc: 'луковые кольца, кольца кальмара, картофельные дольки, колбасы, купаты, чесночный соус', desc_ru: 'луковые кольца, кольца кальмара, картофельные дольки, колбасы, купаты, чесночный соус', price: 308, weight: '450g', img: 'loft_31.webp' },
    ]},
    { name: 'Птица', name_ru: 'Птица', items: [
      { name: 'Цыплёнок гриль', name_ru: 'Цыплёнок гриль', desc: 'цыплёнок, салат из помидор черри, лепёшка, аджика', desc_ru: 'цыплёнок, салат из помидор черри, лепёшка, аджика', price: 188, weight: '350/250g', img: 'loft_32.webp' },
      { name: 'Курица со шпинатом', name_ru: 'Курица со шпинатом', desc: 'куриное мясо, сыр, шпинат, сливки, грибы', desc_ru: 'куриное мясо, сыр, шпинат, сливки, грибы', price: 180, weight: '250g', img: 'loft_33.webp' },
      { name: 'Крылышки в азиатском соусе', name_ru: 'Крылышки в азиатском соусе', desc: 'крылышки куриные, картошка фри, соус', desc_ru: 'крылышки куриные, картошка фри, соус', price: 135, weight: '250/200g', img: 'loft_34.webp' },
      { name: 'Шницель', name_ru: 'Шницель', desc: 'куриные филе, яйцо, панко, салатная смесь, сыр, сливки, картофель', desc_ru: 'куриные филе, яйцо, панко, салатная смесь, сыр, сливки, картофель', price: 145, weight: '380g', img: 'loft_35.webp' },
    ]},
    { name: 'Свинина', name_ru: 'Свинина', items: [
      { name: 'Свиные рёбра', name_ru: 'Свиные рёбра', desc: 'рёбра свиные, соус BBQ', desc_ru: 'рёбра свиные, соус BBQ', price: 198, weight: '250/50g', img: 'loft_36.webp' },
      { name: 'Рулька свиная с картошкой', name_ru: 'Рулька свиная с картошкой', desc: 'рулька свиная, картофель запечённый, помидоры маринованные', desc_ru: 'рулька свиная, картофель запечённый, помидоры маринованные', price: 275, weight: '200/50g', img: 'loft_37.webp' },
    ]},
    { name: 'Говядина', name_ru: 'Говядина', items: [
      { name: 'Филе Миньон с шампиньонами', name_ru: 'Филе Миньон с шампиньонами', desc: 'вырезка говяжья, шампиньоны, миндальное масло', desc_ru: 'вырезка говяжья, шампиньоны, миндальное масло', price: 218, weight: '250/50g', img: 'loft_38.webp' },
      { name: 'Стейк Chiorassco', name_ru: 'Стейк Chiorassco', desc: 'стейк говяжий, соус BBQ', desc_ru: 'стейк говяжий, соус BBQ', price: 250, weight: '250/50g', img: 'loft_39.webp' },
      { name: 'Стейк Стриплойн', name_ru: 'Стейк Стриплойн', desc: 'стейк говяжий', desc_ru: 'стейк говяжий', price: 460, weight: '250g', img: 'loft_40.webp' },
      { name: 'Говяжий язык гриль', name_ru: 'Говяжий язык гриль', desc: 'язык говяжий, сливки, грибы шампиньоны', desc_ru: 'язык говяжий, сливки, грибы шампиньоны', price: 255, weight: '250/50g', img: 'loft_41.webp' },
    ]},
    { name: 'Мерида-гирос', name_ru: 'Мерида-гирос', items: [
      { name: 'С курицей', name_ru: 'С курицей', desc: 'куриное бедро, хумус, микс салата, помидоры, картошка фри, лепёшка', desc_ru: 'куриное бедро, хумус, микс салата, помидоры, картошка фри, лепёшка', price: 119, weight: '190/80g', img: 'loft_42.webp' },
      { name: 'С говядиной', name_ru: 'С говядиной', desc: 'говяжье мясо, хумус, микс салата, помидоры, картошка фри, лепёшка', desc_ru: 'говяжье мясо, хумус, микс салата, помидоры, картошка фри, лепёшка', price: 195, weight: '190/80g', img: null },
    ]},
    { name: 'Рыба', name_ru: 'Рыба', items: [
      { name: 'Судак Loft', name_ru: 'Судак Loft', desc: 'судак, брокколи, стручковая фасоль, сливки, сыр', desc_ru: 'судак, брокколи, стручковая фасоль, сливки, сыр', price: 168, weight: '300g', img: 'loft_43.webp' },
      { name: 'Дорадо с овощами', name_ru: 'Дорадо с овощами', desc: 'дорадо, помидоры пилатте, маслины, оливки, каперсы', desc_ru: 'дорадо, помидоры пилатте, маслины, оливки, каперсы', price: 248, weight: '300g', img: 'loft_44.webp' },
      { name: 'Стейк лосося', name_ru: 'Стейк лосося', desc: 'стейк лосося, микс салата, соус', desc_ru: 'стейк лосося, микс салата, соус', price: 298, weight: '225g', img: 'loft_45.webp' },
    ]},
    { name: 'Плато', name_ru: 'Плато', items: [
      { name: 'Плато «Баварское»', name_ru: 'Плато «Баварское»', desc: 'рулька, люля кебаб, шашлык куриный, картофель, аджика', desc_ru: 'рулька, люля кебаб, шашлык куриный, картофель, аджика', price: 465, weight: '1100g', img: 'loft_46.webp' },
      { name: 'Плато «Буковина»', name_ru: 'Плато «Буковина»', desc: 'цыплёнок, рёбра свиные, кырнэцэи, овощи гриль, соус BBQ', desc_ru: 'цыплёнок, рёбра свиные, кырнэцэи, овощи гриль, соус BBQ', price: 408, weight: '1200g', img: 'loft_47.webp' },
      { name: 'Плато «Норок»', name_ru: 'Плато «Норок»', desc: 'шашлык свиной, крылышки, мичи, грибочки гриль, соус тар-тар', desc_ru: 'шашлык свиной, крылышки, мичи, грибочки гриль, соус тар-тар', price: 420, weight: '950g', img: null },
    ]},
    { name: 'Роллы', name_ru: 'Роллы', items: [
      { name: 'Филадельфия', name_ru: 'Филадельфия', desc: 'рис, нори, сыр бука, огурец, красная рыба, имбирь, васаби', desc_ru: 'рис, нори, сыр бука, огурец, красная рыба, имбирь, васаби', price: 138, weight: '280g', img: 'loft_48.webp' },
      { name: 'Калифорния', name_ru: 'Калифорния', desc: 'рис, нори, сыр бука, авокадо, лосось, икра, имбирь, васаби', desc_ru: 'рис, нори, сыр бука, авокадо, лосось, икра, имбирь, васаби', price: 138, weight: '280g', img: 'loft_49.webp' },
      { name: 'Нежный', name_ru: 'Нежный', desc: 'рис, нори, сыр бука, авокадо, красная рыба, имбирь, васаби', desc_ru: 'рис, нори, сыр бука, авокадо, красная рыба, имбирь, васаби', price: 165, weight: '280g', img: 'loft_50.webp' },
      { name: 'Тёплый с лососем', name_ru: 'Тёплый с лососем', desc: 'рис, нори, сыр бука, лосось, панировочные сухари, имбирь, васаби', desc_ru: 'рис, нори, сыр бука, лосось, панировочные сухари, имбирь, васаби', price: 145, weight: '290g', img: 'loft_51.webp' },
      { name: 'Тёплый с курицей', name_ru: 'Тёплый с курицей', desc: 'рис, нори, сыр бука, копчённая грудка, панировочные сухари, имбирь, васаби', desc_ru: 'рис, нори, сыр бука, копчённая грудка, панировочные сухари, имбирь, васаби', price: 98, weight: '290g', img: 'loft_52.webp' },
      { name: 'Тёплый с креветкой', name_ru: 'Тёплый с креветкой', desc: 'рис, нори, сыр бука, креветка, панировочные сухари, имбирь, васаби', desc_ru: 'рис, нори, сыр бука, креветка, панировочные сухари, имбирь, васаби', price: 140, weight: '290g', img: 'loft_53.webp' },
      { name: 'Сет Темпура', name_ru: 'Сет Темпура', desc: 'тёплый с сёмгой, тёплый с креветкой, тёплый с курицей', desc_ru: 'тёплый с сёмгой, тёплый с креветкой, тёплый с курицей', price: 345, weight: '870g', img: 'loft_54.webp' },
      { name: 'Сет Loft', name_ru: 'Сет Loft', desc: 'Филадельфия, ролл с тунцом, Канада, Окинава, Калифорния с креветкой', desc_ru: 'Филадельфия, ролл с тунцом, Канада, Окинава, Калифорния с креветкой', price: 858, weight: '1200g', img: 'loft_55.webp' },
      { name: 'Сет Классический', name_ru: 'Сет Классический', desc: 'Филадельфия, ролл с тунцом, Канада, Окинава', desc_ru: 'Филадельфия, ролл с тунцом, Канада, Окинава', price: 575, weight: null, img: 'loft_56.webp' },
      { name: 'Сет Трио', name_ru: 'Сет Трио', desc: 'Калифорния, ролл с тунцом, Окинава', desc_ru: 'Калифорния, ролл с тунцом, Окинава', price: 380, weight: null, img: 'loft_57.webp' },
      { name: 'Канада', name_ru: 'Канада', desc: 'рис, нори, сыр боко, лосось, авокадо, угорь, имбирь, васаби', desc_ru: 'рис, нори, сыр боко, лосось, авокадо, угорь, имбирь, васаби', price: 162, weight: '280g', img: 'loft_58.webp' },
      { name: 'Ролл с тунцом', name_ru: 'Ролл с тунцом', desc: 'рис, нори, сыр боко, авокадо, огурец, тунец, кунжут, васаби, имбирь', desc_ru: 'рис, нори, сыр боко, авокадо, огурец, тунец, кунжут, васаби, имбирь', price: 135, weight: '280g', img: 'loft_59.webp' },
      { name: 'Окинава', name_ru: 'Окинава', desc: 'рис, нори, сыр боко, лосось, огурцы, имбирь, васаби', desc_ru: 'рис, нори, сыр боко, лосось, огурцы, имбирь, васаби', price: 158, weight: '280g', img: 'loft_60.webp' },
    ]},
    { name: 'Бургеры', name_ru: 'Бургеры', items: [
      { name: 'Burger Italian', name_ru: 'Burger Italian', desc: 'котлета, булка, черри, моцарелла, лист салата, пармезан, соус песто, картошка', desc_ru: 'котлета, булка, черри, моцарелла, лист салата, пармезан, соус песто, картошка', price: 158, weight: '400/150g', img: 'loft_61.webp' },
      { name: 'Royal Cheeseburger', name_ru: 'Royal Cheeseburger', desc: 'котлета, булка, бекон, соус айоли, лист салата, помидоры, пармезан, огурец маринованный, кунжут, картошка', desc_ru: 'котлета, булка, бекон, соус айоли, лист салата, помидоры, пармезан, огурец маринованный, кунжут, картошка', price: 162, weight: '400/150g', img: null },
      { name: 'Jack Burger', name_ru: 'Jack Burger', desc: 'котлета, булка, помидор, лист салата, огурец маринованный, сыр чедр, соус барбекю, айоли, картошка', desc_ru: 'котлета, булка, помидор, лист салата, огурец маринованный, сыр чедр, соус барбекю, айоли, картошка', price: 138, weight: '350g', img: null },
      { name: 'Texas Burger', name_ru: 'Texas Burger', desc: 'котлета, булка, бекон, соус айоли, лист салата, огурец маринованный, помидоры, сыр чедр', desc_ru: 'котлета, булка, бекон, соус айоли, лист салата, огурец маринованный, помидоры, сыр чедр', price: 135, weight: '350g', img: null },
      { name: 'Chicken Burger', name_ru: 'Chicken Burger', desc: 'бедро куриное, булка, соус айоли, лист салата, помидор, огурец', desc_ru: 'бедро куриное, булка, соус айоли, лист салата, помидор, огурец', price: 108, weight: '350g', img: 'loft_62.webp' },
      { name: 'Чёрный бургер', name_ru: 'Чёрный бургер', desc: 'булочка, куриное бедро, листья салата, огурцы, помидоры, сыр, соус, картофель фри', desc_ru: 'булочка, куриное бедро, листья салата, огурцы, помидоры, сыр, соус, картофель фри', price: 150, weight: null, img: 'loft_63.webp' },
    ]},
    { name: 'Десерты', name_ru: 'Десерты', items: [
      { name: 'Три молока', name_ru: 'Три молока', desc: 'бисквит, ириска, взбитые сливки', desc_ru: 'бисквит, ириска, взбитые сливки', price: 50, weight: '150g', img: 'loft_64.webp' },
      { name: 'Шоколадный флан', name_ru: 'Шоколадный флан', desc: 'шоколадный кекс с вишней, белое мороженое', desc_ru: 'шоколадный кекс с вишней, белое мороженое', price: 60, weight: '140g', img: 'loft_65.webp' },
      { name: 'Мороженное в панировке', name_ru: 'Мороженное в панировке', desc: 'мороженое жареное в кукурузных хлопьях', desc_ru: 'мороженое жареное в кукурузных хлопьях', price: 75, weight: '150g', img: null },
      { name: 'Брауни чизкейк', name_ru: 'Брауни чизкейк', desc: 'творожный пирог с вишней и грецким орехом', desc_ru: 'творожный пирог с вишней и грецким орехом', price: 75, weight: '200g', img: 'loft_66.webp' },
    ]},
  ];

  cats.forEach((cat, ci) => {
    const result = insertCat.run(cat.name, cat.name_ru, ci);
    const catId = result.lastInsertRowid;
    cat.items.forEach((item, ii) => {
      insertItem.run(catId, item.name, item.name_ru, item.desc, item.desc_ru, item.price, item.weight, item.img, ii);
    });
  });
}

export default db;
