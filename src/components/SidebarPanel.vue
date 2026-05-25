<template>
    <aside class="sidebar-panel" :class="{ open: uiStore.isSidebarOpen }">
        <div class="sidebar-panel__header">
            <div>
                <p class="sidebar-panel__eyebrow">历史足迹</p>
                <h3>事件详情</h3>
            </div>
            <button class="sidebar-panel__close" @click="uiStore.toggleSidebar" aria-label="关闭侧边栏">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="sidebar-panel__content" v-if="isReady">
            <!-- 当前事件详情卡 -->
            <section class="event-detail" v-if="currentEvent">
                <div class="event-detail__head">
                    <span class="tag" :class="`tag-${currentEvent.type}`">
                        {{ getTypeName(currentEvent.type) }}
                    </span>
                    <span class="event-detail__age" v-if="currentEvent.age !== undefined">
                        {{ currentEvent.age }}岁
                    </span>
                </div>

                <h4 class="event-detail__title">{{ currentEvent.title }}</h4>

                <div class="event-detail__meta">
                    <span><i class="fas fa-calendar"></i> {{ currentEvent.date }}</span>
                    <span v-if="locationText"><i class="fas fa-map-marker-alt"></i> {{ locationText }}</span>
                </div>

                <p class="event-detail__desc" v-if="currentEvent.description">
                    {{ currentEvent.description }}
                </p>

                <div class="event-detail__significance" v-if="currentEvent.significance">
                    <h5><i class="fas fa-star"></i> 历史意义</h5>
                    <p>{{ currentEvent.significance }}</p>
                </div>

                <!-- 文章/诗词内容 -->
                <div class="event-detail__content" :class="`content-${currentEvent.type}`" v-if="currentEvent.content">
                    <template v-if="typeof currentEvent.content === 'object'">
                        <h5 v-if="currentEvent.content.title">
                            <i class="fas fa-feather-pointed"></i> {{ currentEvent.content.title }}
                        </h5>
                        <blockquote v-if="currentEvent.content.text || currentEvent.content.excerpt">
                            {{ currentEvent.content.text || currentEvent.content.excerpt }}
                        </blockquote>
                        <p class="event-detail__content-bg" v-if="currentEvent.content.background">
                            {{ currentEvent.content.background }}
                        </p>
                    </template>
                    <template v-else-if="typeof currentEvent.content === 'string' && currentEvent.content.trim()">
                        <blockquote style="font-family: inherit; font-size: 13.5px; margin-bottom: 0;">
                            {{ currentEvent.content }}
                        </blockquote>
                    </template>
                </div>

                <!-- 标签 -->
                <div class="event-detail__tags" v-if="currentEvent.tags?.length">
                    <span class="event-detail__tag-item" v-for="tag in currentEvent.tags" :key="tag">
                        #{{ tag }}
                    </span>
                </div>
            </section>

            <!-- 路线目录 -->
            <section class="route-list">
                <div class="route-list__header">
                    <h4>路线目录</h4>
                    <span class="route-list__count">共 {{ events.length }} 站</span>
                </div>

                <ol class="route-list__items" ref="routeListRef">
                    <li v-for="(event, index) in events" :key="event.id">
                        <button
                            class="route-item"
                            :class="[event.type, { active: event.id === selectedId }]"
                            @click="selectEvent(event.id)"
                            :aria-current="event.id === selectedId ? 'true' : undefined"
                        >
                            <span class="route-item__num">{{ String(index + 1).padStart(2, '0') }}</span>
                            <span class="route-item__info">
                                <span class="route-item__name">{{ event.title }}</span>
                                <span class="route-item__meta">
                                    {{ event.date }} · {{ event.location?.city || '' }}
                                </span>
                            </span>
                            <span class="route-item__type-dot" :class="event.type"></span>
                        </button>
                    </li>
                </ol>
            </section>
        </div>

        <div v-else class="sidebar-panel__loading">
            <template v-if="isLoading">
                <div class="loading-spinner" style="width:32px;height:32px;margin:0 auto 12px;"></div>
                <span>正在载入事件数据...</span>
            </template>
            <template v-else-if="hasError">
                <span>加载失败，请刷新重试</span>
            </template>
            <template v-else>
                <span>暂无数据</span>
            </template>
        </div>
    </aside>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import { useEventsStore } from '../stores/events';
import { useUIStore } from '../stores/ui';

const eventsStore = useEventsStore();
const uiStore = useUIStore();
const routeListRef = ref(null);

const events = computed(() => eventsStore.filteredEvents);
const selectedId = computed(() => eventsStore.selectedEventId);
const isLoading = computed(() => eventsStore.status === 'loading');
const hasError = computed(() => eventsStore.status === 'error');
const isReady = computed(() => eventsStore.status === 'ready' && eventsStore.events.length > 0);
const currentEvent = computed(() => eventsStore.currentEvent);

