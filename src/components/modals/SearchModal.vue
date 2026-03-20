<template>
  <BaseModal title="搜索历史事件" @close="close">
    <div class="search-box">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索地点、事件、文章或诗词..."
        @keyup.enter="performSearch"
      >
      <button @click="performSearch">
        <i class="fas fa-search"></i>
      </button>
    </div>

    <div class="search-results">
      <div v-if="results.length > 0" class="results-list">
        <div 
          v-for="event in results" 
          :key="event.id" 
          class="result-item"
          @click="selectResult(event)"
        >
          <div class="result-title">{{ event.title }}</div>
          <div class="result-meta">
            <span>{{ event.date }}</span>
            <span v-if="event.location?.city"> · {{ event.location.city }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="hasSearched" class="no-results">
        未找到相关内容
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue';
import BaseModal from './BaseModal.vue';
import { useEventsStore } from '../../stores/events';
import { useUIStore } from '../../stores/ui';

const eventsStore = useEventsStore();
const uiStore = useUIStore();

const searchQuery = ref('');
const results = ref([]);
const hasSearched = ref(false);

function close() {
  uiStore.closeModal();
}

function performSearch() {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return;

  results.value = eventsStore.filteredEvents.filter(event => {
    return (
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.city?.toLowerCase().includes(query) ||
      event.location?.name?.toLowerCase().includes(query)
    );
  });
  
  hasSearched.value = true;
}

function selectResult(event) {
  eventsStore.selectEvent(event.id);
  close();
}
</script>

<style scoped>
.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-box input {
  flex: 1;
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all var(--transition-fast);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-transparent);
  background: var(--bg-surface-elevated);
}

.search-box button {
  background: var(--color-primary);
  border: none;
  border-radius: var(--border-radius-md);
  width: 48px;
  color: #fff;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
}

.search-box button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-primary-transparent);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  padding: 16px;
  background: var(--bg-surface-elevated);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.result-item:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-color-hover);
  transform: translateX(4px);
}

.result-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.result-meta {
  font-size: 13px;
  color: var(--text-muted);
}

.no-results {
  text-align: center;
  color: var(--text-muted);
  padding: 32px;
}
</style>
