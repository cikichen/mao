/**
 * 毛泽东一生足迹完整数据合并文件
 * 将分散的数据文件合并为统一的事件数据
 */

// 等待所有数据文件加载完成后合并数据
function mergeAllEventsData() {
  // 检查所有数据是否已加载
  if (typeof window.HISTORICAL_EVENTS === 'undefined' ||
      typeof window.POST_1949_EVENTS === 'undefined' ||
      typeof window.POEMS_EVENTS === 'undefined' ||
      typeof window.ARTICLES_EVENTS === 'undefined') {
    console.log('等待数据文件加载...');
    setTimeout(mergeAllEventsData, 100);
    return;
  }

  // 合并所有事件数据
  window.EVENTS_DATA = []
    .concat(window.HISTORICAL_EVENTS || [])
    .concat(window.POST_1949_EVENTS || [])
    .concat(window.POEMS_EVENTS || [])
    .concat(window.ARTICLES_EVENTS || []);

  // 按日期排序
  window.EVENTS_DATA.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // 统计信息
  const stats = {
    total: window.EVENTS_DATA.length,
    historical: window.HISTORICAL_EVENTS.length,
    post1949: window.POST_1949_EVENTS.length,
    poems: window.POEMS_EVENTS.length,
    articles: window.ARTICLES_EVENTS.length,
    byType: {},
    byImportance: {},
    timeSpan: {
      start: window.EVENTS_DATA[0]?.year,
      end: window.EVENTS_DATA[window.EVENTS_DATA.length - 1]?.year
    }
  };

  // 按类型统计
  window.EVENTS_DATA.forEach(event => {
    stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    stats.byImportance[event.importance] = (stats.byImportance[event.importance] || 0) + 1;
  });

  console.log('📊 毛泽东一生足迹数据统计:');
  console.log(`总计事件: ${stats.total}个`);
  console.log(`历史事件: ${stats.historical}个`);
  console.log(`建国后事件: ${stats.post1949}个`);
  console.log(`诗词作品: ${stats.poems}个`);
  console.log(`文章著作: ${stats.articles}个`);
  console.log(`时间跨度: ${stats.timeSpan.start}-${stats.timeSpan.end}年`);
  console.log('按类型分布:', stats.byType);
  console.log('按重要性分布:', stats.byImportance);

  // 验证长沙事件
  const changshaEvents = window.EVENTS_DATA.filter(event => 
    event.location.city === '长沙市'
  );
  console.log(`长沙市事件: ${changshaEvents.length}个`);
  changshaEvents.forEach(event => {
    console.log(`- ${event.title} (${event.year}年, ${event.location.district})`);
  });

  // 触发数据加载完成事件
  if (typeof window.onEventsDataLoaded === 'function') {
    window.onEventsDataLoaded();
  }

  // 派发自定义事件
  window.dispatchEvent(new CustomEvent('eventsDataLoaded', {
    detail: { stats, events: window.EVENTS_DATA }
  }));
}

// 页面加载完成后开始合并数据
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mergeAllEventsData);
} else {
  mergeAllEventsData();
}
