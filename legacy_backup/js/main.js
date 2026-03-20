class MaoMapApp {
    constructor() {
        this.dataManager = new DataManager();
        // Choose map manager based on configuration or user preference
        this.mapManager = window.APP_CONFIG.defaultProvider === 'leaflet' ? new LeafletMapManager() : new AMapManager();
        this.timelineManager = new TimelineManager();
        this.sidebarManager = new SidebarManager();

        this.state = {
            isPlaying: false,
            currentEventIndex: 0,
            events: [],
        };
    }

    async init() {
        this.showLoading(); // Show loading animation

        await this.loadMapAPI(this.mapManager.constructor.name);
        await this.dataManager.loadEvents();
        this.state.events = this.dataManager.getFilteredEvents();

        await this.mapManager.initMap('map');
        this.mapManager.addEventMarkers(this.state.events);

        this.timelineManager.init(this.state.events);
        this.sidebarManager.init();

        this.bindEvents();

        // 确保初始化时定位到第一个事件（出生点）
        if (this.state.events.length > 0) {
            // 先设置地图中心到第一个事件
            const firstEvent = this.state.events[0];
            if (firstEvent && firstEvent.coordinates) {
                this.mapManager.centerToEvent(firstEvent);
                // 稍微延迟显示事件详情，确保地图已经定位
                setTimeout(() => {
                    this.showEvent(0);
                }, 300);
            } else {
                this.showEvent(0);
            }
        }

        this.hideLoading(); // Hide loading animation after initialization
    }

    loadMapAPI(mapProvider) {
        return new Promise((resolve, reject) => {
            if (mapProvider === 'AMapManager') {
                if (window.AMap) {
                    return resolve();
                }
                const script = document.createElement('script');
                script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${window.AMAP_CONFIG.key}`;
                script.onload = () => resolve();
                script.onerror = (e) => reject(e);
                document.head.appendChild(script);
            } else if (mapProvider === 'LeafletMapManager') {
                // Leaflet is loaded via index.html, so just resolve
                resolve();
            } else {
                reject(new Error('Unknown map provider'));
            }
        });
    }

    async switchMapProvider(newProvider) {
        if (this.mapManager.constructor.name === (newProvider === 'leaflet' ? 'LeafletMapManager' : 'AMapManager')) {
            return; // Already using the selected provider
        }

        this.showLoading();

        // Destroy current map instance
        if (this.mapManager.map) {
            if (this.mapManager.constructor.name === 'LeafletMapManager') {
                this.mapManager.map.remove(); // Leaflet map destroy
            } else if (this.mapManager.constructor.name === 'AMapManager') {
                this.mapManager.map.destroy(); // AMap map destroy
            }
        }

        // Instantiate new map manager
        if (newProvider === 'leaflet') {
            this.mapManager = new LeafletMapManager();
        } else {
            this.mapManager = new AMapManager();
        }

        // Re-bind map events for the new manager
        this.mapManager.on('markerClick', (event) => {
            const index = this.state.events.findIndex(e => e.id === event.id);
            if (index !== -1) {
                this.showEvent(index);
            }
        });

        // Load API if necessary and initialize new map
        await this.loadMapAPI(this.mapManager.constructor.name);
        await this.mapManager.initMap('map');
        this.mapManager.addEventMarkers(this.state.events);

        // Show the current event on the new map
        if (this.state.events.length > 0) {
            this.showEvent(this.state.currentEventIndex);
        }

        this.hideLoading();
    }

    updateMapProviderSelection(selectedProvider) {
        const mapProviderDropdown = document.getElementById('mapProviderDropdown');
        if (mapProviderDropdown) {
            // Remove selected class from all items
            mapProviderDropdown.querySelectorAll('.map-provider-dropdown-item').forEach(item => {
                item.classList.remove('selected');
            });

            // Add selected class to current provider
            const selectedItem = mapProviderDropdown.querySelector(`[data-value="${selectedProvider}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }

            // Update button text to show current provider
            const mapSelectBtn = document.getElementById('mapSelectBtn');
            if (mapSelectBtn) {
                const btnText = mapSelectBtn.querySelector('span');
                if (btnText) {
                    btnText.textContent = selectedProvider === 'leaflet' ? 'Leaflet' : '高德地图';
                }
            }
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = 0;
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
        }
    }

    bindEvents() {
        this.timelineManager.on('play', () => this.play());
        this.timelineManager.on('pause', () => this.pause());
        this.timelineManager.on('seek', (index) => this.showEvent(index));

        this.mapManager.on('markerClick', (event) => {
            const index = this.state.events.findIndex(e => e.id === event.id);
            if (index !== -1) {
                this.showEvent(index);
            }
        });

        // 监听动画过程中到达事件点的事件
        this.mapManager.on('eventReached', (event) => {
            console.log('Event reached during animation:', event.title);
            this.sidebarManager.showEvent(event);
        });

        // Map provider selection
        const mapSelectBtn = document.getElementById('mapSelectBtn');
        const mapProviderDropdown = document.getElementById('mapProviderDropdown');
        const hiddenMapProviderSelect = document.getElementById('hiddenMapProviderSelect');

        if (mapSelectBtn && mapProviderDropdown && hiddenMapProviderSelect) {
            // Set initial selection for the hidden select
            hiddenMapProviderSelect.value = window.APP_CONFIG.defaultProvider;

            // Update initial selected state
            this.updateMapProviderSelection(window.APP_CONFIG.defaultProvider);

            mapSelectBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent document click from immediately closing
                mapProviderDropdown.classList.toggle('active');
            });

            // Add click listeners to dropdown items
            mapProviderDropdown.querySelectorAll('.map-provider-dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const selectedProvider = e.target.dataset.value;
                    if (selectedProvider) {
                        hiddenMapProviderSelect.value = selectedProvider; // Update hidden select value
                        this.updateMapProviderSelection(selectedProvider);
                        this.switchMapProvider(selectedProvider);
                        mapProviderDropdown.classList.remove('active'); // Hide dropdown after selection
                    }
                });
            });

            // Hide dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!mapSelectBtn.contains(event.target) && !mapProviderDropdown.contains(event.target)) {
                    mapProviderDropdown.classList.remove('active');
                }
            });

            // Hide dropdown on escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && mapProviderDropdown.classList.contains('active')) {
                    mapProviderDropdown.classList.remove('active');
                }
            });
        }
    }

    showEvent(index, animate = false) {
        if (index < 0 || index >= this.state.events.length) return;

        this.state.currentEventIndex = index;
        const event = this.state.events[index];

        // Only update map center and sidebar if not animating
        if (!animate) {
            this.mapManager.centerToEvent(event);
            this.sidebarManager.showEvent(event);
        }
        this.mapManager.drawStaticTrajectory(this.state.events.slice(0, index + 1)); // Use drawStaticTrajectory
        this.timelineManager.update(index, this.state.isPlaying);
    }

    play() {
        if (this.state.isPlaying) return;
        this.state.isPlaying = true;
        this.timelineManager.updatePlayButton(true);

        // 清理之前的动画轨迹，重新开始
        this.mapManager.clearAnimatedTrajectory();
        this.mapManager.showAnimatedTrajectory(); // Show animated path

        // Start animation from current event
        this.playLoop.bind(this)(); // Bind this context for the initial call
    }

    pause() {
        this.state.isPlaying = false;
        this.timelineManager.updatePlayButton(false);
        this.mapManager.hideAnimatedTrajectory(); // Hide animated path
        this.mapManager.drawStaticTrajectory(this.state.events.slice(0, this.state.currentEventIndex + 1)); // Draw static path up to current event
    }

    async playLoop() {
        if (!this.state.isPlaying) return;

        let nextIndex = this.state.currentEventIndex + 1;
        if (nextIndex >= this.state.events.length) {
            // 播放结束，重置到开始状态以便重新播放
            this.pause();
            this.state.currentEventIndex = 0; // 重置到第一个事件
            this.showEvent(0); // 显示第一个事件
            console.log('播放完成，已重置到开始状态');
            return;
        }

        const currentEvent = this.state.events[this.state.currentEventIndex];
        const nextEvent = this.state.events[nextIndex];

        // Animate footprint from current to next event
        await this.mapManager.animateFootprint(currentEvent, nextEvent, 2000 / this.timelineManager.playSpeed);

        // After animation, update to next event
        this.showEvent(nextIndex, true); // Pass true to indicate animation is happening

        this.playLoop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new MaoMapApp();
    app.init().catch(error => {
        console.error("Application failed to initialize:", error);
    });
});