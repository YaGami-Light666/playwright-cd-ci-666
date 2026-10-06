<script setup lang="ts">
import { computed } from 'vue';
import { state } from '../store';
import TicketRow from '../components/TicketRow.vue';

const mine = computed(() =>
  state.tickets.filter((t) => t.assignee === state.currentUser?.username),
);
</script>

<template>
  <section>
    <h1>My tickets</h1>

    <!-- The SAME row component as the queue: one component object in the test
         suite is composed into two page objects. -->
    <ul v-if="mine.length" class="ticket-list">
      <TicketRow v-for="ticket in mine" :key="ticket.id" :ticket="ticket" />
    </ul>
    <p v-else data-testid="empty-my-tickets">You hold no tickets right now.</p>
  </section>
</template>
