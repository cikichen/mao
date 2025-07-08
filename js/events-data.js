/**
 * 历史事件数据
 * 避免CORS问题，将JSON数据内嵌到JavaScript文件中
 */

window.EVENTS_DATA = [
  {
    "id": "1893-12-26-birth",
    "date": "1893-12-26",
    "year": 1893,
    "age": 0,
    "type": "historical",
    "importance": "high",
    "title": "毛泽东出生",
    "location": {
      "province": "湖南省",
      "city": "湘潭市",
      "district": "韶山市",
      "detail": "韶山冲上屋场",
      "coordinates": [112.527621, 27.915456]
    },
    "description": "毛泽东出生于湖南省湘潭县韶山冲上屋场，字润之，乳名石三伢子。父亲毛顺生，母亲文七妹。",
    "significance": "中国共产党、中华人民共和国、中国人民解放军的主要缔造者和领导人诞生。",
    "tags": ["出生", "韶山", "湖南"],
    "sources": ["《毛泽东年谱》", "《毛泽东传》"],
    "images": ["images/events/1893-birth.jpg"]
  },
  {
    "id": "1910-09-01-dongshan",
    "date": "1910-09-01",
    "year": 1910,
    "age": 16,
    "type": "historical",
    "importance": "medium",
    "title": "进入东山高等小学堂",
    "location": {
      "province": "湖南省",
      "city": "湘潭市",
      "district": "湘乡市",
      "detail": "东山高等小学堂",
      "coordinates": [112.535321, 27.734567]
    },
    "description": "毛泽东离开韶山，进入湘乡东山高等小学堂读书，开始接受新式教育。",
    "significance": "这是毛泽东第一次离开家乡，接受现代教育的开始，为其后来的思想形成奠定了基础。",
    "tags": ["教育", "湘乡", "求学"],
    "sources": ["《毛泽东年谱》"],
    "images": ["images/events/1910-dongshan.jpg"]
  },
  {
    "id": "1911-10-10-xinhai",
    "date": "1911-10-10",
    "year": 1911,
    "age": 17,
    "type": "historical",
    "importance": "high",
    "title": "参加辛亥革命",
    "location": {
      "province": "湖南省",
      "city": "长沙市",
      "district": "天心区",
      "detail": "长沙城",
      "coordinates": [112.982279, 28.19409]
    },
    "description": "辛亥革命爆发，毛泽东在长沙参加革命军，开始了他的革命生涯。",
    "significance": "毛泽东第一次直接参与政治革命活动，树立了推翻封建专制的理想。",
    "tags": ["辛亥革命", "长沙", "革命"],
    "sources": ["《毛泽东年谱》"],
    "images": ["images/events/1911-xinhai.jpg"]
  },
  {
    "id": "1918-04-14-xinmin",
    "date": "1918-04-14",
    "year": 1918,
    "age": 24,
    "type": "article",
    "importance": "high",
    "title": "发表《体育之研究》",
    "location": {
      "province": "湖南省",
      "city": "长沙市",
      "district": "岳麓区",
      "detail": "湖南第一师范学校",
      "coordinates": [112.938814, 28.183842]
    },
    "description": "毛泽东在《新青年》杂志上发表《体育之研究》一文，署名'二十八画生'。",
    "content": {
      "title": "体育之研究",
      "author": "二十八画生（毛泽东）",
      "publication": "《新青年》第3卷第2号",
      "excerpt": "国力苶弱，武风不振，民族之体质，日趋轻细。此甚可忧之现象也。提倡体育，非独强吾人之身体，实欲强吾人之精神。体育一道，配德育与智育，而德智皆寄于体。无体是无德智也。",
      "significance": "这是毛泽东公开发表的第一篇文章，体现了他对强身健体、振兴民族的思考。"
    },
    "significance": "毛泽东第一次在全国性刊物上发表文章，展现了他的文才和对民族体质的关注。",
    "tags": ["文章", "体育", "新青年", "湖南一师"],
    "sources": ["《新青年》杂志", "《毛泽东年谱》"],
    "images": ["images/events/1918-xinmin.jpg"]
  },
  {
    "id": "1921-07-23-ccp-first",
    "date": "1921-07-23",
    "year": 1921,
    "age": 27,
    "type": "historical",
    "importance": "high",
    "title": "出席中共一大",
    "location": {
      "province": "上海市",
      "city": "上海市",
      "district": "黄浦区",
      "detail": "望志路106号（今兴业路76号）",
      "coordinates": [121.466797, 31.220487]
    },
    "description": "毛泽东作为湖南代表出席中国共产党第一次全国代表大会，中国共产党正式成立。",
    "significance": "中国共产党成立，毛泽东成为党的创始人之一，开启了中国革命的新篇章。",
    "tags": ["中共一大", "上海", "建党", "代表"],
    "sources": ["《中国共产党历史》", "《毛泽东年谱》"],
    "images": ["images/events/1921-ccp-first.jpg"]
  },
  {
    "id": "1925-12-01-poem-changsha",
    "date": "1925-12-01",
    "year": 1925,
    "age": 32,
    "type": "poem",
    "importance": "high",
    "title": "《沁园春·长沙》",
    "location": {
      "province": "湖南省",
      "city": "长沙市",
      "district": "岳麓区",
      "detail": "橘子洲头",
      "coordinates": [112.958814, 28.203842]
    },
    "description": "毛泽东在长沙橘子洲头创作了著名诗词《沁园春·长沙》。",
    "content": {
      "title": "沁园春·长沙",
      "subtitle": "1925年",
      "text": "独立寒秋，湘江北去，橘子洲头。\n看万山红遍，层林尽染；\n漫江碧透，百舸争流。\n鹰击长空，鱼翔浅底，\n万类霜天竞自由。\n怅寥廓，问苍茫大地，\n谁主沉浮？\n\n携来百侣曾游，\n忆往昔峥嵘岁月稠。\n恰同学少年，风华正茂；\n书生意气，挥斥方遒。\n指点江山，激扬文字，\n粪土当年万户侯。\n曾记否，到中流击水，\n浪遏飞舟？",
      "background": "1925年，毛泽东离开故乡韶山，去广州主持农民运动讲习所，途经长沙，重游橘子洲，感慨万千，写下了这首词。",
      "artistic_value": "这首词气势磅礴，意境开阔，展现了青年毛泽东的远大抱负和革命豪情。"
    },
    "significance": "这是毛泽东最著名的诗词之一，体现了他的文学才华和革命理想。",
    "tags": ["诗词", "沁园春", "长沙", "橘子洲"],
    "sources": ["《毛泽东诗词集》", "《毛泽东年谱》"],
    "images": ["images/events/1925-changsha.jpg"]
  },
  {
    "id": "1927-03-01-hunan-peasant",
    "date": "1927-03-01",
    "year": 1927,
    "age": 33,
    "type": "article",
    "importance": "high",
    "title": "发表《湖南农民运动考察报告》",
    "location": {
      "province": "湖南省",
      "city": "长沙市",
      "district": "天心区",
      "detail": "湖南省城",
      "coordinates": [112.982279, 28.19409]
    },
    "description": "毛泽东发表《湖南农民运动考察报告》，为农民运动进行了有力辩护。",
    "content": {
      "title": "湖南农民运动考察报告",
      "date": "1927年3月",
      "excerpt": "很短的时间内，将有几万万农民从中国中部、南部和北部各省起来，其势如暴风骤雨，迅猛异常，无论什么大的力量都将压抑不住。他们将冲决一切束缚他们的罗网，朝着解放的路上迅跑。一切帝国主义、军阀、贪官污吏、土豪劣绅，都将被他们葬入坟墓。",
      "significance": "这篇报告科学分析了农民运动的意义，为中国革命指明了依靠农民的正确道路。"
    },
    "significance": "这是毛泽东关于农民问题的重要著作，奠定了中国革命走农村包围城市道路的理论基础。",
    "tags": ["文章", "农民运动", "湖南", "考察报告"],
    "sources": ["《毛泽东选集》", "《毛泽东年谱》"],
    "images": ["images/events/1927-peasant-report.jpg"]
  },
  {
    "id": "1927-09-09-autumn-harvest",
    "date": "1927-09-09",
    "year": 1927,
    "age": 33,
    "type": "historical",
    "importance": "high",
    "title": "领导秋收起义",
    "location": {
      "province": "湖南省",
      "city": "长沙市",
      "district": "浏阳市",
      "detail": "文家市",
      "coordinates": [113.633333, 28.35]
    },
    "description": "毛泽东领导湘赣边界秋收起义，第一次打出了工农革命军的旗号。",
    "significance": "这是中国共产党独立领导武装斗争的重要开端，为建立农村革命根据地奠定了基础。",
    "tags": ["秋收起义", "工农革命军", "浏阳", "武装斗争"],
    "sources": ["《中国共产党历史》", "《毛泽东年谱》"],
    "images": ["images/events/1927-autumn-harvest.jpg"]
  },
  {
    "id": "1927-10-27-jinggangshan",
    "date": "1927-10-27",
    "year": 1927,
    "age": 33,
    "type": "historical",
    "importance": "high",
    "title": "上井冈山",
    "location": {
      "province": "江西省",
      "city": "吉安市",
      "district": "井冈山市",
      "detail": "井冈山",
      "coordinates": [114.289398, 26.748016]
    },
    "description": "毛泽东率领秋收起义部队到达井冈山，开始创建井冈山革命根据地。",
    "significance": "井冈山革命根据地的建立，开辟了农村包围城市、武装夺取政权的革命道路。",
    "tags": ["井冈山", "革命根据地", "农村包围城市"],
    "sources": ["《毛泽东年谱》", "《井冈山革命史》"],
    "images": ["images/events/1927-jinggangshan.jpg"]
  },
  {
    "id": "1928-04-28-zhu-mao-meeting",
    "date": "1928-04-28",
    "year": 1928,
    "age": 34,
    "type": "historical",
    "importance": "high",
    "title": "朱毛会师",
    "location": {
      "province": "江西省",
      "city": "吉安市",
      "district": "井冈山市",
      "detail": "砻市",
      "coordinates": [114.289398, 26.748016]
    },
    "description": "毛泽东与朱德在井冈山砻市会师，成立中国工农红军第四军。",
    "significance": "朱毛会师壮大了井冈山革命力量，形成了著名的'朱毛红军'。",
    "tags": ["朱毛会师", "红四军", "井冈山", "朱德"],
    "sources": ["《毛泽东年谱》", "《朱德传》"],
    "images": ["images/events/1928-zhu-mao.jpg"]
  },
  {
    "id": "1934-10-10-long-march-start",
    "date": "1934-10-10",
    "year": 1934,
    "age": 40,
    "type": "historical",
    "importance": "high",
    "title": "长征开始",
    "location": {
      "province": "江西省",
      "city": "赣州市",
      "district": "于都县",
      "detail": "于都河",
      "coordinates": [115.415953, 25.952775]
    },
    "description": "中央红军开始长征，毛泽东随军从江西于都出发。",
    "significance": "长征是中国革命史上的伟大壮举，是中国共产党和红军的生死存亡之战。",
    "tags": ["长征", "于都", "中央红军"],
    "sources": ["《毛泽东年谱》", "《长征史》"],
    "images": ["images/events/1934-long-march.jpg"]
  },
  {
    "id": "1935-01-15-zunyi-conference",
    "date": "1935-01-15",
    "year": 1935,
    "age": 41,
    "type": "historical",
    "importance": "high",
    "title": "遵义会议",
    "location": {
      "province": "贵州省",
      "city": "遵义市",
      "district": "红花岗区",
      "detail": "遵义城",
      "coordinates": [106.927389, 27.725654]
    },
    "description": "中共中央在遵义召开政治局扩大会议，确立了毛泽东在党和红军中的领导地位。",
    "significance": "遵义会议是中国共产党历史上一个生死攸关的转折点，挽救了党、挽救了红军、挽救了中国革命。",
    "tags": ["遵义会议", "转折点", "领导地位", "长征"],
    "sources": ["《中国共产党历史》", "《毛泽东年谱》"],
    "images": ["images/events/1935-zunyi.jpg"]
  },
  {
    "id": "1935-10-19-long-march-end",
    "date": "1935-10-19",
    "year": 1935,
    "age": 41,
    "type": "historical",
    "importance": "high",
    "title": "长征胜利结束",
    "location": {
      "province": "陕西省",
      "city": "延安市",
      "district": "吴起县",
      "detail": "吴起镇",
      "coordinates": [108.175956, 36.927267]
    },
    "description": "中央红军到达陕北吴起镇，长征胜利结束。",
    "significance": "长征的胜利，保存了中国革命的火种，为抗日战争和解放战争的胜利奠定了基础。",
    "tags": ["长征胜利", "吴起", "陕北"],
    "sources": ["《毛泽东年谱》", "《长征史》"],
    "images": ["images/events/1935-long-march-end.jpg"]
  },
  {
    "id": "1936-12-12-xian-incident",
    "date": "1936-12-12",
    "year": 1936,
    "age": 42,
    "type": "historical",
    "importance": "high",
    "title": "西安事变",
    "location": {
      "province": "陕西省",
      "city": "西安市",
      "district": "莲湖区",
      "detail": "西安",
      "coordinates": [108.940175, 34.341568]
    },
    "description": "张学良、杨虎城发动西安事变，毛泽东主张和平解决，促成第二次国共合作。",
    "significance": "西安事变的和平解决，促成了抗日民族统一战线的形成，开启了全民族抗战的新局面。",
    "tags": ["西安事变", "国共合作", "抗日统一战线"],
    "sources": ["《毛泽东年谱》", "《西安事变史》"],
    "images": ["images/events/1936-xian.jpg"]
  },
  {
    "id": "1937-07-07-lugouqiao",
    "date": "1937-07-07",
    "year": 1937,
    "age": 43,
    "type": "historical",
    "importance": "high",
    "title": "卢沟桥事变",
    "location": {
      "province": "北京市",
      "city": "北京市",
      "district": "丰台区",
      "detail": "卢沟桥",
      "coordinates": [116.213889, 39.865]
    },
    "description": "卢沟桥事变爆发，全面抗战开始，毛泽东发表《论持久战》等重要著作。",
    "significance": "全面抗战的开始，毛泽东的持久战理论为抗战胜利指明了方向。",
    "tags": ["卢沟桥事变", "全面抗战", "论持久战"],
    "sources": ["《毛泽东年谱》", "《论持久战》"],
    "images": ["images/events/1937-lugouqiao.jpg"]
  },
  {
    "id": "1945-08-15-japan-surrender",
    "date": "1945-08-15",
    "year": 1945,
    "age": 51,
    "type": "historical",
    "importance": "high",
    "title": "日本投降",
    "location": {
      "province": "陕西省",
      "city": "延安市",
      "district": "宝塔区",
      "detail": "延安",
      "coordinates": [109.489727, 36.585455]
    },
    "description": "日本宣布无条件投降，抗日战争胜利结束，毛泽东在延安发表重要讲话。",
    "significance": "抗日战争的胜利，证明了毛泽东持久战理论的正确性，为解放战争的胜利奠定了基础。",
    "tags": ["抗战胜利", "日本投降", "延安"],
    "sources": ["《毛泽东年谱》"],
    "images": ["images/events/1945-victory.jpg"]
  },
  {
    "id": "1949-10-01-founding-prc",
    "date": "1949-10-01",
    "year": 1949,
    "age": 55,
    "type": "historical",
    "importance": "high",
    "title": "中华人民共和国成立",
    "location": {
      "province": "北京市",
      "city": "北京市",
      "district": "东城区",
      "detail": "天安门广场",
      "coordinates": [116.397477, 39.903119]
    },
    "description": "毛泽东在天安门城楼上宣告中华人民共和国成立，中国人民从此站起来了。",
    "significance": "新中国的成立标志着中国人民推翻了帝国主义、封建主义、官僚资本主义的统治，实现了民族独立和人民解放。",
    "tags": ["建国", "天安门", "开国大典", "人民共和国"],
    "sources": ["《毛泽东年谱》", "《开国大典》"],
    "images": ["images/events/1949-founding.jpg"]
  },
  {
    "id": "1976-09-09-death",
    "date": "1976-09-09",
    "year": 1976,
    "age": 82,
    "type": "historical",
    "importance": "high",
    "title": "毛泽东逝世",
    "location": {
      "province": "北京市",
      "city": "北京市",
      "district": "西城区",
      "detail": "中南海",
      "coordinates": [116.386515, 39.906901]
    },
    "description": "毛泽东在北京逝世，享年83岁。中国人民的伟大领袖、马克思主义者、伟大的无产阶级革命家、战略家和理论家走完了他波澜壮阔的一生。",
    "significance": "毛泽东的逝世标志着一个时代的结束，他为中国革命和建设事业建立的丰功伟绩将永远被人民铭记。",
    "tags": ["逝世", "北京", "中南海", "伟大领袖"],
    "sources": ["《毛泽东年谱》"],
    "images": ["images/events/1976-death.jpg"]
  },
  {
    "id": "1936-02-01-snow",
    "date": "1936-02-01",
    "year": 1936,
    "age": 42,
    "type": "poem",
    "importance": "high",
    "title": "《沁园春·雪》",
    "location": {
      "province": "陕西省",
      "city": "延安市",
      "district": "宝塔区",
      "detail": "延安",
      "coordinates": [109.489727, 36.596537]
    },
    "description": "毛泽东在延安创作了气势磅礴的《沁园春·雪》，展现了伟大的胸怀和抱负。",
    "content": {
      "title": "沁园春·雪",
      "subtitle": "1936年2月",
      "text": "北国风光，千里冰封，万里雪飘。\n望长城内外，惟余莽莽；\n大河上下，顿失滔滔。\n山舞银蛇，原驰蜡象，\n欲与天公试比高。\n须晴日，看红装素裹，\n分外妖娆。\n\n江山如此多娇，\n引无数英雄竞折腰。\n惜秦皇汉武，略输文采；\n唐宗宋祖，稍逊风骚。\n一代天骄，成吉思汗，\n只识弯弓射大雕。\n俱往矣，数风流人物，\n还看今朝。",
      "background": "1936年2月，毛泽东率领红军长征到达陕北后，在一个雪后初晴的日子里，面对祖国的壮丽河山，写下了这首千古名篇。",
      "artistic_value": "这首词气势恢宏，意境壮阔，既有对祖国山河的赞美，又有对历史人物的评价，最后点出了当代无产阶级革命家的历史使命。"
    },
    "significance": "这是毛泽东最著名的诗词之一，体现了无产阶级革命家的宏伟气魄和远大理想。",
    "tags": ["诗词", "沁园春", "雪", "延安"],
    "sources": ["《毛泽东诗词集》"],
    "images": ["images/events/1936-snow.jpg"]
  },
  {
    "id": "1940-01-01-new-democracy",
    "date": "1940-01-01",
    "year": 1940,
    "age": 46,
    "type": "article",
    "importance": "high",
    "title": "发表《新民主主义论》",
    "location": {
      "province": "陕西省",
      "city": "延安市",
      "district": "宝塔区",
      "detail": "延安",
      "coordinates": [109.489727, 36.596537]
    },
    "description": "毛泽东发表《新民主主义论》，系统阐述了新民主主义革命的理论。",
    "content": {
      "title": "新民主主义论",
      "date": "1940年1月",
      "excerpt": "中国革命的历史进程，必须分为两步，其第一步是民主主义的革命，其第二步是社会主义的革命，这是性质不同的两个革命过程。而所谓民主主义，现在已不是旧范畴的民主主义，不是旧民主主义，而是新范畴的民主主义，而是新民主主义。",
      "significance": "这篇著作系统地阐述了新民主主义革命的理论，为中国革命指明了正确道路。"
    },
    "significance": "这是毛泽东思想的重要组成部分，为中国革命提供了科学的理论指导。",
    "tags": ["理论", "新民主主义", "延安", "革命"],
    "sources": ["《毛泽东选集》"],
    "images": ["images/events/1940-new-democracy.jpg"]
  }
];

console.log('事件数据已加载:', window.EVENTS_DATA.length, '个事件');
