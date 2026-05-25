<template>
    <section class="timeline" aria-label="历史进程带">
        <!-- 顶部信息行 -->
        <div class="timeline__info">
            <div class="timeline__year-box">
                <strong class="timeline__year">{{ currentYear }}</strong>
                <span class="timeline__age">{{ currentAge }}</span>
            </div>

            <div class="timeline__detail">
                <h3 class="timeline__title">{{ currentTitle }}</h3>
                <p class="timeline__sub">
                    <span class="timeline__chip">{{ positionLabel }}</span>
                    {{ stateLabel }}
                </p>
            </div>

            <!-- 播放控制 -->
            <div class="timeline__controls">
                <button class="tl-btn" @click="prevEvent" title="上一个 (←)">
                    <i class="fas fa-step-backward"></i>
                </button>
                <button
                    class="tl-btn tl-btn--play"
                    :class="{ active: playback.isPlaying }"
                    @click="togglePlay"
                    :title="playback.isPlaying ? '暂停 (Space)' : '播放 (Space)'"
                >
                    <i :class="playback.isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button class="tl-btn" @click="nextEvent" title="下一个 (→)">
                    <i class="fas fa-step-forward"></i>
                </button>
                <button class="tl-btn tl-btn--speed" @click="cycleSpeed" :title="`速度 ${speedLabel}`">
                    {{ speedLabel }}
                </button>
            </div>
        </div>

        <!-- 时间轴轨道 -->
        <div class="timeline__track-wrap">
            <div class="timeline__years">
                <span>{{ startYear }}</span>
                <span>{{ endYear }}</span>
            </div>

            <div class="timeline__track" :style="{ '--progress': `${progressPct}%` }">
                <div class="timeline__track-bg"></div>
                <div class="timeline__track-fill" :class="{ playing: playback.isPlaying }"></div>
                <div class="timeline__track-thumb">
                    <span class="timeline__thumb-dot"></span>
                </div>

                <input
                    type="range"
                    class="timeline__slider"
                    min="0"
                    :max="Math.max(events.length - 1, 0)"
                    :value="playback.currentIndex"
                    @input="onSeek"
                    aria-label="跳转历史节点"
                />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useEventsStore } from '../stores/events';
import { usePlaybackStore } from '../stores/playback';

const eventsStore = useEventsStore();
const playback = usePlaybackStore();

const events = computed(() => eventsStore.filteredEvents);
const currentEvent = computed(() => eventsStore.currentEvent);

const currentYear = computed(() => currentEvent.value?.date?.split('-')[0] || '1893');
const currentAge = computed(() => {
    const y = parseInt(currentYear.value, 10);
    return `${Math.max(y - 1893, 0)}岁`;
});
const currentTitle = computed(() => currentEvent.value?.title || '从时间轴探索重要历史节点');

const positionLabel = computed(() => {
    if (!events.value.length) return '0 / 0';
    return `${playback.currentIndex + 1} / ${events.value.length}`;
});
const stateLabel = computed(() => {
    if (!events.value.length) return '等待载入';
    if (playback.currentIndex <= 0) return '历史起笔';
    if (playback.currentIndex >= events.value.length - 1) return '历史收束';
    return playback.isPlaying ? '巡游中' : '驻留中';
});

const startYear = computed(() => events.value[0]?.date?.split('-')[0] || '1893');
const endYear = computed(() => events.value[events.value.length - 1]?.date?.split('-')[0] || '1976');
const speedLabel = computed(() => `${playback.playSpeed}x`);
const progressPct = computed(() => events.value.length <= 1 ? 0 : (playback.currentIndex / (events.value.length - 1)) * 100);

function togglePlay() { playback.togglePlay(); }
function cycleSpeed() { playback.cycleSpeed(); }

function onSeek(e) {
    playback.setPlaying(false);
    const idx = Number(e.target.value);
    playback.setCurrentIndex(idx);
    const ev = events.value[idx];
    if (ev) eventsStore.selectEvent(ev.id);
}

