<script setup lang="ts">
import { computed, ref } from 'vue';
import { state } from '../store';
import type { TicketStatus } from '../store';
import TicketRow from '../components/TicketRow.vue';

const status = ref<TicketStatus | 'All'>('All');
const search = ref('');

const visible = computed(() =>
  state.tickets.filter((t) => {
    const statusMatches = status.value === 'All' || t.status === status.value;
    const textMatches = t.title.toLowerCase().includes(search.value.trim().toLowerCase());
    return statusMatches && textMatches;
  }),
);
</script>

<template>
  <section>
    <h1>Ticket queue</h1>

    <div class="filters">
      <div>
        <label for="status-filter">Status</label>
        <select id="status-filter" v-model="status">
          <option>All</option>
          <option>Open</option>
          <option>Assigned</option>
          <option>Resolved</option>
        </select>
      </div>
      <div>
        <label for="search">Search titles</label>
        <input id="search" v-model="search" type="search" />
      </div>
      <p class="result-count" data-testid="result-count">
        {{ visible.length }} of {{ state.tickets.length }} tickets
      </p>
    </div>

    <ul v-if="visible.length" class="ticket-list">
      <TicketRow v-for="ticket in visible" :key="ticket.id" :ticket="ticket" />
    </ul>
    <p v-else data-testid="empty-queue">No tickets match your filters.</p>
  </section>
</template>
