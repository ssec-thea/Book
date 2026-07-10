import { Book, Review, Bookmark } from './types';

// Helper to get dates
const getDateAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    userId: 'user_1',
    title: '三体 (The Three-Body Problem)',
    author: '刘慈欣 (Cixin Liu)',
    country: 'China',
    category: 'Science Fiction',
    visibility: 'public',
    totalPages: 320,
    currentPage: 45,
    progress: 14,
    readTime: 5400,
    lastReadTime: getDateAgo(1),
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(30),
    updatedAt: getDateAgo(1),
    chapters: [
      {
        title: '第一章：科学边界 (Chapter 1: Frontiers of Science)',
        content: `科学边界是一个神秘的学术组织。汪淼，一名纳米材料科学家，在警方和军方的联合邀请下，接触到了这个组织。在这个时期，全球物理学界发生了诡异的连锁反应：高精尖物理实验的结果变得毫无规律，理论物理学家接连自杀，仿佛物理学在一夜之间不复存在。汪淼在参与“科学边界”的讨论时，听到了一句话：“一切物理学的前提都是假的。”他开始怀疑自己的信仰，并接触到一款神秘的虚拟现实游戏《三体》……`
      },
      {
        title: '第二章：红岸基地 (Chapter 2: Red Coast Base)',
        content: `时间倒退回二十世纪六十年代。在叶文洁经历家庭巨变和红卫兵风暴后，她被带到了大兴安岭深处的绝密基地——红岸基地。这里拥有一台巨大的射电望远镜。红岸基地的真实任务，是寻找地外文明。叶文洁作为天体物理学家，在这里工作了数年，并偶然间发现了太阳对电磁波的放大效应。她利用太阳作为发射器，向宇宙深处发射了一封呼吁地外文明干预地球的电波……`
      },
      {
        title: '第三章：三体游戏 (Chapter 3: The Three-Body Game)',
        content: `汪淼穿上体感服，戴上视网膜显示镜，进入了《三体》游戏。游戏的世界充满了诡异与蛮荒。这里的太阳不规则地升起和落下，有时天空中会出现两颗或三颗飞星，这意味着“乱纪元”的到来，整个文明将被极端的严寒或酷热毁灭。只有当三颗太阳排成一线的“恒纪元”到来时，生命才能得以繁衍。在这个世界里，居民可以“脱水”成一张张干皮，在乱纪元中储存起来，等恒纪元到来时再浸泡复活。汪淼试图通过牛顿、秦始皇、墨子等历史名人的思考，解开这个世界的运行规律。`
      }
    ]
  },
  {
    id: '2',
    userId: 'user_1',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    country: 'Colombia',
    category: 'Magical Realism',
    visibility: 'public',
    totalPages: 417,
    currentPage: 120,
    progress: 28,
    readTime: 12400,
    lastReadTime: getDateAgo(2),
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(60),
    updatedAt: getDateAgo(2),
    chapters: [
      {
        title: 'Chapter 1: The Founding of Macondo',
        content: `Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice. Macondo was then a village of twenty adobe houses, built on the bank of a river of clear water that ran along a bed of polished stones, which were white and enormous, like prehistoric eggs. The world was so recent that many things lacked names, and in order to indicate them it was necessary to point. Every year during the month of March, a family of ragged gypsies would set up their tents near the village, and with a great uproar of pipes and kettles they would display new inventions. First they brought the magnet...`
      },
      {
        title: 'Chapter 2: The Plague of Insomnia',
        content: `When Ursula realized that her children were growing up, she decided to expand the house. She built a spacious gallery, a dining room that could hold fifty people, and nine guest rooms. Macondo began to change. People from other villages arrived, attracted by the news of its prosperity. Along with them came the insomnia plague. It was Rebecca who brought it, a quiet girl who ate earth and lime from the walls. Soon, the entire village was awake, unable to sleep, but experiencing no fatigue. The danger was not the lack of sleep, but the gradual loss of memory. People began to forget the names of things, then their functions, and eventually their own identities...`
      }
    ]
  },
  {
    id: '3',
    userId: 'user_2',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    country: 'United States',
    category: 'Modernist Fiction',
    visibility: 'public',
    totalPages: 180,
    currentPage: 180,
    progress: 100,
    readTime: 18000,
    lastReadTime: getDateAgo(5),
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(45),
    updatedAt: getDateAgo(5),
    chapters: [
      {
        title: 'Chapter 1: The Green Light',
        content: `In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. "Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had." He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments... And so it was that on a warm summer night I saw the figure of my neighbor, Mr. Gatsby, standing on his lawn, stretching his arms out toward the dark water. Far across the bay, a single green light, minute and far away, marked the end of a dock.`
      }
    ]
  },
  {
    id: '4',
    userId: 'user_3',
    title: 'Kokoro (心)',
    author: 'Natsume Soseki (夏目漱石)',
    country: 'Japan',
    category: 'Japanese Literature',
    visibility: 'public',
    totalPages: 240,
    currentPage: 0,
    progress: 0,
    readTime: 0,
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(15),
    updatedAt: getDateAgo(15),
    chapters: [
      {
        title: '第一部：先生と私 (Part 1: Sensei and I)',
        content: `私はその人を常に先生と呼んでいた。だからここでもただ先生と書くだけで本名は打ち明けない。これは世間を憚かる遠慮というよりも、その方が私にとって自然だからである。私はその人の記憶を呼び起すごとに、すぐ「先生」と言いたくなる。筆を執っても心持は同じ事である。よそよそしい頭文字などはとても使う気にならない。
私が先生と知り合いになったのは鎌倉である。その時私はまだうら若い学生であった。暑中休暇を利用して海水浴に行った友達から、ぜひ来いという端書を受け取ったので、私は多少の金を工面して、出掛けた。私は金を工面するのに二日ほど費やした。しかし鎌倉に着いて三日目に、私を呼び寄せた友達は、急に国元から帰れという電報を受け取った。電報には母が病気だからとあったが、友達はそれを信じなかった……`
      }
    ]
  },
  {
    id: '5',
    userId: 'user_1',
    title: 'Les Misérables (悲惨世界)',
    author: 'Victor Hugo',
    country: 'France',
    category: 'Historical Fiction',
    visibility: 'public',
    totalPages: 1200,
    currentPage: 15,
    progress: 1,
    readTime: 900,
    lastReadTime: getDateAgo(10),
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(80),
    updatedAt: getDateAgo(10),
    chapters: [
      {
        title: 'Chapter 1: Jean Valjean and Myriel',
        content: `In 1815, M. Charles-Francois-Bienvenu Myriel was Bishop of Digne. He was an old man of about seventy-five years of age; he had occupied the see of Digne since 1806. Though this detail has no connection whatever with the real substance of what we are about to relate, it will not be superfluous, if merely for the sake of exactness in all points, to mention here the rumors and gossip which had been current concerning him at the moment when he arrived in the diocese... Jean Valjean, a convict released after nineteen years in prison, arrived in Digne. Turned away from every inn, he was taken in by the saintly bishop, whose silver plates Valjean subsequently stole...`
      }
    ]
  },
  {
    id: '6',
    userId: 'user_2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    country: 'United Kingdom',
    category: 'Romantic Fiction',
    visibility: 'public',
    totalPages: 350,
    currentPage: 0,
    progress: 0,
    readTime: 0,
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(12),
    updatedAt: getDateAgo(12),
    chapters: [
      {
        title: 'Chapter 1: Mr. Bingley Arrives',
        content: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters. "My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?" Mr. Bennet replied that he had not...`
      }
    ]
  },
  {
    id: '7',
    userId: 'user_4',
    title: 'Faust (浮士德)',
    author: 'Johann Wolfgang von Goethe',
    country: 'Germany',
    category: 'Drama',
    visibility: 'public',
    totalPages: 300,
    currentPage: 0,
    progress: 0,
    readTime: 0,
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(25),
    updatedAt: getDateAgo(25),
    chapters: [
      {
        title: 'Prolog im Himmel (Prologue in Heaven)',
        content: `The Lord, the Heavenly Hosts, afterwards Mephistopheles. The Three Archangels come forward.
RAPHAEL: The sun-orb sings, in emulation, mid brother-spheres his ancient song, and his prescribed path-course direction, with thunder-speed, he speeds along...
MEPHISTOPHELES: Since Thou, O Lord, deignst to approach us once again, and ask how all things with us go, and since of old Thou didst welcome me, so now I show myself among Thy household train. Pardon, if I cannot speak in lofty wise, though all this circle mock me as a fool; my pathos surely would provoke Thy sighs, hadst Thou not ceased from weeping as a rule...`
      }
    ]
  },
  {
    id: '8',
    userId: 'user_3',
    title: 'The Posthumous Memoirs of Brás Cubas',
    author: 'Machado de Assis',
    country: 'Brazil',
    category: 'Satire',
    visibility: 'public',
    totalPages: 220,
    currentPage: 10,
    progress: 4,
    readTime: 400,
    fileType: 'txt',
    cover: 'https://images.unsplash.com/photo-1491849794228-a11ee3288e80?q=80&w=300&auto=format&fit=crop',
    createdAt: getDateAgo(20),
    updatedAt: getDateAgo(20),
    chapters: [
      {
        title: 'Chapter 1: The Death of the Author',
        content: `I am a deceased writer, not in the sense of one who has written and is now dead, but in the sense of one who has died and is now writing, for whom the grave was a second cradle. My death occurred at two o'clock on a Friday afternoon in the month of August, 1869, at my beautiful suburban estate in Catumbi. I was sixty-four years old, robust, and single... I died of a pneumonia, or rather, I died of an idea: the creation of a sublime pharmaceutical product, the "Brás Cubas Plaster," which was to alleviate human suffering. Sadly, I caught a cold while supervising its composition...`
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    userId: 'user_1',
    username: '汪淼 (Miao Wang)',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
    bookId: '1',
    bookTitle: '三体 (The Three-Body Problem)',
    bookAuthor: '刘慈欣 (Cixin Liu)',
    title: '震撼心灵的宇宙尺度史诗 (Soul-shaking Cosmic Epic)',
    content: '看这本书的时候，能真切感受到物理学作为人类理性的尊严和脆弱。刘慈欣用极致的硬科幻外壳包裹了深刻的哲学思考。当红岸基地的天线对准太阳，叶文洁按下了那个按钮，整个人类文明的命运便彻底偏航。在宇宙的大尺度下，人类微小如虫子，却拥有着最宝贵的思考。五星推荐！',
    score: 5,
    longitude: 116.4074,
    latitude: 39.9042,
    locationName: 'Beijing, China',
    visibility: 'public',
    createdAt: getDateAgo(1)
  },
  {
    id: 'r2',
    userId: 'user_2',
    username: 'Julio Cortázar',
    userAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop',
    bookId: '2',
    bookTitle: 'One Hundred Years of Solitude',
    bookAuthor: 'Gabriel García Márquez',
    title: 'Magical, beautiful, and profoundly melancholic',
    content: 'García Márquez created a universe where the line between the dead and the living, the magical and the ordinary, simply melts away. Reading about Aureliano Buendía and his laboratory is like stepping into a dream where time runs in circles. A brilliant masterpiece of Colombian magical realism, written with prose that tastes like poetry.',
    score: 5,
    longitude: -74.0721,
    latitude: 4.7110,
    locationName: 'Bogotá, Colombia',
    visibility: 'public',
    createdAt: getDateAgo(12)
  },
  {
    id: 'r3',
    userId: 'user_3',
    username: 'Aya Tanaka',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    bookId: '4',
    bookTitle: 'Kokoro (心)',
    bookAuthor: 'Natsume Soseki (夏目漱石)',
    title: '静谧之下的悲哀与救赎 (Sadness and Redemption beneath Serenity)',
    content: '夏目漱石的书有一种日本传统的哀愁，像秋天的落叶。描写明治时代晚期知识分子的精神孤独入木三分。先生对年轻人的教导、以及他内心深处沉重的罪恶感，最终通过遗书的形式缓缓展现，读来令人心碎。这种细腻而沉重的罪与罚，是东方文学中极少见的杰作。',
    score: 5,
    longitude: 139.6917,
    latitude: 35.6895,
    locationName: 'Tokyo, Japan',
    visibility: 'public',
    createdAt: getDateAgo(3)
  },
  {
    id: 'r4',
    userId: 'user_4',
    username: 'Jean-Pierre',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
    bookId: '5',
    bookTitle: 'Les Misérables (悲惨世界)',
    bookAuthor: 'Victor Hugo',
    title: 'The ultimate triumph of human love and sacrifice',
    content: 'Jean Valjean is one of the most sublime characters in literary history. His struggle with Inspector Javert is not just a police chase, but the eternal clash between absolute law and absolute grace. The description of Digne, Paris, and the barricades is detailed and cinematic. It represents the height of French historical romanticism.',
    score: 4,
    longitude: 2.3522,
    latitude: 48.8566,
    locationName: 'Paris, France',
    visibility: 'public',
    createdAt: getDateAgo(15)
  },
  {
    id: 'r5',
    userId: 'user_1',
    username: 'Miao Wang',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
    bookId: '3',
    bookTitle: 'The Great Gatsby',
    bookAuthor: 'F. Scott Fitzgerald',
    title: 'The tragedy of the American Dream',
    content: 'Gatsby is a character who lives in the romantic illusion of the past, symbolized by the green light across the bay. Fitzgerald\'s writing is extremely precise and evocative. His portrayal of the roaring twenties, the valley of ashes, and Gatsby\'s extravagant parties serves as an eternal warning against hollow pursuit and spiritual emptiness. An absolute masterpiece.',
    score: 5,
    longitude: -74.0060,
    latitude: 40.7128,
    locationName: 'New York, USA',
    visibility: 'public',
    createdAt: getDateAgo(7)
  },
  {
    id: 'r6',
    userId: 'user_3',
    username: 'Aya Tanaka',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    bookId: '6',
    bookTitle: 'Pride and Prejudice',
    bookAuthor: 'Jane Austen',
    title: 'Charming social satire and brilliant character study',
    content: 'Elizabeth Bennet and Mr. Darcy represent one of the best romantic pairings ever written. Austen\'s wit is sharp, humorous, and timeless. Her keen observation of the English country gentry and their marriage anxieties is both funny and sociologically accurate. A comforting and satisfying read.',
    score: 4,
    longitude: -0.1276,
    latitude: 51.5074,
    locationName: 'London, United Kingdom',
    visibility: 'public',
    createdAt: getDateAgo(8)
  },
  {
    id: 'r7',
    userId: 'user_2',
    username: 'Julio Cortázar',
    userAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop',
    bookId: '7',
    bookTitle: 'Faust (浮士德)',
    bookAuthor: 'Johann Wolfgang von Goethe',
    title: 'A monumental work of German drama and philosophy',
    content: 'Goethe spent decades writing Faust, and it shows. The pact between Faust and Mephistopheles is the ultimate metaphor for humanity\'s restless ambition and search for meaning. The language is rich, dense, and full of classical references. Highly challenging but deeply rewarding.',
    score: 4,
    longitude: 13.4050,
    latitude: 52.5200,
    locationName: 'Berlin, Germany',
    visibility: 'public',
    createdAt: getDateAgo(20)
  },
  {
    id: 'r8',
    userId: 'user_4',
    username: 'Jean-Pierre',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
    bookId: '8',
    bookTitle: 'The Posthumous Memoirs of Brás Cubas',
    bookAuthor: 'Machado de Assis',
    title: 'A brilliant, ironic, and completely ahead-of-its-time masterpiece',
    content: 'Writing from the perspective of a dead man is a genius narrative trick. Machado de Assis uses irony and sarcasm to dismantle the high-society hypocrisy of 19th-century Brazil. It has short, snappy, metafictional chapters that feel like they were written by a modern postmodernist. Essential read.',
    score: 5,
    longitude: -43.1729,
    latitude: -22.9068,
    locationName: 'Rio de Janeiro, Brazil',
    visibility: 'public',
    createdAt: getDateAgo(11)
  }
];

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'b1',
    bookId: '1',
    userId: 'user_1',
    position: 150,
    chapterTitle: '第一章：科学边界',
    note: '这一句极其震撼，体现了物理学在未解谜团前的坍塌。',
    textSnippet: '“一切物理学的前提都是假的。”他开始怀疑自己的信仰',
    createdAt: getDateAgo(1)
  }
];

