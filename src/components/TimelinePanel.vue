<template>
    <div class="timeline-container timeline-panel">
        <div class="timeline-header timeline-panel__header">
            <div class="timeline-info timeline-panel__info">
                <div>
                    <span class="current-year">{{ currentYear }}</span>
                    <p class="timeline-panel__title">{{ currentTitle }}</p>
                </div>
                <span class="current-age">{{ currentAge }}</span>
            </div>

            <div class="timeline-controls timeline-panel__controls">
                <button class="timeline-btn" @click="prevEvent" title="上一个">
                    <i class="fas fa-step-backward"></i>
                </button>
                <button
                    class="timeline-btn play-btn"
                    :class="{ active: playback.isPlaying }"
                    @click="togglePlay"
                    :title="playback.isPlaying ? '暂停' : '播放'"
                >
                    <i :class="playback.isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button class="timeline-btn" @click="nextEvent" title="下一个">
                    <i class="fas fa-step-forward"></i>
                </button>

                <label class="speed-control timeline-panel__speed">
                    <span>速度</span>
                    <input
                        id="speedSlider"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.25"
                        :value="playback.playSpeed"
                        @input="onSpeedChange"
                    />
                    <strong id="speedValue">{{ speedLabel }}</strong>
                </label>
            </div>
        </div>

        <div class="timeline-panel__progress-meta">
            <span>{{ currentPositionLabel }}</span>
            <span>{{ events.length ? `共 ${events.length} 个节点` : '暂无节点' }}</span>
        </div>

        <div class="timeline-track timeline-panel__track">
            <div
                class="timeline-progress"
                :class="{ playing: playback.isPlaying }"
                :style="{ width: progressPercentage + '%' }"
            ></div>
            <input
                type="range"
                class="timeline-slider timeline-panel__slider"
                min="0"
                :max="Math.max(events.length - 1, 0)"
                :value="playback.currentIndex"
                @input="onSeek"
            />
        </div>

        <div class="timeline-labels timeline-panel__labels">
            <span>1893</span>
            <span>{{ currentYear }}</span>
            <span>1976</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useEventsStore } from '../stores/events';
import { usePlaybackStore } from '../stores/playback';

const eventsStore = useEventsStore();
const playbackStore = usePlaybackStore();

const events = computed(() => eventsStore.filteredEvents);
const currentEvent = computed(() => eventsStore.currentEvent);
const playback = playbackStore;

const currentYear = computed(() => {
    if (!currentEvent.value?.date) return '1893';
    return currentEvent.value.date.split('-')[0];
});

const currentAge = computed(() => {
    if (!currentEvent.value?.date) return '0岁';
    const year = parseInt(currentEvent.value.date.split('-')[0], 10);
    return `${Math.max(year - 1893, 0)}岁`;
});

const currentTitle = computed(() => currentEvent.value?.title || '从时间轴探索重要历史节点');
const currentPositionLabel = computed(() => {
    if (!events.value.length) return '第 0 / 0 站';
    return `第 ${playback.currentIndex + 1} / ${events.value.length} 站`;
});
const speedLabel = computed(() => `${playback.playSpeed.toFixed(2).replace(/\.00$/, '')}x`);

const progressPercentage = computed(() => {
    if (events.value.length <= 1) return 0;
    return (playback.currentIndex / (events.value.length - 1)) * 100;
});

function togglePlay() {
    playbackStore.togglePlay();
}

function onSeek(event) {
    if (!events.value.length) return;
    const index = Number(event.target.value);
    playbackStore.setPlaying(false);
    playbackStore.setCurrentIndex(index);
    const targetEvent = events.value[index];
    if (targetEvent) {
        eventsStore.selectEvent(targetEvent.id);
    }
}

function onSpeedChange(event) {
    playbackStore.setPlaySpeed(event.target.value);
}

function prevEvent() {
    if (!events.value.length) return;
    playbackStore.setPlaying(false);
    const newIndex = Math.max(0, playbackStore.currentIndex - 1);
    playbackStore.setCurrentIndex(newIndex);
    eventsStore.selectEvent(events.value[newIndex].id);
}

function nextEvent() {
    if (!events.value.length) return;
    playbackStore.setPlaying(false);
    const newIndex = Math.min(events.value.length - 1, playbackStore.currentIndex + 1);
    playbackStore.setCurrentIndex(newIndex);
    eventsStore.selectEvent(events.value[newIndex].id);
}
</script>

<style scoped>
.timeline-panel {
    width: 100%;
    min-height: 132px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(45, 45, 45, 0.96), rgba(26, 26, 26, 0.92));
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(var(--backdrop-blur-strong, 12px));
    pointer-events: auto;
}

.timeline-panel__header {
    gap: 16px;
}

.timeline-panel__info {
    min-width: 0;
}

.timeline-panel__title {
    margin-top: 4px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.5;
}

.timeline-panel__controls {
    flex-wrap: wrap;
    justify-content: flex-end;
}

.timeline-panel__speed strong {
    color: var(--text-primary);
}

.timeline-panel__progress-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: var(--text-muted);
    font-size: 12px;
}

.timeline-panel__track {
    margin-top: 4px;
}

.timeline-panel__slider {
    opacity: 0;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    z-index: 3;
}

.timeline-panel__labels {
    margin-top: 2px;
}

@media (max-width: 768px) {
    .timeline-panel {
        border-radius: 20px;
    }

    .timeline-panel__progress-meta {
        flex-direction: column;
        gap: 6px;
    }

    .timeline-panel__controls {
        justify-content: flex-start;
    }
}
</style>
