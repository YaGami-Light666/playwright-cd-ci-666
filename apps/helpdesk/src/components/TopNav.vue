<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { state, openAssignedCount, signOut } from '../store';

const router = useRouter();

// App.vue only renders this nav for a signed-in agent; the fallback keeps the
// template free of non-null assertions.
const agentName = computed(() => state.currentUser?.name ?? '');

function onSignOut() {
  signOut();
  router.push({ name: 'login' });
}
</script>

<template>
  <!-- The same header appears on all three signed-in screens: one component
       object in the test suite, composed into several page objects. -->
  <nav class="top-nav" aria-label="Main">
    <span class="brand">CAMT Help Desk</span>

    <router-link :to="{ name: 'queue' }">Queue</router-link>
    <router-link :to="{ name: 'my-tickets' }">
      My tickets
      <!-- The badge is ABSENT, not zero, when nothing is assigned. -->
      <span v-if="openAssignedCount > 0" class="badge" data-testid="assigned-badge">
        {{ openAssignedCount }}
      </span>
    </router-link>

    <span class="spacer" />
    <span data-testid="current-agent">{{ agentName }}</span>
    <button type="button" @click="onSignOut">Sign out</button>
  </nav>
</template>
