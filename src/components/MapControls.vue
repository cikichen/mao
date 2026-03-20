<template>
    <div class="map-controls">
        <button class="control-btn" @click="$emit('reset')" title="复位地图">
            <i class="fas fa-compress-arrows-alt"></i>
        </button>
        <button class="control-btn" @click="$emit('zoomIn')" title="放大">
            <i class="fas fa-plus"></i>
        </button>
        <button class="control-btn" @click="$emit('zoomOut')" title="缩小">
            <i class="fas fa-minus"></i>
        </button>
        <button class="control-btn" @click="$emit('toggleFullscreen')" title="全屏">
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
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 400;
    padding: 10px;
    border-radius: 18px;
    background: rgba(18, 18, 18, 0.64);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.22);
}

.control-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
}

.control-btn:hover {
    background: rgba(211, 47, 47, 0.12);
    color: var(--color-primary);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 24px rgba(211, 47, 47, 0.16);
}

.control-btn:active {
    transform: translateY(0);
}

.control-btn i {
    font-size: 16px;
}

@media (max-width: 768px) {
    .map-controls {
        top: auto;
        bottom: 144px;
        right: 14px;
        padding: 8px;
        gap: 8px;
    }

    .control-btn {
        width: 40px;
        height: 40px;
    }
}
</style>
