import type {
  GreatPerson,
  GreatPersonType,
  GreatPersonPersonality,
  GreatPersonBias,
  EraStage,
  CivilizationStats,
} from '../../shared/types';

interface GreatPersonTemplate {
  type: GreatPersonType;
  names: string[];
  personalities: GreatPersonPersonality[];
  biases: GreatPersonBias[];
  era: EraStage[];
  titles: string[];
  descriptions: {
    base: string;
    personalityVariants: Partial<Record<GreatPersonPersonality, string>>;
  };
  quotes: {
    base: string;
    personalityVariants: Partial<Record<GreatPersonPersonality, string>>;
  };
  icon: string;
  baseEffects: {
    supported: Partial<CivilizationStats>;
    ignored: Partial<CivilizationStats>;
    exiled: Partial<CivilizationStats>;
    assassinated: Partial<CivilizationStats>;
  };
  personalityEffectModifiers: Partial<
    Record<GreatPersonPersonality, Partial<Record<'supported' | 'ignored' | 'exiled' | 'assassinated', Partial<CivilizationStats>>>>
  >;
  biasEffectModifiers: Partial<
    Record<GreatPersonBias, Partial<Record<'supported' | 'ignored' | 'exiled' | 'assassinated', Partial<CivilizationStats>>>>
  >;
  flavorTexts: {
    arrival: string;
    support: string;
    exile: string;
    assassinate: string;
    ignore: string;
    personalityVariants?: Partial<
      Record<GreatPersonPersonality, Partial<Record<'arrival' | 'support' | 'exile' | 'assassinate' | 'ignore', string>>>
    >;
  };
}

const THINKER_TEMPLATES: GreatPersonTemplate[] = [
  {
    type: 'thinker',
    names: ['孔子', '苏格拉底', '柏拉图', '亚里士多德', '老子', '庄子', '孟子', '荀子', '墨子', '韩非子'],
    personalities: ['visionary', 'idealistic', 'introverted', 'eloquent', 'cynical'],
    biases: ['pro_culture', 'pro_tradition', 'pro_freedom', 'pro_centralization', 'elitist'],
    era: ['stoneAge', 'agricultural', 'imperial'],
    titles: ['大哲学家', '至圣先师', '思想导师', '智者', '辩证法大师'],
    descriptions: {
      base: '一位深邃的思想家，其言论和著述将影响后世千年。他/她对人性、社会、宇宙有着独到的见解。',
      personalityVariants: {
        visionary: '其思想超越时代，预见到了文明发展的未来方向。',
        idealistic: '秉持着高尚的理想，试图构建一个完美的社会制度。',
        cynical: '对人性持悲观态度，其思想中透露出对世俗的深刻批判。',
      },
    },
    quotes: {
      base: '"学而不思则罔，思而不学则殆。"',
      personalityVariants: {
        visionary: '"世界的变化如流水，唯有智者能顺流而下。"',
        idealistic: '"人人皆可为尧舜，只要我们愿意追求至善。"',
        cynical: '"历史不过是一场场闹剧，而我们都是其中的演员。"',
      },
    },
    icon: 'Brain',
    baseEffects: {
      supported: { culture: 15, technology: 5, population: -3 },
      ignored: { culture: -5, technology: -3 },
      exiled: { culture: -10, technology: -5, military: 5 },
      assassinated: { culture: 20, technology: -10, population: -5 },
    },
    personalityEffectModifiers: {
      visionary: { supported: { technology: 10, culture: 5 } },
      idealistic: { supported: { culture: 10, population: -2 } },
      cynical: { supported: { culture: 5, military: -5 }, assassinated: { culture: 10 } },
      introverted: { supported: { technology: 5 }, ignored: { culture: -3 } },
      eloquent: { supported: { culture: 10, population: 5 } },
    },
    biasEffectModifiers: {
      pro_culture: { supported: { culture: 10 } },
      pro_tradition: { supported: { culture: 5, technology: -5 }, exiled: { culture: -10 } },
      pro_freedom: { supported: { population: 5, military: -5 }, exiled: { population: -5 } },
      elitist: { supported: { technology: 5, population: -5 }, assassinated: { population: 10 } },
    },
    flavorTexts: {
      arrival: '一位智者出现在你的土地上，他/她的名声早已传遍四方。人们争相聆听其教诲，而他/她似乎对你的文明产生了浓厚的兴趣。',
      support: '你邀请这位思想家进入宫廷，尊其为国师。他/她的思想迅速传播，学者们纷纷著书立说，文化出现前所未有的繁荣。然而，不同政见者开始受到排挤。',
      exile: '你下令将这位思想家驱逐出境。他/她的追随者们大失所望，文化发展陷入停滞。但你也因此巩固了统治，军事力量得到加强。',
      assassinate: '你派人暗杀了这位思想家。消息传出，举国震惊。虽然反对派被压制，但文化界遭受重创，许多知识被焚毁。然而，这位思想家的思想反而在民众中传播得更广、更深入人心。',
      ignore: '你对这位思想家置若罔闻。他/她在民间默默传道，虽然没有官方支持，但其思想在底层民众中悄然传播，对社会产生着潜移默化的影响。',
    },
  },
];

