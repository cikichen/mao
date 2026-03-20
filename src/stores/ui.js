import { defineStore } from 'pinia';

const MAP_PROVIDER_STORAGE_KEY = 'mao_map_provider';

function getInitialMapProvider() {
    if (typeof window === 'undefined') return 'leaflet';
    const stored = window.localStorage?.getItem(MAP_PROVIDER_STORAGE_KEY);
    if (stored === 'leaflet' || stored === 'amap') return stored;
    const appDefault = window.APP_CONFIG?.defaultProvider;
    if (appDefault === 'leaflet' || appDefault === 'amap') return appDefault;
    return 'leaflet';
}

export const useUIStore = defineStore('ui', {
    state: () => ({
        activeModal: null, // 'search', 'filter', 'info' or null
        isSidebarOpen: true,
        mapProvider: getInitialMapProvider() // 'leaflet' or 'amap'
    }),
    actions: {
        openModal(modalName) {
            this.activeModal = modalName;
        },
        closeModal() {
            this.activeModal = null;
        },
        toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
        },
        setMapProvider(provider) {
            if (provider !== 'leaflet' && provider !== 'amap') return;
            this.mapProvider = provider;
            if (typeof window !== 'undefined') {
                window.localStorage?.setItem(MAP_PROVIDER_STORAGE_KEY, provider);
            }
        }
    }
});
