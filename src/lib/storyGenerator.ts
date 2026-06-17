import type {
  CivilizationMyth,
  LegalSystem,
  CurrencySystem,
  CivilizationFlag,
  CivilizationSlogan,
  CivilizationCulture,
  LawArticle,
  EraStage,
  CivilizationStats,
} from '../types';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MYTH_TEMPLATES: Omit<CivilizationMyth, 'id' | 'cooperationBonus'>[] = [
  {
    name: '神树信仰',
    type: 'nature',
    title: '万源神树创世说',
    summary: '世界诞生于一棵连接天地的巨树，文明因神树的庇佑而繁荣。',
    coreDeity: '树母 · 绿枝',
    sacredSymbol: '🌳',
    story: [
      '混沌初开，万物未生，唯有一粒种子漂浮于虚空。',
      '历经千年，种子发芽，长成通天彻地的万源神树。',
      '神树的根须汲取大地之力，枝叶舒展于云端之上。',
      '树母从神树之心走出，将智慧赐予第一批部落子民。',
      '神树每年结出一颗圣果，食之可增加一年的丰收。',
      '凡虔诚向树母祈祷者，皆可获得合作的勇气与力量。',
    ],
    effects: { agriculture: 3, culture: 2 },
  },
  {
    name: '天空契约',
    type: 'cosmic',
    title: '星辰盟约·天空之神的誓言',
    summary: '先祖与天空之神订立永恒契约，以守信换取文明的繁荣。',
    coreDeity: '苍穹神 · 司星',
    sacredSymbol: '⭐',
    story: [
      '远古时期，大地洪水泛滥，人类流离失所。',
      '苍穹神怜悯众生，以星辰为笔画下契约符文。',
      '先祖以纯洁之心盟誓：世代守信，永不背叛。',
      '天空之神遂退去洪水，教人类观星授时之术。',
      '每当日出，第一缕阳光便是契约生效的见证。',
      '凡守约者，内心安定，协作无间，事半功倍。',
    ],
    effects: { technology: 2, culture: 3 },
  },
  {
    name: '先祖魂归',
    type: 'ancestor',
    title: '万古先祖·血脉传承之歌',
    summary: '先祖英灵常驻，庇佑后代子孙，教导众人团结一心。',
    coreDeity: '始祖 · 万古魂',
    sacredSymbol: '👥',
    story: [
      '我们的第一位先祖，以血肉之躯开辟荒野。',
      '他临终前留下遗训：团结则兴，分裂则亡。',
      '先祖之魂并未远去，而是化为山川河流守护故土。',
      '每当月圆之夜，族长可在梦境中聆听先祖的教诲。',
      '族中长老传承先祖智慧，以古训引导族人前行。',
      '凡敬祖者，血脉共鸣，众人同心，其利断金。',
    ],
    effects: { population: 2, military: 2, culture: 1 },
  },
  {
    name: '英雄史诗',
    type: 'heroic',
    title: '屠龙者·铁手王的十二功绩',
    summary: '伟大的英雄以十二功绩建立文明根基，后世永志不忘。',
    coreDeity: '英雄王 · 铁手',
    sacredSymbol: '⚔️',
    story: [
      '蛮荒年代，恶龙肆虐，人类如蝼蚁般苟延残喘。',
      '英雄王铁手，以凡人之躯拔出石中神剑。',
      '第一功：斩杀深渊恶龙，为民除害。',
      '第二功：建立第一座城市，划定疆界。',
      '第三至第十二功：逐一收服其他凶兽，订立秩序。',
      '英雄虽已远去，其精神永存，激励每一代人奋发图强。',
    ],
    effects: { military: 3, population: 1, culture: 1 },
  },
  {
    name: '五谷圣典',
    type: 'agricultural',
    title: '丰收女神·金穗娘的恩赐',
    summary: '女神将五谷赐予人类，教会耕耘之道，文明因之永续。',
    coreDeity: '丰收神 · 金穗',
    sacredSymbol: '🌾',
    story: [
      '远古先民以狩猎为生，时常忍饥挨饿。',
      '丰收女神金穗，化身为老妪降临人间。',
      '她将五粒金色种子交给一位善良的少女。',
      '少女依女神之法耕种，收获了前所未有的饱满谷穗。',
      '女神还传授二十四节气之秘，指导农时。',
      '凡勤耕者，女神必赐丰收；凡懒怠者，田地荒芜。',
    ],
    effects: { agriculture: 4, population: 1 },
  },
];

