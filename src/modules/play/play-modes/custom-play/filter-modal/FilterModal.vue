<script setup lang="ts">
import { ref } from 'vue'
import TabWizardSelection from './tabs/TabWizardSelection.vue'
import TabQuickSelection from './tabs/TabQuickSelection.vue'
import TabCountrySelection from './tabs/TabCountrySelection.vue'

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
          Wizards
        </a>
        <a 
          class="tab" 
          :class="{ 'tab-active': activeTab === 'tab-b' }"
          @click="activeTab = 'tab-b'"
        >
          Quick Select
        </a>
        <a 
          class="tab" 
          :class="{ 'tab-active': activeTab === 'tab-c' }"
          @click="activeTab = 'tab-c'"
        >
          Countries
        </a>
      </div>

      <div class="modal-content">
        <TabWizardSelection v-if="activeTab === 'tab-a'" />
        <TabQuickSelection v-if="activeTab === 'tab-b'" />
        <TabCountrySelection v-if="activeTab === 'tab-c'" />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop bg-black bg-opacity-50">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template> 