export default class LeafletMapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.movingFootprintMarker = null;
        this.animatedTrajectory = null;
        this.staticTrajectory = null;
        this.isInitialized = false;
        this.eventListeners = new Map();
        this.activeInfoWindow = null;
        this.selectedMarkerId = null;
    }

    async initMap(containerOrId) {
        if (this.map) return;

        let container;
        if (typeof containerOrId === 'string') {
            container = document.getElementById(containerOrId);
            if (!container) {
                throw new Error(`Map container with id '${containerOrId}' not found`);
            }
        } else if (containerOrId instanceof HTMLElement) {
            container = containerOrId;
        } else {
            throw new Error('Invalid map container: must be a string ID or HTMLElement');
        }

        if (container._leaflet_id) {
            container._leaflet_id = null;
            container.innerHTML = '';
        }

        const birthPlaceCenter = [27.915456, 112.527621];
        this.map = L.map(container, {
            center: birthPlaceCenter,
            zoom: 8,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 3
        }).addTo(this.map);

        setTimeout(() => this.map.invalidateSize(), 100);

        this.isInitialized = true;
        this.emit('mapReady');
    }

    // --- Marker 图标工厂 ---
    _createIcon(type, isSelected = false) {
        const colors = {
            historical: '#d32f2f',
            article: '#ffd700',
            poem: '#ff8a65'
        };
        const color = colors[type] || colors.historical;
        const size = isSelected ? 18 : 12;
        const border = isSelected ? 3 : 2;
        const shadow = isSelected
            ? `0 0 12px ${color}, 0 0 24px ${color}40`
            : `0 0 6px ${color}80`;

        return L.divIcon({
            className: 'mao-marker-icon',
            html: `<div style="
                width: ${size}px; height: ${size}px;
                background: ${color};
                border-radius: 50%;
                border: ${border}px solid #fff;
                box-shadow: ${shadow};
                transition: all 0.25s ease;
                cursor: pointer;
            "></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    }

    // --- 信息窗内容 ---
    _createPopupContent(event) {
        const typeLabels = { historical: '历史事件', article: '重要文章', poem: '诗词作品' };
        const typeClass = event.type || 'historical';
        const dateStr = event.date || '';
        const location = event.location?.detail || event.location?.city || '';
        const desc = event.description || '';

        return `
            <div style="min-width:200px;max-width:280px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span class="tag tag-${typeClass}" style="font-size:11px;padding:1px 8px;">${typeLabels[typeClass] || '历史事件'}</span>
                    <span style="font-size:12px;color:#a0a0a0;">${dateStr}</span>
                </div>
                <div style="font-weight:700;font-size:15px;margin-bottom:4px;font-family:var(--font-heading);">${event.title}</div>
                ${location ? `<div style="font-size:12px;color:#a0a0a0;margin-bottom:6px;">${location}</div>` : ''}
                ${desc ? `<div style="font-size:13px;color:#ccc;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${desc}</div>` : ''}
            </div>
        `;
    }

    addEventMarkers(events) {
        this.clearMarkers();
        if (!events || !events.length) return;

        events.forEach(event => {
            if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;

            const marker = L.marker([event.coordinates.lat, event.coordinates.lng], {
                icon: this._createIcon(event.type, false),
                riseOnHover: true
            }).addTo(this.map);

            marker.bindPopup(this._createPopupContent(event), {
                maxWidth: 300,
                closeButton: true,
                className: 'mao-popup'
            });

            marker.on('click', () => {
                this.highlightMarker(event.id);
                this.emit('markerClick', event);
            });

            this.markers.set(event.id, { marker, event });
        });

        // 自动适配视野
        const allLatLngs = [];
        this.markers.forEach(({ marker }) => allLatLngs.push(marker.getLatLng()));
        if (allLatLngs.length > 1) {
            this.map.fitBounds(L.latLngBounds(allLatLngs).pad(0.1));
        }
    }

    clearMarkers() {
        if (!this.map) { this.markers.clear(); return; }
        this.markers.forEach(({ marker }) => {
            if (marker) this.map.removeLayer(marker);
        });
        this.markers.clear();
        this.selectedMarkerId = null;
    }

    highlightMarker(eventId) {
        // 恢复上一个选中的 marker
        if (this.selectedMarkerId && this.markers.has(this.selectedMarkerId)) {
            const prev = this.markers.get(this.selectedMarkerId);
            prev.marker.setIcon(this._createIcon(prev.event.type, false));
        }

        // 高亮新选中的 marker
        if (this.markers.has(eventId)) {
            const curr = this.markers.get(eventId);
            curr.marker.setIcon(this._createIcon(curr.event.type, true));
            curr.marker.openPopup();
            this.selectedMarkerId = eventId;
        }
    }

    centerToEvent(event, targetZoom = 12, options = {}) {
        if (!event?.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
        const latlng = [event.coordinates.lat, event.coordinates.lng];

        if (options.animate !== false) {
            this.map.flyTo(latlng, targetZoom, { duration: options.duration || 0.8 });
        } else {
            this.map.setView(latlng, targetZoom);
        }

        this.highlightMarker(event.id);
    }

    drawStaticTrajectory(eventsArray) {
        if (this.staticTrajectory) {
            this.map.removeLayer(this.staticTrajectory);
            this.staticTrajectory = null;
        }
        if (!eventsArray || eventsArray.length < 2) return;

        const pathPoints = eventsArray
            .filter(e => e.coordinates && !isNaN(e.coordinates.lng) && !isNaN(e.coordinates.lat))
            .map(e => [e.coordinates.lat, e.coordinates.lng]);

        if (pathPoints.length < 2) return;

        this.staticTrajectory = L.polyline(pathPoints, {
            color: '#d32f2f',
            weight: 3,
            opacity: 0.5,
            dashArray: '8, 6'
        }).addTo(this.map);
    }

    animateFootprint(startEvent, endEvent) {
        return new Promise((resolve) => {
            if (!startEvent || !endEvent || !startEvent.coordinates || !endEvent.coordinates) {
                resolve();
                return;
            }

            const startPos = L.latLng(startEvent.coordinates.lat, startEvent.coordinates.lng);
            const endPos = L.latLng(endEvent.coordinates.lat, endEvent.coordinates.lng);
            const distance = startPos.distanceTo(endPos);

            if (distance < 100) {
                setTimeout(() => {
                    this.emit('eventReached', endEvent);
                    resolve();
                }, 800);
                return;
            }

            let targetZoom, totalDuration;
            const currentZoom = this.map.getZoom();

            if (distance > 500000) {
                targetZoom = distance > 1000000 ? 5 : distance > 800000 ? 6 : 7;
                totalDuration = Math.max(3000, Math.min(5000, distance * 0.002));
            } else if (distance < 10000) {
                targetZoom = Math.max(14, Math.min(16, currentZoom + 2));
                totalDuration = Math.max(1500, Math.min(2500, distance * 0.15));
            } else if (distance < 100000) {
                targetZoom = Math.max(10, Math.min(12, currentZoom));
                totalDuration = Math.max(2000, Math.min(3000, distance * 0.02));
            } else {
                targetZoom = Math.max(8, Math.min(10, currentZoom));
                totalDuration = Math.max(2500, Math.min(4000, distance * 0.005));
            }

            if (!this.movingFootprintMarker) {
                this.movingFootprintMarker = L.marker(startPos, {
                    icon: L.divIcon({
                        className: 'mao-footprint-icon',
                        html: `
                            <div class="mao-footprint-container">
                                <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                                    <circle cx="50" cy="50" r="46" fill="#d32f2f" stroke="#ffd700" stroke-width="4"/>
                                    <ellipse cx="50" cy="65" rx="30" ry="12" fill="rgba(0,0,0,0.25)"/>
                                    <path d="M 24,55 C 24,35 34,26 50,26 C 66,26 76,35 76,55 Z" fill="#8ca0ba" stroke="#2c3e50" stroke-width="3"/>
                                    <path d="M 50,26 L 50,55 M 34,36 L 50,55 M 66,36 L 50,55" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/>
                                    <path d="M 18,54 C 18,54 28,62 50,62 C 72,62 82,54 82,54 C 82,54 74,68 50,68 C 26,68 18,54 18,54 Z" fill="#2c3e50"/>
                                    <polygon points="50,33 53,40 60,40 55,44 57,51 50,47 43,51 45,44 40,40 47,40" fill="#ff1744"/>
                                </svg>
                            </div>
                        `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    })
                }).addTo(this.map);
            } else {
                this.movingFootprintMarker.setLatLng(startPos);
            }

            let startTime = null;
            let eventTriggered = false;

            // 1. 触发 Leaflet 原生的飞越平滑动画（CSS 3D 变焦+平移，彻底避免每帧强制重绘导致的黑屏瓦片丢失）
            this.map.flyTo(endPos, targetZoom, {
                duration: totalDuration / 1000,
                easeLinearity: 0.25
            });

            // 2. 通过 requestAnimationFrame 只更新 Marker 位置与画轨迹线
            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / totalDuration, 1);

                if (progress > 0.1 && !eventTriggered) {
                    this.emit('eventReached', endEvent);
                    eventTriggered = true;
                }

                const lat = startPos.lat + (endPos.lat - startPos.lat) * progress;
                const lng = startPos.lng + (endPos.lng - startPos.lng) * progress;
                const currentPos = L.latLng(lat, lng);

                // 只更新足迹点坐标
                this.movingFootprintMarker.setLatLng(currentPos);

                // 绘制行动轨迹
                if (!this.animatedTrajectory) {
                    this.animatedTrajectory = L.polyline([startPos], {
                        color: '#ff4444', weight: 3, opacity: 0.8
                    }).addTo(this.map);
                }
                const path = this.animatedTrajectory.getLatLngs();
                const last = path[path.length - 1];
                if (!last || last.distanceTo(currentPos) > 500) {
                    path.push(currentPos);
                    this.animatedTrajectory.setLatLngs(path);
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // 到达目的地，稍作停留后完成 Promise
                    setTimeout(() => {
                        resolve();
                    }, 200);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    showAnimatedTrajectory() {
        if (this.animatedTrajectory) this.animatedTrajectory.addTo(this.map);
        if (this.staticTrajectory) { this.map.removeLayer(this.staticTrajectory); this.staticTrajectory = null; }
    }

    hideAnimatedTrajectory() {
        if (this.animatedTrajectory) { this.map.removeLayer(this.animatedTrajectory); }
    }

    clearAnimatedTrajectory() {
        if (this.movingFootprintMarker) {
            this.map.removeLayer(this.movingFootprintMarker);
            this.movingFootprintMarker = null;
        }
        if (this.animatedTrajectory) {
            this.map.removeLayer(this.animatedTrajectory);
            this.animatedTrajectory = null;
        }
        if (this.staticTrajectory) {
            this.map.removeLayer(this.staticTrajectory);
            this.staticTrajectory = null;
        }
    }

    // --- Camera helpers (for CameraDirector) ---
    flyTo(latlng, zoom, options = {}) {
        this.map.flyTo(latlng, zoom, { duration: options.duration || 1 });
    }

    flyToBounds(bounds, options = {}) {
        this.map.flyToBounds(bounds, { padding: [30, 30], duration: options.duration || 1 });
    }

    resetView() {
        const allLatLngs = [];
        this.markers.forEach(({ marker }) => allLatLngs.push(marker.getLatLng()));
        if (allLatLngs.length) {
            this.map.fitBounds(L.latLngBounds(allLatLngs).pad(0.1));
        }
    }

    zoomIn() { this.map.zoomIn(); }
    zoomOut() { this.map.zoomOut(); }

    toggleFullscreen(containerEl) {
        if (!document.fullscreenElement) {
            containerEl?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) this.eventListeners.set(eventName, []);
        this.eventListeners.get(eventName).push(callback);
    }

    emit(eventName, ...args) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(cb => cb(...args));
        }
    }

    destroy() {
        this.clearAnimatedTrajectory();
        this.clearMarkers();
        if (this.map) { this.map.remove(); this.map = null; }
        this.isInitialized = false;
    }
}
