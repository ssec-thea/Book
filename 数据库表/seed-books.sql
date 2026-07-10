-- ======================================================
-- BookVoyage 种子数据
-- 包含: 默认用户 + 6本真实图书 + 8本Mock图书 + 书评 + 书签
-- ======================================================

USE bookvoyage;

-- ----------------------------
-- 默认用户 (密码: guestpass123, bcrypt hash)
-- ----------------------------
INSERT INTO users (username, email, password_hash, avatar, bio) VALUES
('书旅行者 (Voyager)', 'voyager@bookvoyage.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
 '爱读书，也爱丈量世界的旅行者。Believe that reading is a voyage across space and time.')
ON DUPLICATE KEY UPDATE username=username;

-- ----------------------------
-- 6 本真实图书 (来自 C:\Users\Lenovo\Desktop\book)
-- ----------------------------
INSERT INTO books (user_id, title, author, country, cover, file_path, file_type, file_size, category, visibility, total_pages, summary) VALUES
-- 1. 百年孤独
(1, '百年孤独', '加西亚·马尔克斯', 'Colombia',
 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop',
 'data/books/百年孤独.epub', 'epub', 13692811, 'Magical Realism', 1, 360,
 '《百年孤独》是哥伦比亚作家加西亚·马尔克斯的代表作，也是拉丁美洲魔幻现实主义文学的代表作，被誉为"再现拉丁美洲历史社会图景的鸿篇巨著"。作品描写了布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰。'),
-- 2. 她对此感到厌烦2
(1, '她对此感到厌烦2', '妚鹤', 'China',
 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop',
 'data/books/她对此感到厌烦2.epub', 'epub', 832624, 'Contemporary Fiction', 1, 280,
 '当代网络文学作品，以都市女性视角展开的自我成长故事。'),
-- 3. 世上最美的溺水者
(1, '世上最美的溺水者', '加西亚·马尔克斯', 'Colombia',
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop',
 'data/books/世上最美的溺水者.epub', 'epub', 237667, 'Magical Realism', 1, 150,
 '马尔克斯短篇小说集，收录了包括《世上最美的溺水者》在内的多部魔幻现实主义短篇佳作。'),
-- 4. 恶意
(1, '恶意', '东野圭吾', 'Japan',
 'https://images.unsplash.com/photo-1587876930976-f4da5a504a0b?q=80&w=300&auto=format&fit=crop',
 'data/books/恶意.epub', 'epub', 213926, 'Mystery', 1, 250,
 '日本推理小说大师东野圭吾的代表作之一，以精妙的叙事结构探讨了人性深处无端的恶意。被称为东野圭吾的巅峰之作。'),
-- 5. 梦中的欢快葬礼和十二个异乡故事
(1, '梦中的欢快葬礼和十二个异乡故事', '加西亚·马尔克斯', 'Colombia',
 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=300&auto=format&fit=crop',
 'data/books/梦中的欢快葬礼和十二个异乡故事.epub', 'epub', 213314, 'Magical Realism', 1, 180,
 '马尔克斯的短篇小说集，收录了十二个关于异乡人的奇异故事，展现了作者对旅居欧洲的拉丁美洲人命运的深刻洞察。'),
-- 6. 羊道 春牧场
(1, '羊道 春牧场', '李娟', 'China',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300&auto=format&fit=crop',
 'data/books/羊道 春牧场.pdf', 'pdf', 8045692, 'Non-Fiction', 1, 320,
 '李娟的散文集，记录了新疆阿勒泰牧区哈萨克族牧民的真实生活。文字质朴而充满诗意，被誉为"当代汉语写作的清新之风"。')
ON DUPLICATE KEY UPDATE title=title;

-- ----------------------------
-- 8 本 Mock 图书 (来自 mockData.ts)
-- ----------------------------
INSERT INTO books (user_id, title, author, country, cover, file_type, category, visibility, total_pages, read_time, summary, content) VALUES
-- 7. 三体
(1, '三体 (The Three-Body Problem)', '刘慈欣 (Cixin Liu)', 'China',
 'https://images.unsplash.com/photo-1614313913007-2b1b1b1b1b1b?q=80&w=300&auto=format&fit=crop',
 'txt', 'Science Fiction', 1, 400, 7200,
 '一个关于人类首次接触外星文明——三体星人的宏大硬科幻故事。文化大革命期间，天文学家叶文洁在红岸基地向宇宙发出了地球的第一声啼鸣...',
 'Chapter 1: The Madness Years\n\nThe Red Union had been attacking the headquarters of the April Twenty-eighth Brigade for two days...'),
-- 8. 百年孤独 (Mock)
(1, 'One Hundred Years of Solitude', 'Gabriel García Márquez', 'Colombia',
 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop',
 'txt', 'Magical Realism', 1, 420, 5400,
 'The multi-generational story of the Buendía family in the mythical town of Macondo.',
 'Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon...'),
-- 9. 了不起的盖茨比
(1, 'The Great Gatsby', 'F. Scott Fitzgerald', 'United States',
 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop',
 'txt', 'Modernist Fiction', 1, 180, 3600,
 'A tragedy of love, obsession, and the illusion of the American Dream in the Roaring Twenties.',
 'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since...'),
-- 10. 心
(1, 'Kokoro (こころ)', 'Natsume Sōseki', 'Japan',
 'https://images.unsplash.com/photo-1587876930976-f4da5a504a0b?q=80&w=300&auto=format&fit=crop',
 'txt', 'Japanese Literature', 1, 250, 4200,
 'A meditation on loneliness, guilt, and the transition from the Meiji era to modern Japan.',
 'I always called him "Sensei." I shall therefore refer to him simply as "Sensei," and not by his real name...'),
