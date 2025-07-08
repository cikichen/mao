/**
 * 毛泽东建国后重要诗词补充数据
 * 这些是建国后创作的重要诗词作品
 */

const ADDITIONAL_POEMS = [
  {
    "id": "1950-10-huanxisha-liuyazi",
    "date": "1950-10-01",
    "year": 1950,
    "age": 56,
    "type": "poem",
    "importance": "medium",
    "title": "《浣溪沙·和柳亚子先生》",
    "location": {
      "province": "北京市",
      "city": "北京市",
      "district": "东城区",
      "detail": "中南海",
      "coordinates": [116.384064, 39.928847]
    },
    "description": "毛泽东在北京创作《浣溪沙·和柳亚子先生》。",
    "content": "1950年国庆节，毛泽东在北京创作《浣溪沙·和柳亚子先生》：'长夜难明赤县天，百年魔怪舞翩跹，人民五亿不团圆。一唱雄鸡天下白，万方乐奏有于阗，诗人兴会更无前。'",
    "image": "images/events/1950-huanxisha.jpg"
  },
  {
    "id": "1954-08-langtaosha-beidaihe",
    "date": "1954-08-01",
    "year": 1954,
    "age": 60,
    "type": "poem",
    "importance": "medium",
    "title": "《浪淘沙·北戴河》",
    "location": {
      "province": "河北省",
      "city": "秦皇岛市",
      "district": "北戴河区",
      "detail": "北戴河海滨",
      "coordinates": [119.484444, 39.834167]
    },
    "description": "毛泽东在北戴河创作《浪淘沙·北戴河》。",
    "content": "1954年夏，毛泽东在北戴河海滨创作《浪淘沙·北戴河》：'大雨落幽燕，白浪滔天，秦皇岛外打鱼船。一片汪洋都不见，知向谁边？往事越千年，魏武挥鞭，东临碣石有遗篇。萧瑟秋风今又是，换了人间。'",
    "image": "images/events/1954-langtaosha.jpg"
  },
  {
    "id": "1956-06-shuidiaogetou-youyong",
    "date": "1956-06-01",
    "year": 1956,
    "age": 62,
    "type": "poem",
    "importance": "high",
    "title": "《水调歌头·游泳》",
    "location": {
      "province": "湖北省",
      "city": "武汉市",
      "district": "武昌区",
      "detail": "长江",
      "coordinates": [114.305392, 30.593099]
    },
    "description": "毛泽东在武汉长江游泳时创作《水调歌头·游泳》。",
    "content": "1956年6月，毛泽东在武汉长江游泳时创作《水调歌头·游泳》：'才饮长沙水，又食武昌鱼。万里长江横渡，极目楚天舒。不管风吹浪打，胜似闲庭信步，今日得宽余。子在川上曰：逝者如斯夫！'",
    "image": "images/events/1956-youyong.jpg"
  },
  {
    "id": "1957-05-dielianhua-lishuyi",
    "date": "1957-05-11",
    "year": 1957,
    "age": 63,
    "type": "poem",
    "importance": "high",
    "title": "《蝶恋花·答李淑一》",
    "location": {
      "province": "北京市",
      "city": "北京市",
      "district": "西城区",
      "detail": "中南海",
      "coordinates": [116.384064, 39.928847]
    },
    "description": "毛泽东在北京创作《蝶恋花·答李淑一》，悼念杨开慧。",
    "content": "1957年5月11日，毛泽东写下《蝶恋花·答李淑一》：'我失骄杨君失柳，杨柳轻飏直上重霄九。问讯吴刚何所有，吴刚捧出桂花酒。寂寞嫦娥舒广袖，万里长空且为忠魂舞。忽报人间曾伏虎，泪飞顿作倾盆雨。'",
    "image": "images/events/1957-dielianhua.jpg"
  },
  {
    "id": "1959-06-qilv-shaoshan",
    "date": "1959-06-25",
    "year": 1959,
    "age": 65,
    "type": "poem",
    "importance": "high",
    "title": "《七律·到韶山》",
    "location": {
      "province": "湖南省",
      "city": "湘潭市",
      "district": "韶山市",
      "detail": "韶山冲",
      "coordinates": [112.527621, 27.915456]
    },
    "description": "毛泽东回到故乡韶山，创作《七律·到韶山》。",
    "content": "1959年6月25日，毛泽东回到阔别32年的故乡韶山，创作《七律·到韶山》：'别梦依稀咒逝川，故园三十二年前。红旗卷起农奴戟，黑手高悬霸主鞭。为有牺牲多壮志，敢教日月换新天。喜看稻菽千重浪，遍地英雄下夕烟。'",
    "image": "images/events/1959-shaoshan.jpg"
  },
  {
    "id": "1961-12-busuanzi-yongmei",
    "date": "1961-12-01",
    "year": 1961,
    "age": 67,
    "type": "poem",
    "importance": "medium",
    "title": "《卜算子·咏梅》",
    "location": {
      "province": "北京市",
      "city": "北京市",
      "district": "西城区",
      "detail": "中南海",
      "coordinates": [116.384064, 39.928847]
    },
    "description": "毛泽东在北京创作《卜算子·咏梅》。",
    "content": "1961年12月，毛泽东创作《卜算子·咏梅》：'读陆游咏梅词，反其意而用之。风雨送春归，飞雪迎春到。已是悬崖百丈冰，犹有花枝俏。俏也不争春，只把春来报。待到山花烂漫时，她在丛中笑。'",
    "image": "images/events/1961-yongmei.jpg"
  },
  {
    "id": "1963-01-manjianhong-guomoruo",
    "date": "1963-01-09",
    "year": 1963,
    "age": 69,
    "type": "poem",
    "importance": "medium",
    "title": "《满江红·和郭沫若同志》",
    "location": {
      "province": "北京市",
      "city": "北京市",
      "district": "西城区",
      "detail": "中南海",
      "coordinates": [116.384064, 39.928847]
    },
    "description": "毛泽东在北京创作《满江红·和郭沫若同志》。",
    "content": "1963年1月9日，毛泽东创作《满江红·和郭沫若同志》：'小小寰球，有几个苍蝇碰壁。嗡嗡叫，几声凄厉，几声抽泣。蚂蚁缘槐夸大国，蚍蜉撼树谈何易。正西风落叶下长安，飞鸣镝。'",
    "image": "images/events/1963-manjianhong.jpg"
  },
  {
    "id": "1965-05-shuidiaogetou-jinggangshan",
    "date": "1965-05-01",
    "year": 1965,
    "age": 71,
    "type": "poem",
    "importance": "high",
    "title": "《水调歌头·重上井冈山》",
    "location": {
      "province": "江西省",
      "city": "吉安市",
      "district": "井冈山市",
      "detail": "井冈山",
      "coordinates": [114.289398, 26.748016]
    },
    "description": "毛泽东重上井冈山，创作《水调歌头·重上井冈山》。",
    "content": "1965年5月，毛泽东重上井冈山，创作《水调歌头·重上井冈山》：'久有凌云志，重上井冈山。千里来寻故地，旧貌变新颜。到处莺歌燕舞，更有潺潺流水，高路入云端。过了黄洋界，险处不须看。'",
    "image": "images/events/1965-jinggangshan.jpg"
  },
  {
    "id": "1976-09-09-shishi",
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
      "coordinates": [116.384064, 39.928847]
    },
    "description": "毛泽东在北京逝世，享年83岁。",
    "content": "1976年9月9日零时10分，中国共产党中央委员会主席、中国共产党中央军事委员会主席、中国人民政治协商会议全国委员会名誉主席毛泽东在北京逝世，享年83岁。",
    "image": "images/events/1976-shishi.jpg"
  }
];

// 将补充诗词合并到主数据中
if (window.EVENTS_DATA) {
  window.EVENTS_DATA = window.EVENTS_DATA.concat(ADDITIONAL_POEMS);
  console.log('补充诗词数据已合并，总计:', window.EVENTS_DATA.length, '个事件');
}