const CONQUEROR_TEMPLATES: GreatPersonTemplate[] = [
  {
    type: 'conqueror',
    names: ['秦始皇', '亚历山大大帝', '成吉思汗', '凯撒', '拿破仑', '汉武帝', '项羽', '李世民', '帖木儿', '查理曼'],
    personalities: ['ruthless', 'charismatic', 'reckless', 'visionary', 'paranoid'],
    biases: ['pro_military', 'pro_centralization', 'pro_agriculture', 'anti_military', 'populist'],
    era: ['agricultural', 'imperial', 'scientific'],
    titles: ['铁血大帝', '征服者', '世界之王', '军事天才', '开国君主'],
    descriptions: {
      base: '一位天生的军事领袖，其军事才能和野心将使整个世界为之颤抖。他/她善于用兵，渴望建立不朽的功勋。',
      personalityVariants: {
        ruthless: '以冷酷无情著称，对待敌人毫不手软，所到之处望风披靡。',
        charismatic: '具有超凡的个人魅力，士兵们愿意为他/她赴汤蹈火，在所不辞。',
        reckless: '作战勇猛但过于冒险，常常能创造奇迹，也时常陷入险境。',
        paranoid: '生性多疑，时刻提防身边的人，但其军事才能无人能及。',
      },
    },
    quotes: {
      base: '"我来，我见，我征服。"',
      personalityVariants: {
        ruthless: '"慈不掌兵，对敌人的仁慈就是对自己的残忍。"',
        charismatic: '"将士们！随我冲锋！胜利就在眼前！"',
        reckless: '"最危险的地方往往最安全，出奇才能制胜。"',
        paranoid: '"宁可我负天下人，不可天下人负我。"',
      },
    },
    icon: 'Sword',
    baseEffects: {
      supported: { military: 20, agriculture: 5, population: -8, culture: -5 },
      ignored: { military: -10, population: 3 },
      exiled: { military: -15, culture: 5, population: 5 },
      assassinated: { military: -20, population: 10, culture: 10, agriculture: -5 },
    },
    personalityEffectModifiers: {
      ruthless: { supported: { military: 10, population: -5 }, assassinated: { population: 10 } },
      charismatic: { supported: { military: 5, population: 5 }, exiled: { military: -10 } },
      reckless: { supported: { military: 15, agriculture: -5 }, exiled: { military: -5 } },
      visionary: { supported: { technology: 5, military: 5 }, ignored: { military: -5 } },
      paranoid: { supported: { military: 5, culture: -10 }, assassinated: { culture: 15 } },
    },
    biasEffectModifiers: {
      pro_military: { supported: { military: 15 } },
      pro_centralization: { supported: { military: 5, culture: -5 }, exiled: { culture: 10 } },
      pro_agriculture: { supported: { agriculture: 10 }, exiled: { agriculture: -5 } },
      anti_military: { supported: { military: -5, population: 10 }, ignored: { military: 5 } },
      populist: { supported: { population: 10, military: 5 }, exiled: { population: -10 } },
    },
    flavorTexts: {
      arrival: '一位声名赫赫的军事统帅出现在你的边境，身后跟着一支精锐的军队。他/她表示愿意为你效力，但前提是你能满足他/她的雄心壮志。',
      support: '你任命这位征服者为最高统帅，赋予他/她极大的权力。军队的战斗力突飞猛进，领土不断扩张。但连年的战争也让人民疲于奔命，文化发展被忽视。',
      exile: '你担心这位征服者功高震主，下令将他/她流放。军队士气大减，但人民得以休养生息，文化和经济开始复苏。',
      assassinate: '你设下鸿门宴，暗杀了这位战功赫赫的统帅。军队陷入混乱，军事力量大幅削弱。但人民欢呼雀跃，文化和人口迅速增长，大家都庆幸摆脱了战争狂人。',
      ignore: '你对这位征服者的求见置之不理。他/她转投其他势力，最终成为你的劲敌。你的军队因缺乏优秀统帅而战斗力下降，而民众则庆幸没有卷入战争。',
    },
  },
];

