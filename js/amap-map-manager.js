class AMapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.trajectory = null;
        this.currentMarker = null;
        this.movingFootprintMarker = null;
        this.animatedTrajectory = null; // For the growing path during animation
        this.staticTrajectory = null;   // For the full path when not animating
        this.isInitialized = false;
        this.eventListeners = new Map();
    }

    async initMap(containerId) {
        if (typeof AMap === 'undefined') throw new Error('高德地图API未加载');
        // 使用韶山（出生点）作为初始中心点
        this.map = new AMap.Map(containerId, {
            center: [112.527621, 27.915456], // 韶山坐标
            zoom: 8, // 使用较高的缩放级别显示更多细节
            mapStyle: 'amap://styles/normal',
        });
        this.map.on('complete', () => {
            this.isInitialized = true;
            this.emit('mapReady');

            // Initialize animated and static trajectories
            this.animatedTrajectory = new AMap.Polyline({
                path: [],
                strokeColor: '#007bff', // Blue for animated path
                strokeWeight: 4,
                strokeOpacity: 0.8,
                map: this.map,
                zIndex: 90 // Higher zIndex for animated path
            });
            this.staticTrajectory = new AMap.Polyline({
                path: [],
                strokeColor: '#d32f2f', // Red for static path
                strokeWeight: 4,
                strokeOpacity: 0.6,
                map: this.map,
                zIndex: 80 // Lower zIndex for static path
            });
        });
        return new Promise(resolve => this.map.on('complete', resolve));
    }

    addEventMarkers(events) {
        events.forEach(event => {
            if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
            const marker = new AMap.Marker({
                position: [event.coordinates.lng, event.coordinates.lat],
                title: event.title,
                extData: event
            });
            marker.on('click', () => this.emit('markerClick', event));
            this.map.add(marker);
            this.markers.set(event.id, marker);
        });
        this.map.setFitView();
    }

    centerToEvent(event) {
        if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
        const marker = this.markers.get(event.id);
        if (!marker) return;

        this.map.panTo(marker.getPosition());
        this.map.setZoom(12);

        if (this.currentMarker) {
            this.currentMarker.setAnimation('AMAP_ANIMATION_NONE');
        }
        marker.setAnimation('AMAP_ANIMATION_BOUNCE');
        this.currentMarker = marker;
    }

    drawStaticTrajectory(eventsArray) {
        // Hide animated trajectory
        if (this.animatedTrajectory) {
            this.animatedTrajectory.setPath([]);
        }

        if (!eventsArray || eventsArray.length < 1) {
            if (this.staticTrajectory) this.staticTrajectory.setPath([]);
            return;
        }

        const pathPoints = eventsArray.map(event => {
            if (event.coordinates && !isNaN(event.coordinates.lng) && !isNaN(event.coordinates.lat)) {
                return [event.coordinates.lng, event.coordinates.lat];
            }
            return null;
        }).filter(point => point !== null);

        if (pathPoints.length < 1) {
            if (this.staticTrajectory) this.staticTrajectory.setPath([]);
            return;
        }

        if (this.staticTrajectory) {
            this.staticTrajectory.setPath(pathPoints);
        }
    }

    // New: Animate a footprint marker along a path with smart zoom and speed control
    animateFootprint(startEvent, endEvent, baseDuration = 2000) {
        return new Promise(resolve => {
            if (!startEvent || !endEvent || !startEvent.coordinates || !endEvent.coordinates) {
                resolve();
                return;
            }

            const startPos = new AMap.LngLat(startEvent.coordinates.lng, startEvent.coordinates.lat);
            const endPos = new AMap.LngLat(endEvent.coordinates.lng, endEvent.coordinates.lat);

            // Calculate distance and determine animation strategy
            const distance = startPos.distance(endPos);
            console.log(`AMap Distance: ${distance}m between ${startEvent.title} and ${endEvent.title}`);

            // 智能动画策略分类
            let animationType, zoomOutLevel, zoomInLevel, duration;

            if (distance < 5000) { // < 5km - 同城内移动
                animationType = 'intracity';
                zoomOutLevel = 12; // 拉近显示街道级别
                zoomInLevel = 14;  // 最终更近显示细节
                duration = Math.max(1500, distance * 0.5); // 最少1.5秒
            } else if (distance < 50000) { // 5-50km - 城际移动
                animationType = 'intercity';
                zoomOutLevel = 9;
                zoomInLevel = 11;
                duration = Math.max(2000, distance * 0.08);
            } else if (distance < 200000) { // 50-200km - 省内移动
                animationType = 'intraprovince';
                zoomOutLevel = 7;
                zoomInLevel = 10;
                duration = Math.max(2500, distance * 0.015);
            } else if (distance < 1000000) { // 200km-1000km - 跨省移动
                animationType = 'interprovince';
                zoomOutLevel = 5;
                zoomInLevel = 9;
                duration = Math.max(3000, distance * 0.005);
            } else { // > 1000km - 长距离移动
                animationType = 'longdistance';
                zoomOutLevel = 4;
                zoomInLevel = 8;
                duration = Math.max(4000, Math.min(6000, distance * 0.003)); // 最多6秒
            }

            console.log(`AMap Animation type: ${animationType}, duration: ${duration}ms, zoom: ${zoomOutLevel}->${zoomInLevel}`);

            if (!this.movingFootprintMarker) {
                this.movingFootprintMarker = new AMap.Marker({
                    position: startPos,
                    content: '<div style="width: 26px; height: 26px; background-color: #ff4444; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px rgba(255,68,68,0.6);"></div>',
                    offset: new AMap.Pixel(-13, -13),
                    map: this.map
                });
            }

            let startTime = null;
            let phase = 'zoomOut';
            let phaseStartTime = null;
            let eventTriggered = false; // 添加标志防止重复触发事件
            const pauseDuration = 600; // 减少停留时间

            // 根据动画类型调整时间分配
            let zoomOutDuration, moveDuration, zoomInDuration;

            if (animationType === 'intracity') {
                // 同城移动：快速拉近 -> 慢速移动 -> 稍微调整
                zoomOutDuration = duration * 0.15;
                moveDuration = duration * 0.7;
                zoomInDuration = duration * 0.15;
            } else if (animationType === 'intercity') {
                // 城际移动：适中拉远 -> 适中移动 -> 拉近
                zoomOutDuration = duration * 0.2;
                moveDuration = duration * 0.6;
                zoomInDuration = duration * 0.2;
            } else {
                // 长距离移动：明显拉远 -> 快速移动 -> 拉近
                zoomOutDuration = duration * 0.25;
                moveDuration = duration * 0.5;
                zoomInDuration = duration * 0.25;
            }

            // 缓动函数
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };

            const easeOutQuad = (t) => {
                return 1 - (1 - t) * (1 - t);
            };

            const animate = (currentTime) => {
                if (!startTime) {
                    startTime = currentTime;
                    phaseStartTime = currentTime;
                }

                const phaseElapsed = currentTime - phaseStartTime;

                if (phase === 'zoomOut') {
                    // 阶段1：调整地图缩放
                    const progress = Math.min(phaseElapsed / zoomOutDuration, 1);
                    const easedProgress = easeOutQuad(progress);

                    if (progress < 1) {
                        const currentZoom = this.map.getZoom();
                        const targetZoom = zoomOutLevel;
                        const newZoom = currentZoom + (targetZoom - currentZoom) * easedProgress;
                        this.map.setZoom(newZoom);
                        requestAnimationFrame(animate);
                    } else {
                        this.map.setZoom(zoomOutLevel);

                        // 等待地图缩放和图层加载完成
                        setTimeout(() => {
                            phase = 'move';
                            phaseStartTime = performance.now();
                            requestAnimationFrame(animate);
                        }, 200);
                    }
                } else if (phase === 'move') {
                    // 阶段2：移动
                    const progress = Math.min(phaseElapsed / moveDuration, 1);

                    // 根据动画类型选择不同的缓动效果
                    let easedProgress;
                    if (animationType === 'intracity') {
                        easedProgress = progress; // 同城移动使用线性
                    } else {
                        easedProgress = easeInOutCubic(progress);
                    }

                    if (progress < 1) {
                        const currentLng = startPos.getLng() + (endPos.getLng() - startPos.getLng()) * easedProgress;
                        const currentLat = startPos.getLat() + (endPos.getLat() - startPos.getLat()) * easedProgress;
                        const currentPos = new AMap.LngLat(currentLng, currentLat);

                        this.movingFootprintMarker.setPosition(currentPos);
                        this.map.setCenter(currentPos);

                        // Update animated trajectory
                        const animatedPath = this.animatedTrajectory.getPath();
                        if (animatedPath.length === 0 || animatedPath[animatedPath.length - 1].toString() !== currentPos.toString()) {
                            animatedPath.push(currentPos);
                            this.animatedTrajectory.setPath(animatedPath);
                        }

                        requestAnimationFrame(animate);
                    } else {
                        this.movingFootprintMarker.setPosition(endPos);
                        this.map.setCenter(endPos);

                        phase = 'zoomIn';
                        phaseStartTime = currentTime;
                        requestAnimationFrame(animate);
                    }
                } else if (phase === 'zoomIn') {
                    // 阶段3：调整到最终缩放级别
                    const progress = Math.min(phaseElapsed / zoomInDuration, 1);
                    const easedProgress = easeOutQuad(progress);

                    if (progress < 1) {
                        const currentZoom = this.map.getZoom();
                        const targetZoom = zoomInLevel;
                        const newZoom = currentZoom + (targetZoom - currentZoom) * easedProgress;
                        this.map.setZoom(newZoom);
                        requestAnimationFrame(animate);
                    } else {
                        this.map.setZoom(zoomInLevel);

                        // 等待最终缩放完成
                        setTimeout(() => {
                            phase = 'pause';
                            phaseStartTime = performance.now();
                            requestAnimationFrame(animate);
                        }, 150);
                    }
                } else if (phase === 'pause') {
                    // 阶段4：停留展示
                    if (!eventTriggered) {
                        // 只触发一次事件更新
                        this.emit('eventReached', endEvent);
                        console.log('AMap Event reached and details updated:', endEvent.title);
                        eventTriggered = true;
                    }

                    if (phaseElapsed < pauseDuration) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                }
            };

            requestAnimationFrame(animate);
        });
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

    showAnimatedTrajectory() {
        if (this.animatedTrajectory && this.animatedTrajectory.show) {
            this.animatedTrajectory.show();
        }
        if (this.staticTrajectory && this.staticTrajectory.hide) {
            this.staticTrajectory.hide();
        }
    }

    hideAnimatedTrajectory() {
        if (this.animatedTrajectory && this.animatedTrajectory.hide) {
            this.animatedTrajectory.hide();
            this.animatedTrajectory.setPath([]); // Clear path when hidden
        }
        if (this.staticTrajectory && this.staticTrajectory.show) {
            this.staticTrajectory.show();
        }
    }

    clearAnimatedTrajectory() {
        console.log("AMapManager: clearAnimatedTrajectory called");
        if (this.animatedTrajectory) {
            this.animatedTrajectory.setPath([]); // 清空路径
            if (this.animatedTrajectory.hide) {
                this.animatedTrajectory.hide();
            }
        }
        if (this.movingFootprintMarker) {
            this.movingFootprintMarker.setMap(null); // 移除移动标记
            this.movingFootprintMarker = null;
        }
    }
}
