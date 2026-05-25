<template>
    <BaseModal title="搜索历史事件" @close="close">
        <div class="search-input-wrap">
            <i class="fas fa-search search-input-icon"></i>
            <input
                ref="inputRef"
                v-model="query"
                type="text"
                class="search-input"
                placeholder="搜索事件、地点、人物、标签..."
                @keydown.escape="close"
                @keydown.down.prevent="moveFocus(1)"
                @keydown.up.prevent="moveFocus(-1)"
                @keydown.enter.prevent="selectFocused"
            />
            <span class="search-input-hint" v-if="!query">Ctrl+K</span>
        </div>

        <div class="search-results" v-if="query.trim()">
            <div v-if="results.length" class="search-results__list">
                <button
                    v-for="(event, i) in results"
                    :key="event.id"
                    class="search-result-item"
                    :class="{ focused: i === focusIndex }"
                    @click="selectResult(event)"
                    @mouseenter="focusIndex = i"
                >
                    <span class="tag" :class="`tag-${event.type}`" style="font-size:10px;padding:1px 6px;">
                        {{ typeNames[event.type] || event.type }}
                    </span>
                    <div class="search-result-item__info">
                        <strong>{{ event.title }}</strong>
                        <span>{{ event.date }} · {{ event.location?.city || '' }}</span>
                    </div>
                </button>
            </div>
            <div v-else class="search-empty">
                <i class="fas fa-search" style="font-size:20px;margin-bottom:8px;display:block;"></i>
                未找到相关内容
            </div>
        </div>

        <div v-else class="search-hints">
            <p>输入关键词搜索历史事件、重要文章、诗词作品</p>
            <div class="search-hints__tags">
                <button class="search-hint-tag" @click="query = '长征'">长征</button>
                <button class="search-hint-tag" @click="query = '湖南'">湖南</button>
                <button class="search-hint-tag" @click="query = '诗词'">诗词</button>
                <button class="search-hint-tag" @click="query = '革命'">革命</button>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import BaseModal from './BaseModal.vue';
import { useEventsStore } from '../../stores/events';
import { useUIStore } from '../../stores/ui';

const eventsStore = useEventsStore();
const uiStore = useUIStore();
const inputRef = ref(null);
const query = ref('');
const focusIndex = ref(0);

const typeNames = { historical: '历史事件', article: '重要文章', poem: '诗词作品' };

const results = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return [];
    return eventsStore.events.filter(event => {
        const text = [
            event.title, event.description, event.significance,
            event.location?.province, event.location?.city, event.location?.detail,
            ...(event.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        return text.includes(q);
    }).slice(0, 15);
});

watch(query, () => { focusIndex.value = 0; });

function close() { uiStore.closeModal(); }

function selectResult(event) {
    eventsStore.selectEvent(event.id);
    close();
}

function moveFocus(dir) {
    const len = results.value.length;
    if (!len) return;
    focusIndex.value = (focusIndex.value + dir + len) % len;
}

function selectFocused() {
    const ev = results.value[focusIndex.value];
    if (ev) selectResult(ev);
}

onMounted(() => { nextTick(() => inputRef.value?.focus()); });
</script>

<style scoped>
.search-input-wrap {
    position: relative;
    margin-bottom: 16px;
}

.search-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 14px;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 12px 14px 12px 38px;
    border-radius: var(--radius-md);
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 15px;
}

.search-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.15);
}

.search-input-hint {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: var(--text-muted);
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
}

.search-results__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 400px;
    overflow-y: auto;
}

.search-result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid transparent;
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
    width: 100%;
}

.search-result-item:hover,
.search-result-item.focused {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--border-color-hover);
}

.search-result-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.search-result-item__info strong {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-result-item__info span {
    font-size: 12px;
    color: var(--text-muted);
}

.search-empty {
    text-align: center;
    color: var(--text-muted);
    padding: 24px 0;
}

.search-hints {
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    padding: 12px 0;
}

.search-hints__tags {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
}

.search-hint-tag {
    padding: 4px 14px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.search-hint-tag:hover {
    background: rgba(211, 47, 47, 0.1);
    border-color: rgba(211, 47, 47, 0.3);
    color: var(--text-primary);
}
</style>
