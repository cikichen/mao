<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </header>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-surface-elevated);
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  transition: color var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  color: var(--text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
