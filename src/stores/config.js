import { defineStore } from 'pinia';
import { config as staticConfig } from '../config/index';

const AMAP_KEY_STORAGE = 'mao_amap_key';
const AMAP_JSCODE_STORAGE = 'mao_amap_security_jscode';

function getInitialKey() {
    if (typeof window === 'undefined') return '';
    return window.localStorage?.getItem(AMAP_KEY_STORAGE) || window.LOCAL_CONFIG?.AMAP_API_KEY || staticConfig.amap.key || '';
}

function getInitialJsCode() {
    if (typeof window === 'undefined') return '';
    return window.localStorage?.getItem(AMAP_JSCODE_STORAGE) || window.LOCAL_CONFIG?.AMAP_SECURITY_JS_CODE || '';
}

export const useConfigStore = defineStore('config', {
    state: () => ({
        app: { ...staticConfig.app },
        amap: {
            ...staticConfig.amap,
            key: getInitialKey(),
            securityJsCode: getInitialJsCode()
        },
        theme: { ...staticConfig.theme }
    }),
    getters: {
        mapProvider: (state) => state.app.defaultProvider,
        amapKey: (state) => state.amap.key,
        amapSecurityJsCode: (state) => state.amap.securityJsCode,
        isDebug: (state) => state.app.debug
    },
    actions: {
        setMapProvider(provider) {
            this.app.defaultProvider = provider;
        },
        setAMapConfig({ key, securityJsCode }) {
            this.amap.key = key || '';
            this.amap.securityJsCode = securityJsCode || '';
            if (typeof window !== 'undefined') {
                window.localStorage?.setItem(AMAP_KEY_STORAGE, this.amap.key);
                window.localStorage?.setItem(AMAP_JSCODE_STORAGE, this.amap.securityJsCode);
            }
        },
        updateConfig(newConfig) {
            if (newConfig.app) Object.assign(this.app, newConfig.app);
            if (newConfig.amap) Object.assign(this.amap, newConfig.amap);
            if (newConfig.theme) Object.assign(this.theme, newConfig.theme);
        }
    }
});

