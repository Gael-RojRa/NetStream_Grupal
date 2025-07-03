<template>
  <div class="progress-bar">
    <div class="progress-info">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-stats">{{ watchedCount }}/{{ totalCount }}</span>
    </div>
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :style="{ width: `${percentage}%` }"
        :class="{ 'complete': percentage === 100 }"
      ></div>
    </div>
    <div class="progress-percentage">{{ Math.round(percentage) }}%</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  watchedCount: number;
  totalCount: number;
}

const props = defineProps<Props>();

const percentage = computed(() => {
  if (props.totalCount === 0) return 0;
  return (props.watchedCount / props.totalCount) * 100;
});
</script>

<style scoped>
.progress-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
}

.progress-stats {
  font-size: 0.8rem;
  color: #b0b0b0;
  font-weight: 500;
}

.progress-track {
  width: 100%;
  height: 8px;
  background-color: #3a3b47;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
  position: relative;
}

.progress-fill.complete {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

.progress-percentage {
  font-size: 0.75rem;
  color: #bac3ff;
  font-weight: 600;
  text-align: right;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Variante compacta */
.progress-bar.compact {
  gap: 4px;
}

.progress-bar.compact .progress-track {
  height: 6px;
}

.progress-bar.compact .progress-label {
  font-size: 0.8rem;
}

.progress-bar.compact .progress-stats {
  font-size: 0.7rem;
}

.progress-bar.compact .progress-percentage {
  font-size: 0.7rem;
}
</style>