const LEGAL_SYSTEM_TEMPLATES: Omit<LegalSystem, 'id' | 'articles' | 'socialOrderBonus'>[] = [
  {
    name: '神谕法典',
    type: 'divine',
    title: '天授神谕·神圣律令',
    description: '法律源自神灵的启示，由祭司阶层代为阐释执行。',
    corePrinciple: '凡违神意者，必受天谴；凡遵神谕者，必得庇佑。',
    effects: { culture: 2, military: 1 },
  },
  {
    name: '十二铜表法',
    type: 'codified',
    title: '成文律典·万民同规',
    description: '法律条文镌刻于铜表之上，人人可见，公平无偏。',
    corePrinciple: '法律面前，不分贵贱，一视同仁。',
    effects: { technology: 1, culture: 2, population: 1 },
  },
  {
    name: '长老惯例',
    type: 'customary',
    title: '世代相传·长老判例',
    description: '法律源自历代长老的判例与习俗，口耳相传，深入人心。',
    corePrinciple: '祖制不可违，惯例大于新令。',
    effects: { culture: 2, agriculture: 1, population: 1 },
  },
  {
    name: '军律铁则',
    type: 'military',
    title: '铁血军纪·赏罚分明',
    description: '法律以军事纪律为核心，严字当头，赏罚必信。',
    corePrinciple: '令行禁止，赏罚分明，军威即国法。',
    effects: { military: 4, population: -1 },
  },
  {
    name: '口传典章',
    type: 'oral',
    title: '说唱律法·诗律记忆',
    description: '法律以史诗诗歌的形式流传，人人自幼耳熟能详。',
    corePrinciple: '律法融入血脉，代代吟唱不绝。',
    effects: { culture: 3, agriculture: 1 },
  },
];

const LAW_ARTICLES_POOL: Omit<LawArticle, 'id'>[] = [
  {
    title: '合作契约令',
    content: '凡订立合作者，必须守约。违约者需赔偿对方三倍损失，并公开道歉。',
    category: 'civil',
    severity: 'moderate',
    effects: { culture: 1, technology: 1 },
  },
  {
    title: '神圣祭祀法',
    content: '每月十五为祭祀日，全体族人必须参加神树祭祀，违者罚劳役三日。',
    category: 'religious',
    severity: 'mild',
    effects: { culture: 2 },
  },
  {
    title: '土地分配令',
    content: '凡成年男子，皆可分得土地一块；勤耕者可获额外土地，荒耕者收回。',
    category: 'economic',
    severity: 'moderate',
    effects: { agriculture: 2, population: 1 },
  },
  {
    title: '军令如山律',
    content: '凡临阵脱逃者，斩；凡勇立战功者，厚赏。军法无情，违者必究。',
    category: 'military',
    severity: 'severe',
    effects: { military: 3 },
  },
  {
    title: '诚信交易法',
    content: '凡做买卖者，必须使用统一度量衡；缺斤短两者，没收货物并示众。',
    category: 'economic',
    severity: 'moderate',
    effects: { agriculture: 1, technology: 1 },
  },
  {
    title: '杀人偿命律',
    content: '凡故意杀人者，必须以命抵命；过失杀人者，需赔偿苦主二十头牲畜。',
    category: 'criminal',
    severity: 'severe',
    effects: { population: 1, culture: 1 },
  },
  {
    title: '盗窃惩罚令',
    content: '凡盗窃他人财物者，需十倍归还；无力偿还者，罚为奴三年。',
    category: 'criminal',
    severity: 'moderate',
    effects: { culture: 1, population: 1 },
  },
  {
    title: '星象观测定律',
    content: '天文观测为祭司专属知识，私习星象者，视为窥探天机，流放边境。',
    category: 'religious',
    severity: 'severe',
    effects: { technology: 2, culture: 1 },
  },
  {
    title: '婚姻家庭法',
    content: '婚姻由父母之命媒妁之言，离婚者需经长老会批准；子女赡养父母为天职。',
    category: 'civil',
    severity: 'mild',
    effects: { population: 2, culture: 1 },
  },
  {
    title: '工匠技艺令',
    content: '工匠技艺必须传承给后代，不得外传；优秀工匠可获免税特权。',
    category: 'economic',
    severity: 'moderate',
    effects: { technology: 2, agriculture: 1 },
  },
  {
    title: '战利品分配律',
    content: '战争所得，十之三归公，十之七按战功分配；统帅多得两倍。',
    category: 'military',
    severity: 'moderate',
    effects: { military: 2, culture: 1 },
  },
  {
    title: '森林河流保护令',
    content: '不得滥伐神木林，不得污染圣河水；违者需植树百株赎罪。',
    category: 'religious',
    severity: 'mild',
    effects: { agriculture: 2, culture: 1 },
  },
];

