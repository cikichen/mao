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
/* 全局布局样式 */
/* 全局布局样式 */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-body);
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  height: auto !important; /* Override main.css fixed height calculation */
}

.main-content > * {
  position: absolute;
  top: 0;
  bottom: 0;
}

/* MapContainer 填充整个空间 */
.main-content > :first-child {
  left: 0;
  right: 0;
  z-index: 1;
}

/* SidebarPanel 在右侧 - 悬浮式，不强制撑满高度 */
.main-content > :nth-child(2) {
  position: absolute;
  right: 24px;
  top: 88px; /* Header height (64px) + padding (24px) */
  bottom: auto; /* 让组件自己控制高度 */
  z-index: 10;
  height: auto;
  max-height: calc(100vh - 200px); /* 留出底部 Timeline 的空间 */
  pointer-events: none; /* 容器不阻挡点击 */
}

/* 让 Sidebar 内部内容可以点击 */
.main-content > :nth-child(2) > * {
  pointer-events: auto;
}

.timeline-wrapper {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  z-index: 100;
  pointer-events: none; /* 让点击穿透到地图，TimelinePanel 内部会恢复 pointer-events */
}

/* Loading Overlay 样式复用 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-body);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: var(--text-primary);
}

.loading-content {
  text-align: center;
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
  to { transform: rotate(360deg); }
}

/* Leaflet 高德地图深色模式滤镜 - 优化版 */
.amap-dark-mode .leaflet-tile {
  filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) grayscale(30%);
  -webkit-filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%) grayscale(30%);
}

/* 优化 Leaflet 控件样式以匹配深色主题 */
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
</style>
