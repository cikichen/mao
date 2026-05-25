<template>
    <Teleport to="body">
        <div class="modal-mask" @click.self="$emit('close')">
            <div class="modal-box" :class="size">
                <header class="modal-box__header">
                    <h3>{{ title }}</h3>
                    <button class="modal-box__close" @click="$emit('close')" aria-label="关闭">
                        <i class="fas fa-times"></i>
                    </button>
                </header>
                <div class="modal-box__body">
                    <slot />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
defineProps({
    title: { type: String, default: '' },
    size: { type: String, default: '' }
});
defineEmits(['close']);
</script>

<style scoped>
.modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    animation: fadeIn 0.2s ease;
}

.modal-box {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    width: 90%;
    max-width: 520px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
    animation: fadeInUp 0.25s ease;
}

.modal-box.large {
    max-width: 680px;
}

.modal-box__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
}

.modal-box__header h3 {
    font-size: 17px;
}

.modal-box__close {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: all var(--transition-fast);
}

.modal-box__close:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.08);
}

.modal-box__body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

@media (max-width: 768px) {
    .modal-mask {
        align-items: flex-end;
    }

    .modal-box {
        width: 100%;
        max-width: 100%;
        max-height: 85vh;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        animation: slideInUp 0.3s ease;
    }
}
</style>
