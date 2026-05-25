<template>
    <div class="map-wrap">
        <div ref="mapRef" class="map-canvas"></div>

        <MapControls
            @reset="resetView"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @toggleFullscreen="toggleFullscreen"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useEventsStore } from '../stores/events';
import { usePlaybackStore } from '../stores/playback';
import { useUIStore } from '../stores/ui';
import { useConfigStore } from '../stores/config';
import LeafletMapManager from '../../js/leaflet-map-manager.js';
import AMapManager from '../../js/amap-map-manager.js';
import MapControls from './MapControls.vue';

const mapRef = ref(null);
const mapManager = ref(null);
const isReady = ref(false);

const eventsStore = useEventsStore();
const playbackStore = usePlaybackStore();
const uiStore = useUIStore();
const configStore = useConfigStore();

// 动态载入高德 API 并处理安全配置
function loadAMapScript(key, securityJsCode) {
    return new Promise((resolve, reject) => {
        if (window.AMap) return resolve();
        
        // 挂载安全密钥
        if (securityJsCode) {
            window._AMapSecurityConfig = { securityJsCode };
        }
        
        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Scale,AMap.ToolBar,AMap.InfoWindow,AMap.CircleMarker,AMap.Polyline,AMap.OverlayGroup`;
        script.onload = () => resolve();
        script.onerror = (e) => reject(new Error('高德地图 SDK 加载失败，请检查密钥是否有效'));
        document.head.appendChild(script);
    });
}

async function initMap() {
    if (!mapRef.value) return;
    try {
        isReady.value = false;
        // 销毁上一次的地图管理器实例
        if (mapManager.value) {
            mapManager.value.destroy();
            mapManager.value = null;
        }

        const provider = uiStore.mapProvider;
        if (provider === 'leaflet') {
            mapManager.value = new LeafletMapManager();
            await mapManager.value.initMap(mapRef.value);
        } else if (provider === 'amap') {
            const key = configStore.amapKey;
            const securityJsCode = configStore.amapSecurityJsCode;
            if (!key) {
                uiStore.openModal('settings');
                alert('请先在「地图设置」中配置您的高德地图 API Key！');
                uiStore.setMapProvider('leaflet'); // 自动回退到 Leaflet
                return;
            }
            await loadAMapScript(key, securityJsCode);
            mapManager.value = new AMapManager();
            await mapManager.value.initMap(mapRef.value);
        }

        if (mapManager.value) {
            mapManager.value.on('markerClick', event => {
                eventsStore.selectEvent(event.id);
                if (!uiStore.isSidebarOpen) uiStore.toggleSidebar();
            });

            // 监听地图轨迹动画事件到达
            mapManager.value.on('eventReached', event => {
                const idx = eventsStore.filteredEvents.findIndex(e => e.id === event.id);
                if (idx >= 0) {
                    playbackStore.setCurrentIndex(idx);
                }
            });

            const events = eventsStore.filteredEvents;
            if (events.length) {
                mapManager.value.addEventMarkers(events);
                playbackStore.setTotalEvents(events.length);
                const current = eventsStore.currentEvent || events[0];
                if (current) {
                    mapManager.value.centerToEvent(current, 8, { animate: false });
                }
                
                // 绘制当前选中进度之前的静态轨迹
                const currentIdx = events.findIndex(e => e.id === eventsStore.selectedEventId);
                if (currentIdx >= 0) {
                    mapManager.value.drawStaticTrajectory(events.slice(0, currentIdx + 1));
                }
            }
        }
        isReady.value = true;
    } catch (err) {
        console.error('Map init failed:', err);
    }
}

watch(() => uiStore.mapProvider, () => {
    initMap();
});


// 事件列表变化时更新 markers
watch(
    () => eventsStore.filteredEvents,
    events => {
        if (!mapManager.value) return;
        mapManager.value.addEventMarkers(events);
        playbackStore.setTotalEvents(events.length);

        const idx = events.findIndex(e => e.id === eventsStore.selectedEventId);
        if (idx >= 0) {
            playbackStore.setCurrentIndex(idx);
        } else if (events.length) {
            eventsStore.selectEvent(events[0].id);
            playbackStore.setCurrentIndex(0);
        }
    }
);

// 选中事件时飞到位置 + 高亮 marker + 画轨迹
watch(
    () => eventsStore.selectedEventId,
    id => {
        const event = eventsStore.events.find(e => e.id === id);
        if (!event || !mapManager.value) return;

        const filteredIdx = eventsStore.filteredEvents.findIndex(e => e.id === id);
        if (filteredIdx !== -1) playbackStore.setCurrentIndex(filteredIdx);

        if (!playbackStore.isPlaying) {
            mapManager.value.centerToEvent(event, 12);
            mapManager.value.drawStaticTrajectory(
                filteredIdx >= 0 ? eventsStore.filteredEvents.slice(0, filteredIdx + 1) : []
            );
        }
    }
);

// 播放/暂停
watch(
    () => playbackStore.isPlaying,
    playing => {
        if (playing) playSequence();
        else mapManager.value?.hideAnimatedTrajectory?.();
    }
);

async function playSequence() {
    if (!playbackStore.isPlaying || !mapManager.value) return;

    const idx = playbackStore.currentIndex;
    const events = eventsStore.filteredEvents;

    if (idx >= events.length - 1) {
        playbackStore.setPlaying(false);
        return;
    }

    const curr = events[idx];
    const next = events[idx + 1];
    if (!curr || !next) {
        playbackStore.setPlaying(false);
        return;
    }

    playbackStore.setCurrentIndex(idx + 1);
    eventsStore.selectEvent(next.id);

    await mapManager.value.animateFootprint(curr, next);

    if (playbackStore.isPlaying) playSequence();
}

function resetView() {
    const ev = eventsStore.currentEvent;
    if (ev && mapManager.value) mapManager.value.centerToEvent(ev, 12);
}

function zoomIn() { mapManager.value?.zoomIn?.(); }
function zoomOut() { mapManager.value?.zoomOut?.(); }

function toggleFullscreen() {
    const el = mapRef.value?.closest('.app-main') || mapRef.value;
    if (!document.fullscreenElement) {
        el?.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}

onMounted(initMap);
onUnmounted(() => {
    mapManager.value?.destroy?.();
    mapManager.value = null;
});
</script>

<style scoped>
.map-wrap {
    position: relative;
    width: 100%;
    height: 100%;
}

.map-canvas {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top, rgba(211, 47, 47, 0.1), transparent 30%), var(--bg-base);
}
</style>
