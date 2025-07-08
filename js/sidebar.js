/**
 * 侧边栏管理模块
 * 负责事件详情面板的显示和交互
 */

class SidebarManager {
    constructor() {
        this.isOpen = false;
        this.currentEvent = null;
        this.expandedContent = new Set(); // 记录展开的内容
        
        // DOM元素
        this.elements = {
            sidebar: null,
            content: null,
            header: null,
            closeBtn: null
        };
        
        // 事件监听器
        this.listeners = {
            open: [],
            close: [],
            contentExpand: []
        };
    }
    
    /**
     * 初始化侧边栏
     */
    init() {
        this.initElements();
        this.bindEvents();
        
        UTILS.log.info('侧边栏初始化完成');
    }
    
    /**
     * 初始化DOM元素
     */
    initElements() {
        this.elements.sidebar = document.getElementById('sidebar');
        this.elements.content = document.getElementById('sidebarContent');
        this.elements.header = this.elements.sidebar?.querySelector('.sidebar-header');
        this.elements.closeBtn = document.getElementById('closeSidebar');

        // 检查必要元素
        if (!this.elements.sidebar) {
            UTILS.log.error('侧边栏元素未找到');
        } else {
            UTILS.log.debug('侧边栏元素初始化成功');
        }

        if (!this.elements.content) {
            UTILS.log.error('侧边栏内容元素未找到');
        } else {
            UTILS.log.debug('侧边栏内容元素初始化成功');
        }
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 关闭按钮
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => {
                this.close();
            });
        }
        
        // 点击遮罩关闭（移动端）
        if (ENVIRONMENT.isMobile) {
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.elements.sidebar.contains(e.target)) {
                    this.close();
                }
            });
        }
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    /**
     * 显示事件详情
     */
    showEvent(event) {
        if (!event) {
            UTILS.log.warn('showEvent: 事件数据为空');
            return;
        }

        UTILS.log.info('侧边栏显示事件:', event.title);

        try {
            this.currentEvent = event;
            this.renderEventContent(event);
            this.open();

            UTILS.log.debug('事件详情显示成功');
        } catch (error) {
            UTILS.log.error('显示事件详情失败:', error);
        }
    }
    
    /**
     * 显示多个事件（同一地点）
     */
    showEvents(events) {
        if (!events || events.length === 0) return;
        
        if (events.length === 1) {
            this.showEvent(events[0]);
            return;
        }
        
        this.renderEventsContent(events);
        this.open();
        
        UTILS.log.debug(`显示 ${events.length} 个事件`);
    }
    
    /**
     * 渲染单个事件内容
     */
    renderEventContent(event) {
        if (!this.elements.content) return;
        
        const content = this.createEventCard(event);
        this.elements.content.innerHTML = content;
        
        // 绑定交互事件
        this.bindContentEvents();
    }
    
    /**
     * 渲染多个事件内容
     */
    renderEventsContent(events) {
        if (!this.elements.content) return;
        
        const location = events[0].location;
        const locationName = `${location.province} ${location.city}`;
        
        let content = `
            <div class="events-header">
                <h3>${locationName}</h3>
                <span class="events-count">${events.length} 个事件</span>
            </div>
            <div class="events-list">
        `;
        
        events.forEach(event => {
            content += this.createEventCard(event);
        });
        
        content += '</div>';
        
        this.elements.content.innerHTML = content;
        this.bindContentEvents();
    }
    
    /**
     * 创建事件卡片
     */
    createEventCard(event) {
        const typeNames = {
            historical: '历史事件',
            article: '重要文章',
            poem: '诗词作品'
        };
        
        const importanceNames = {
            high: '重要',
            medium: '一般',
            low: '次要'
        };
        
        return `
            <div class="event-card ${event.type}" data-event-id="${event.id}">
                <div class="event-header">
                    <div class="event-meta">
                        <div class="event-date">${UTILS.formatDate(event.date)}</div>
                        <div class="event-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${event.location.province} ${event.location.city}
                            ${event.location.detail ? ` · ${event.location.detail}` : ''}
                        </div>
                    </div>
                    <div class="event-type ${event.type}">
                        ${typeNames[event.type]}
                    </div>
                </div>
                
                <h4 class="event-title">${event.title}</h4>
                
                ${event.images && event.images.length > 0 ? `
                    <div class="event-image-container">
                        <img src="${event.images[0]}"
                             alt="${event.title}"
                             class="event-image"
                             onerror="this.style.display='none'; this.parentElement.style.display='none';"
                             loading="lazy">
                    </div>
                ` : ''}

                <p class="event-description">${event.description}</p>
                
                ${this.renderEventContentDetails(event)}
                
                ${this.renderEventTags(event)}
                
                ${this.renderEventActions(event)}
            </div>
        `;
    }
    
    /**
     * 渲染事件内容（文章/诗词）
     */
    renderEventContentDetails(event) {
        if (!event.content) return '';
        
        const isExpanded = this.expandedContent.has(event.id);
        const contentId = `content-${event.id}`;
        
        let content = `
            <div class="event-content">
                <div class="content-header">
                    <span class="content-title">
                        ${event.content.title || (event.type === 'poem' ? '诗词全文' : '文章内容')}
                    </span>
                    <button class="expand-btn" data-content-id="${contentId}">
                        <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}"></i>
                    </button>
                </div>
                <div class="content-text ${event.type} ${isExpanded ? 'expanded' : ''}" id="${contentId}">
        `;
        
        if (event.type === 'poem' && event.content.text) {
            content += `<div class="poem-text">${event.content.text}</div>`;
        } else if (event.content.excerpt) {
            content += `<div class="article-excerpt">${event.content.excerpt}</div>`;
        }
        
        if (event.content.background) {
            content += `<div class="content-background">
                <h5>创作背景</h5>
                <p>${event.content.background}</p>
            </div>`;
        }
        
        if (event.content.significance) {
            content += `<div class="content-significance">
                <h5>历史意义</h5>
                <p>${event.content.significance}</p>
            </div>`;
        }
        
        if (event.content.artistic_value) {
            content += `<div class="content-artistic">
                <h5>艺术价值</h5>
                <p>${event.content.artistic_value}</p>
            </div>`;
        }
        
        content += '</div></div>';
        
        return content;
    }
    
    /**
     * 渲染事件标签
     */
    renderEventTags(event) {
        if (!event.tags || event.tags.length === 0) return '';
        
        let tagsHtml = '<div class="event-tags">';
        event.tags.forEach(tag => {
            tagsHtml += `<span class="event-tag">${tag}</span>`;
        });
        tagsHtml += '</div>';
        
        return tagsHtml;
    }
    
    /**
     * 渲染事件操作按钮
     */
    renderEventActions(event) {
        return `
            <div class="event-actions">
                <button class="action-btn" data-action="locate" data-event-id="${event.id}">
                    <i class="fas fa-crosshairs"></i>
                    定位
                </button>
                <button class="action-btn" data-action="share" data-event-id="${event.id}">
                    <i class="fas fa-share-alt"></i>
                    分享
                </button>
                <button class="action-btn" data-action="favorite" data-event-id="${event.id}">
                    <i class="fas fa-heart"></i>
                    收藏
                </button>
            </div>
        `;
    }
    
    /**
     * 绑定内容交互事件
     */
    bindContentEvents() {
        if (!this.elements.content) return;
        
        // 展开/收起内容
        this.elements.content.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleContent(e.target.closest('.expand-btn'));
            });
        });
        
        // 操作按钮
        this.elements.content.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAction(e.target.closest('.action-btn'));
            });
        });
        
        // 标签点击
        this.elements.content.querySelectorAll('.event-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.handleTagClick(e.target.textContent);
            });
        });
    }
    
    /**
     * 切换内容展开状态
     */
    toggleContent(btn) {
        const contentId = btn.dataset.contentId;
        const content = document.getElementById(contentId);
        const icon = btn.querySelector('i');
        const eventId = btn.closest('.event-card').dataset.eventId;
        
        if (!content) return;
        
        const isExpanded = content.classList.contains('expanded');
        
        if (isExpanded) {
            content.classList.remove('expanded');
            icon.className = 'fas fa-chevron-down';
            this.expandedContent.delete(eventId);
        } else {
            content.classList.add('expanded');
            icon.className = 'fas fa-chevron-up';
            this.expandedContent.add(eventId);
        }
        
        this.emit('contentExpand', eventId, !isExpanded);
    }
    
    /**
     * 处理操作按钮点击
     */
    handleAction(btn) {
        const action = btn.dataset.action;
        const eventId = btn.dataset.eventId;
        
        switch (action) {
            case 'locate':
                this.locateEvent(eventId);
                break;
            case 'share':
                this.shareEvent(eventId);
                break;
            case 'favorite':
                this.toggleFavorite(eventId);
                break;
        }
    }
    
    /**
     * 定位事件
     */
    locateEvent(eventId) {
        if (window.mapManager) {
            mapManager.centerToEvent(eventId, 12);
        }
        
        // 移动端关闭侧边栏
        if (ENVIRONMENT.isMobile) {
            this.close();
        }
    }
    
    /**
     * 分享事件
     */
    shareEvent(eventId) {
        const event = dataManager.getEventById(eventId);
        if (!event) return;
        
        const shareData = {
            title: `${event.title} - 毛主席生平足迹地图`,
            text: event.description,
            url: `${window.location.origin}${window.location.pathname}?event=${eventId}`
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showToast('链接已复制到剪贴板');
            });
        }
    }
    
    /**
     * 切换收藏状态
     */
    toggleFavorite(eventId) {
        const favorites = UTILS.storage.get('favorites') || [];
        const index = favorites.indexOf(eventId);
        const btn = document.querySelector(`[data-action="favorite"][data-event-id="${eventId}"]`);
        
        if (index > -1) {
            favorites.splice(index, 1);
            btn.classList.remove('active');
            this.showToast('已取消收藏');
        } else {
            favorites.push(eventId);
            btn.classList.add('active');
            this.showToast('已添加到收藏');
        }
        
        UTILS.storage.set('favorites', favorites);
    }
    
    /**
     * 处理标签点击
     */
    handleTagClick(tag) {
        // 触发搜索
        if (window.searchManager) {
            searchManager.search(tag);
        }
        this.close();
    }
    
    /**
     * 显示提示消息
     */
    showToast(message) {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
    }
    
    /**
     * 打开侧边栏
     */
    open() {
        if (this.isOpen) {
            UTILS.log.debug('侧边栏已经打开');
            return;
        }

        UTILS.log.debug('正在打开侧边栏...');

        if (!this.elements.sidebar) {
            UTILS.log.error('无法打开侧边栏：元素未找到');
            return;
        }

        this.isOpen = true;
        this.elements.sidebar.classList.add('open');

        // 移动端添加遮罩
        if (ENVIRONMENT.isMobile) {
            document.body.classList.add('sidebar-open');
        }

        this.emit('open');
        UTILS.log.info('侧边栏已打开');
    }
    
    /**
     * 关闭侧边栏
     */
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.elements.sidebar?.classList.remove('open');
        
        // 移动端移除遮罩
        if (ENVIRONMENT.isMobile) {
            document.body.classList.remove('sidebar-open');
        }
        
        this.emit('close');
        UTILS.log.debug('侧边栏已关闭');
    }
    
    /**
     * 切换侧边栏状态
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * 清空内容
     */
    clear() {
        if (this.elements.content) {
            this.elements.content.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-hand-point-left"></i>
                    <p>点击地图上的标记点查看详细信息</p>
                </div>
            `;
        }
        this.currentEvent = null;
        this.expandedContent.clear();
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        if (this.elements.content) {
            this.elements.content.innerHTML = `
                <div class="sidebar-loading">
                    <i class="fas fa-spinner"></i>
                    <span>加载中...</span>
                </div>
            `;
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

// 创建全局侧边栏管理器实例
const sidebarManager = new SidebarManager();
