<template>
    <div class="map-controls">
        <button class="mc-btn" @click="$emit('reset')" title="复位地图">
            <i class="fas fa-compress-arrows-alt"></i>
        </button>
        <button class="mc-btn" @click="$emit('zoomIn')" title="放大">
            <i class="fas fa-plus"></i>
        </button>
        <button class="mc-btn" @click="$emit('zoomOut')" title="缩小">
            <i class="fas fa-minus"></i>
        </button>
        <button class="mc-btn" @click="$emit('toggleFullscreen')" title="全屏">
            <i class="fas fa-expand"></i>
        </button>
    </div>
</template>

<script setup>
defineEmits(['reset', 'zoomIn', 'zoomOut', 'toggleFullscreen']);
</script>

<style scoped>
.map-controls {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: var(--z-controls);
    padding: 8px;
    border-radius: var(--radius-lg);
    background: rgba(18, 18, 18, 0.65);
    border: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-md);
}

.mc-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all var(--transition-normal);
}

.mc-btn:hover {
    background: rgba(211, 47, 47, 0.12);
    color: var(--color-primary);
    border-color: rgba(211, 47, 47, 0.3);
}

@media (max-width: 768px) {
    .map-controls {
        top: auto;
        bottom: 120px;
        right: 10px;
    }

    .mc-btn {
        width: 34px;
        height: 34px;
    }
}
</style>
