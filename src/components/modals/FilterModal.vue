<template>
  <BaseModal title="筛选条件" @close="close">
    <div class="filter-content">
      <!-- 事件类型筛选 -->
      <div class="filter-section">
        <h3>事件类型</h3>
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input type="checkbox" value="historical" v-model="selectedTypes">
            <span class="checkmark"></span>
            <span class="label-text">历史事件</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" value="article" v-model="selectedTypes">
            <span class="checkmark"></span>
            <span class="label-text">重要文章</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" value="poem" v-model="selectedTypes">
            <span class="checkmark"></span>
            <span class="label-text">诗词作品</span>
          </label>
        </div>
      </div>

      <!-- 时间范围筛选 -->
      <div class="filter-section">
        <h3>时间范围 ({{ yearRange.start }} - {{ yearRange.end }})</h3>
        <div class="range-inputs">
          <div class="input-group">
            <label>开始年份</label>
            <input type="number" v-model.number="yearRange.start" min="1893" max="1976">
          </div>
          <div class="input-group">
            <label>结束年份</label>
            <input type="number" v-model.number="yearRange.end" min="1893" max="1976">
          </div>
        </div>
        <!-- 简单的滑块模拟 (可选，这里先用输入框) -->
      </div>

      <div class="filter-actions">
        <button class="btn-reset" @click="reset">重置</button>
        <button class="btn-apply" @click="apply">应用筛选</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseModal from './BaseModal.vue';
import { useUIStore } from '../../stores/ui';
import { useEventsStore } from '../../stores/events';

const uiStore = useUIStore();
const eventsStore = useEventsStore();

const MIN_YEAR = 1893;
const MAX_YEAR = 1976;
const selectedTypes = ref([]);
const yearRange = ref({ start: MIN_YEAR, end: MAX_YEAR });

onMounted(() => {
  // 初始化状态
  selectedTypes.value = [...eventsStore.filters.types];
  yearRange.value = { ...eventsStore.filters.yearRange };
});

function close() {
  uiStore.closeModal();
}

function reset() {
  selectedTypes.value = [];
  yearRange.value = { start: MIN_YEAR, end: MAX_YEAR };
}

function apply() {
  const normalized = normalizeYearRange(yearRange.value);
  yearRange.value = normalized;
  eventsStore.setFilters({
    types: selectedTypes.value,
    yearRange: normalized
  });
  close();
}

function normalizeYearRange(range) {
  let start = Number(range.start);
  let end = Number(range.end);
  if (!Number.isFinite(start)) start = MIN_YEAR;
  if (!Number.isFinite(end)) end = MAX_YEAR;

  start = Math.min(Math.max(start, MIN_YEAR), MAX_YEAR);
  end = Math.min(Math.max(end, MIN_YEAR), MAX_YEAR);

  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
  }

  return { start, end };
}
</script>

<style scoped>
.filter-content {
  padding: 12px;
}

.filter-section {
  margin-bottom: 32px;
}

.filter-section h3 {
  font-size: 16px;
  color: var(--color-secondary);
  margin-bottom: 16px;
  border-left: 3px solid var(--color-primary);
  padding-left: 12px;
  font-weight: 600;
}

.checkbox-group {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-item input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color-strong);
  border-radius: 6px;
  margin-right: 10px;
  position: relative;
  transition: all var(--transition-fast);
  background: var(--bg-surface-elevated);
}

.checkbox-item input:checked + .checkmark {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary-transparent);
}

.checkbox-item input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  color: var(--text-primary);
  font-size: 15px;
}

.range-inputs {
  display: flex;
  gap: 24px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 13px;
  color: var(--text-muted);
}

.input-group input {
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all var(--transition-fast);
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-transparent);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.btn-reset {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 10px 24px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 14px;
}

.btn-reset:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
  background: var(--bg-surface-hover);
}

.btn-apply {
  background: var(--color-primary);
  border: none;
  color: white;
  padding: 10px 32px;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
  font-size: 14px;
  box-shadow: var(--shadow-glow);
}

.btn-apply:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-primary-transparent);
}
</style>