function prevEvent() {
    playback.setPlaying(false);
    if (playback.prevIndex()) {
        const ev = events.value[playback.currentIndex];
        if (ev) eventsStore.selectEvent(ev.id);
    }
}

function nextEvent() {
    playback.setPlaying(false);
    if (playback.nextIndex()) {
        const ev = events.value[playback.currentIndex];
        if (ev) eventsStore.selectEvent(ev.id);
    }
}
</script>

<style scoped>
.timeline {
    width: 100%;
    padding: 10px 14px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    background: rgba(20, 20, 20, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
}

/* Info row */
.timeline__info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.timeline__year-box {
    flex-shrink: 0;
    padding: 6px 10px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.3), rgba(50, 30, 25, 0.9));
    border: 1px solid rgba(211, 47, 47, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 68px;
}

.timeline__year {
    font-size: 22px;
    line-height: 1;
    font-family: var(--font-heading);
}

.timeline__age {
    font-size: 10px;
    color: var(--text-secondary);
    padding: 1px 6px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.06);
}

.timeline__detail {
    flex: 1;
    min-width: 0;
}

.timeline__title {
    font-size: 15px;
    line-height: 1.3;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.timeline__sub {
    font-size: 11px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
}

.timeline__chip {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    border-radius: var(--radius-full);
    background: rgba(255, 215, 0, 0.1);
    color: var(--color-secondary);
    font-size: 10px;
    font-weight: 600;
}

/* Controls */
.timeline__controls {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.tl-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all var(--transition-normal);
}

.tl-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border-color: var(--border-color-hover);
}

.tl-btn--play {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.85), rgba(211, 47, 47, 0.5));
    border-color: rgba(211, 47, 47, 0.4);
    color: #fff;
    font-size: 14px;
    box-shadow: var(--shadow-glow-primary);
}

.tl-btn--play:hover {
    background: linear-gradient(135deg, rgba(211, 47, 47, 1), rgba(211, 47, 47, 0.7));
}

.tl-btn--play.active {
    background: linear-gradient(135deg, rgba(180, 30, 30, 0.95), rgba(211, 47, 47, 0.7));
}

.tl-btn--speed {
    width: auto;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 700;
    color: var(--color-secondary);
    letter-spacing: 0.03em;
}

/* Track */
.timeline__track-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.timeline__years {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--text-muted);
}

.timeline__track {
    --progress: 0%;
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
}

.timeline__track-bg,
.timeline__track-fill {
    position: absolute;
    left: 0;
    right: 0;
    height: 8px;
    border-radius: var(--radius-full);
    top: 50%;
    transform: translateY(-50%);
}

.timeline__track-bg {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.04);
}

.timeline__track-fill {
    right: auto;
    width: var(--progress);
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    box-shadow: 0 0 12px rgba(211, 47, 47, 0.3);
    transition: width var(--transition-fast);
}

.timeline__track-fill.playing {
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
}

.timeline__track-thumb {
    position: absolute;
    left: var(--progress);
    top: 50%;
    transform: translate(-50%, -50%);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    box-shadow: var(--shadow-md);
}

.timeline__thumb-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.5);
}

.timeline__slider {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
}

/* Mobile */
@media (max-width: 768px) {
    .timeline {
        padding: 12px 14px;
        gap: 10px;
        border-radius: var(--radius-lg);
    }

    .timeline__info {
        gap: 10px;
    }

    .timeline__year-box {
        min-width: 64px;
        padding: 8px 10px;
    }

    .timeline__year {
        font-size: 22px;
    }

    .timeline__title {
        font-size: 14px;
    }

    .timeline__controls {
        gap: 4px;
    }

    .tl-btn {
        width: 34px;
        height: 34px;
        font-size: 12px;
    }

    .tl-btn--play {
        width: 40px;
        height: 40px;
    }

    .tl-btn--speed {
        display: none;
    }
}
</style>
