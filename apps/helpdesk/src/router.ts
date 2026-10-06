import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { state } from './store';
import LoginView from './views/LoginView.vue';
import QueueView from './views/QueueView.vue';
import TicketDetailView from './views/TicketDetailView.vue';
import MyTicketsView from './views/MyTicketsView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/tickets' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/tickets', name: 'queue', component: QueueView },
  { path: '/tickets/:id', name: 'ticket', component: TicketDetailView, props: true },
  { path: '/my-tickets', name: 'my-tickets', component: MyTicketsView },
  { path: '/:pathMatch(.*)*', redirect: '/tickets' },
];

// Hash routing, so the app can be served as a plain static bundle and so the
// "?service=down" query string survives navigation.
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Every screen except the login page requires a signed-in agent. This is why
// the tests need a "signed in" fixture rather than a plain goto().
router.beforeEach((to) => {
  if (to.name !== 'login' && !state.currentUser) {
    return { name: 'login' };
  }
  if (to.name === 'login' && state.currentUser) {
    return { name: 'queue' };
  }
  return true;
});

export default router;
