<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Distance from Country Center</h2>
    <div class="w-full h-[400px]" ref="chartContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { LearningEvent } from '@/modules/shared-types/types';

const props = defineProps<{
  learningEvents: LearningEvent[]
}>()

const chartContainer = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)

const updateChart = () => {
  if (!chart.value || !props.learningEvents.length) return

  const data = props.learningEvents.map((event, index) => ({
    index: index + 1,
    distance: event.distanceOfFirstClickToCenterOfCountry
  }))

  chart.value.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const attempt = params[0].dataIndex + 1
        return `Attempt ${attempt}<br/>` +
          `Distance: ${params[0].value.toFixed(0)}km`
      }
    },
    xAxis: {
      type: 'category',
      name: 'Attempt',
      data: data.map(d => d.index)
    },
    yAxis: {
      type: 'value',
      name: 'Distance (km)'
    },
    series: [
      {
        type: 'line',
        data: data.map(d => d.distance),
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
        },
        areaStyle: {
          opacity: 0.2
        }
      }
    ]
  })
}

onMounted(() => {
  if (!chartContainer.value) return
  
  chart.value = echarts.init(chartContainer.value)
  updateChart()
  
  window.addEventListener('resize', () => {
    chart.value?.resize()
  })
})

watch(() => props.learningEvents, updateChart, { deep: true })
</script> 