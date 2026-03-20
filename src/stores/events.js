import { defineStore } from 'pinia';
import { eventsData } from '../../js/events-data.js';

const EVENTS_DATA_URL = 'data/events.json';

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [],
    status: 'idle',
    error: null,
    selectedEventId: null,
    filters: {
      types: [], // 空数组表示全选
      yearRange: { start: 1893, end: 1976 }
    }
  }),
  getters: {
    currentEvent(state) {
      if (state.selectedEventId) {
        const selected = state.events.find(event => event.id === state.selectedEventId);
        if (selected) return selected;
      }
      const filtered = state.events.filter(event => {
        if (state.filters.types.length > 0 && !state.filters.types.includes(event.type)) {
          return false;
        }
        if (event.year < state.filters.yearRange.start || event.year > state.filters.yearRange.end) {
          return false;
        }
        return true;
      });
      return filtered[0] || null;
    },
    filteredEvents(state) {
      return state.events.filter(event => {
        // 类型筛选
        if (state.filters.types.length > 0 && !state.filters.types.includes(event.type)) {
          return false;
        }
        // 年份筛选
        if (event.year < state.filters.yearRange.start || event.year > state.filters.yearRange.end) {
          return false;
        }
        return true;
      });
    }
  },
  actions: {
    async loadEvents(force = false) {
      if (this.status === 'loading' && !force) return;
      if (this.events.length && !force) return;

      this.status = 'loading';
      this.error = null;

      try {
        const response = await fetch(`${EVENTS_DATA_URL}?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`Failed to load events: ${response.status}`);
        }
        const data = await response.json();
        this.hydrate(data);
      } catch (error) {
        console.warn('Failed to load events from file, using fallback data:', error);
        // Fallback for local file access where fetch might fail
        try {
          this.hydrate(eventsData);
          if (!this.events.length) {
            this.status = 'error';
            this.error = error;
          }
        } catch (fallbackError) {
          this.status = 'error';
          this.error = fallbackError;
        }
      }
    },
    hydrate(events = []) {
        // 转换坐标格式: [lng, lat] -> {lat, lng}
        this.events = Array.isArray(events) ? events.map(event => {
            if (event.location?.coordinates && Array.isArray(event.location.coordinates)) {
                return {
            ...event,
            coordinates: {
              lng: event.location.coordinates[0],
              lat: event.location.coordinates[1]
            }
          };
        }
        return event;
        }) : [];
        this.status = this.events.length ? 'ready' : 'empty';
        this.error = null;
        this.selectedEventId = this.events[0]?.id || null;
        const filtered = this.filteredEvents;
        if (filtered.length > 0 && !filtered.find(event => event.id === this.selectedEventId)) {
            this.selectedEventId = filtered[0].id;
        }
    },
    selectEvent(eventId) {
        this.selectedEventId = eventId;
    },
    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        const filtered = this.filteredEvents;
        if (filtered.length === 0) {
            this.selectedEventId = null;
            return;
        }
        if (!filtered.find(event => event.id === this.selectedEventId)) {
            this.selectedEventId = filtered[0].id;
        }
    },
    resetFilters() {
        this.filters = {
            types: [],
            yearRange: { start: 1893, end: 1976 }
        };
        const filtered = this.filteredEvents;
        this.selectedEventId = filtered[0]?.id || null;
    }
  }
});
