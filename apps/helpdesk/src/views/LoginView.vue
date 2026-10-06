<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signIn } from '../store';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');

function onSubmit() {
  const result = signIn(username.value, password.value);
  if (result.ok) {
    error.value = '';
    router.push({ name: 'queue' });
  } else {
    error.value = result.error;
  }
}
</script>

<template>
  <section class="card card--narrow">
    <h1>Agent sign in</h1>

    <!-- role="alert" + data-testid: the error element the specs assert on. -->
    <p v-if="error" class="error" role="alert" data-testid="login-error">{{ error }}</p>

    <form @submit.prevent="onSubmit">
      <!-- Real <label for=...> elements, so getByLabel() is the natural locator. -->
      <label for="username">Username</label>
      <input id="username" v-model="username" type="text" autocomplete="off" />

      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" autocomplete="off" />

      <button type="submit" class="primary">Sign in</button>
    </form>

    <p class="hint">Demo account: <code>agent</code> / <code>camt1234</code></p>
  </section>
</template>
