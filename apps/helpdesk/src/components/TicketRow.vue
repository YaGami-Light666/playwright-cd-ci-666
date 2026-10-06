<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Ticket } from '../store';

defineProps<{ ticket: Ticket }>();

const router = useRouter();
</script>

<template>
  <!-- Every row looks the same and every row has a button named "Open".
       Calling getByRole('button', { name: 'Open' }) on the queue therefore
       resolves to several elements — scope to the row first. -->
  <li class="ticket-row" data-testid="ticket-row">
    <div class="ticket-row__main">
      <h3>{{ ticket.title }}</h3>
      <p class="ticket-row__meta">
        <span data-testid="ticket-id">{{ ticket.id }}</span>
        · requested by <span data-testid="ticket-requester">{{ ticket.requester }}</span>
        · <span data-testid="ticket-category">{{ ticket.category }}</span>
      </p>
    </div>
    <span class="chip" data-testid="ticket-priority">{{ ticket.priority }}</span>
    <span
      class="chip"
      :class="`chip--${ticket.status.toLowerCase()}`"
      data-testid="ticket-status"
    >{{ ticket.status }}</span>
    <button
      type="button"
      @click="router.push({ name: 'ticket', params: { id: ticket.id } })"
    >
      Open
    </button>
  </li>
</template>