const CURRENCY_TEMPLATES: Omit<CurrencySystem, 'id' | 'tradeEfficiencyBonus'>[] = [
  {
    name: '永恒金币信用体系',
    type: 'credit',
    unitName: '永恒金币',
    material: '以国家信用背书的金币',
    symbol: '🪙',
    description: '以永恒信用为担保的货币体系，每枚金币对应仓库中储存的等量粮食。',
    originStory: '初代国王担心商人长途携带重物，遂以国库存粮为担保，发行等量金券，见券即付，信用永恒，故名「永恒金币」。',
    conversionRate: 1,
    effects: { technology: 2, agriculture: 1, population: 1 },
  },
  {
    name: '贝壳本位制',
    type: 'commodity',
    unitName: '贝珠',
    material: '来自深海的稀有珍珠贝',
    symbol: '🐚',
    description: '以罕见的深海贝壳为一般等价物，因其稀有和美丽而被全体族人接受。',
    originStory: '远古时，一位勇敢的渔夫冒险深入远洋，带回一筐闪亮的贝壳。众人争相以物品交换，贝壳遂成为最早的货币。',
    conversionRate: 10,
    effects: { agriculture: 1, population: 2 },
  },
  {
    name: '青铜铸币制',
    type: 'metallic',
    unitName: '青铜环',
    material: '精炼青铜合金',
    symbol: '🔵',
    description: '以青铜铸造的圆形方孔钱币，每枚重量标准统一，由国家统一铸造发行。',
    originStory: '伟大的冶炼师发现了铜锡合金的秘密，铸造出永不生锈的青铜钱。国家统一铸造，刻上神树徽记，人人信任。',
    conversionRate: 5,
    effects: { technology: 2, military: 1 },
  },
  {
    name: '神圣仪式筹码',
    type: 'ritual',
    unitName: '圣签',
    material: '加持过的祭天竹签',
    symbol: '🎋',
    description: '每逢重大祭祀，祭司在竹签上写下祝福，持有者可凭此兑换等价物品。',
    originStory: '大祭司在一次盛大祭典中，将神谕写在竹签上散落人间。拾得者皆心想事成，从此圣签便成为最珍贵的信物。',
    conversionRate: 15,
    effects: { culture: 3, population: 1 },
  },
  {
    name: '粮票凭证制',
    type: 'fiat',
    unitName: '粮券',
    material: '加盖官印的棉麻纸',
    symbol: '📜',
    description: '以国家粮仓储备为担保发行的粮票凭证，凭票即可领取等量粮食。',
    originStory: '某年大饥荒，国王开仓放粮，印制粮票分配给百姓。事后粮票继续流通，成为稳定的货币。',
    conversionRate: 1,
    effects: { agriculture: 3, population: 1 },
  },
];

const FLAG_PATTERNS: CivilizationFlag[] = [
  {
    id: 'flag-1',
    pattern: {
      type: 'stripes',
      colors: ['#8B4513', '#D4AF37', '#228B22'],
      primaryColor: '#8B4513',
      secondaryColor: '#D4AF37',
      accentColor: '#228B22',
    },
    mottoBorder: '金色双边框',
    centralEmblem: '🌳',
    description: '三色横条旗帜，中央绣有神树徽记，象征文明的根基。',
  },
  {
    id: 'flag-2',
    pattern: {
      type: 'cross',
      colors: ['#0D47A1', '#FFFFFF', '#FFD700'],
      primaryColor: '#0D47A1',
      secondaryColor: '#FFFFFF',
      accentColor: '#FFD700',
    },
    mottoBorder: '星光镶边',
    centralEmblem: '⭐',
    description: '深蓝为底，白色十字分割，四角镶嵌金星，象征天空契约。',
  },
  {
    id: 'flag-3',
    pattern: {
      type: 'circle',
      colors: ['#7B1FA2', '#FFD54F', '#2E7D32'],
      primaryColor: '#7B1FA2',
      secondaryColor: '#FFD54F',
      accentColor: '#2E7D32',
    },
    mottoBorder: '藤蔓花纹',
    centralEmblem: '👥',
    description: '紫色旗面中央有金色圆环，圆环内绘族人携手图腾。',
  },
  {
    id: 'flag-4',
    pattern: {
      type: 'animal',
      colors: ['#C62828', '#FFE082', '#3E2723'],
      primaryColor: '#C62828',
      secondaryColor: '#FFE082',
      accentColor: '#3E2723',
    },
    mottoBorder: '龙牙纹饰',
    centralEmblem: '⚔️',
    description: '血红底色上绘金色屠龙之刃，象征英雄无畏精神。',
  },
  {
    id: 'flag-5',
    pattern: {
      type: 'plant',
      colors: ['#E65100', '#8BC34A', '#FFF8E1'],
      primaryColor: '#E65100',
      secondaryColor: '#8BC34A',
      accentColor: '#FFF8E1',
    },
    mottoBorder: '稻穗编织',
    centralEmblem: '🌾',
    description: '金黄与翠绿交织，中央金穗垂实，象征丰收富足。',
  },
];

