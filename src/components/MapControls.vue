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
  z-index: 400; /* Ensure it's above the map */
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.control-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.control-btn i {
  font-size: 16px;
}
</style>
