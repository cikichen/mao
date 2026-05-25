<template>
    <header class="header-bar" role="banner">
        <div class="header-bar__brand">
            <div class="header-bar__emblem">
                <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="header-bar__text">
                <h1>毛主席生平足迹地图</h1>
                <p class="header-bar__sub">1893 — 1976</p>
            </div>
        </div>

        <div class="header-bar__stats">
            <span class="header-bar__stat">
                <i class="fas fa-route"></i>
                <strong>{{ totalEvents }}</strong> 历史节点
            </span>
            <span class="header-bar__stat" v-if="currentLocation">
                <i class="fas fa-location-dot"></i>
                {{ currentLocation }}
            </span>
        </div>

        <nav class="header-bar__actions" aria-label="工具栏">
            <button class="header-btn" @click="uiStore.openModal('search')" title="搜索 (Ctrl+K)">
                <i class="fas fa-search"></i>
                <span class="header-btn__label">搜索</span>
            </button>
            <button class="header-btn" @click="uiStore.openModal('filter')" title="筛选 (Ctrl+F)">
                <i class="fas fa-filter"></i>
                <span class="header-btn__label">筛选</span>
            </button>
            <button class="header-btn" @click="uiStore.openModal('settings')" title="设置地图服务及 Key">
                <i class="fas fa-cog"></i>
                <span class="header-btn__label">地图设置</span>
            </button>
            <button class="header-btn" @click="uiStore.openModal('info')" title="说明">
                <i class="fas fa-info-circle"></i>
            </button>
        </nav>
    </header>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../stores/ui';
import { useEventsStore } from '../stores/events';

const uiStore = useUIStore();
const eventsStore = useEventsStore();

const totalEvents = computed(() => eventsStore.filteredEvents.length || eventsStore.events.length || 0);
const currentLocation = computed(() => eventsStore.currentEvent?.location?.city || '');
</script>

<style scoped>
.header-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 12px 20px;
    max-width: 1200px;
    margin: 0 auto;
    border-radius: var(--radius-lg);
    background: rgba(18, 18, 18, 0.75);
    backdrop-filter: blur(16px) saturate(130%);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
}

.header-bar__brand {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

.header-bar__emblem {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.6), rgba(211, 47, 47, 0.2));
    box-shadow: var(--shadow-glow-primary);
    font-size: 16px;
}

.header-bar__text h1 {
    font-size: 20px;
    line-height: 1.2;
    white-space: nowrap;
}

.header-bar__sub {
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.15em;
    margin-top: 2px;
}

.header-bar__stats {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
}

.header-bar__stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-secondary);
    white-space: nowrap;
}

.header-bar__stat i {
    color: var(--color-secondary);
    font-size: 12px;
}

.header-bar__stat strong {
    color: var(--text-primary);
    font-weight: 600;
}

.header-bar__actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.header-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 13px;
    transition: all var(--transition-normal);
}

.header-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border-color: var(--border-color-hover);
}

.header-btn i {
    font-size: 14px;
}

/* Mobile */
@media (max-width: 768px) {
    .header-bar {
        padding: 10px 14px;
        gap: 12px;
        border-radius: var(--radius-md);
    }

    .header-bar__stats {
        display: none;
    }

    .header-bar__text h1 {
        font-size: 16px;
    }

    .header-btn__label {
        display: none;
    }

    .header-btn {
        padding: 8px 10px;
    }
}
</style>