const SLOGAN_TEMPLATES: Omit<CivilizationSlogan, 'id' | 'moraleBonus'>[] = [
  {
    short: '根脉相联，万众一心',
    full: '如神树之根脉，盘根错节，我们万众一心，生生不息。',
    theme: 'unity',
    effects: { population: 1, culture: 1 },
  },
  {
    short: '与天立约，永世不渝',
    full: '我们与苍穹诸神订立契约，信守誓言，永世不渝，天必佑之。',
    theme: 'eternity',
    effects: { culture: 2 },
  },
  {
    short: '知者不惑，勇者不惧',
    full: '以先贤之智为灯，以前辈之勇为剑，知者不惑，勇者不惧。',
    theme: 'wisdom',
    effects: { technology: 2 },
  },
  {
    short: '金穗遍野，国泰民安',
    full: '愿金穗遍野生，愿仓廪皆丰实，愿国泰民安，万世太平。',
    theme: 'prosperity',
    effects: { agriculture: 2 },
  },
  {
    short: '铁血丹心，荣耀无疆',
    full: '以我铁血丹心，铸就文明荣耀；剑锋所指，所向披靡。',
    theme: 'glory',
    effects: { military: 2 },
  },
  {
    short: '天地人和，万物共生',
    full: '天道左旋，地道右迁，人道中行，天地人和，万物共生共荣。',
    theme: 'harmony',
    effects: { population: 1, agriculture: 1, culture: 1 },
  },
];

export function generateMyth(era: EraStage, stats: CivilizationStats): CivilizationMyth {
  const template = pick(MYTH_TEMPLATES);
  const cultureLevel = stats.culture;
  const cooperationBonus = Math.min(15, 5 + Math.floor(cultureLevel / 8) + randomInRange(0, 3));

  const eraBonus: Partial<CivilizationStats> =
    era === 'stoneAge' ? { population: 1 } :
    era === 'agricultural' ? { agriculture: 1 } :
    era === 'imperial' ? { military: 1 } :
    { technology: 1 };

  return {
    ...template,
    id: `myth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cooperationBonus,
    effects: {
      ...template.effects,
      ...eraBonus,
    },
  };
}

export function generateLegalSystem(era: EraStage, stats: CivilizationStats): LegalSystem {
  const template = pick(LEGAL_SYSTEM_TEMPLATES);
  const articleCount = era === 'stoneAge' ? 3 : era === 'agricultural' ? 4 : era === 'imperial' ? 5 : 6;
  const selectedArticles = pickN(LAW_ARTICLES_POOL, articleCount);

  const articles: LawArticle[] = selectedArticles.map((article, idx) => ({
    ...article,
    id: `law-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }));

  const articleEffects = articles.reduce(
    (acc, a) => {
      for (const key of Object.keys(a.effects) as (keyof CivilizationStats)[]) {
        acc[key] = (acc[key] || 0) + (a.effects[key] || 0);
      }
      return acc;
    },
    {} as Partial<CivilizationStats>
  );

  const socialOrderBonus = Math.min(15, 4 + Math.floor(stats.culture / 10) + randomInRange(0, 3));

  const totalEffects: Partial<CivilizationStats> = { ...template.effects };
  for (const key of Object.keys(articleEffects) as (keyof CivilizationStats)[]) {
    totalEffects[key] = (totalEffects[key] || 0) + Math.floor((articleEffects[key] || 0) * 0.5);
  }

  return {
    ...template,
    id: `legal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    articles,
    socialOrderBonus,
    effects: totalEffects,
  };
}

export function generateCurrencySystem(era: EraStage, stats: CivilizationStats): CurrencySystem {
  const template = pick(CURRENCY_TEMPLATES);
  const techLevel = stats.technology;
  const tradeEfficiencyBonus = Math.min(20, 5 + Math.floor(techLevel / 6) + randomInRange(0, 4));

  const eraBonus: Partial<CivilizationStats> =
    era === 'stoneAge' ? { population: 1 } :
    era === 'agricultural' ? { agriculture: 1 } :
    era === 'imperial' ? { technology: 1 } :
    { technology: 2 };

  return {
    ...template,
    id: `currency-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tradeEfficiencyBonus,
    effects: {
      ...template.effects,
      ...eraBonus,
    },
  };
}

