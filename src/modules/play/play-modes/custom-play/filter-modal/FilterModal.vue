<script setup lang="ts">
import { ref } from 'vue'
import TabA from './tabs/TabA.vue'
import TabB from './tabs/TabB.vue'
import TabC from './tabs/TabC.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeTab = ref('tab-a')
</script>

<template>
  <dialog :class="{ 'modal': true, 'modal-open': isOpen }">
    <div class="modal-box w-11/12 max-w-5xl h-[90vh]">
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="emit('close')"
      >
        ✕
      </button>
      
      <div class="tabs tabs-boxed mb-4">
        <a 
          class="tab" 
          :class="{ 'tab-active': activeTab === 'tab-a' }"
          @click="activeTab = 'tab-a'"
        >
          Tab A
        </a>
        <a 
          class="tab" 
          :class="{ 'tab-active': activeTab === 'tab-b' }"
          @click="activeTab = 'tab-b'"
        >
          Tab B
        </a>
        <a 
          class="tab" 
          :class="{ 'tab-active': activeTab === 'tab-c' }"
          @click="activeTab = 'tab-c'"
        >
          Tab C
        </a>
      </div>

      <div class="modal-content">
        <TabA v-if="activeTab === 'tab-a'" />
        <TabB v-if="activeTab === 'tab-b'" />
        <TabC v-if="activeTab === 'tab-c'" />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop bg-black bg-opacity-50">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template> 