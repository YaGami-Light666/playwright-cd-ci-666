<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { state, findTicket, assignToMe, resolveTicket, addComment } from '../store';
import ResolveDialog from '../components/ResolveDialog.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();

const ticket = computed(() => findTicket(props.id));
const error = ref('');
const toast = ref('');
const busy = ref(false);
const dialogOpen = ref(false);
const comment = ref('');

const mine = computed(() => ticket.value?.assignee === state.currentUser?.username);

// A deliberate 400 ms round trip, as if the assignment went to a server. The UI
// disables the button and shows "Assigning…" while it is in flight, which is
// exactly the situation Playwright's auto-waiting assertions are built for.
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function onAssign() {
  error.value = '';
  toast.value = '';
  busy.value = true;
  await delay(400);
  const result = assignToMe(props.id);
  busy.value = false;
  if (result.ok) toast.value = result.message;
  else error.value = result.error;
}

function onResolve(note: string, showDialogError: (message: string) => void) {
  const result = resolveTicket(props.id, note);
  if (!result.ok) {
    showDialogError(result.error);
    return;
  }
  dialogOpen.value = false;
  error.value = '';
  toast.value = result.message;
}

function onComment() {
  if (addComment(props.id, comment.value).ok) comment.value = '';
}
</script>

<template>
  <section v-if="ticket" class="card">
    <button type="button" class="link-button" @click="router.push({ name: 'queue' })">
      ← Back to queue
    </button>

    <h1>{{ ticket.title }}</h1>
    <p class="ticket-id" data-testid="detail-id">{{ ticket.id }}</p>

    <p v-if="error" class="error" role="alert" data-testid="detail-error">{{ error }}</p>
    <p v-if="toast" class="toast" role="status" data-testid="toast">{{ toast }}</p>

    <dl class="detail-grid">
      <dt>Status</dt>
      <dd data-testid="detail-status">{{ ticket.status }}</dd>
      <dt>Priority</dt>
      <dd data-testid="detail-priority">{{ ticket.priority }}</dd>
      <dt>Requester</dt>
      <dd data-testid="detail-requester">{{ ticket.requester }}</dd>
      <dt>Assignee</dt>
      <dd data-testid="detail-assignee">{{ ticket.assignee ?? 'Unassigned' }}</dd>
    </dl>

    <p v-if="ticket.note" class="resolution" data-testid="resolution-note">
      Resolution: {{ ticket.note }}
    </p>

    <div class="actions">
      <button
        type="button"
        class="primary"
        :disabled="busy || ticket.status !== 'Open'"
        @click="onAssign"
      >
        {{ busy ? 'Assigning…' : 'Assign to me' }}
      </button>
      <button
        type="button"
        :disabled="!mine || ticket.status !== 'Assigned'"
        @click="dialogOpen = true"
      >
        Resolve
      </button>
    </div>

    <h2>Comments</h2>
    <ul class="comments">
      <li v-for="(c, i) in ticket.comments" :key="i" data-testid="comment">
        <strong>{{ c.author }}:</strong> {{ c.text }}
      </li>
    </ul>
    <p v-if="!ticket.comments.length" data-testid="no-comments">No comments yet.</p>

    <form @submit.prevent="onComment">
      <label for="comment">Add a comment</label>
      <textarea id="comment" v-model="comment" rows="2"></textarea>
      <button type="submit">Post comment</button>
    </form>

    <ResolveDialog :open="dialogOpen" @confirm="onResolve" @cancel="dialogOpen = false" />
  </section>

  <p v-else data-testid="unknown-ticket">That ticket does not exist.</p>
</template>
