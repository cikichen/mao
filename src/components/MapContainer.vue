<template>
    <div class="map-wrapper">
        <div ref="mapRef" class="map-instance"></div>

        <div class="map-wrapper__overlay map-wrapper__overlay--top-left">
            <div class="map-wrapper__panel">
                <span class="map-wrapper__label">当前节点</span>
                <strong>{{ currentTitle }}</strong>
                <p>{{ currentLocation }}</p>
            </div>
            <div class="map-wrapper__panel map-wrapper__panel--compact">
                <span class="map-wrapper__label">地图源</span>
                <strong>{{ mapProviderLabel }}</strong>
            </div>
        </div>

        <MapControls
            @reset="resetView"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @toggleFullscreen="toggleFullscreen"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { useEventsStore } from '../stores/events';
import { usePlaybackStore } from '../stores/playback';
import { useUIStore } from '../stores/ui';
import { useConfigStore } from '../stores/config';
import LeafletMapManager from '../../js/leaflet-map-manager.js';
import AMapManager from '../../js/amap-map-manager.js';
import MapControls from './MapControls.vue';

const mapRef = ref(null);
const mapManager = ref(null);
const isMounted = ref(false);
const eventsStore = useEventsStore();
const playbackStore = usePlaybackStore();
const uiStore = useUIStore();
const configStore = useConfigStore();

const currentTitle = computed(() => eventsStore.currentEvent?.title || '等待事件载入');
const currentLocation = computed(() => eventsStore.currentEvent?.location?.city || '中国');
const mapProviderLabel = computed(() => (uiStore.mapProvider === 'amap' ? '高德地图' : 'Leaflet'));

