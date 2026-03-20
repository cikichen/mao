/**
 * 搜索管理模块
 * 负责事件搜索功能的实现
 */

class SearchManager {
    constructor() {
        this.isOpen = false;
        this.searchResults = [];
        this.currentQuery = '';
        
        // DOM元素
        this.elements = {
            modal: null,
            input: null,
            submitBtn: null,
            results: null,
            closeBtn: null
        };
        
        // 搜索配置
        this.config = {
            minQueryLength: 1,
            maxResults: 50,
            highlightClass: 'search-highlight'
        };
        
        // 防抖搜索
        this.debouncedSearch = null;
        
        // 事件监听器
        this.listeners = {
            searchComplete: [],
            resultSelect: []
        };
    }
    
    /**
     * 初始化搜索功能
     */
    init() {
        this.initElements();
        this.bindEvents();
        this.debouncedSearch = UTILS.debounce(this.performSearch.bind(this), CONFIG.performance.debounceDelay);
        
        UTILS.log.info('搜索功能初始化完成');
    }
    
    /**
     * 初始化DOM元素
     */
    initElements() {
        this.elements.modal = document.getElementById('searchModal');
        this.elements.input = document.getElementById('searchInput');
        this.elements.submitBtn = document.getElementById('searchSubmit');
        this.elements.results = document.getElementById('searchResults');
        this.elements.closeBtn = document.getElementById('closeSearchModal');
        
        if (!this.elements.modal) {
            UTILS.log.error('搜索模态框元素未找到');
        }
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 搜索按钮
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.open();
            });
        }
        
        // 关闭按钮
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => {
                this.close();
            });
        }
        
        // 模态框背景点击关闭
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.close();
                }
            });
        }
        
        // 搜索输入框
        if (this.elements.input) {
            this.elements.input.addEventListener('input', (e) => {
                this.handleInputChange(e.target.value);
            });
            
            this.elements.input.addEventListener('keydown', (e) => {
                this.handleKeyDown(e);
            });
        }
        
        // 搜索提交按钮
        if (this.elements.submitBtn) {
            this.elements.submitBtn.addEventListener('click', () => {
                this.performSearch(this.elements.input.value);
            });
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.open();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    /**
     * 处理输入变化
     */
    handleInputChange(query) {
        this.currentQuery = query.trim();
        
        if (this.currentQuery.length >= this.config.minQueryLength) {
            this.debouncedSearch(this.currentQuery);
        } else {
            this.clearResults();
        }
    }
    
    /**
     * 处理键盘事件
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.performSearch(this.currentQuery);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateResults('down');
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateResults('up');
                break;
        }
    }
    
    /**
     * 执行搜索
     */
    performSearch(query) {
        if (!query || query.length < this.config.minQueryLength) {
            this.clearResults();
            return;
        }
        
        UTILS.log.debug('执行搜索:', query);
        
        // 显示加载状态
        this.showLoading();
        
        // 获取所有事件数据
        const events = dataManager.getAllEvents();
        
        // 执行搜索
        const results = this.searchEvents(events, query);
        
        // 显示结果
        this.displayResults(results, query);
        
        // 触发搜索完成事件
        this.emit('searchComplete', results, query);
    }
    
    /**
     * 搜索事件
     */
    searchEvents(events, query) {
        const searchTerm = query.toLowerCase();
        const results = [];
        
        events.forEach(event => {
            const score = this.calculateRelevanceScore(event, searchTerm);
            if (score > 0) {
                results.push({
                    event: event,
                    score: score,
                    matches: this.findMatches(event, searchTerm)
                });
            }
        });
        
        // 按相关性排序
        results.sort((a, b) => b.score - a.score);
        
        // 限制结果数量
        return results.slice(0, this.config.maxResults);
    }
    
    /**
     * 计算相关性得分
     */
    calculateRelevanceScore(event, searchTerm) {
        let score = 0;
        
        // 标题匹配（权重最高）
        if (event.title.toLowerCase().includes(searchTerm)) {
            score += 10;
        }
        
        // 描述匹配
        if (event.description.toLowerCase().includes(searchTerm)) {
            score += 5;
        }
        
        // 地点匹配
        if (event.location) {
            const locationText = Object.values(event.location)
                .filter(v => typeof v === 'string')
                .join(' ')
                .toLowerCase();
            if (locationText.includes(searchTerm)) {
                score += 3;
            }
        }
        
        // 标签匹配
        if (event.tags) {
            event.tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    score += 2;
                }
            });
        }
        
        // 内容匹配
        if (event.content) {
            if (event.content.title && event.content.title.toLowerCase().includes(searchTerm)) {
                score += 4;
            }
            if (event.content.text && event.content.text.toLowerCase().includes(searchTerm)) {
                score += 3;
            }
            if (event.content.excerpt && event.content.excerpt.toLowerCase().includes(searchTerm)) {
                score += 3;
            }
        }
        
        // 年份匹配
        if (event.year.toString().includes(searchTerm)) {
            score += 1;
        }
        
        return score;
    }
    
    /**
     * 查找匹配项
     */
    findMatches(event, searchTerm) {
        const matches = [];
        
        // 检查各个字段
        const fields = [
            { name: 'title', value: event.title, weight: 10 },
            { name: 'description', value: event.description, weight: 5 },
            { name: 'location', value: this.getLocationText(event.location), weight: 3 },
            { name: 'tags', value: event.tags?.join(' ') || '', weight: 2 },
            { name: 'content', value: this.getContentText(event.content), weight: 3 }
        ];
        
        fields.forEach(field => {
            if (field.value && field.value.toLowerCase().includes(searchTerm)) {
                matches.push({
                    field: field.name,
                    text: this.highlightMatch(field.value, searchTerm),
                    weight: field.weight
                });
            }
        });
        
        return matches;
    }
    
    /**
     * 获取地点文本
     */
    getLocationText(location) {
        if (!location) return '';
        return Object.values(location)
            .filter(v => typeof v === 'string')
            .join(' ');
    }
    
    /**
     * 获取内容文本
     */
    getContentText(content) {
        if (!content) return '';
        return [content.title, content.text, content.excerpt]
            .filter(Boolean)
            .join(' ');
    }
    
    /**
     * 高亮匹配文本
     */
    highlightMatch(text, searchTerm) {
        if (!text || !searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, `<mark class="${this.config.highlightClass}">$1</mark>`);
    }
    
    /**
     * 显示搜索结果
     */
    displayResults(results, query) {
        if (!this.elements.results) return;
        
        if (results.length === 0) {
            this.elements.results.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <h4>未找到相关结果</h4>
                    <p>尝试使用其他关键词搜索</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="search-results-header">
                <span class="results-count">找到 ${results.length} 个相关结果</span>
                <span class="search-query">关键词: "${query}"</span>
            </div>
            <div class="search-results-list">
        `;
        
        results.forEach((result, index) => {
            html += this.createResultItem(result, index);
        });
        
        html += '</div>';
        
        this.elements.results.innerHTML = html;
        this.bindResultEvents();
    }
    
    /**
     * 创建结果项
     */
    createResultItem(result, index) {
        const event = result.event;
        const typeNames = {
            historical: '历史事件',
            article: '重要文章',
            poem: '诗词作品'
        };
        
        // 获取最佳匹配
        const bestMatch = result.matches.sort((a, b) => b.weight - a.weight)[0];
        
        return `
            <div class="search-result-item" data-event-id="${event.id}" data-index="${index}">
                <div class="result-header">
                    <span class="result-type ${event.type}">${typeNames[event.type]}</span>
                    <span class="result-date">${event.year}年</span>
                </div>
                <h4 class="result-title">${this.highlightMatch(event.title, this.currentQuery)}</h4>
                <p class="result-description">${this.highlightMatch(event.description, this.currentQuery)}</p>
                <div class="result-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.location.province} ${event.location.city}
                </div>
                ${bestMatch && bestMatch.field !== 'title' ? `
                    <div class="result-match">
                        <span class="match-field">${this.getFieldName(bestMatch.field)}:</span>
                        <span class="match-text">${bestMatch.text}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * 获取字段名称
     */
    getFieldName(field) {
        const names = {
            description: '描述',
            location: '地点',
            tags: '标签',
            content: '内容'
        };
        return names[field] || field;
    }
    
    /**
     * 绑定结果事件
     */
    bindResultEvents() {
        if (!this.elements.results) return;
        
        this.elements.results.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectResult(item.dataset.eventId);
            });
        });
    }
    
    /**
     * 选择搜索结果
     */
    selectResult(eventId) {
        const event = dataManager.getEventById(eventId);
        if (!event) return;
        
        // 关闭搜索模态框
        this.close();
        
        // 定位到事件
        if (window.mapManager) {
            mapManager.centerToEvent(eventId, 12);
        }
        
        // 显示事件详情
        if (window.sidebarManager) {
            sidebarManager.showEvent(event);
        }
        
        // 更新时间轴
        if (window.timelineManager) {
            const eventIndex = dataManager.getFilteredEvents().findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                timelineManager.goToEvent(eventIndex);
            }
        }
        
        this.emit('resultSelect', event);
        UTILS.log.debug('选择搜索结果:', event.title);
    }
    
    /**
     * 导航搜索结果
     */
    navigateResults(direction) {
        const items = this.elements.results?.querySelectorAll('.search-result-item');
        if (!items || items.length === 0) return;
        
        const current = this.elements.results.querySelector('.search-result-item.active');
        let index = current ? Array.from(items).indexOf(current) : -1;
        
        if (direction === 'down') {
            index = (index + 1) % items.length;
        } else {
            index = index <= 0 ? items.length - 1 : index - 1;
        }
        
        // 移除之前的高亮
        items.forEach(item => item.classList.remove('active'));
        
        // 高亮当前项
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        if (this.elements.results) {
            this.elements.results.innerHTML = `
                <div class="search-loading">
                    <i class="fas fa-spinner animate-spin"></i>
                    <span>搜索中...</span>
                </div>
            `;
        }
    }
    
    /**
     * 清空搜索结果
     */
    clearResults() {
        if (this.elements.results) {
            this.elements.results.innerHTML = '';
        }
        this.searchResults = [];
    }
    
    /**
     * 打开搜索模态框
     */
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.elements.modal?.classList.add('show');
        
        // 聚焦输入框
        setTimeout(() => {
            this.elements.input?.focus();
        }, 100);
        
        UTILS.log.debug('搜索模态框已打开');
    }
    
    /**
     * 关闭搜索模态框
     */
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.elements.modal?.classList.remove('show');
        
        // 清空输入和结果
        if (this.elements.input) {
            this.elements.input.value = '';
        }
        this.clearResults();
        this.currentQuery = '';
        
        UTILS.log.debug('搜索模态框已关闭');
    }
    
    /**
     * 公开搜索方法
     */
    search(query) {
        this.open();
        if (this.elements.input) {
            this.elements.input.value = query;
            this.handleInputChange(query);
        }
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

// 创建全局搜索管理器实例
const searchManager = new SearchManager();
