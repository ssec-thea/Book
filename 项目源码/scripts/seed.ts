/**
 * 数据库种子脚本
 * 初始化默认用户和示例数据
 *
 * 运行: npx tsx scripts/seed.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase, getPool } from '../src/db/database';
import { hashPassword } from '../utils/password';

async function seed() {
  console.log('🌱 Seeding database...');

  // 初始化数据库和表
  await initializeDatabase();
  const pool = getPool();

  // ----------------------------
  // 1. 创建默认用户
  // ----------------------------
  const passwordHash = await hashPassword('guestpass123');
  console.log('  Creating default user...');

  const [existingUser] = await pool.execute<any[]>(
    'SELECT id FROM users WHERE email = ?', ['voyager@bookvoyage.com']
  );

  let userId: number;

  if (existingUser.length > 0) {
    userId = existingUser[0].id;
    console.log('  Default user already exists, skipping.');
  } else {
    const [result] = await pool.execute<any>(
      `INSERT INTO users (username, email, password_hash, avatar, bio)
       VALUES (?, ?, ?, ?, ?)`,
      [
        '书旅行者 (Voyager)',
        'voyager@bookvoyage.com',
        passwordHash,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        '爱读书，也爱丈量世界的旅行者。Believe that reading is a voyage across space and time.',
      ]
    );
    userId = result.insertId;
    console.log(`  Created user: 书旅行者 (id=${userId})`);
  }

  // ----------------------------
  // 2. 插入 14 本图书（6 真实 + 8 Mock）
  // ----------------------------
  const [bookCount] = await pool.execute<any[]>(
    'SELECT COUNT(*) as count FROM books'
  );
  if (bookCount[0].count > 0) {
    console.log(`  ${bookCount[0].count} books already exist, skipping.`);
  } else {
    const books = [
      // 6 本真实图书
      {
        title: '百年孤独', author: '加西亚·马尔克斯', country: 'Colombia',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop',
        fileType: 'epub', fileSize: 13692811, category: 'Magical Realism',
        summary: '《百年孤独》是哥伦比亚作家加西亚·马尔克斯的代表作，也是拉丁美洲魔幻现实主义文学的代表作，被誉为"再现拉丁美洲历史社会图景的鸿篇巨著"。',
      },
      {
        title: '她对此感到厌烦2', author: '妚鹤', country: 'China',
        cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop',
        fileType: 'epub', fileSize: 832624, category: 'Contemporary Fiction',
        summary: '当代网络文学作品，以都市女性视角展开的自我成长故事。',
      },
      {
        title: '世上最美的溺水者', author: '加西亚·马尔克斯', country: 'Colombia',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop',
        fileType: 'epub', fileSize: 237667, category: 'Magical Realism',
        summary: '马尔克斯短篇小说集，收录了包括《世上最美的溺水者》在内的多部魔幻现实主义短篇佳作。',
      },
      {
        title: '恶意', author: '东野圭吾', country: 'Japan',
        cover: 'https://images.unsplash.com/photo-1587876930976-f4da5a504a0b?q=80&w=300&auto=format&fit=crop',
        fileType: 'epub', fileSize: 213926, category: 'Mystery',
        summary: '日本推理小说大师东野圭吾的代表作之一，以精妙的叙事结构探讨了人性深处无端的恶意。',
      },
      {
        title: '梦中的欢快葬礼和十二个异乡故事', author: '加西亚·马尔克斯', country: 'Colombia',
        cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=300&auto=format&fit=crop',
        fileType: 'epub', fileSize: 213314, category: 'Magical Realism',
        summary: '马尔克斯短篇小说集，收录了十二个关于异乡人的奇异故事，展现了作者对旅居欧洲的拉丁美洲人命运的深刻洞察。',
      },
      {
        title: '羊道 春牧场', author: '李娟', country: 'China',
        cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300&auto=format&fit=crop',
        fileType: 'pdf', fileSize: 8045692, category: 'Non-Fiction',
        summary: '李娟的散文集，记录了新疆阿勒泰牧区哈萨克族牧民的真实生活。文字质朴而充满诗意。',
      },
      // 8 本 Mock 图书
      {
        title: '三体 (The Three-Body Problem)', author: '刘慈欣 (Cixin Liu)', country: 'China',
        cover: 'https://images.unsplash.com/photo-1614313913007-2b1b1b1b1b1b?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Science Fiction', readTime: 7200,
        summary: '一个关于人类首次接触外星文明——三体星人的宏大硬科幻故事。',
        content: 'Chapter 1: The Madness Years\n\nThe Red Union had been attacking the headquarters of the April Twenty-eighth Brigade for two days...',
      },
      {
        title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', country: 'Colombia',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Magical Realism', readTime: 5400,
        summary: 'The multi-generational story of the Buendía family in the mythical town of Macondo.',
        content: 'Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon...',
      },
      {
        title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', country: 'United States',
        cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Modernist Fiction', readTime: 3600,
        summary: 'A tragedy of love, obsession, and the illusion of the American Dream in the Roaring Twenties.',
        content: 'In my younger and more vulnerable years my father gave me some advice...',
      },
      {
        title: 'Kokoro (こころ)', author: 'Natsume Sōseki', country: 'Japan',
        cover: 'https://images.unsplash.com/photo-1587876930976-f4da5a504a0b?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Japanese Literature', readTime: 4200,
        summary: 'A meditation on loneliness, guilt, and the transition from the Meiji era to modern Japan.',
        content: 'I always called him "Sensei." I shall therefore refer to him simply as "Sensei."',
      },
      {
        title: 'Les Misérables', author: 'Victor Hugo', country: 'France',
        cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Historical Fiction', readTime: 10800,
        summary: 'An epic tale of redemption, revolution, and the human spirit in 19th century France.',
        content: 'In 1815, M. Charles-François-Bienvenu Myriel was Bishop of Digne...',
      },
      {
        title: 'Pride and Prejudice', author: 'Jane Austen', country: 'United Kingdom',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Classic Romance', readTime: 4800,
        summary: 'A sparkling comedy of manners and marriage in Regency-era England.',
        content: 'It is a truth universally acknowledged, that a single man in possession of a good fortune...',
      },
      {
        title: 'Faust', author: 'Johann Wolfgang von Goethe', country: 'Germany',
        cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Classic Drama', readTime: 3600,
        summary: 'A tragic play about a scholar who makes a pact with the devil in exchange for unlimited knowledge.',
        content: "I've studied now Philosophy, And Jurisprudence, Medicine—And even, alas! Theology...",
      },
      {
        title: 'The Posthumous Memoirs of Brás Cubas', author: 'Machado de Assis', country: 'Brazil',
        cover: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=300&auto=format&fit=crop',
        fileType: 'txt', category: 'Classic Literature', readTime: 3000,
        summary: 'A groundbreaking novel narrated by a dead man looking back at his life with irony and wit.',
        content: 'I am not exactly a writer who is dead, but a dead man who is a writer...',
      },
    ];

    for (const b of books) {
      await pool.execute(
        `INSERT INTO books (user_id, title, author, country, cover, file_type, file_size, category, visibility, read_time, summary, content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [userId, b.title, b.author, b.country, b.cover, b.fileType, b.fileSize || 0, b.category, b.readTime || 0, b.summary || '', b.content || '']
      );
    }
    console.log(`  Inserted ${books.length} books.`);
  }

  // ----------------------------
  // 3. 插入 8 条示例书评
  // ----------------------------
  const [reviewCount] = await pool.execute<any[]>(
    'SELECT COUNT(*) as count FROM reviews'
  );
  if (reviewCount[0].count > 0) {
    console.log(`  ${reviewCount[0].count} reviews already exist, skipping.`);
  } else {
    const [rows] = await pool.execute<any[]>(
      'SELECT id, title FROM books ORDER BY id'
    );

    const getBookId = (titlePattern: string): number => {
      const match = rows.find((r: any) => r.title.includes(titlePattern));
      return match ? match.id : 1;
    };

    const reviews = [
      { bookPattern: '三体', title: '宇宙社会学的第一课', content: '读完《三体》，我久久无法平静。刘慈欣用冷静到近乎残酷的笔调，构建了一个逻辑自洽的宇宙文明图景。黑暗森林法则不仅仅是一种科幻设定，更是对人类文明自身的一种深刻隐喻。', score: 5, lng: 116.4074, lat: 39.9042, loc: 'Beijing, China' },
      { bookPattern: 'Solitude', title: 'Macondo: A Mirror of Humanity', content: 'Marquez weaves a tapestry where time folds upon itself. The Buendia family saga is not just a story—it is a meditation on solitude, love, war, and the cyclical nature of history.', score: 5, lng: -74.0721, lat: 4.711, loc: 'Bogotá, Colombia' },
      { bookPattern: 'Gatsby', title: 'The Green Light Across the Bay', content: 'Fitzgerald captured the hollowness of the American Dream with devastating precision. Gatsby is the ultimate romantic—and the ultimate fool.', score: 4, lng: -74.006, lat: 40.7128, loc: 'New York, United States' },
      { bookPattern: 'Kokoro', title: 'The Silence Between Generations', content: 'Natsume Soseki plumbs the depths of loneliness with extraordinary restraint. A profoundly moving experience.', score: 5, lng: 139.6503, lat: 35.6762, loc: 'Tokyo, Japan' },
      { bookPattern: 'Misérabl', title: 'The Weight of Redemption', content: "Hugo's masterpiece is a cathedral of a novel—vast, intricate, and soaring. Jean Valjean's journey from convict to saint is one of the most powerful arcs in all of literature.", score: 5, lng: 2.3522, lat: 48.8566, loc: 'Paris, France' },
      { bookPattern: 'Pride', title: 'Wit as a Weapon', content: "Austen's irony is so sharp you don't realize you're bleeding until the chapter ends. Elizabeth Bennet remains one of the most fully-realized characters in English literature.", score: 4, lng: -0.1276, lat: 51.5074, loc: 'London, United Kingdom' },
      { bookPattern: 'Faust', title: 'The Eternal Wager', content: "Goethe's cosmic drama is the ultimate exploration of the human drive for knowledge, experience, and transcendence. Mephistopheles is the most charming devil ever written.", score: 5, lng: 13.4050, lat: 52.5200, loc: 'Berlin, Germany' },
      { bookPattern: 'Brás|Cubas', title: 'Laughter from Beyond the Grave', content: "Machado de Assis was centuries ahead of his time. This novel's narrative innovations anticipated postmodernism by a hundred years.", score: 5, lng: -43.1729, lat: -22.9068, loc: 'Rio de Janeiro, Brazil' },
    ];

    for (const r of reviews) {
      const bookId = getBookId(r.bookPattern);
      await pool.execute(
        `INSERT INTO reviews (user_id, book_id, title, content, score, longitude, latitude, location_name, visibility)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [userId, bookId, r.title, r.content, r.score, r.lng, r.lat, r.loc]
      );
    }
    console.log(`  Inserted ${reviews.length} reviews.`);
  }

  console.log('✅ Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