const loadAMapAPI = () => {
    return new Promise((resolve, reject) => {
        if (window.AMap) {
            resolve();
            return;
        }

        const key = configStore.amapKey;
        if (!key || key === 'YOUR_AMAP_API_KEY_HERE') {
            console.warn('AMap API Key 未配置，将无法加载高德地图');
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
        script.onerror = reject;
        script.onload = () => {
            resolve();
        };
        document.head.appendChild(script);
    });
};

async function destroyMap() {
    if (mapManager.value?.map) {
        if (typeof mapManager.value.map.remove === 'function') {
            mapManager.value.map.remove();
        } else if (typeof mapManager.value.map.destroy === 'function') {
            mapManager.value.map.destroy();
        }
    }

    mapManager.value = null;
    if (mapRef.value) {
        mapRef.value.innerHTML = '';
        if (mapRef.value._leaflet_id) {
            mapRef.value._leaflet_id = null;
        }
    }
}

async function initMapForProvider(provider) {
    try {
        if (playbackStore.isPlaying) {
            playbackStore.setPlaying(false);
        }
        await destroyMap();
        if (!mapRef.value) return;

        if (provider === 'amap') {
            await loadAMapAPI();
            mapManager.value = new AMapManager();
        } else {
            mapManager.value = new LeafletMapManager();
        }
        await mapManager.value.initMap(mapRef.value);

        mapManager.value.on('markerClick', event => {
            eventsStore.selectEvent(event.id);
        });

        const events = eventsStore.filteredEvents;
        mapManager.value.addEventMarkers(events);
        playbackStore.setTotalEvents(events.length);

        const current = eventsStore.currentEvent || events[0];
        if (current) {
            mapManager.value.centerToEvent(current, 12, { animate: false });
        }
    } catch (error) {
        console.error('Failed to initialize map:', error);
    }
}

onMounted(async () => {
    isMounted.value = true;
    await initMapForProvider(uiStore.mapProvider);
});

watch(
    () => uiStore.mapProvider,
    (provider, prev) => {
        if (!isMounted.value || provider === prev) return;
        initMapForProvider(provider);
    }
);

watch(
    () => eventsStore.filteredEvents,
    newEvents => {
        if (mapManager.value) {
            mapManager.value.addEventMarkers(newEvents);
        }
        playbackStore.setTotalEvents(newEvents.length);

        const selectedId = eventsStore.selectedEventId;
        const selectedIndex = newEvents.findIndex(event => event.id === selectedId);
        if (selectedIndex >= 0) {
            playbackStore.setCurrentIndex(selectedIndex);
        } else if (newEvents.length > 0) {
            eventsStore.selectEvent(newEvents[0].id);
            playbackStore.setCurrentIndex(0);
        } else {
            playbackStore.setCurrentIndex(0);
        }
    }
);

watch(
    () => eventsStore.selectedEventId,
    newId => {
        const event = eventsStore.events.find(e => e.id === newId);
        if (event && mapManager.value) {
            const filteredIndex = eventsStore.filteredEvents.findIndex(e => e.id === newId);
            if (filteredIndex !== -1) {
                playbackStore.setCurrentIndex(filteredIndex);
            }

            if (!playbackStore.isPlaying) {
                mapManager.value.centerToEvent(event, 12);
                mapManager.value.drawStaticTrajectory(
                    filteredIndex >= 0 ? eventsStore.filteredEvents.slice(0, filteredIndex + 1) : []
                );
            }
        }
    }
);

watch(
    () => playbackStore.isPlaying,
    isPlaying => {
        if (isPlaying) {
            playSequence();
        } else {
            mapManager.value?.hideAnimatedTrajectory?.();
        }
    }
);

async function playSequence() {
    if (!playbackStore.isPlaying || !mapManager.value) return;

    const currentIndex = playbackStore.currentIndex;
    const events = eventsStore.filteredEvents;

    if (currentIndex >= events.length - 1) {
        playbackStore.setPlaying(false);
        return;
    }

    const currentEvent = events[currentIndex];
    const nextEvent = events[currentIndex + 1];
    if (!currentEvent || !nextEvent) {
        playbackStore.setPlaying(false);
        return;
    }

    if (playbackStore.isPlaying) {
        playbackStore.setCurrentIndex(currentIndex + 1);
        eventsStore.selectEvent(nextEvent.id);
    }

    const duration = 2000 / Math.max(playbackStore.playSpeed || 1, 0.5);
    await mapManager.value.animateFootprint(currentEvent, nextEvent, duration);

    if (playbackStore.isPlaying) {
        playSequence();
    }
}

function resetView() {
    const current = eventsStore.currentEvent;
    if (current && mapManager.value) {
        mapManager.value.centerToEvent(current, 12);
    }
}

function zoomIn() {
    if (mapManager.value?.map) {
        mapManager.value.map.zoomIn();
    }
}

function zoomOut() {
    if (mapManager.value?.map) {
        mapManager.value.map.zoomOut();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

onUnmounted(() => {
    destroyMap();
});
</script>

<style scoped>
.map-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    isolation: isolate;
}

.map-instance {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top, rgba(211, 47, 47, 0.14), transparent 28%), #1a1a1a;
}

.map-wrapper__overlay {
    position: absolute;
    z-index: 350;
    display: flex;
    gap: 12px;
    pointer-events: none;
}

.map-wrapper__overlay--top-left {
    top: 24px;
    left: 24px;
    max-width: min(520px, calc(100vw - 72px));
}

.map-wrapper__panel {
    min-width: 180px;
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(18, 18, 18, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    backdrop-filter: blur(var(--backdrop-blur, 8px));
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
}

.map-wrapper__panel--compact {
    min-width: auto;
}

.map-wrapper__label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
}

.map-wrapper__panel strong {
    display: block;
    font-size: 15px;
    line-height: 1.4;
}

.map-wrapper__panel p {
    margin-top: 4px;
    color: var(--text-secondary);
    font-size: 13px;
}

@media (max-width: 768px) {
    .map-wrapper__overlay--top-left {
        top: 14px;
        left: 14px;
        right: 14px;
        flex-direction: column;
        max-width: none;
    }

    .map-wrapper__panel {
        min-width: 0;
    }
}
</style>
