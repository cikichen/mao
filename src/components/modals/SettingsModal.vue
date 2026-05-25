<template>
    <BaseModal title="地图与密钥设置" @close="close">
        <div class="settings-section">
            <h4 class="settings-section__title">地图底图服务商</h4>
            <div class="provider-selector">
                <label class="provider-item" :class="{ active: mapProvider === 'leaflet' }">
                    <input type="radio" value="leaflet" v-model="mapProvider" />
                    <i class="fas fa-globe"></i>
                    <div class="provider-info">
                        <span class="provider-name">Leaflet (OpenStreetMap)</span>
                        <span class="provider-desc">内置免费的开源地图服务，开箱即用。</span>
                    </div>
                </label>
                <label class="provider-item" :class="{ active: mapProvider === 'amap' }">
                    <input type="radio" value="amap" v-model="mapProvider" />
                    <i class="fas fa-map-marked-alt"></i>
                    <div class="provider-info">
                        <span class="provider-name">高德地图 (AMap)</span>
                        <span class="provider-desc">国内精确的地图解析与暗色样式，需自配置 Key。</span>
                    </div>
                </label>
            </div>
        </div>

        <Transition name="expand">
            <div class="settings-section" v-if="mapProvider === 'amap'">
                <h4 class="settings-section__title">高德地图 API 密钥配置</h4>
                <div class="input-group">
                    <label for="amapKey">API Key (Web端开发密钥)</label>
                    <input
                        type="text"
                        id="amapKey"
                        v-model="amapKey"
                        placeholder="请输入高德地图 JS API Key"
                        class="form-control"
                    />
                </div>
                <div class="input-group">
                    <label for="amapSecurity">安全密钥 (securityJsCode)</label>
                    <input
                        type="text"
                        id="amapSecurity"
                        v-model="amapSecurityJsCode"
                        placeholder="请输入高德安全密钥"
                        class="form-control"
                    />
                    <small class="help-text">
                        高德 Web 端 JS API v2.0 及以上安全规范要求配置安全密钥，用于防止密钥滥用。
                    </small>
                </div>
            </div>
        </Transition>

        <div class="settings-actions">
            <button class="btn btn-ghost" @click="close">取消</button>
            <button class="btn btn-primary" @click="save">保存设置</button>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseModal from './BaseModal.vue';
import { useUIStore } from '../../stores/ui';
import { useConfigStore } from '../../stores/config';

const uiStore = useUIStore();
const configStore = useConfigStore();

const mapProvider = ref('leaflet');
const amapKey = ref('');
const amapSecurityJsCode = ref('');

onMounted(() => {
    mapProvider.value = uiStore.mapProvider;
    amapKey.value = configStore.amapKey;
    amapSecurityJsCode.value = configStore.amapSecurityJsCode;
});

function close() {
    uiStore.closeModal();
}

function save() {
    uiStore.setMapProvider(mapProvider.value);
    configStore.setAMapConfig({
        key: amapKey.value,
        securityJsCode: amapSecurityJsCode.value
    });
    close();
}
</script>

<style scoped>
.settings-section {
    margin-bottom: 24px;
}

.settings-section__title {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.provider-selector {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.provider-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all var(--transition-normal);
}

.provider-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--border-color-hover);
}

.provider-item.active {
    border-color: var(--border-color-active);
    background: rgba(211, 47, 47, 0.06);
    box-shadow: 0 0 15px rgba(211, 47, 47, 0.08);
}

.provider-item input {
    display: none;
}

.provider-item i {
    font-size: 20px;
    color: var(--text-muted);
    transition: color var(--transition-fast);
}

.provider-item.active i {
    color: var(--color-primary-light);
}

.provider-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.provider-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.provider-desc {
    font-size: 12px;
    color: var(--text-secondary);
}

.input-group {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-group label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
}

.form-control {
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    transition: all var(--transition-fast);
}

.form-control:focus {
    border-color: var(--border-color-active);
    box-shadow: 0 0 10px rgba(211, 47, 47, 0.15);
}

.help-text {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.5;
}

.settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.25s ease-out;
    max-height: 250px;
    opacity: 1;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
    margin-bottom: 0;
}
</style>
