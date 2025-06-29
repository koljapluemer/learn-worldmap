<script setup lang="ts">
const props = defineProps<{
  instruction: string
}>()

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
const taskPre = isTouchDevice ? "Move the red circle so that it touches " : "Place the red circle so that it touches "
const taskPost = "."

const formattedInstruction = props.instruction
  .replace('{{instruction_pre}}', taskPre)
  .replace('{{instruction_post}}', '').trimEnd()+taskPost
</script>

<template>
  <Transition name="flip" mode="out-in">
    <div :key="instruction" class="text-center">
      {{ formattedInstruction }}
    </div>
  </Transition>
</template>

<style scoped>
.flip-enter-active,
.flip-leave-active {
  transition: all 0.2s ease;
}

.flip-enter-from,
.flip-leave-to {
  opacity: 0;
  transform: perspective(400px) rotateX(90deg);
}

.flip-enter-to,
.flip-leave-from {
  opacity: 1;
  transform: perspective(400px) rotateX(0);
}
</style> 