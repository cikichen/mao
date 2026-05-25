import { defineStore } from 'pinia';

export const usePlaybackStore = defineStore('playback', {
    state: () => ({
        isPlaying: false,
        currentIndex: 0,
        totalEvents: 0,
        playSpeed: 1
    }),
    getters: {
        progress(state) {
            if (!state.totalEvents) return 0;
            return (state.currentIndex / (state.totalEvents - 1 || 1)) * 100;
        }
    },
    actions: {
        setTotalEvents(total) {
            this.totalEvents = Math.max(Number(total) || 0, 0);
            if (this.currentIndex > Math.max(this.totalEvents - 1, 0)) {
                this.currentIndex = Math.max(this.totalEvents - 1, 0);
            }
        },
        setCurrentIndex(index) {
            const next = Number(index);
            const max = Math.max(this.totalEvents - 1, 0);
            this.currentIndex = Number.isFinite(next) ? Math.min(Math.max(next, 0), max) : 0;
        },
        nextIndex() {
            const max = Math.max(this.totalEvents - 1, 0);
            if (this.currentIndex < max) {
                this.currentIndex++;
                return true;
            }
            return false;
        },
        prevIndex() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                return true;
            }
            return false;
        },
        setPlaying(flag) {
            this.isPlaying = !!flag;
        },
        togglePlay() {
            if (this.totalEvents <= 1) { this.isPlaying = false; return; }
            this.isPlaying = !this.isPlaying;
        },
        setPlaySpeed(speed) {
            const steps = [0.5, 1, 1.5, 2];
            const n = Number(speed);
            this.playSpeed = steps.includes(n) ? n : 1;
        },
        cycleSpeed() {
            const steps = [0.5, 1, 1.5, 2];
            const idx = steps.indexOf(this.playSpeed);
            this.playSpeed = steps[(idx + 1) % steps.length];
        }
    }
});
