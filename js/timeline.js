class TimelineManager {
    constructor() {
        this.elements = {
            slider: document.getElementById('timelineSlider'),
            playBtn: document.getElementById('playBtn'),
            currentYear: document.getElementById('currentYear'),
            currentAge: document.getElementById('currentAge'),
            // ... other elements
        };
        this.eventListeners = new Map();
        this.playSpeed = 1;
    }

    init(events) {
        this.elements.slider.max = events.length - 1;
        this.bindEvents();
    }

    bindEvents() {
        this.elements.playBtn.addEventListener('click', () => {
            const isPlaying = this.elements.playBtn.classList.contains('playing');
            if (isPlaying) {
                this.emit('pause');
            } else {
                this.emit('play');
            }
        });

        this.elements.slider.addEventListener('input', (e) => {
            this.emit('seek', parseInt(e.target.value, 10));
        });
    }

    update(index, isPlaying) {
        const event = dataManager.getEventByIndex(index);
        if(event) {
            this.elements.currentYear.textContent = event.year;
            this.elements.currentAge.textContent = `${event.age}岁`;
            this.elements.slider.value = index;
            // Update progress bar
            const progress = (index / (this.elements.slider.max || 1)) * 100;
            this.elements.progress.style.width = `${progress}%`;
        }
        this.updatePlayButton(isPlaying);
    }

    updatePlayButton(isPlaying) {
        this.elements.playBtn.classList.toggle('playing', isPlaying);
        const icon = this.elements.playBtn.querySelector('i');
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    emit(eventName, ...args) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(cb => cb(...args));
        }
    }
}
