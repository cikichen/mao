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
            const nextIndex = Number(index);
            const maxIndex = Math.max(this.totalEvents - 1, 0);
            this.currentIndex = Number.isFinite(nextIndex)
                ? Math.min(Math.max(nextIndex, 0), maxIndex)
                : 0;
        },
        setPlaying(flag) {
            this.isPlaying = !!flag;
        },
        togglePlay() {
            if (this.totalEvents <= 1) {
                this.isPlaying = false;
                return;
            }
            this.isPlaying = !this.isPlaying;
        },
        setPlaySpeed(speed) {
            const numericSpeed = Number(speed);
            const normalizedSpeed = Number.isFinite(numericSpeed) ? numericSpeed : 1;
            this.playSpeed = Math.min(Math.max(normalizedSpeed, 0.5), 2);
        }
    }
});