export const MOCK_USER = {
  id: 'user_1',
  username: '书旅行者 (Voyager)',
  email: 'voyager@bookvoyage.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
  bio: '爱读书，也爱丈量世界的旅行者。Believe that reading is a voyage across space and time.'
};

export const MOCK_CATEGORIES = [
  'Science Fiction',
  'Magical Realism',
  'Modernist Fiction',
  'Japanese Literature',
  'Historical Fiction',
  'Romantic Fiction',
  'Drama',
  'Satire',
  'Biography',
  'Philosophy',
  'History'
];

export const COUNTRIES_GEO_MAP: { [country: string]: { lat: number; lng: number; code: string } } = {
  'China': { lat: 39.9042, lng: 116.4074, code: 'CN' },
  'Colombia': { lat: 4.7110, lng: -74.0721, code: 'CO' },
  'United States': { lat: 40.7128, lng: -74.0060, code: 'US' },
  'Japan': { lat: 35.6895, lng: 139.6917, code: 'JP' },
  'France': { lat: 48.8566, lng: 2.3522, code: 'FR' },
  'United Kingdom': { lat: 51.5074, lng: -0.1276, code: 'GB' },
  'Germany': { lat: 52.5200, lng: 13.4050, code: 'DE' },
  'Brazil': { lat: -22.9068, lng: -43.1729, code: 'BR' },
  'Russia': { lat: 55.7558, lng: 37.6173, code: 'RU' },
  'India': { lat: 28.6139, lng: 77.2090, code: 'IN' },
  'South Africa': { lat: -33.9249, lng: 18.4241, code: 'ZA' },
  'Australia': { lat: -35.2809, lng: 149.1300, code: 'AU' },
  'Italy': { lat: 41.9028, lng: 12.4964, code: 'IT' },
  'Canada': { lat: 45.4215, lng: -75.6972, code: 'CA' },
  'Spain': { lat: 40.4167, lng: -3.7037, code: 'ES' },
  'Egypt': { lat: 30.0444, lng: 31.2357, code: 'EG' },
  'Mexico': { lat: 19.4326, lng: -99.1332, code: 'MX' },
  'Argentina': { lat: -34.6037, lng: -58.3816, code: 'AR' },
  'South Korea': { lat: 37.5665, lng: 126.9780, code: 'KR' },
  'Greece': { lat: 37.9838, lng: 23.7275, code: 'GR' },
  'Sweden': { lat: 59.3293, lng: 18.0686, code: 'SE' },
  'Turkey': { lat: 38.9637, lng: 35.2433, code: 'TR' },
  'Singapore': { lat: 1.3521, lng: 103.8198, code: 'SG' }
};