const locationText = computed(() => {
    const loc = currentEvent.value?.location;
    if (!loc) return '';
    return [loc.province, loc.city, loc.detail].filter(Boolean).join(' ');
});

const typeNames = { historical: '历史事件', article: '重要文章', poem: '诗词作品' };
function getTypeName(type) { return typeNames[type] || type; }

function selectEvent(id) { eventsStore.selectEvent(id); }

// 自动滚动到选中项
watch(selectedId, async () => {
    await nextTick();
    const active = routeListRef.value?.querySelector('.route-item.active');
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
</script>

<style scoped>
.sidebar-panel {
    position: relative;
    height: min(100%, 720px);
    max-height: 100%;
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    overflow: hidden;
    background: rgba(20, 20, 20, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.3s ease;
}

.sidebar-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
}

.sidebar-panel__eyebrow {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 4px;
}

.sidebar-panel__header h3 {
    font-size: 16px;
}

.sidebar-panel__close {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: all var(--transition-fast);
}

.sidebar-panel__close:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.08);
}

.sidebar-panel__content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Event Detail Card */
.event-detail {
    padding: 14px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.12), rgba(30, 30, 30, 0.95));
    border: 1px solid rgba(211, 47, 47, 0.2);
}

.event-detail__head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.event-detail__age {
    font-size: 11px;
    color: var(--text-muted);
}

.event-detail__title {
    font-size: 16px;
    line-height: 1.35;
    margin-bottom: 8px;
    font-family: var(--font-heading);
}

.event-detail__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 10px;
}

.event-detail__meta i {
    margin-right: 4px;
    color: var(--color-secondary);
}

.event-detail__desc {
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--text-secondary);
    margin-bottom: 10px;
}

.event-detail__significance {
    padding: 10px;
    border-radius: var(--radius-md);
    background: rgba(255, 215, 0, 0.06);
    border: 1px solid rgba(255, 215, 0, 0.12);
    margin-bottom: 10px;
}

.event-detail__significance h5 {
    font-size: 11px;
    color: var(--color-secondary);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.event-detail__significance p {
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--text-secondary);
}

.event-detail__content {
    padding: 10px;
    border-radius: var(--radius-md);
    margin-bottom: 10px;
}

.event-detail__content.content-historical {
    background: rgba(211, 47, 47, 0.05);
    border: 1px solid rgba(211, 47, 47, 0.12);
}

.event-detail__content.content-historical blockquote {
    border-left-color: var(--color-primary);
}

.event-detail__content.content-article {
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.12);
}

.event-detail__content.content-article blockquote {
    border-left-color: var(--color-secondary);
}

.event-detail__content.content-poem {
    background: rgba(255, 138, 101, 0.05);
    border: 1px solid rgba(255, 138, 101, 0.12);
}

.event-detail__content.content-poem blockquote {
    border-left-color: var(--color-poem);
}

.event-detail__content h5 {
    font-size: 12px;
    color: var(--color-poem);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.event-detail__content blockquote {
    font-family: var(--font-heading);
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-primary);
    padding-left: 12px;
    border-left: 3px solid var(--color-poem);
    margin-bottom: 8px;
    white-space: pre-line;
}

.event-detail__content-bg {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.6;
}

.event-detail__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.event-detail__tag-item {
    font-size: 11px;
    color: var(--text-muted);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.04);
}

/* Route List */
.route-list__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.route-list__header h4 {
    font-size: 14px;
}

.route-list__count {
    font-size: 12px;
    color: var(--text-muted);
}

.route-list__items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.route-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.route-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--border-color-hover);
}

.route-item.active {
    background: rgba(211, 47, 47, 0.12);
    border-color: rgba(211, 47, 47, 0.3);
}

.route-item__num {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.06);
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
}

.route-item.active .route-item__num {
    background: rgba(211, 47, 47, 0.3);
    color: var(--text-primary);
}

.route-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.route-item__name {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.route-item__meta {
    font-size: 11px;
    color: var(--text-muted);
}

.route-item__type-dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
}

.route-item__type-dot.historical { background: var(--color-historical); }
.route-item__type-dot.article { background: var(--color-article); }
.route-item__type-dot.poem { background: var(--color-poem); }

.sidebar-panel__loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: var(--text-muted);
    font-size: 13px;
}

/* Mobile: bottom drawer */
@media (max-width: 768px) {
    .sidebar-panel {
        width: 100%;
        height: auto;
        max-height: 50vh;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        animation: slideInUp 0.3s ease;
    }

    .event-detail__title {
        font-size: 16px;
    }

    .event-detail__content blockquote {
        font-size: 13px;
    }
}
</style>
