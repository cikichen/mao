<template>
    <header class="header app-header">
        <div class="header-content app-header__content">
            <div class="app-header__brand">
                <div class="logo app-header__logo">
                    <i class="fas fa-map-marked-alt"></i>
                    <div class="app-header__title-group">
                        <h1>毛主席生平足迹地图</h1>
                        <p class="app-header__subtitle">
                            以交互地图与时间线回望 1893—1976 的关键足迹
                        </p>
                    </div>
                </div>

                <div class="app-header__meta">
                    <span class="app-header__badge">
                        <i class="fas fa-route"></i>
                        {{ totalEvents }} 个历史节点
                    </span>
                    <span class="app-header__badge app-header__badge--muted">
                        <i class="fas fa-location-dot"></i>
                        {{ currentLocation }}
                    </span>
                </div>
            </div>

            <nav class="nav-menu app-header__actions">
                <button class="nav-btn app-header__action-btn" @click="openModal('search')">
                    <i class="fas fa-search"></i>
                    <span>搜索</span>
                </button>
                <button class="nav-btn app-header__action-btn" @click="openModal('filter')">
                    <i class="fas fa-filter"></i>
                    <span>筛选</span>
                </button>
                <button class="nav-btn app-header__action-btn" @click="openModal('info')">
                    <i class="fas fa-info-circle"></i>
                    <span>说明</span>
                </button>
                <div class="map-selector-container">
                    <button class="nav-btn app-header__action-btn" @click="toggleMapDropdown">
                        <i class="fas fa-map"></i>
                        <span>{{ currentMapLabel }}</span>
                        <i
                            class="fas fa-chevron-down app-header__chevron"
                            :class="{ 'is-open': isMapDropdownOpen }"
                        ></i>
                    </button>
                    <div class="map-provider-dropdown" :class="{ active: isMapDropdownOpen }">
                        <div
                            class="map-provider-dropdown-item"
                            :class="{ selected: mapProvider === 'leaflet' }"
                            @click="selectMapProvider('leaflet')"
                        >
                            Leaflet (OpenStreetMap)
                        </div>
                        <div
                            class="map-provider-dropdown-item"
                            :class="{ selected: mapProvider === 'amap' }"
                            @click="selectMapProvider('amap')"
                        >
                            高德地图
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUIStore } from '../stores/ui';
import { useEventsStore } from '../stores/events';

const uiStore = useUIStore();
const eventsStore = useEventsStore();
const isMapDropdownOpen = ref(false);

const mapProvider = computed(() => uiStore.mapProvider);
const currentMapLabel = computed(() => (mapProvider.value === 'leaflet' ? 'Leaflet' : '高德地图'));
const totalEvents = computed(
    () => eventsStore.filteredEvents.length || eventsStore.events.length || 0
);
const currentLocation = computed(() => eventsStore.currentEvent?.location?.city || '中国');

function openModal(name) {
    uiStore.openModal(name);
}

function toggleMapDropdown() {
    isMapDropdownOpen.value = !isMapDropdownOpen.value;
}

function selectMapProvider(provider) {
    uiStore.setMapProvider(provider);
    isMapDropdownOpen.value = false;
}

const handleClickOutside = e => {
    if (!e.target.closest('.map-selector-container')) {
        isMapDropdownOpen.value = false;
    }
};

onMounted(() => {
    window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.app-header {
    position: relative;
    z-index: 1200;
    backdrop-filter: blur(var(--backdrop-blur, 8px));
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.92), rgba(45, 45, 45, 0.88)),
        var(--surface-color);
    border-bottom-color: rgba(255, 255, 255, 0.08);
}

.app-header__content {
    max-width: none;
    padding: 14px 24px;
    gap: 20px;
}

.app-header__brand {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
}

.app-header__logo {
    gap: 14px;
}

.app-header__logo i {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.18), rgba(255, 102, 89, 0.1));
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.app-header__title-group {
    min-width: 0;
}

.app-header__title-group h1 {
    font-size: 24px;
    line-height: 1.2;
}

.app-header__subtitle {
    margin-top: 4px;
    color: var(--text-muted);
    font-size: 13px;
}

.app-header__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.app-header__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    font-size: 12px;
}

.app-header__badge--muted {
    color: var(--text-secondary);
}

.app-header__actions {
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
}

.app-header__action-btn {
    min-height: 42px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
}

.app-header__chevron {
    font-size: 12px;
    transition: transform var(--transition-fast);
}

.app-header__chevron.is-open {
    transform: rotate(180deg);
}

@media (max-width: 1024px) {
    .app-header__content {
        flex-direction: column;
        align-items: stretch;
    }

    .app-header__actions {
        justify-content: flex-start;
    }
}

@media (max-width: 768px) {
    .app-header__content {
        padding: 12px 16px;
        gap: 14px;
    }

    .app-header__title-group h1 {
        font-size: 20px;
    }

    .app-header__subtitle {
        font-size: 12px;
    }

    .app-header__actions {
        gap: 8px;
    }

    .app-header__action-btn {
        min-width: 42px;
        padding: 8px 12px;
    }
}

@media (max-width: 480px) {
    .app-header__logo {
        align-items: flex-start;
    }

    .app-header__logo i {
        width: 40px;
        height: 40px;
    }

    .app-header__title-group h1 {
        font-size: 18px;
    }

    .app-header__meta {
        gap: 8px;
    }

    .app-header__badge {
        width: 100%;
        justify-content: center;
    }
}
</style>