export function generateFlag(era: EraStage): CivilizationFlag {
  void era;
  const template = pick(FLAG_PATTERNS);
  return {
    ...template,
    id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export function generateSlogan(era: EraStage, stats: CivilizationStats): CivilizationSlogan {
  const template = pick(SLOGAN_TEMPLATES);
  const moraleBonus = Math.min(12, 3 + Math.floor(stats.culture / 12) + randomInRange(0, 3));

  return {
    ...template,
    id: `slogan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    moraleBonus,
  };
}

export function generateCivilizationCulture(
  era: EraStage,
  stats: CivilizationStats,
  turn: number
): CivilizationCulture {
  const myth = generateMyth(era, stats);
  const legalSystem = generateLegalSystem(era, stats);
  const currencySystem = generateCurrencySystem(era, stats);
  const flag = generateFlag(era);
  const slogan = generateSlogan(era, stats);

  const totalBonus: Partial<CivilizationStats> = {};
  const systems = [myth, legalSystem, currencySystem, slogan];
  for (const system of systems) {
    for (const key of Object.keys(system.effects) as (keyof CivilizationStats)[]) {
      totalBonus[key] = (totalBonus[key] || 0) + (system.effects[key] || 0);
    }
  }

  return {
    myth,
    legalSystem,
    currencySystem,
    flag,
    slogan,
    generationTurn: turn,
    totalCultureBonus: totalBonus,
  };
}

export function applyCultureBonus(
  stats: CivilizationStats,
  culture: CivilizationCulture
): CivilizationStats {
  const bonus = culture.totalCultureBonus;
  return {
    population: stats.population + (bonus.population || 0),
    technology: stats.technology + (bonus.technology || 0),
    culture: stats.culture + (bonus.culture || 0),
    military: stats.military + (bonus.military || 0),
    agriculture: stats.agriculture + (bonus.agriculture || 0),
  };
}

export const MYTH_TYPE_LABELS: Record<CivilizationMyth['type'], string> = {
  nature: '自然崇拜',
  ancestor: '祖先崇拜',
  cosmic: '天神契约',
  heroic: '英雄史诗',
  agricultural: '农耕神话',
};

export const LAW_CATEGORY_LABELS: Record<LawArticle['category'], string> = {
  criminal: '刑法',
  civil: '民法',
  religious: '宗教法',
  economic: '经济法',
  military: '军事法',
};

export const LAW_SEVERITY_LABELS: Record<LawArticle['severity'], string> = {
  mild: '轻典',
  moderate: '中典',
  severe: '重典',
};

export const LEGAL_TYPE_LABELS: Record<LegalSystem['type'], string> = {
  divine: '神授法',
  customary: '习惯法',
  codified: '成文法',
  military: '军事法',
  oral: '口述法',
};

export const CURRENCY_TYPE_LABELS: Record<CurrencySystem['type'], string> = {
  commodity: '实物货币',
  metallic: '金属铸币',
  fiat: '法定纸币',
  credit: '信用货币',
  ritual: '仪式信物',
};

export const SLOGAN_THEME_LABELS: Record<CivilizationSlogan['theme'], string> = {
  unity: '团结',
  glory: '荣耀',
  wisdom: '智慧',
  prosperity: '繁荣',
  eternity: '永恒',
  harmony: '和谐',
};

export const FLAG_PATTERN_LABELS: Record<CivilizationFlag['pattern']['type'], string> = {
  stripes: '条纹旗',
  cross: '十字旗',
  circle: '圆环旗',
  triangle: '三角旗',
  stars: '星辰旗',
  animal: '兽纹旗',
  plant: '植物旗',
  abstract: '抽象纹旗',
};
