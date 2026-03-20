/**
 * 筛选管理模块
 * 负责事件筛选功能的实现
 */

class FilterManager {
    constructor() {
        this.isOpen = false;
        this.currentFilters = {
            types: ['historical', 'article', 'poem'],
            yearRange: {
                start: 1893,
                end: 1976
            },
            importance: ['high', 'medium', 'low'],
            search: ''
        };
        
        // DOM元素
        this.elements = {
            modal: null,
            closeBtn: null,
            typeCheckboxes: null,
            yearRangeStart: null,
            yearRangeEnd: null,
            yearStartDisplay: null,
            yearEndDisplay: null,
            applyBtn: null,
            resetBtn: null
        };
        
        // 事件监听器
        this.listeners = {
            filterChange: [],
            filterApply: [],
            filterReset: []
        };
    }
    
    /**
     * 初始化筛选功能
     */
    init() {
        this.initElements();
        this.bindEvents();
        this.loadSavedFilters();
        
        UTILS.log.info('筛选功能初始化完成');
    }
    
    /**
     * 初始化DOM元素
     */
    initElements() {
        this.elements.modal = document.getElementById('filterModal');
        this.elements.closeBtn = document.getElementById('closeFilterModal');
        this.elements.typeCheckboxes = this.elements.modal?.querySelectorAll('input[type="checkbox"]');
        this.elements.yearRangeStart = document.getElementById('yearRangeStart');
        this.elements.yearRangeEnd = document.getElementById('yearRangeEnd');
        this.elements.yearStartDisplay = document.getElementById('yearStart');
        this.elements.yearEndDisplay = document.getElementById('yearEnd');
        this.elements.applyBtn = document.getElementById('applyFilter');
        this.elements.resetBtn = document.getElementById('resetFilter');
        
        if (!this.elements.modal) {
            UTILS.log.error('筛选模态框元素未找到');
        }
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 筛选按钮
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
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
        
        // 事件类型复选框
        if (this.elements.typeCheckboxes) {
            this.elements.typeCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.updateTypeFilters();
                });
            });
        }
        
        // 年份范围滑块
        if (this.elements.yearRangeStart) {
            this.elements.yearRangeStart.addEventListener('input', (e) => {
                this.updateYearRange('start', parseInt(e.target.value));
            });
        }
        
        if (this.elements.yearRangeEnd) {
            this.elements.yearRangeEnd.addEventListener('input', (e) => {
                this.updateYearRange('end', parseInt(e.target.value));
            });
        }
        
        // 应用筛选按钮
        if (this.elements.applyBtn) {
            this.elements.applyBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        // 重置按钮
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.open();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    /**
     * 更新事件类型筛选
     */
    updateTypeFilters() {
        const checkedTypes = [];
        
        if (this.elements.typeCheckboxes) {
            this.elements.typeCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkedTypes.push(checkbox.value);
                }
            });
        }
        
        this.currentFilters.types = checkedTypes;
        this.updateFilterPreview();
    }
    
    /**
     * 更新年份范围
     */
    updateYearRange(type, value) {
        if (type === 'start') {
            // 确保开始年份不大于结束年份
            if (value > this.currentFilters.yearRange.end) {
                value = this.currentFilters.yearRange.end;
                if (this.elements.yearRangeStart) {
                    this.elements.yearRangeStart.value = value;
                }
            }
            this.currentFilters.yearRange.start = value;
            if (this.elements.yearStartDisplay) {
                this.elements.yearStartDisplay.textContent = value;
            }
        } else {
            // 确保结束年份不小于开始年份
            if (value < this.currentFilters.yearRange.start) {
                value = this.currentFilters.yearRange.start;
                if (this.elements.yearRangeEnd) {
                    this.elements.yearRangeEnd.value = value;
                }
            }
            this.currentFilters.yearRange.end = value;
            if (this.elements.yearEndDisplay) {
                this.elements.yearEndDisplay.textContent = value;
            }
        }
        
        this.updateFilterPreview();
    }
    
    /**
     * 更新筛选预览
     */
    updateFilterPreview() {
        // 计算符合条件的事件数量
        const events = dataManager.getAllEvents();
        const filteredCount = this.getFilteredEventsCount(events);
        
        // 更新应用按钮文本
        if (this.elements.applyBtn) {
            this.elements.applyBtn.textContent = `应用筛选 (${filteredCount} 个事件)`;
        }
    }
    
    /**
     * 获取筛选后的事件数量
     */
    getFilteredEventsCount(events) {
        return events.filter(event => this.matchesFilters(event)).length;
    }
    
    /**
     * 检查事件是否匹配筛选条件
     */
    matchesFilters(event) {
        // 检查事件类型
        if (!this.currentFilters.types.includes(event.type)) {
            return false;
        }
        
        // 检查年份范围
        if (event.year < this.currentFilters.yearRange.start || 
            event.year > this.currentFilters.yearRange.end) {
            return false;
        }
        
        // 检查重要性（如果有设置）
        if (this.currentFilters.importance.length > 0 && 
            !this.currentFilters.importance.includes(event.importance)) {
            return false;
        }
        
        // 检查搜索关键词（如果有）
        if (this.currentFilters.search && 
            !event.searchKeywords.includes(this.currentFilters.search.toLowerCase())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 应用筛选
     */
    applyFilters() {
        // 应用筛选到数据管理器
        dataManager.applyFilters(this.currentFilters);
        
        // 保存筛选设置
        this.saveFilters();
        
        // 关闭模态框
        this.close();
        
        // 触发筛选应用事件
        this.emit('filterApply', this.currentFilters);
        
        // 更新地图和时间轴
        this.updateVisualization();
        
        UTILS.log.debug('应用筛选:', this.currentFilters);
    }
    
    /**
     * 重置筛选
     */
    resetFilters() {
        // 重置到默认值
        this.currentFilters = {
            types: ['historical', 'article', 'poem'],
            yearRange: {
                start: 1893,
                end: 1976
            },
            importance: ['high', 'medium', 'low'],
            search: ''
        };
        
        // 更新UI
        this.updateFilterUI();
        
        // 应用重置后的筛选
        this.applyFilters();
        
        // 触发重置事件
        this.emit('filterReset');
        
        UTILS.log.debug('筛选已重置');
    }
    
    /**
     * 更新筛选UI
     */
    updateFilterUI() {
        // 更新事件类型复选框
        if (this.elements.typeCheckboxes) {
            this.elements.typeCheckboxes.forEach(checkbox => {
                checkbox.checked = this.currentFilters.types.includes(checkbox.value);
            });
        }
        
        // 更新年份范围滑块
        if (this.elements.yearRangeStart) {
            this.elements.yearRangeStart.value = this.currentFilters.yearRange.start;
        }
        if (this.elements.yearRangeEnd) {
            this.elements.yearRangeEnd.value = this.currentFilters.yearRange.end;
        }
        
        // 更新年份显示
        if (this.elements.yearStartDisplay) {
            this.elements.yearStartDisplay.textContent = this.currentFilters.yearRange.start;
        }
        if (this.elements.yearEndDisplay) {
            this.elements.yearEndDisplay.textContent = this.currentFilters.yearRange.end;
        }
        
        // 更新预览
        this.updateFilterPreview();
    }
    
    /**
     * 更新可视化组件
     */
    updateVisualization() {
        const filteredEvents = dataManager.getFilteredEvents();
        
        // 更新地图标记
        if (window.mapManager) {
            mapManager.clearMarkers();
            filteredEvents.forEach(event => {
                mapManager.addEventMarker(event);
            });
            mapManager.fitToMarkers();
        }
        
        // 更新时间轴
        if (window.timelineManager) {
            timelineManager.setEvents(filteredEvents);
        }
        
        // 显示筛选结果提示
        this.showFilterResult(filteredEvents.length);
    }
    
    /**
     * 显示筛选结果提示
     */
    showFilterResult(count) {
        const toast = document.createElement('div');
        toast.className = 'filter-toast';
        toast.innerHTML = `
            <i class="fas fa-filter"></i>
            <span>筛选完成，显示 ${count} 个事件</span>
        `;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * 设置搜索筛选
     */
    setSearchFilter(query) {
        this.currentFilters.search = query;
        this.applyFilters();
    }
    
    /**
     * 获取当前筛选条件
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }
    
    /**
     * 设置筛选条件
     */
    setFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.updateFilterUI();
    }
    
    /**
     * 检查是否有活动筛选
     */
    hasActiveFilters() {
        const defaultFilters = {
            types: ['historical', 'article', 'poem'],
            yearRange: { start: 1893, end: 1976 },
            importance: ['high', 'medium', 'low'],
            search: ''
        };
        
        return JSON.stringify(this.currentFilters) !== JSON.stringify(defaultFilters);
    }
    
    /**
     * 保存筛选设置
     */
    saveFilters() {
        UTILS.storage.set('filters', this.currentFilters);
    }
    
    /**
     * 加载保存的筛选设置
     */
    loadSavedFilters() {
        const savedFilters = UTILS.storage.get('filters');
        if (savedFilters) {
            this.currentFilters = { ...this.currentFilters, ...savedFilters };
            this.updateFilterUI();
        }
    }
    
    /**
     * 打开筛选模态框
     */
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.elements.modal?.classList.add('show');
        
        // 更新UI状态
        this.updateFilterUI();
        
        UTILS.log.debug('筛选模态框已打开');
    }
    
    /**
     * 关闭筛选模态框
     */
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.elements.modal?.classList.remove('show');
        
        UTILS.log.debug('筛选模态框已关闭');
    }
    
    /**
     * 获取筛选统计信息
     */
    getFilterStats() {
        const allEvents = dataManager.getAllEvents();
        const filteredEvents = dataManager.getFilteredEvents();
        
        return {
            total: allEvents.length,
            filtered: filteredEvents.length,
            percentage: Math.round((filteredEvents.length / allEvents.length) * 100),
            byType: this.getTypeStats(filteredEvents),
            byDecade: this.getDecadeStats(filteredEvents)
        };
    }
    
    /**
     * 获取类型统计
     */
    getTypeStats(events) {
        const stats = {};
        events.forEach(event => {
            stats[event.type] = (stats[event.type] || 0) + 1;
        });
        return stats;
    }
    
    /**
     * 获取年代统计
     */
    getDecadeStats(events) {
        const stats = {};
        events.forEach(event => {
            const decade = Math.floor(event.year / 10) * 10;
            stats[decade] = (stats[decade] || 0) + 1;
        });
        return stats;
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

// 创建全局筛选管理器实例
const filterManager = new FilterManager();