const SCIENTIST_TEMPLATES: GreatPersonTemplate[] = [
  {
    type: 'scientist',
    names: ['牛顿', '爱因斯坦', '伽利略', '达尔文', '张衡', '祖冲之', '沈括', '毕昇', '特斯拉', '居里夫人'],
    personalities: ['diligent', 'paranoid', 'visionary', 'introverted', 'reckless'],
    biases: ['pro_technology', 'pro_innovation', 'anti_technology', 'pro_culture', 'pro_freedom'],
    era: ['agricultural', 'imperial', 'scientific'],
    titles: ['科学巨匠', '发明大王', '天纵奇才', '真理追求者', '实验大师'],
    descriptions: {
      base: '一位孜孜不倦的科学家，热衷于探索自然的奥秘。他/她的发现和发明可能彻底改变文明的发展轨迹。',
      personalityVariants: {
        diligent: '数十年如一日地投入研究，即使面对无数次失败也从不气馁。',
        paranoid: '坚信有人在窃取他/她的研究成果，时刻提防着竞争对手。',
        visionary: '其理论超前于时代，当时的人们难以理解，但终将被证明是正确的。',
        reckless: '为了追求真理，敢于进行危险的实验，不顾个人安危。',
      },
    },
    quotes: {
      base: '"如果说我看得比别人更远，那是因为我站在巨人的肩膀上。"',
      personalityVariants: {
        diligent: '"天才是百分之一的灵感加百分之九十九的汗水。"',
        paranoid: '"我的研究成果绝不能落入他人之手！"',
        visionary: '"想象力比知识更重要，因为知识是有限的，而想象力概括着世界的一切。"',
        reckless: '"为了真理，我愿意付出一切代价，包括我的生命。"',
      },
    },
    icon: 'FlaskConical',
    baseEffects: {
      supported: { technology: 25, agriculture: 5, culture: 5, population: -5, military: -5 },
      ignored: { technology: -8, culture: 3 },
      exiled: { technology: -15, culture: 10, population: 5 },
      assassinated: { technology: -20, culture: 15, population: 8, military: 5 },
    },
    personalityEffectModifiers: {
      diligent: { supported: { technology: 10, agriculture: 5 } },
      paranoid: { supported: { technology: 5, military: -10 }, assassinated: { military: 10 } },
      visionary: { supported: { technology: 15, culture: 5 }, ignored: { technology: -5 } },
      introverted: { supported: { technology: 5 }, exiled: { technology: -10 } },
      reckless: { supported: { technology: 10, population: -5 }, exiled: { population: 5 } },
    },
    biasEffectModifiers: {
      pro_technology: { supported: { technology: 15 } },
      pro_innovation: { supported: { technology: 10, culture: 5 } },
      anti_technology: { supported: { technology: -5, culture: 10 }, exiled: { technology: 10 } },
      pro_culture: { supported: { culture: 10 }, exiled: { culture: -10 } },
      pro_freedom: { supported: { population: 5, technology: 5 }, assassinated: { population: -10 } },
    },
    flavorTexts: {
      arrival: '一位古怪的学者带着奇怪的仪器来到你的宫廷，他/她声称有了能够改变世界的新发现。人们用怀疑的眼光看着他/她，但他/她眼中闪烁着狂热的光芒。',
      support: '你大力资助这位科学家的研究，为他/她建造了最好的实验室。科学技术突飞猛进，新的发明创造层出不穷。然而，传统的技艺和信仰受到冲击，许多人因此失业，幸福感下降。',
      exile: '你认为这位科学家的研究是异端邪说，下令将他/她驱逐。科学发展陷入停滞，但传统文化得到保护，人民的幸福感有所提升。',
      assassinate: '你派人暗杀了这位科学家，焚毁了他/她的研究手稿。科学界陷入恐怖，科技发展倒退。但他/她的思想却以地下方式流传，最终引发了更猛烈的科学革命。',
      ignore: '你对这位科学家的请求置若罔闻。他/她只能在简陋的条件下独自研究，进展缓慢。虽然没有取得重大突破，但也避免了可能的社会动荡。',
    },
  },
];

