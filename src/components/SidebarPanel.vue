<template>
    <aside class="sidebar sidebar-panel" :class="{ open: uiStore.isSidebarOpen }">
        <div class="sidebar-header sidebar-panel__header">
            <div>
                <p class="sidebar-panel__eyebrow">历史足迹</p>
                <h3>事件详情</h3>
            </div>
            <button class="close-btn sidebar-panel__close" @click="uiStore.toggleSidebar">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="sidebar-content sidebar-panel__content" v-if="isReady">
            <div class="sidebar-panel__summary">
                <div class="sidebar-panel__summary-card">
                    <span class="sidebar-panel__summary-label">当前筛选</span>
                    <strong>{{ events.length }} 条事件</strong>
                </div>
                <div class="sidebar-panel__summary-card">
                    <span class="sidebar-panel__summary-label">当前位置</span>
                    <strong>{{ currentLocation }}</strong>
                </div>
            </div>

            <div class="events-list">
                <div
                    v-for="(event, index) in events"
                    :key="event.id"
                    class="event-card sidebar-panel__card"
                    :class="[event.type, { active: event.id === selectedId }]"
                    @click="selectEvent(event.id)"
                >
                    <div class="sidebar-panel__index">{{ String(index + 1).padStart(2, '0') }}</div>
                    <div class="event-header">
                        <div class="event-meta">
                            <div class="event-date">{{ formatDate(event.date) }}</div>
                            <div class="event-location">
                                <i class="fas fa-map-marker-alt"></i>
                                {{ event.location?.city || '未知地点' }}
                            </div>
                        </div>
                        <span class="event-type" :class="event.type">{{
                            getTypeName(event.type)
                        }}</span>
                    </div>
                    <div class="event-title">{{ event.title }}</div>
                    <p class="sidebar-panel__excerpt">{{ getExcerpt(event) }}</p>
                </div>
            </div>
        </div>

        <div v-else class="sidebar-loading sidebar-panel__loading">
            <div v-if="isLoading">
                <i class="fas fa-spinner"></i>
                <span>正在载入事件数据...</span>
            </div>
            <div v-else-if="hasError">加载失败，请稍后重试。</div>
            <div v-else>暂无数据</div>
        </div>
    </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useEventsStore } from '../stores/events';
import { useUIStore } from '../stores/ui';

const eventsStore = useEventsStore();
const uiStore = useUIStore();

const events = computed(() => eventsStore.filteredEvents);
const selectedId = computed(() => eventsStore.selectedEventId);
const isLoading = computed(() => eventsStore.status === 'loading');
const hasError = computed(() => eventsStore.status === 'error');
const isReady = computed(() => eventsStore.status === 'ready' && eventsStore.events.length > 0);
const currentLocation = computed(() => eventsStore.currentEvent?.location?.city || '未选择');

function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr;
}

function getTypeName(type) {
    const map = {
        historical: '历史事件',
        poem: '诗词作品',
        article: '文章著作'
    };
    return map[type] || type;
}

function getExcerpt(event) {
    const source = event.summary || event.description || event.content || '';
    if (!source) return '点击查看该节点并在地图中定位。';
    return source.length > 52 ? `${source.slice(0, 52)}…` : source;
}

function selectEvent(id) {
    eventsStore.selectEvent(id);
}
</script>

<style scoped>
.sidebar-panel {
    position: relative;
    height: min(100%, 720px);
    max-height: 100%;
    width: min(420px, calc(100vw - 32px));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(45, 45, 45, 0.95), rgba(26, 26, 26, 0.92));
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(var(--backdrop-blur-strong, 12px));
}

.sidebar-panel__header {
    background: rgba(255, 255, 255, 0.04);
}

.sidebar-panel__eyebrow {
    margin: 0 0 6px;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
}

.sidebar-panel__close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-panel__content {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.sidebar-panel__summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.sidebar-panel__summary-card {
    padding: 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-panel__summary-label {
    display: block;
    margin-bottom: 6px;
    color: var(--text-muted);
    font-size: 12px;
}

.sidebar-panel__card {
    margin-bottom: 0;
    padding-left: 52px;
    cursor: pointer;
}

.sidebar-panel__card.active {
    border-color: rgba(211, 47, 47, 0.45);
    box-shadow: 0 16px 36px rgba(211, 47, 47, 0.18);
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.14), rgba(61, 61, 61, 0.95));
}

.sidebar-panel__card.active::before {
    width: 10px;
}

.sidebar-panel__index {
    position: absolute;
    top: 18px;
    left: 18px;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.08);
}

.sidebar-panel__excerpt {
    margin-top: 10px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.6;
}

.sidebar-panel__loading {
    min-height: 220px;
}

.close-btn {
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 18px;
}

.close-btn:hover {
    color: var(--text-primary);
}

@media (max-width: 768px) {
    .sidebar-panel {
        width: calc(100vw - 20px);
        height: auto;
        max-height: calc(100vh - 180px);
        border-radius: 20px 20px 0 0;
    }

    .sidebar-panel__summary {
        grid-template-columns: 1fr;
    }
}
</style>