-- 11. 悲惨世界
(1, 'Les Misérables', 'Victor Hugo', 'France',
 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=300&auto=format&fit=crop',
 'txt', 'Historical Fiction', 1, 1200, 10800,
 'An epic tale of redemption, revolution, and the human spirit in 19th century France.',
 'In 1815, M. Charles-François-Bienvenu Myriel was Bishop of Digne...'),
-- 12. 傲慢与偏见
(1, 'Pride and Prejudice', 'Jane Austen', 'United Kingdom',
 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop',
 'txt', 'Classic Romance', 1, 350, 4800,
 'A sparkling comedy of manners and marriage in Regency-era England.',
 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife...'),
-- 13. 浮士德
(1, 'Faust', 'Johann Wolfgang von Goethe', 'Germany',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300&auto=format&fit=crop',
 'txt', 'Classic Drama', 1, 300, 3600,
 'A tragic play about a scholar who makes a pact with the devil in exchange for unlimited knowledge.',
 'I''ve studied now Philosophy, And Jurisprudence, Medicine—And even, alas! Theology—From end to end, with labor keen...'),
-- 14. 布拉斯·库巴斯死后回忆录
(1, 'The Posthumous Memoirs of Brás Cubas', 'Machado de Assis', 'Brazil',
 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=300&auto=format&fit=crop',
 'txt', 'Classic Literature', 1, 200, 3000,
 'A groundbreaking novel narrated by a dead man looking back at his life with irony and wit.',
 'I am not exactly a writer who is dead, but a dead man who is a writer...')
ON DUPLICATE KEY UPDATE title=title;

-- ----------------------------
-- 8 条 Mock 书评 (来自 mockData.ts)
-- ----------------------------
INSERT INTO reviews (user_id, book_id, title, content, score, longitude, latitude, location_name, visibility) VALUES
-- 注意: book_id 使用子查询动态获取
(1, (SELECT id FROM books WHERE title LIKE '%三体%' LIMIT 1),
 '宇宙社会学的第一课', '读完《三体》，我久久无法平静。刘慈欣用冷静到近乎残酷的笔调，构建了一个逻辑自洽的宇宙文明图景。黑暗森林法则不仅仅是一种科幻设定，更是对人类文明自身的一种深刻隐喻。每当仰望星空，我都不禁会想：那些闪烁的星光背后，是否也有一双双眼睛在凝视着我们？', 5,
 116.4074, 39.9042, 'Beijing, China', 1),

(1, (SELECT id FROM books WHERE title = 'One Hundred Years of Solitude' LIMIT 1),
 'Macondo: A Mirror of Humanity', 'Marquez weaves a tapestry where time folds upon itself. The Buendia family saga is not just a story—it is a meditation on solitude, love, war, and the cyclical nature of history. Every reader will find a piece of themselves in Macondo. Reading this in the quiet hours of the night, with only a candle flickering, felt like stepping into another dimension of existence.', 5,
 -74.0721, 4.711, 'Bogotá, Colombia', 1),

(1, (SELECT id FROM books WHERE title LIKE '%Great Gatsby%' LIMIT 1),
 'The Green Light Across the Bay', 'Fitzgerald captured the hollowness of the American Dream with devastating precision. Gatsby is the ultimate romantic—and the ultimate fool. The prose is so crystalline, so perfectly tuned, that every sentence feels inevitable. Read this on a summer evening by the water, watching the lights of the city flicker on one by one.', 4,
 -74.006, 40.7128, 'New York, United States', 1),

(1, (SELECT id FROM books WHERE title = 'Kokoro (こころ)' LIMIT 1),
 'The Silence Between Generations', 'Natsume Soseki plumbs the depths of loneliness with extraordinary restraint. The relationship between Sensei and the narrator becomes a mirror for Japan''s own struggle between tradition and modernity. A profoundly moving experience that left me staring at the wall for an hour after finishing.', 5,
 139.6503, 35.6762, 'Tokyo, Japan', 1),

(1, (SELECT id FROM books WHERE title LIKE '%Mis%rables%' LIMIT 1),
 'The Weight of Redemption', 'Hugo''s masterpiece is a cathedral of a novel—vast, intricate, and soaring. Jean Valjean''s journey from convict to saint is one of the most powerful arcs in all of literature. The sewers of Paris have never felt so spiritual.', 5,
 2.3522, 48.8566, 'Paris, France', 1),

(1, (SELECT id FROM books WHERE title LIKE '%Pride%Prejudice%' LIMIT 1),
 'Wit as a Weapon', 'Austen''s irony is so sharp you don''t realize you''re bleeding until the chapter ends. Elizabeth Bennet remains one of the most fully-realized characters in English literature. The dance of pride and prejudice between her and Darcy is choreographed with balletic precision.', 4,
 -0.1276, 51.5074, 'London, United Kingdom', 1),

(1, (SELECT id FROM books WHERE title = 'Faust' LIMIT 1),
 'The Eternal Wager', 'Goethe''s cosmic drama is the ultimate exploration of the human drive for knowledge, experience, and transcendence. Mephistopheles is the most charming devil ever written. The final scene''s redemptive vision still brings tears to my eyes.', 5,
 13.4050, 52.5200, 'Berlin, Germany', 1),

(1, (SELECT id FROM books WHERE title LIKE '%Br%s Cubas%' LIMIT 1),
 'Laughter from Beyond the Grave', 'Machado de Assis was centuries ahead of his time. This novel''s narrative innovations—a dead narrator, fragmentary chapters, direct reader address—anticipated postmodernism by a hundred years. And it''s hilarious. Brazilian literature''s greatest gift to the world.', 5,
 -43.1729, -22.9068, 'Rio de Janeiro, Brazil', 1)
ON DUPLICATE KEY UPDATE title=title;
