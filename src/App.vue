<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow-lg">
      <div class="container mx-auto">
        <div class="flex-1">
          <router-link to="/" class="btn btn-ghost text-xl">Geography Learning</router-link>
        </div>
        <div class="flex-none">
          <ul class="menu menu-horizontal px-1">
            <li>
              <router-link to="/play" class="btn btn-ghost">Play</router-link>
            </li>
            <li>
              <router-link to="/stats" class="btn btn-ghost">Stats</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

</script>
