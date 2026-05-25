<template>
    <div class="app-layout" :style="shellStyle">
        <div class="app-header">
            <AppHeader />
        </div>

        <main class="app-main">
            <div class="app-map-area">
                <section class="app-map">
                    <MapContainer />
                </section>
                <div ref="timelineRailRef" class="app-timeline">
                    <TimelinePanel />
                </div>
            </div>
            <aside class="app-sidebar" v-show="uiStore.isSidebarOpen || !uiStore.isMobile">
                <SidebarPanel />
            </aside>
        </main>


        <!-- Modals -->
        <SearchModal v-if="uiStore.activeModal === 'search'" />
        <FilterModal v-if="uiStore.activeModal === 'filter'" />
        <InfoModal v-if="uiStore.activeModal === 'info'" />
        <SettingsModal v-if="uiStore.activeModal === 'settings'" />

        <!-- Loading Overlay -->
        <Transition name="fade">
            <div v-if="isLoading" class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2>正在加载历史足迹...</h2>
                    <p>让我们一起追随伟人的脚步</p>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, nextTick, ref } from 'vue';
import { useEventsStore } from './stores/events';
import { useUIStore } from './stores/ui';
import { usePlaybackStore } from './stores/playback';
import AppHeader from './components/AppHeader.vue';
import MapContainer from './components/MapContainer.vue';
import SidebarPanel from './components/SidebarPanel.vue';
import TimelinePanel from './components/TimelinePanel.vue';
import SearchModal from './components/modals/SearchModal.vue';
import FilterModal from './components/modals/FilterModal.vue';
import InfoModal from './components/modals/InfoModal.vue';
import SettingsModal from './components/modals/SettingsModal.vue';


const eventsStore = useEventsStore();
const uiStore = useUIStore();
const playbackStore = usePlaybackStore();
const isLoading = computed(() => eventsStore.status === 'loading' || eventsStore.status === 'idle');
const timelineRailRef = ref(null);
const timelineReserve = ref(160);

let timelineRailObserver = null;

const shellStyle = computed(() => ({
    '--shell-timeline-reserve': `${Math.max(Math.ceil(timelineReserve.value), 96)}px`
}));

function updateTimelineReserve() {
    if (!timelineRailRef.value) return;
    timelineReserve.value = timelineRailRef.value.getBoundingClientRect().height;
}

// --- 键盘快捷键 ---
function handleKeydown(e) {
    // 输入框内不拦截
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // 关闭弹窗
    if (e.key === 'Escape') {
        if (uiStore.activeModal) { uiStore.closeModal(); e.preventDefault(); return; }
        if (uiStore.isSidebarOpen && uiStore.isMobile) { uiStore.toggleSidebar(); e.preventDefault(); return; }
    }

    // 搜索 Ctrl+K 或 /
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        uiStore.openModal(uiStore.activeModal === 'search' ? null : 'search');
        return;
    }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        uiStore.openModal('search');
        return;
    }

    // 筛选 Ctrl+F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        uiStore.openModal(uiStore.activeModal === 'filter' ? null : 'filter');
        return;
    }

    // 播放/暂停 空格
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        playbackStore.togglePlay();
        return;
    }

    // 上/下一个事件
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (playbackStore.prevIndex()) {
            const ev = eventsStore.filteredEvents[playbackStore.currentIndex];
            if (ev) eventsStore.selectEvent(ev.id);
        }
        return;
    }
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (playbackStore.nextIndex()) {
            const ev = eventsStore.filteredEvents[playbackStore.currentIndex];
            if (ev) eventsStore.selectEvent(ev.id);
        }
        return;
    }
}

// --- 响应式 ---
function handleResize() {
    uiStore.setMobile(window.innerWidth < 768);
}

onMounted(async () => {
    await nextTick();
    updateTimelineReserve();

    if (typeof ResizeObserver !== 'undefined' && timelineRailRef.value) {
        timelineRailObserver = new ResizeObserver(updateTimelineReserve);
        timelineRailObserver.observe(timelineRailRef.value);
    }

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);

    await eventsStore.loadEvents();
    await nextTick();
    updateTimelineReserve();
});

onUnmounted(() => {
    timelineRailObserver?.disconnect();
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', handleResize);
});
</script>

<style>
.app-layout {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    padding: 16px 16px 0;
    gap: 16px;
    background:
        radial-gradient(circle at top, rgba(211, 47, 47, 0.18), transparent 30%),
        var(--bg-base);
}

.app-header {
    position: relative;
    z-index: var(--z-header);
    flex: 0 0 auto;
}

.app-main {
    position: relative;
    flex: 1;
    min-height: 0;
    z-index: var(--z-map);
    overflow: hidden;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: row;
    background: var(--bg-base);
}

.app-map-area {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
}

.app-map {
    position: absolute;
    inset: 0;
    z-index: 1;
}

.app-map > * {
    width: 100%;
    height: 100%;
}

.app-sidebar {
    width: 432px;
    height: 100%;
    flex-shrink: 0;
    z-index: var(--z-sidebar);
    padding: 16px;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
}

.app-sidebar > * {
    pointer-events: auto;
    width: 100%;
    height: 100%;
}

.app-timeline {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: min(800px, calc(100% - 40px));
    z-index: var(--z-timeline);
    pointer-events: none;
}

.app-timeline > * {
    pointer-events: auto;
}


/* Loading */
.loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 10, 0.92);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-content {
    text-align: center;
    animation: fadeInUp 0.6s ease;
}

.loading-content h2 {
    margin-bottom: 8px;
    font-family: var(--font-heading);
}

.loading-content p {
    color: var(--text-secondary);
}

.loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

/* Leaflet overrides */
.leaflet-tile {
    filter: brightness(85%) contrast(90%) saturate(80%);
    will-change: transform, filter;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

.leaflet-control-attribution {
    background: rgba(10, 10, 10, 0.6) !important;
    color: var(--text-muted) !important;
    font-size: 10px !important;
    backdrop-filter: blur(4px);
}

.leaflet-control-attribution a {
    color: var(--text-secondary) !important;
}

/* Responsive */
@media (max-width: 768px) {
    .app-layout {
        padding: 10px 10px 0;
        gap: 10px;
    }

    .app-main {
        border-radius: var(--radius-lg);
        display: block;
    }

    .app-map-area {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }

    .app-sidebar {
        position: absolute;
        right: 8px;
        left: 8px;
        top: 8px;
        bottom: auto;
        width: auto;
        height: auto;
        max-height: 50vh;
        padding: 0;
    }

    .app-sidebar > * {
        width: 100%;
        height: auto;
        max-height: 50vh;
    }

    .app-timeline {
        width: calc(100% - 20px);
        bottom: 10px;
    }
}

@media (max-width: 480px) {
    .app-layout {
        padding: 6px 6px 0;
        gap: 6px;
    }

    .app-sidebar {
        right: 4px;
        left: 4px;
        top: 4px;
    }

    .app-timeline {
        width: calc(100% - 12px);
        bottom: 6px;
    }
}
</style>
