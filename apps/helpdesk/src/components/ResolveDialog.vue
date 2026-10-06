<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{ open?: boolean }>(), { open: false });
const emit = defineEmits<{
  confirm: [note: string, showError: (message: string) => void];
  cancel: [];
}>();

const dialog = ref<HTMLDialogElement | null>(null);
const note = ref('');
const error = ref('');

// A native <dialog> opened with showModal() is exposed as role="dialog" in every
// browser Playwright drives, so getByRole('dialog') works on all three engines.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      note.value = '';
      error.value = '';
      dialog.value?.showModal();
    } else {
      dialog.value?.close();
    }
  },
);

function onConfirm() {
  emit('confirm', note.value, (message: string) => {
    error.value = message;
  });
}
</script>

<template>
  <dialog ref="dialog" class="resolve-dialog" @cancel.prevent="emit('cancel')">
    <h2>Resolve ticket</h2>

    <p v-if="error" class="error" role="alert" data-testid="dialog-error">{{ error }}</p>

    <label for="resolution-note">Resolution note</label>
    <textarea id="resolution-note" v-model="note" rows="4"></textarea>

    <div class="dialog-actions">
      <button type="button" @click="emit('cancel')">Cancel</button>
      <button type="button" class="primary" @click="onConfirm">Confirm resolve</button>
    </div>
  </dialog>
</template>
