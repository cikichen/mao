<template>
    <div class="app-layout">
        <AppHeader />

        <main class="main-content">
            <MapContainer />
            <SidebarPanel />
        </main>

        <div class="timeline-wrapper">
            <TimelinePanel />
        </div>

        <!-- Modals -->
        <SearchModal v-if="uiStore.activeModal === 'search'" />
        <FilterModal v-if="uiStore.activeModal === 'filter'" />
        <InfoModal v-if="uiStore.activeModal === 'info'" />

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h2>正在加载历史足迹...</h2>
                <p>让我们一起追随伟人的脚步</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useEventsStore } from './stores/events';
import { useUIStore } from './stores/ui';
import AppHeader from './components/AppHeader.vue';
import MapContainer from './components/MapContainer.vue';
import SidebarPanel from './components/SidebarPanel.vue';
import TimelinePanel from './components/TimelinePanel.vue';
import SearchModal from './components/modals/SearchModal.vue';
import FilterModal from './components/modals/FilterModal.vue';
import InfoModal from './components/modals/InfoModal.vue';

const eventsStore = useEventsStore();
const uiStore = useUIStore();
const isLoading = computed(() => eventsStore.status === 'loading' || eventsStore.status === 'idle');

onMounted(async () => {
    await eventsStore.loadEvents();
});
</script>

<style>
.app-layout {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: radial-gradient(circle at top, rgba(211, 47, 47, 0.18), transparent 30%),
        linear-gradient(180deg, rgba(10, 10, 10, 0.98), rgba(20, 20, 20, 1));
}

.app-layout::before,
.app-layout::after {
    content: '';
    position: absolute;
    inset: auto;
    pointer-events: none;
    z-index: 0;
}

.app-layout::before {
    top: 88px;
    left: -120px;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(211, 47, 47, 0.14), transparent 68%);
    filter: blur(10px);
}

.app-layout::after {
    right: -80px;
    bottom: 60px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.12), transparent 70%);
    filter: blur(18px);
}

.main-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    min-height: 0;
    height: auto !important;
    z-index: 1;
}

.main-content > * {
    position: absolute;
    top: 0;
    bottom: 0;
}

.main-content > :first-child {
    left: 0;
    right: 0;
    z-index: 1;
}

.main-content > :nth-child(2) {
    position: absolute;
    right: 24px;
    top: 96px;
    bottom: auto;
    z-index: 10;
    height: auto;
    max-height: calc(100vh - 220px);
    pointer-events: none;
}

.main-content > :nth-child(2) > * {
    pointer-events: auto;
}

.timeline-wrapper {
    position: absolute;
    bottom: 26px;
    left: 50%;
    transform: translateX(-50%);
    width: min(920px, calc(100vw - 48px));
    z-index: 100;
    pointer-events: none;
}

.loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 10, 0.92);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: var(--text-primary);
}

.loading-content {
    text-align: center;
}

.loading-content h2 {
    margin-bottom: 8px;
}

.loading-content p {
    color: var(--text-secondary);
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s ease-in-out infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.amap-dark-mode .leaflet-tile {
    filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) grayscale(30%);
    -webkit-filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) grayscale(30%);
}

.leaflet-bar a {
    background-color: var(--bg-surface) !important;
    color: var(--text-primary) !important;
    border-bottom: 1px solid var(--border-color) !important;
}

.leaflet-bar a:hover {
    background-color: var(--bg-surface-hover) !important;
}

.leaflet-control-attribution {
    background: var(--bg-glass) !important;
    color: var(--text-muted) !important;
    backdrop-filter: blur(4px);
}

.leaflet-control-attribution a {
    color: var(--color-primary-light) !important;
}

@media (max-width: 1024px) {
    .main-content > :nth-child(2) {
        top: 108px;
        right: 20px;
        max-height: calc(100vh - 240px);
    }
}

@media (max-width: 768px) {
    .main-content > :nth-child(2) {
        left: 10px;
        right: 10px;
        top: auto;
        bottom: 126px;
        max-height: min(420px, calc(100vh - 240px));
    }

    .timeline-wrapper {
        bottom: 12px;
        width: calc(100vw - 20px);
    }
}
</style>
