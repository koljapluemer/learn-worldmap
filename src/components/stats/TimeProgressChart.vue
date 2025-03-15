<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Time to Find Country</h2>
    <div class="w-full h-[400px]" ref="chartContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { LearningEvent } from '../../composables/useDexie'
import * as echarts from 'echarts'

const props = defineProps<{
  learningEvents: LearningEvent[]
}>()

const chartContainer = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)

const updateChart = () => {
  if (!chart.value || !props.learningEvents.length) return

  const data = props.learningEvents.map((event, index) => ({
    index: index + 1,
    firstClick: Math.min(event.msFromExerciseToFirstClick / 1000, 10),
    finishClick: Math.min(event.msFromExerciseToFinishClick / 1000, 10)
  }))

  chart.value.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const attempt = params[0].dataIndex + 1
        return `Attempt ${attempt}<br/>` +
          `First Click: ${params[0].value.toFixed(2)}s<br/>` +
          `Finish: ${params[1].value.toFixed(2)}s`
      }
    },
    legend: {
      data: ['Time to First Click', 'Time to Finish']
    },
    xAxis: {
      type: 'category',
      name: 'Attempt',
      data: data.map(d => d.index)
    },
    yAxis: {
      type: 'value',
      name: 'Seconds',
      max: 10
    },
    series: [
      {
        name: 'Time to First Click',
        type: 'line',
        data: data.map(d => d.firstClick),
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
        }
      },
      {
        name: 'Time to Finish',
        type: 'line',
        data: data.map(d => d.finishClick),
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
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