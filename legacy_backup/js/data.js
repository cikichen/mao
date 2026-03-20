/**
 * 数据管理模块
 * 负责加载、处理和管理历史事件数据
 */

class DataManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentEventIndex = 0;
        this.isLoading = false;
        this.cache = new Map();
        
        // 事件监听器
        this.listeners = {
            dataLoaded: [],
            eventChanged: [],
            filterChanged: []
        };
    }
    
    /**
     * 加载事件数据
     */
    async loadEvents() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        UTILS.log.info('开始加载事件数据...');
        
        try {
            // 强制使用内嵌数据，不使用缓存（临时调试）
            if (window.EVENTS_DATA) {
                console.log('🔄 使用内嵌事件数据');
                this.events = this.processEvents(window.EVENTS_DATA);
                this.filteredEvents = [...this.events];
                this.isLoading = false;
                this.emit('dataLoaded', this.events);
                UTILS.log.info(`从内嵌数据加载成功，共 ${this.events.length} 个事件`);
                return;
            }

            // 检查缓存
            const cachedData = UTILS.storage.get('events_data');
            if (cachedData && !CONFIG.development.mockData) {
                this.events = cachedData;
                this.filteredEvents = [...this.events];
                this.isLoading = false;
                this.emit('dataLoaded', this.events);
                UTILS.log.info('从缓存加载事件数据成功');
                return;
            }
            
            // 从文件加载
            const response = await fetch(CONFIG.data.eventsFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.events = this.processEvents(data);
            this.filteredEvents = [...this.events];
            
            // 缓存数据
            UTILS.storage.set('events_data', this.events);
            
            this.isLoading = false;
            this.emit('dataLoaded', this.events);
            UTILS.log.info(`成功加载 ${this.events.length} 个事件`);
            
        } catch (error) {
            this.isLoading = false;
            UTILS.log.error('加载事件数据失败:', error);
            
            // 使用模拟数据作为后备
            this.events = this.getMockData();
            this.filteredEvents = [...this.events];
            this.emit('dataLoaded', this.events);
        }
    }
    
    /**
     * 处理原始事件数据
     */
    processEvents(rawEvents) {
        return rawEvents
            .map(event => this.processEvent(event))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event, index) => ({ ...event, index }));
    }
    
    /**
     * 处理单个事件数据
     */
    processEvent(event) {
        return {
            ...event,
            // 确保日期格式正确
            date: this.normalizeDate(event.date),
            // 计算年龄
            age: event.age || this.calculateAge('1893-12-26', event.date),
            // 处理坐标
            coordinates: this.processCoordinates(event.location),
            // 处理内容
            content: this.processContent(event.content),
            // 添加搜索关键词
            searchKeywords: this.generateSearchKeywords(event),
            // 添加时间戳用于排序
            timestamp: new Date(event.date).getTime()
        };
    }
    
    /**
     * 标准化日期格式
     */
    normalizeDate(dateStr) {
        // 处理各种日期格式
        if (typeof dateStr === 'string') {
            // 确保格式为 YYYY-MM-DD
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parts[0].padStart(4, '0');
                const month = parts[1].padStart(2, '0');
                const day = parts[2].padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        }
        return dateStr;
    }
    
    /**
     * 计算年龄
     */
    calculateAge(birthDate, currentDate) {
        const birth = new Date(birthDate);
        const current = new Date(currentDate);
        return Math.floor((current - birth) / (365.25 * 24 * 60 * 60 * 1000));
    }
    
    /**
     * 处理地理坐标
     */
    processCoordinates(location) {
        if (!location || !Array.isArray(location.coordinates) || location.coordinates.length < 2) {
            return null;
        }

        const lng = parseFloat(location.coordinates[0]);
        const lat = parseFloat(location.coordinates[1]);

        if (isNaN(lng) || isNaN(lat)) {
            return null;
        }

        return { lng, lat };
    }
    
    /**
     * 处理事件内容
     */
    processContent(content) {
        if (!content) return null;
        
        return {
            ...content,
            // 处理文本内容，确保换行符正确
            text: content.text ? content.text.replace(/\\n/g, '\n') : '',
            // 生成摘要
            summary: this.generateSummary(content.text || content.excerpt || ''),
            // 计算阅读时间
            readingTime: this.calculateReadingTime(content.text || content.excerpt || '')
        };
    }
    
    /**
     * 生成搜索关键词
     */
    generateSearchKeywords(event) {
        const keywords = [];
        
        // 添加标题
        if (event.title) keywords.push(event.title);
        
        // 添加描述
        if (event.description) keywords.push(event.description);
        
        // 添加地点信息
        if (event.location) {
            Object.values(event.location).forEach(value => {
                if (typeof value === 'string') keywords.push(value);
            });
        }
        
        // 添加标签
        if (event.tags) keywords.push(...event.tags);
        
        // 添加内容
        if (event.content) {
            if (event.content.title) keywords.push(event.content.title);
            if (event.content.text) keywords.push(event.content.text);
            if (event.content.excerpt) keywords.push(event.content.excerpt);
        }
        
        return keywords.join(' ').toLowerCase();
    }
    
    /**
     * 生成内容摘要
     */
    generateSummary(text, maxLength = 100) {
        if (!text) return '';
        
        const cleanText = text.replace(/\n/g, ' ').trim();
        if (cleanText.length <= maxLength) return cleanText;
        
        return cleanText.substring(0, maxLength) + '...';
    }
    
    /**
     * 计算阅读时间（分钟）
     */
    calculateReadingTime(text) {
        if (!text) return 0;
        
        const wordsPerMinute = 200; // 中文阅读速度
        const wordCount = text.length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
    
    /**
     * 获取所有事件
     */
    getAllEvents() {
        return this.events;
    }
    
    /**
     * 获取过滤后的事件
     */
    getFilteredEvents() {
        return this.filteredEvents;
    }
    
    /**
     * 根据ID获取事件
     */
    getEventById(id) {
        return this.events.find(event => event.id === id);
    }
    
    /**
     * 根据索引获取事件
     */
    getEventByIndex(index) {
        return this.filteredEvents[index];
    }
    
    /**
     * 获取当前事件
     */
    getCurrentEvent() {
        return this.getEventByIndex(this.currentEventIndex);
    }
    
    /**
     * 设置当前事件索引
     */
    setCurrentEventIndex(index) {
        if (index >= 0 && index < this.filteredEvents.length) {
            this.currentEventIndex = index;
            this.emit('eventChanged', this.getCurrentEvent(), index);
        }
    }
    
    /**
     * 下一个事件
     */
    nextEvent() {
        if (this.currentEventIndex < this.filteredEvents.length - 1) {
            this.setCurrentEventIndex(this.currentEventIndex + 1);
            return true;
        }
        return false;
    }
    
    /**
     * 上一个事件
     */
    prevEvent() {
        if (this.currentEventIndex > 0) {
            this.setCurrentEventIndex(this.currentEventIndex - 1);
            return true;
        }
        return false;
    }
    
    /**
     * 跳转到第一个事件
     */
    firstEvent() {
        this.setCurrentEventIndex(0);
    }
    
    /**
     * 跳转到最后一个事件
     */
    lastEvent() {
        this.setCurrentEventIndex(this.filteredEvents.length - 1);
    }
    
    /**
     * 搜索事件
     */
    searchEvents(query) {
        if (!query || query.trim() === '') {
            this.filteredEvents = [...this.events];
        } else {
            const searchTerm = query.toLowerCase().trim();
            this.filteredEvents = this.events.filter(event => 
                event.searchKeywords.includes(searchTerm)
            );
        }
        
        this.currentEventIndex = 0;
        this.emit('filterChanged', this.filteredEvents);
        return this.filteredEvents;
    }
    
    /**
     * 按类型筛选事件
     */
    filterByType(types) {
        if (!types || types.length === 0) {
            this.filteredEvents = [...this.events];
        } else {
            this.filteredEvents = this.events.filter(event => 
                types.includes(event.type)
            );
        }
        
        this.currentEventIndex = 0;
        this.emit('filterChanged', this.filteredEvents);
        return this.filteredEvents;
    }
    
    /**
     * 按年份范围筛选事件
     */
    filterByYearRange(startYear, endYear) {
        this.filteredEvents = this.events.filter(event => 
            event.year >= startYear && event.year <= endYear
        );
        
        this.currentEventIndex = 0;
        this.emit('filterChanged', this.filteredEvents);
        return this.filteredEvents;
    }
    
    /**
     * 组合筛选
     */
    applyFilters(filters) {
        let filtered = [...this.events];
        
        // 按类型筛选
        if (filters.types && filters.types.length > 0) {
            filtered = filtered.filter(event => filters.types.includes(event.type));
        }
        
        // 按年份范围筛选
        if (filters.yearRange) {
            filtered = filtered.filter(event => 
                event.year >= filters.yearRange.start && 
                event.year <= filters.yearRange.end
            );
        }
        
        // 按搜索词筛选
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(event => 
                event.searchKeywords.includes(searchTerm)
            );
        }
        
        this.filteredEvents = filtered;
        this.currentEventIndex = 0;
        this.emit('filterChanged', this.filteredEvents);
        return this.filteredEvents;
    }
    
    /**
     * 获取统计信息
     */
    getStatistics() {
        const stats = {
            total: this.events.length,
            filtered: this.filteredEvents.length,
            byType: {},
            byDecade: {},
            timeSpan: {
                start: null,
                end: null,
                years: 0
            }
        };
        
        // 按类型统计
        this.events.forEach(event => {
            stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
        });
        
        // 按年代统计
        this.events.forEach(event => {
            const decade = Math.floor(event.year / 10) * 10;
            stats.byDecade[decade] = (stats.byDecade[decade] || 0) + 1;
        });
        
        // 时间跨度
        if (this.events.length > 0) {
            const years = this.events.map(e => e.year).sort((a, b) => a - b);
            stats.timeSpan.start = years[0];
            stats.timeSpan.end = years[years.length - 1];
            stats.timeSpan.years = stats.timeSpan.end - stats.timeSpan.start;
        }
        
        return stats;
    }
    
    /**
     * 获取模拟数据（用于开发和测试）
     */
    getMockData() {
        return [
            {
                id: 'mock-1',
                date: '1893-12-26',
                year: 1893,
                age: 0,
                type: 'historical',
                importance: 'high',
                title: '毛泽东出生',
                location: {
                    province: '湖南省',
                    city: '湘潭市',
                    coordinates: [112.527621, 27.915456]
                },
                description: '毛泽东出生于湖南省湘潭县韶山冲',
                tags: ['出生', '韶山'],
                searchKeywords: '毛泽东出生湖南省湘潭市韶山冲出生韶山',
                coordinates: { lng: 112.527621, lat: 27.915456 },
                timestamp: new Date('1893-12-26').getTime(),
                index: 0
            }
        ];
    }
    
    /**
     * 事件监听器管理
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }
    
    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args));
        }
    }
}

// 创建全局数据管理器实例
const dataManager = new DataManager();