const RELIGIOUS_LEADER_TEMPLATES: GreatPersonTemplate[] = [
  {
    type: 'religious_leader',
    names: ['释迦牟尼', '耶稣', '穆罕默德', '摩西', '老子', '孔子', '马丁路德', '加尔文', '玄奘', '鉴真'],
    personalities: ['charismatic', 'idealistic', 'visionary', 'introverted', 'ruthless'],
    biases: ['pro_culture', 'pro_tradition', 'pro_freedom', 'anti_technology', 'pro_centralization'],
    era: ['stoneAge', 'agricultural', 'imperial', 'scientific'],
    titles: ['先知', '圣人', '宗教改革家', '精神导师', '布道者'],
    descriptions: {
      base: '一位受到神启的精神领袖，其教义将抚慰无数人的心灵，也可能引发巨大的社会变革。他/她的话语具有不可思议的感召力。',
      personalityVariants: {
        charismatic: '其讲道具有超凡的魅力，能够吸引成千上万的信众。',
        idealistic: '追求建立一个充满爱与和平的理想世界，为此不惜牺牲一切。',
        visionary: '声称看到了未来的异象，其预言往往在后世应验。',
        ruthless: '对于异端毫不留情，坚信只有自己信仰的才是唯一真理。',
      },
    },
    quotes: {
      base: '"爱人如己，这是律法和先知一切道理的总纲。"',
      personalityVariants: {
        charismatic: '"来跟从我，我要叫你们得人如得鱼一样。"',
        idealistic: '"愿你的国降临，愿你的旨意行在地上，如同行在天上。"',
        visionary: '"我看见一个新天新地，先前的天地已经过去了。"',
        ruthless: '"不信的人，就让他们和他们的偶像一同毁灭吧。"',
      },
    },
    icon: 'Church',
    baseEffects: {
      supported: { culture: 20, population: 10, military: 5, technology: -15, agriculture: 5 },
      ignored: { culture: -5, population: -3 },
      exiled: { culture: -10, population: -10, technology: 10, military: 5 },
      assassinated: { culture: 30, population: -5, technology: 5, military: -10 },
    },
    personalityEffectModifiers: {
      charismatic: { supported: { population: 15, culture: 5 }, exiled: { population: -10 } },
      idealistic: { supported: { population: 10, military: -10 }, ignored: { population: -5 } },
      visionary: { supported: { culture: 10, technology: -5 }, assassinated: { culture: 20 } },
      introverted: { supported: { culture: 5 }, exiled: { culture: -5 } },
      ruthless: { supported: { military: 15, culture: 5, population: -5 }, assassinated: { military: -15 } },
    },
    biasEffectModifiers: {
      pro_culture: { supported: { culture: 10 } },
      pro_tradition: { supported: { culture: 5, technology: -10 }, exiled: { technology: 15 } },
      pro_freedom: { supported: { population: 10, military: -10 }, exiled: { population: -10 } },
      anti_technology: { supported: { technology: -10, culture: 10 }, exiled: { technology: 15 } },
      pro_centralization: { supported: { military: 10, population: -5 }, assassinated: { military: -10 } },
    },
    flavorTexts: {
      arrival: '一位自称得到神启的传道者出现在你的土地上，他/她的言行举止透露出一种神圣的力量。人们开始聚集在他/她周围，聆听其教诲。',
      support: '你将这位宗教领袖的教义定为国教，广建庙宇教堂。人民的精神得到慰藉，社会凝聚力空前增强，人口迅速增长。然而，宗教狂热也抑制了科学探索，对新思想的排斥导致科技发展停滞。',
      exile: '你下令驱逐这位宗教领袖，禁止其教义传播。信众们大失所望，人口出现流失。但摆脱了宗教束缚后，科学思想开始萌芽，科技和军事力量得到发展。',
      assassinate: '你下令处死这位宗教领袖，试图彻底根除其影响。然而，他/她的殉道反而使其形象更加神圣，信众们更加坚定地信仰其教义，文化达到前所未有的高度。但宗教狂热也引发了社会动荡，军事力量受到影响。',
      ignore: '你对这位宗教领袖的活动不加干涉。他/她的教义在民间自由传播，虽然没有官方支持，但也没有引发剧烈的社会冲突。文化和人口缓慢增长，而科技发展则保持平稳。',
    },
  },
];

export const GREAT_PERSON_TEMPLATES: GreatPersonTemplate[] = [
  ...THINKER_TEMPLATES,
  ...CONQUEROR_TEMPLATES,
  ...SCIENTIST_TEMPLATES,
  ...RELIGIOUS_LEADER_TEMPLATES,
];

export function getGreatPersonTemplatesByType(type: GreatPersonType): GreatPersonTemplate[] {
  return GREAT_PERSON_TEMPLATES.filter((t) => t.type === type);
}

