import type { WhatIfNode } from '../types';

export const whatIfNodes: WhatIfNode[] = [
  {
    "id": "no-cognitive-revolution",
    "title": "认知革命",
    "subtitle": "虚构能力的关键转折",
    "description": "约7万年前，智人发展出讨论虚构事物的能力——神话、法律、货币。这使得大规模陌生人合作成为可能，是文明崛起的根基。",
    "era": "认知革命",
    "eraColor": "stoneAge",
    "yearLabel": "公元前70,000年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prehistoric%20cave%20painting%20storytelling%20tribe%20firelight%20symbolic%20art%20dramatic&image_size=landscape_16_9",
    "icon": "Brain",
    "category": "认知",
    "defaultState": true,
    "alteration": {
      "title": "如果认知革命没有发生",
      "description": "智人始终只能交流具体信息（\"河边有狮子\"），无法讨论虚构概念（\"部落守护神要求我们服从首领\"）。大规模合作无法实现。",
      "logic": "虚构能力是大规模协作的认知基础。没有它，人类群体上限停留在约150人（邓巴数），无法形成城市、宗教、国家或任何需要陌生人合作的制度。",
      "consequences": [
        "人类群体规模永远不超过150人",
        "无法形成城市、国家等大型组织",
        "宗教、法律、货币等制度不会诞生",
        "智人可能无法超越其他人类物种",
        "科技发展极度缓慢，缺乏集体知识积累"
      ]
    },
    "effects": {
      "on": { "population": 15, "culture": 20, "technology": 5 },
      "off": { "population": -40, "culture": -50, "technology": -30, "military": -30 }
    },
    "dependencies": [],
    "conflicts": []
  },
  {
    "id": "no-agricultural-revolution",
    "title": "农业革命",
    "subtitle": "定居与驯化的代价",
    "description": "约1万年前，人类开始种植作物、驯化动物，从游牧转向定居。粮食盈余催生了分工、阶级和文明，但也带来了疾病、不平等和更长的劳动时间。",
    "era": "农业革命",
    "eraColor": "agricultural",
    "yearLabel": "公元前10,000年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=endless%20hunter%20gatherer%20paradise%20wild%20nature%20abundance%20tribe%20harmony%20no%20farming&image_size=landscape_16_9",
    "icon": "Wheat",
    "category": "生存方式",
    "defaultState": true,
    "alteration": {
      "title": "如果农业革命从未发生",
      "description": "人类永远保持狩猎采集的生活方式。没有定居，没有粮食盈余，没有城市——但也没有饥饿、瘟疫和社会不平等的折磨。",
      "logic": "农业革命的核心悖论：个体生活质量下降（更长的劳动时间、更单一的饮食、更多的疾病），但种群总量暴增。没有农业，人类数量永远维持在千万级别，但每个人的生活可能更加自由和健康。",
      "consequences": [
        "全球人口永远不超过5000万",
        "没有城市、没有国家、没有战争机器",
        "人人平等，没有阶级分化",
        "饮食多样化，身体素质优于农业社会",
        "科技发展停滞——没有盈余供养专职人员",
        "文字、数学、天文学等知识不会系统发展"
      ]
    },
    "effects": {
      "on": { "population": 25, "agriculture": 30, "technology": 5, "military": -5 },
      "off": { "population": -60, "agriculture": -80, "technology": -50, "culture": -30, "military": -70 }
    },
    "dependencies": ["no-cognitive-revolution"],
    "conflicts": []
  },
  {
    "id": "no-writing-system",
    "title": "文字的诞生",
    "subtitle": "知识跨越时间的桥梁",
    "description": "约5000年前，苏美尔人发明楔形文字，人类第一次能够将知识储存于大脑之外。文字使得法律、账目、历史和科学得以传承和积累。",
    "era": "帝国时代",
    "eraColor": "imperial",
    "yearLabel": "公元前3,200年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20sumerian%20cuneiform%20clay%20tablets%20scribe%20writing%20temple%20dramatic&image_size=landscape_16_9",
    "icon": "Scroll",
    "category": "知识传承",
    "defaultState": true,
    "alteration": {
      "title": "如果文字从未被发明",
      "description": "所有知识只能口口相传。没有书籍、没有法典、没有历史记录。每一代人都必须从零开始，文明的积累被锁死在人类记忆的极限内。",
      "logic": "文字是文明突破邓巴数的第二种方式——不只是空间上的大规模协作，更是时间上的知识积累。没有文字，知识无法可靠地跨代传承，科学发现每代都得重新来过。",
      "consequences": [
        "法律只能靠口头传统维持，容易变形",
        "科学发现无法积累，每代人重新摸索",
        "没有历史记录，文明无法从过去吸取教训",
        "帝国的行政效率极低，无法管理广袤领土",
        "宗教教义只能口头传承，派系分裂不可避免"
      ]
    },
    "effects": {
      "on": { "technology": 15, "culture": 15, "military": 5 },
      "off": { "technology": -40, "culture": -30, "military": -20, "population": -10 }
    },
    "dependencies": ["no-cognitive-revolution", "no-agricultural-revolution"],
    "conflicts": []
  },
  {
    "id": "no-printing-press",
    "title": "印刷术",
    "subtitle": "知识民主化的引擎",
    "description": "1440年古腾堡发明活字印刷机，书籍成本暴跌95%。知识不再是教会和贵族的专利，为文艺复兴、宗教改革和科学革命铺平了道路。",
    "era": "科学革命",
    "eraColor": "scientific",
    "yearLabel": "公元1,440年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gutenberg%20printing%20press%20workshop%20books%20renaissance%20craftsmanship%20warm%20light&image_size=landscape_16_9",
    "icon": "Printer",
    "category": "信息传播",
    "defaultState": true,
    "alteration": {
      "title": "如果印刷术晚出现500年",
      "description": "直到1940年代，书籍仍然是昂贵的手抄本。文艺复兴被推迟，宗教改革不会发生，科学革命遥遥无期。知识被教会和贵族牢牢垄断。",
      "logic": "印刷术是信息技术的第一次革命，其影响力堪比互联网。它让知识传播成本降低了95%以上，打破了信息垄断。没有印刷术，知识传播仍依赖手抄，一本圣经的价格相当于一个农民三年的收入。",
      "consequences": [
        "文艺复兴推迟至少300年",
        "宗教改革不会发生，教会权威延续",
        "科学革命推迟500年以上",
        "启蒙运动和民主思想不会出现",
        "工业革命可能永远不会到来",
        "教育仍为精英阶层独享"
      ]
    },
    "effects": {
      "on": { "technology": 30, "culture": 20, "population": 10 },
      "off": { "technology": -45, "culture": -25, "population": -15, "agriculture": -10 }
    },
    "dependencies": ["no-writing-system"],
    "conflicts": []
  },
  {
    "id": "no-scientific-method",
    "title": "科学方法",
    "subtitle": "承认无知的力量",
    "description": "16-17世纪，人类发展出通过观察、实验和可证伪性来认识世界的方法。这是人类第一次系统性地承认自己的无知，并以此驱动知识增长。",
    "era": "科学革命",
    "eraColor": "scientific",
    "yearLabel": "公元1,600年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scientific%20laboratory%20experiment%20beakers%20telescope%20microscope%20discovery%20enlightenment&image_size=landscape_16_9",
    "icon": "FlaskConical",
    "category": "认识论",
    "defaultState": true,
    "alteration": {
      "title": "如果科学方法没有诞生",
      "description": "人类继续依赖传统权威和神学解释世界。没有系统的实验方法，技术进步只能靠偶然发现和经验积累，如同在黑暗中摸索。",
      "logic": "科学方法的核心是'承认无知'——这与传统知识体系（宣称拥有全部答案）根本不同。没有科学方法，技术可以进步（如中国的四大发明），但无法产生持续加速的知识增长。",
      "consequences": [
        "技术进步线性缓慢，而非指数增长",
        "医学仍停留在放血和草药时代",
        "没有工业革命，能量来源仍为人力和畜力",
        "天文学、物理学等基础科学停滞",
        "社会变革缓慢，封建制度可能延续至今"
      ]
    },
    "effects": {
      "on": { "technology": 35, "agriculture": 15, "population": 15, "military": 5 },
      "off": { "technology": -55, "agriculture": -20, "population": -20, "military": -10 }
    },
    "dependencies": ["no-printing-press"],
    "conflicts": []
  },
  {
    "id": "no-imperialism",
    "title": "帝国与殖民",
    "subtitle": "统一与扩张的引擎",
    "description": "从罗马帝国到大英帝国，帝国通过征服和同化将不同民族纳入同一体系。虽然伴随暴力与压迫，但帝国也促进了文化融合、技术传播和全球化。",
    "era": "帝国时代",
    "eraColor": "imperial",
    "yearLabel": "公元前500年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=peaceful%20isolated%20villages%20diverse%20cultures%20no%20empire%20harmony%20pastoral&image_size=landscape_16_9",
    "icon": "Castle",
    "category": "政治组织",
    "defaultState": true,
    "alteration": {
      "title": "如果帝国从未出现",
      "description": "人类永远停留在小规模的部落和城邦阶段。没有统一的法律、货币和度量衡，每个群体都保持自己独特的文化和生活方式。",
      "logic": "帝国虽然暴力，但它是文化融合和技术传播的最有效载体。没有帝国，各地区独立发展，技术传播速度极慢，全球化永远不会发生。但文化的多样性会远超现实。",
      "consequences": [
        "全球存在数千个独立的文化和语言",
        "技术传播极慢，不同地区技术水平差异巨大",
        "没有全球化，各地区保持独立发展",
        "战争规模小但更频繁",
        "文化多样性极高，但文明等级低",
        "没有统一标准（货币、度量衡、法律）"
      ]
    },
    "effects": {
      "on": { "military": 20, "population": 15, "culture": -5, "technology": 10 },
      "off": { "military": -30, "population": -15, "culture": 25, "technology": -25 }
    },
    "dependencies": ["no-cognitive-revolution", "no-agricultural-revolution"],
    "conflicts": []
  },
  {
    "id": "no-money",
    "title": "货币体系",
    "subtitle": "信任的通用语言",
    "description": "货币是人类发明最成功的信任体系。它让陌生人之间的合作成为可能，使得贸易、分工和资本积累在史无前例的规模上进行。",
    "era": "帝国时代",
    "eraColor": "imperial",
    "yearLabel": "公元前1,000年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=barter%20market%20trading%20goods%20exchange%20no%20coins%20ancient%20marketplace&image_size=landscape_16_9",
    "icon": "Coins",
    "category": "经济制度",
    "defaultState": true,
    "alteration": {
      "title": "如果货币从未被发明",
      "description": "人类永远依赖物物交换。没有通用的价值尺度，贸易受到'双重需求巧合'的限制，大规模经济活动几乎不可能。",
      "logic": "货币的本质是'信任的载体'——它让素不相识的人也能合作。没有货币，经济被限制在直接交换的范围内，银行、投资、保险等金融制度无从发展。",
      "consequences": [
        "贸易规模极小，只能进行直接物物交换",
        "没有银行、投资和金融体系",
        "大规模工程无法融资",
        "分工被严重限制，每个人都必须自给自足",
        "技术创新缺乏资金支持"
      ]
    },
    "effects": {
      "on": { "technology": 10, "agriculture": 15, "population": 10 },
      "off": { "technology": -30, "agriculture": -25, "population": -15, "military": -15 }
    },
    "dependencies": ["no-cognitive-revolution"],
    "conflicts": []
  },
  {
    "id": "no-industrial-revolution",
    "title": "工业革命",
    "subtitle": "能量的解放",
    "description": "18世纪末，蒸汽机将化石能源转化为机械动力，人类首次突破了肌肉力量的极限。生产效率暴增，城市扩张，现代世界由此诞生。",
    "era": "科学革命",
    "eraColor": "scientific",
    "yearLabel": "公元1,760年",
    "imageUrl": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pre%20industrial%20pastoral%20countryside%20handicraft%20workshop%20peaceful%20village%20artisan&image_size=landscape_16_9",
    "icon": "Factory",
    "category": "生产力",
    "defaultState": true,
    "alteration": {
      "title": "如果工业革命从未发生",
      "description": "人类永远依赖人力、畜力和自然力。没有工厂、没有铁路、没有电力。社会停留在手工业时代，优美但缓慢。",
      "logic": "工业革命的核心是能源利用方式的质变——从生物质能转向化石能源。没有它，人类生产力的天花板就是肌肉力量，无论社会组织多么高效，都无法突破农业社会的产出极限。",
      "consequences": [
        "全球人口上限约10亿",
        "所有制造品均为手工制作，昂贵且稀少",
        "交通运输依赖马匹和帆船",
        "城市规模受限于食物运输半径",
        "没有电力、没有电信、没有现代医学",
        "社会不平等程度可能更低"
      ]
    },
    "effects": {
      "on": { "technology": 25, "population": 20, "agriculture": 10, "military": 10 },
      "off": { "technology": -50, "population": -40, "agriculture": -15, "military": -25 }
    },
    "dependencies": ["no-scientific-method", "no-printing-press"],
    "conflicts": []
  }
]
