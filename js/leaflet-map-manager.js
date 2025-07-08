class LeafletMapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.movingFootprintMarker = null;
        this.animatedTrajectory = null;
        this.staticTrajectory = null;
        this.isInitialized = false;
        this.eventListeners = new Map();
    }

    async initMap(containerId) {
        console.log("LeafletMapManager: initMap called");

        // 检查是否已经初始化过
        if (this.map) {
            console.log("LeafletMapManager: Map already initialized, skipping");
            return;
        }

        // 检查容器是否存在
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Map container with id '${containerId}' not found`);
        }

        // 检查容器是否已经被Leaflet使用
        if (container._leaflet_id) {
            console.log("LeafletMapManager: Container already has a map, clearing it");
            container._leaflet_id = null;
            container.innerHTML = '';
        }

        // 使用韶山（出生点）作为初始中心点，而不是中国地理中心
        // 韶山坐标：[112.527621, 27.915456] -> Leaflet格式：[27.915456, 112.527621]
        const birthPlaceCenter = [27.915456, 112.527621]; // 韶山坐标
        const initialZoom = 8; // 使用较高的缩放级别显示更多细节

        this.map = L.map(containerId, {
            center: birthPlaceCenter,
            zoom: initialZoom,
            zoomControl: true,
            attributionControl: true
        });

        // 添加瓦片图层
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 3
        }).addTo(this.map);

        // 确保地图正确渲染
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);

        this.isInitialized = true;
        this.emit('mapReady');
        return Promise.resolve();
    }

    addEventMarkers(events) {
        // TODO: Implement adding markers for Leaflet
        console.log("LeafletMapManager: addEventMarkers called");
        events.forEach(event => {
            if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
            const marker = L.marker([event.coordinates.lat, event.coordinates.lng]).addTo(this.map);
            marker.bindPopup(event.title);
            this.markers.set(event.id, marker);
        });
        // this.map.fitBounds(this.markers.values().map(m => m.getLatLng())); // Need to collect all latlngs
    }

    centerToEvent(event) {
        // TODO: Implement centering map for Leaflet
        console.log("LeafletMapManager: centerToEvent called");
        if (!event.coordinates || isNaN(event.coordinates.lng) || isNaN(event.coordinates.lat)) return;
        this.map.panTo([event.coordinates.lat, event.coordinates.lng]);
        this.map.setZoom(12);
    }

    drawStaticTrajectory(eventsArray) {
        console.log("LeafletMapManager: drawStaticTrajectory called - DISABLED");
        return; // 禁用静态轨迹绘制，使用动画轨迹作为永久路径
        if (this.staticTrajectory) {
            this.map.removeLayer(this.staticTrajectory);
        }
        if (!eventsArray || eventsArray.length < 1) return;

        const pathPoints = eventsArray.map(event => {
            if (event.coordinates && !isNaN(event.coordinates.lng) && !isNaN(event.coordinates.lat)) {
                return [event.coordinates.lat, event.coordinates.lng];
            }
            return null;
        }).filter(point => point !== null);

        if (pathPoints.length < 1) return;

        this.staticTrajectory = L.polyline(pathPoints, {
            color: 'red',
            weight: 4,
            opacity: 0.6
        }).addTo(this.map);
    }

    animateFootprint(startEvent, endEvent, baseDuration = 2000) {
        console.log("LeafletMapManager: animateFootprint called");
        return new Promise(async (resolve) => {
            if (!startEvent || !endEvent || !startEvent.coordinates || !endEvent.coordinates) {
                resolve();
                return;
            }

            const startPos = L.latLng(startEvent.coordinates.lat, startEvent.coordinates.lng);
            const endPos = L.latLng(endEvent.coordinates.lat, endEvent.coordinates.lng);

            // 计算距离（米）
            const distance = startPos.distanceTo(endPos);
            console.log(`Distance: ${distance}m between ${startEvent.title} and ${endEvent.title}`);

            // 如果距离很小（<100米），认为是同一地点，直接播放事件
            if (distance < 100) {
                console.log('Same location detected, skipping animation');
                // 直接触发事件更新，不进行移动动画
                setTimeout(() => {
                    this.emit('eventReached', endEvent);
                    console.log('Event reached (same location):', endEvent.title);
                    resolve();
                }, 800); // 短暂停留后继续
                return;
            }

            // 简化缩放策略：严格按距离规则执行，根据距离自动调整移动速度
            let needsZoom, targetZoom, totalDuration;
            const currentZoom = this.map.getZoom();

            // 严格按距离分级缩放，不考虑城市因素
            if (distance > 500000) { // > 500km - 远距离移动，缩小视野
                needsZoom = true;
                if (distance > 1000000) {
                    targetZoom = 5; // 超远距离：国家级视图
                } else if (distance > 800000) {
                    targetZoom = 6; // 远距离：省际视图
                } else {
                    targetZoom = 7; // 中远距离：区域视图
                }
                // 根据距离自动调整移动速度：远距离移动更快
                totalDuration = Math.max(3000, Math.min(5000, distance * 0.002));
                console.log(`远距离移动 ${Math.round(distance/1000)}km，缩小到级别 ${targetZoom}，时长 ${totalDuration}ms`);
            } else if (distance < 10000) { // < 10km：街道级视图
                needsZoom = true;
                targetZoom = Math.max(14, Math.min(16, currentZoom + 2)); // 拉近到14-16级，看到街道
                // 短距离移动较慢，便于观察细节
                totalDuration = Math.max(1500, Math.min(2500, distance * 0.15));
                console.log(`短距离移动 ${Math.round(distance)}m，拉近到街道级别 ${targetZoom}，时长 ${totalDuration}ms`);
            } else if (distance < 100000) { // 10-100km：区域细节视图
                needsZoom = true;
                targetZoom = Math.max(10, Math.min(12, currentZoom)); // 保持10-12级
                // 中短距离移动适中速度
                totalDuration = Math.max(2000, Math.min(3000, distance * 0.02));
                console.log(`中短距离移动 ${Math.round(distance/1000)}km，区域级别 ${targetZoom}，时长 ${totalDuration}ms`);
            } else { // 100-500km：保持适中视野
                needsZoom = true;
                targetZoom = Math.max(8, Math.min(10, currentZoom)); // 保持8-10级
                // 中距离移动较快
                totalDuration = Math.max(2500, Math.min(4000, distance * 0.005));
                console.log(`中距离移动 ${Math.round(distance/1000)}km，适中级别 ${targetZoom}，时长 ${totalDuration}ms`);
            }

            // 分阶段时间分配（为等待瓦片加载预留时间）
            const zoomOutDuration = needsZoom ? totalDuration * 0.12 : 0; // 12%缩放出
            const waitForTilesDuration = needsZoom ? 800 : 0; // 固定800ms等待瓦片
            const moveDuration = totalDuration * 0.65; // 65%移动（主要时间）
            const zoomInDuration = needsZoom ? totalDuration * 0.12 : 0; // 12%缩放入

            console.log(`Distance: ${distance}m, needsZoom: ${needsZoom}, totalDuration: ${totalDuration}ms, phases: ${zoomOutDuration}+${waitForTilesDuration}+${moveDuration}+${zoomInDuration}`);

            // 不清除之前的轨迹，让动画轨迹累积成为完整路径

            if (!this.movingFootprintMarker) {
                this.movingFootprintMarker = L.marker(startPos, {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: '<div style="width: 26px; height: 26px; background-color: #ff4444; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px rgba(255,68,68,0.6);"></div>',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13]
                    })
                }).addTo(this.map);
            }

            let startTime = null;
            let phase = needsZoom ? 'zoomOut' : 'move';
            let phaseStartTime = null;
            let eventTriggered = false;

            // 缓动函数
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };

            // 线性缓动函数，用于平滑匀速移动
            const linear = (t) => t;

            const animate = (currentTime) => {
                if (!startTime) {
                    startTime = currentTime;
                    phaseStartTime = currentTime;
                }

                const phaseElapsed = currentTime - phaseStartTime;

                if (phase === 'zoomOut' && needsZoom) {
                    // 阶段1：快速缩放出
                    const progress = Math.min(phaseElapsed / zoomOutDuration, 1);
                    const easedProgress = easeInOutCubic(progress);

                    if (progress < 1) {
                        const newZoom = currentZoom + (targetZoom - currentZoom) * easedProgress;
                        this.map.setZoom(newZoom);
                        requestAnimationFrame(animate);
                    } else {
                        this.map.setZoom(targetZoom);
                        phase = 'waitForTiles';
                        phaseStartTime = currentTime;
                        console.log('缩放完成，等待地图瓦片加载...');
                        requestAnimationFrame(animate);
                    }
                } else if (phase === 'waitForTiles') {
                    // 阶段1.5：等待地图瓦片加载完成
                    const minWaitTime = 500; // 最少等待500ms
                    const maxWaitTime = 1200; // 最多等待1200ms

                    // 检查是否有瓦片正在加载
                    const tilesLoading = this.map._loading || false;

                    if (phaseElapsed < minWaitTime || (tilesLoading && phaseElapsed < maxWaitTime)) {
                        requestAnimationFrame(animate);
                    } else {
                        phase = 'move';
                        phaseStartTime = currentTime;
                        console.log(`地图瓦片加载完成（等待${Math.round(phaseElapsed)}ms），开始移动`);
                        requestAnimationFrame(animate);
                    }
                } else if (phase === 'move') {
                    // 阶段2：平滑匀速移动
                    const progress = Math.min(phaseElapsed / moveDuration, 1);
                    const easedProgress = linear(progress); // 使用线性缓动，确保匀速

                    // 移动开始时立即显示事件详情
                    if (progress > 0 && !eventTriggered) {
                        this.emit('eventReached', endEvent);
                        console.log('Event reached at start of movement:', endEvent.title);
                        eventTriggered = true;
                    }

                    if (progress < 1) {
                        const currentLat = startPos.lat + (endPos.lat - startPos.lat) * easedProgress;
                        const currentLng = startPos.lng + (endPos.lng - startPos.lng) * easedProgress;
                        const currentPos = L.latLng(currentLat, currentLng);

                        this.movingFootprintMarker.setLatLng(currentPos);
                        this.map.panTo(currentPos, { animate: false });

                        // 更新累积轨迹（作为永久路径）
                        if (!this.animatedTrajectory) {
                            // 创建全局轨迹线，从起点开始
                            this.animatedTrajectory = L.polyline([startPos], {
                                color: '#ff4444',
                                weight: 3,
                                opacity: 0.8
                            }).addTo(this.map);
                        } else {
                            // 确保轨迹连续性：如果当前轨迹的终点不是起点，则连接
                            const animatedPath = this.animatedTrajectory.getLatLngs();
                            const lastPoint = animatedPath[animatedPath.length - 1];
                            if (lastPoint && lastPoint.distanceTo(startPos) > 100) {
                                animatedPath.push(startPos);
                                this.animatedTrajectory.setLatLngs(animatedPath);
                            }
                        }

                        // 平滑添加轨迹点
                        const animatedPath = this.animatedTrajectory.getLatLngs();
                        const lastPoint = animatedPath[animatedPath.length - 1];
                        if (!lastPoint || lastPoint.distanceTo(currentPos) > 500) { // 距离超过500m才添加新点
                            animatedPath.push(currentPos);
                            this.animatedTrajectory.setLatLngs(animatedPath);
                        }

                        requestAnimationFrame(animate);
                    } else {
                        this.movingFootprintMarker.setLatLng(endPos);
                        this.map.panTo(endPos, { animate: false });

                        if (needsZoom && zoomInDuration > 0) {
                            phase = 'zoomIn';
                            phaseStartTime = currentTime;
                            requestAnimationFrame(animate);
                        } else {
                            phase = 'finish';
                            phaseStartTime = currentTime;
                            requestAnimationFrame(animate);
                        }
                    }
                } else if (phase === 'zoomIn' && needsZoom) {
                    // 阶段3：快速缩放入（如果需要）
                    const progress = Math.min(phaseElapsed / zoomInDuration, 1);
                    const easedProgress = easeInOutCubic(progress);

                    if (progress < 1) {
                        // 可以在这里做细微的缩放调整
                        requestAnimationFrame(animate);
                    } else {
                        phase = 'waitForTilesAfterZoomIn';
                        phaseStartTime = currentTime;
                        console.log('缩放入完成，等待瓦片加载...');
                        requestAnimationFrame(animate);
                    }
                } else if (phase === 'waitForTilesAfterZoomIn') {
                    // 阶段3.5：缩放入后等待瓦片加载
                    const waitTime = 400; // 缩放入后等待400ms
                    if (phaseElapsed < waitTime) {
                        requestAnimationFrame(animate);
                    } else {
                        phase = 'finish';
                        phaseStartTime = currentTime;
                        console.log('缩放入瓦片加载完成');
                        requestAnimationFrame(animate);
                    }
                } else if (phase === 'finish') {
                    // 阶段4：完成后等待
                    // 事件已经在移动开始时触发，这里只需要等待
                    if (phaseElapsed < 800) { // 停留800ms，让用户有时间观察
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                }
            };

            requestAnimationFrame(animate);
        });
    }

    showAnimatedTrajectory() {
        // TODO: Implement show animated trajectory for Leaflet
        console.log("LeafletMapManager: showAnimatedTrajectory called");
        if (this.animatedTrajectory) {
            this.animatedTrajectory.addTo(this.map);
        }
        if (this.staticTrajectory) {
            this.map.removeLayer(this.staticTrajectory);
        }
    }

    hideAnimatedTrajectory() {
        console.log("LeafletMapManager: hideAnimatedTrajectory called - DISABLED");
        return; // 不隐藏动画轨迹，让它作为永久路径保留
        if (this.staticTrajectory) {
            this.staticTrajectory.addTo(this.map);
        }
    }

    clearAnimatedTrajectory() {
        console.log("LeafletMapManager: clearAnimatedTrajectory called - DISABLED");
        return; // 不清除动画轨迹，让它作为永久路径保留
        if (this.movingFootprintMarker) {
            this.map.removeLayer(this.movingFootprintMarker);
            this.movingFootprintMarker = null; // 重置移动标记
        }
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
