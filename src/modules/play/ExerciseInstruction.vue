<script setup lang="ts">
const props = defineProps<{
  instruction: string
}>()

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
const taskPre = isTouchDevice ? "Move the red circle so that it touches " : "Place the red circle so that it touches "
const taskPost = "."

const formattedInstruction = props.instruction
  .replace('$task_pre', taskPre)
  .replace('$task_post', taskPost)
</script>

<template>
  {{ formattedInstruction }}
</template> 