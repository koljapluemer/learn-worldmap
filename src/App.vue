<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow-lg">
      <div class="container mx-auto">
        <div class="flex-1">
          <router-link to="/" class="btn btn-ghost text-xl">Flashcard App</router-link>
        </div>
        <div class="flex-none">
          <ul class="menu menu-horizontal px-1">
            <li>
              <router-link to="/manage" class="btn btn-ghost">Manage Cards</router-link>
            </li>
            <li>
              <router-link to="/practice" class="btn btn-ghost">Practice</router-link>
            </li>
            <li>
              <button class="btn btn-ghost text-error" @click="resetDatabase">Reset DB</button>
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
import { FlashcardDatabase } from './services/database';

const db = new FlashcardDatabase();

async function resetDatabase() {
  if (!confirm('Are you sure you want to reset the database? This will delete all flashcards.')) return;
  await db.resetDatabase();
  window.location.reload();
}
</script>
