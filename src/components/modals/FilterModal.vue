<template>
    <BaseModal title="筛选事件" @close="close">
        <!-- 类型筛选 -->
        <div class="filter-section">
            <h4 class="filter-section__title">事件类型</h4>
            <div class="filter-types">
                <label
                    v-for="t in typeOptions"
                    :key="t.value"
                    class="filter-type-item"
                    :class="{ checked: selectedTypes.includes(t.value) }"
                >
                    <input type="checkbox" :value="t.value" v-model="selectedTypes" />
                    <span class="filter-type-dot" :class="t.value"></span>
                    {{ t.label }}
                    <span class="filter-type-count">{{ t.count }}</span>
                </label>
            </div>
        </div>

        <!-- 年份范围 -->
        <div class="filter-section">
            <h4 class="filter-section__title">
                年份范围
                <span class="filter-section__range-label">{{ yearStart }} — {{ yearEnd }}</span>
            </h4>
            <div class="filter-range">
                <input type="range" :min="1893" :max="1976" v-model.number="yearStart" />
                <input type="range" :min="1893" :max="1976" v-model.number="yearEnd" />
            </div>
        </div>

        <!-- 预览结果数 -->
        <div class="filter-preview">
            筛选后共 <strong>{{ previewCount }}</strong> 个事件
        </div>

        <!-- 操作按钮 -->
        <div class="filter-actions">
            <button class="btn btn-ghost" @click="reset">重置</button>
            <button class="btn btn-primary" @click="apply">应用筛选</button>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseModal from './BaseModal.vue';
import { useEventsStore } from '../../stores/events';
import { useUIStore } from '../../stores/ui';

const eventsStore = useEventsStore();
const uiStore = useUIStore();

const selectedTypes = ref([]);
const yearStart = ref(1893);
const yearEnd = ref(1976);

const typeOptions = computed(() => {
    const stats = eventsStore.typeStats;
    return [
        { value: 'historical', label: '历史事件', count: stats.historical },
        { value: 'article', label: '重要文章', count: stats.article },
        { value: 'poem', label: '诗词作品', count: stats.poem }
    ];
});

const previewCount = computed(() => {
    return eventsStore.events.filter(e => {
        if (selectedTypes.value.length && !selectedTypes.value.includes(e.type)) return false;
        if (e.year < yearStart.value || e.year > yearEnd.value) return false;
        return true;
    }).length;
});

onMounted(() => {
    selectedTypes.value = [...eventsStore.filters.types];
    yearStart.value = eventsStore.filters.yearRange.start;
    yearEnd.value = eventsStore.filters.yearRange.end;
});

function close() { uiStore.closeModal(); }

function reset() {
    selectedTypes.value = [];
    yearStart.value = 1893;
    yearEnd.value = 1976;
}

function apply() {
    const s = Math.min(yearStart.value, yearEnd.value);
    const e = Math.max(yearStart.value, yearEnd.value);
    eventsStore.setFilters({
        types: selectedTypes.value,
        yearRange: { start: s, end: e }
    });
    close();
}
</script>

<style scoped>
.filter-section {
    margin-bottom: 24px;
}

.filter-section__title {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-section__range-label {
    color: var(--color-secondary);
    font-weight: 600;
    font-size: 12px;
}

.filter-types {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-type-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    cursor: pointer;
    font-size: 14px;
    transition: all var(--transition-fast);
}

.filter-type-item:hover {
    background: rgba(255, 255, 255, 0.06);
}

.filter-type-item.checked {
    border-color: var(--border-color-active);
    background: rgba(211, 47, 47, 0.08);
}

.filter-type-item input {
    display: none;
}

.filter-type-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.filter-type-dot.historical { background: var(--color-historical); }
.filter-type-dot.article { background: var(--color-article); }
.filter-type-dot.poem { background: var(--color-poem); }

.filter-type-count {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-muted);
}

.filter-range {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-range input[type="range"] {
    width: 100%;
    appearance: none;
    height: 6px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
}

.filter-range input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid #fff;
    box-shadow: var(--shadow-sm);
}

.filter-preview {
    text-align: center;
    padding: 12px;
    border-radius: var(--radius-md);
    background: rgba(255, 215, 0, 0.06);
    color: var(--text-secondary);
    font-size: 13px;
    margin-bottom: 16px;
}

.filter-preview strong {
    color: var(--color-secondary);
    font-size: 16px;
}

.filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
