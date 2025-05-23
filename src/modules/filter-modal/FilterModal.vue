<script setup lang="ts">
import QuickSelection from './selections/QuickSelection.vue';
import CountryListSelection from './selections/CountryListSelection.vue';

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

</script>

<template>
  <dialog :class="{ 'modal': true, 'modal-open': isOpen }">
    <div class="modal-box w-11/12 max-w-5xl h-[90vh]">
      <QuickSelection />
      <CountryListSelection />
    </div>
    <form method="dialog" class="modal-backdrop bg-black bg-opacity-50">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template> 