export function getGreatPersonTemplatesByEra(era: EraStage): GreatPersonTemplate[] {
  return GREAT_PERSON_TEMPLATES.filter((t) => t.era.includes(era));
}

export function mergeEffects(
  base: Partial<CivilizationStats>,
  ...modifiers: Array<Partial<CivilizationStats> | undefined>
): Partial<CivilizationStats> {
  const result: Partial<CivilizationStats> = { ...base };
  const keys: Array<keyof CivilizationStats> = ['population', 'technology', 'culture', 'military', 'agriculture'];

  for (const modifier of modifiers) {
    if (!modifier) continue;
    for (const key of keys) {
      if (modifier[key] !== undefined) {
        result[key] = (result[key] || 0) + (modifier[key] || 0);
      }
    }
  }

  for (const key of keys) {
    if (result[key] !== undefined && Math.abs(result[key]!) > 30) {
      result[key] = Math.sign(result[key]!) * 30;
    }
  }

  return result;
}

export function generateGreatPerson(
  era: EraStage,
  usedIds: string[],
  turn: number
): GreatPerson | null {
  const eligibleTemplates = getGreatPersonTemplatesByEra(era);
  if (eligibleTemplates.length === 0) return null;

  const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];

  const personality = template.personalities[Math.floor(Math.random() * template.personalities.length)];
  const bias = template.biases[Math.floor(Math.random() * template.biases.length)];

  let name: string;
  let id: string;
  let attempts = 0;
  do {
    name = template.names[Math.floor(Math.random() * template.names.length)];
    id = `great-person-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    attempts++;
  } while (usedIds.includes(id) && attempts < 50);

  if (usedIds.includes(id)) return null;

  const personalityDesc = template.descriptions.personalityVariants[personality] || '';
  const personalityQuote = template.quotes.personalityVariants[personality] || template.quotes.base;

  const supportedEffects = mergeEffects(
    template.baseEffects.supported,
    template.personalityEffectModifiers[personality]?.supported,
    template.biasEffectModifiers[bias]?.supported
  );

  const ignoredEffects = mergeEffects(
    template.baseEffects.ignored,
    template.personalityEffectModifiers[personality]?.ignored,
    template.biasEffectModifiers[bias]?.ignored
  );

  const exiledEffects = mergeEffects(
    template.baseEffects.exiled,
    template.personalityEffectModifiers[personality]?.exiled,
    template.biasEffectModifiers[bias]?.exiled
  );

  const assassinatedEffects = mergeEffects(
    template.baseEffects.assassinated,
    template.personalityEffectModifiers[personality]?.assassinated,
    template.biasEffectModifiers[bias]?.assassinated
  );

  const title = template.titles[Math.floor(Math.random() * template.titles.length)];

  const imagePrompt = encodeURIComponent(
    `portrait of ${name}, ${template.type} ${personality} ${bias}, historical figure, detailed face, era: ${era}, professional art style`
  );
  const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${imagePrompt}&image_size=square`;

  const yearOffset = Math.floor(Math.random() * 50);
  const baseYear =
    era === 'stoneAge' ? -8000 : era === 'agricultural' ? -3000 : era === 'imperial' ? 500 : 1500;

  const flavorTexts = {
    arrival: template.flavorTexts.personalityVariants?.[personality]?.arrival || template.flavorTexts.arrival,
    support: template.flavorTexts.personalityVariants?.[personality]?.support || template.flavorTexts.support,
    exile: template.flavorTexts.personalityVariants?.[personality]?.exile || template.flavorTexts.exile,
    assassinate: template.flavorTexts.personalityVariants?.[personality]?.assassinate || template.flavorTexts.assassinate,
    ignore: template.flavorTexts.personalityVariants?.[personality]?.ignore || template.flavorTexts.ignore,
  };

  const greatPerson: GreatPerson = {
    id,
    type: template.type,
    name,
    birthYear: baseYear + yearOffset,
    deathYear: undefined,
    personality,
    bias,
    era: template.era,
    title,
    description: template.descriptions.base + ' ' + personalityDesc,
    quote: personalityQuote,
    imageUrl,
    icon: template.icon,
    effects: {
      supported: supportedEffects,
      ignored: ignoredEffects,
      exiled: exiledEffects,
      assassinated: assassinatedEffects,
    },
    activeTurns: 0,
    maxTurns: 3 + Math.floor(Math.random() * 3),
    status: 'active',
    turnIntroduced: turn,
    flavorText: flavorTexts,
  };

  return greatPerson;
}
