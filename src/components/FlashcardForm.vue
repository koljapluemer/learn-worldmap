<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  front: string;
  back: string;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:front', value: string): void;
  (e: 'update:back', value: string): void;
  (e: 'submit'): void;
}>();

const front = ref(props.front);
const back = ref(props.back);

function handleSubmit() {
  emit('submit');
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Front</span>
        </label>
        <textarea
          v-model="front"
          class="textarea textarea-bordered"
          placeholder="Enter the front of the card"
          @input="emit('update:front', front)"
        ></textarea>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Back</span>
        </label>
        <textarea
          v-model="back"
          class="textarea textarea-bordered"
          placeholder="Enter the back of the card"
          @input="emit('update:back', back)"
        ></textarea>
      </div>
      <div class="card-actions justify-end">
        <button class="btn btn-primary" @click="handleSubmit">
          {{ submitLabel || 'Submit' }}
        </button>
      </div>
    </div>
  </div>
</template> 