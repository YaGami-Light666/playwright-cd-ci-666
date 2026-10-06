import { reactive, computed } from 'vue';

// ---------------------------------------------------------------------------
// CAMT Help Desk — in-memory state.
//
// Everything lives in this module. There is no backend and no persistence, so a
// full page load re-seeds the data. That is deliberate: every Playwright test
// starts from the same known state, and tests can run in parallel without
// stepping on each other.
// ---------------------------------------------------------------------------

export interface Agent {
  username: string;
  password: string;
  name: string;
  disabled: boolean;
}

export type TicketStatus = 'Open' | 'Assigned' | 'Resolved';
export type TicketPriority = 'High' | 'Medium' | 'Low';
export type TicketCategory = 'Hardware' | 'Account' | 'Network' | 'Software';

export interface TicketComment {
  author: string;
  text: string;
}

export interface Ticket {
  id: string;
  title: string;
  requester: string;
  priority: TicketPriority;
  category: TicketCategory;
  status: TicketStatus;
  assignee: string | null;
  note: string;
  comments: TicketComment[];
}

// Every business rule returns the same shape, so a caller can branch on `ok`
// and TypeScript narrows to either `error` or `message`.
export type Result = { ok: true } | { ok: false; error: string };
export type MessageResult = { ok: true; message: string } | { ok: false; error: string };

export const AGENTS: Record<string, Agent> = {
  agent: { username: 'agent', password: 'camt1234', name: 'Ann Agent', disabled: false },
  locked_agent: { username: 'locked_agent', password: 'camt1234', name: 'Lek Locked', disabled: true },
};

// BR-1: an agent may hold at most three OPEN assigned tickets at a time.
export const ASSIGNMENT_LIMIT = 3;

// BR-2: a resolution note must be at least ten characters long.
export const MIN_NOTE_LENGTH = 10;

function seedTickets(): Ticket[] {
  return [
    {
      id: 'TK-1001',
      title: 'Projector in room 305 will not power on',
      requester: 'Nattapong S.',
      priority: 'High',
      category: 'Hardware',
      status: 'Open',
      assignee: null,
      note: '',
      comments: [],
    },
    {
      id: 'TK-1002',
      title: 'Cannot log in to the student portal',
      requester: 'Siriporn K.',
      priority: 'High',
      category: 'Account',
      status: 'Assigned',
      assignee: 'agent',
      note: '',
      comments: [{ author: 'Ann Agent', text: 'Asked the requester for a screenshot.' }],
    },
    {
      id: 'TK-1003',
      title: 'Wi-Fi drops in the library basement',
      requester: 'Chaiwat P.',
      priority: 'Medium',
      category: 'Network',
      status: 'Open',
      assignee: null,
      note: '',
      comments: [],
    },
    {
      id: 'TK-1004',
      title: 'Request: install Python 3.12 in lab 2',
      requester: 'Malee T.',
      priority: 'Low',
      category: 'Software',
      status: 'Open',
      assignee: null,
      note: '',
      comments: [],
    },
    {
      id: 'TK-1005',
      title: 'Printer queue stuck on floor 4',
      requester: 'Anan W.',
      priority: 'Medium',
      category: 'Hardware',
      status: 'Assigned',
      assignee: 'agent',
      note: '',
      comments: [],
    },
    {
      id: 'TK-1006',
      title: 'Email quota exceeded',
      requester: 'Ploy R.',
      priority: 'Low',
      category: 'Account',
      status: 'Resolved',
      assignee: 'agent',
      note: 'Quota raised to 5 GB and the requester confirmed.',
      comments: [],
    },
  ];
}

// The test hook: "/?service=down#/tickets" makes the assignment call fail, so
// the exception flow can be reached without touching the source. The query
// string goes BEFORE the hash.
function serviceIsDown(): boolean {
  return new URLSearchParams(window.location.search).get('service') === 'down';
}

export interface State {
  currentUser: Agent | null;
  tickets: Ticket[];
  serviceDown: boolean;
}

export const state = reactive<State>({
  currentUser: null,
  tickets: seedTickets(),
  serviceDown: serviceIsDown(),
});

export const openAssignedCount = computed(() =>
  state.tickets.filter(
    (t) => t.assignee === state.currentUser?.username && t.status === 'Assigned',
  ).length,
);

export function signIn(username: string, password: string): Result {
  const account = AGENTS[username];
  if (!account || account.password !== password) {
    return { ok: false, error: 'Username and password do not match any agent account.' };
  }
  if (account.disabled) {
    return { ok: false, error: 'This account is disabled. Contact the service desk.' };
  }
  state.currentUser = account;
  return { ok: true };
}

export function signOut(): void {
  state.currentUser = null;
}

export function findTicket(id: string): Ticket | null {
  return state.tickets.find((t) => t.id === id) || null;
}

export function assignToMe(id: string): MessageResult {
  if (state.serviceDown) {
    return { ok: false, error: 'Service unavailable — please try again later.' };
  }
  const ticket = findTicket(id);
  if (!ticket) return { ok: false, error: 'Unknown ticket.' };
  if (ticket.assignee) {
    return { ok: false, error: `${ticket.id} is already assigned.` };
  }
  if (openAssignedCount.value >= ASSIGNMENT_LIMIT) {
    return {
      ok: false,
      error: `Assignment limit reached — you already hold ${ASSIGNMENT_LIMIT} open tickets.`,
    };
  }
  // The router guard keeps every screen but #/login behind a signed-in agent,
  // so currentUser cannot be null by the time an action runs.
  ticket.assignee = state.currentUser!.username;
  ticket.status = 'Assigned';
  return { ok: true, message: `${ticket.id} is now assigned to you.` };
}

export function resolveTicket(id: string, note: string): MessageResult {
  const ticket = findTicket(id);
  if (!ticket) return { ok: false, error: 'Unknown ticket.' };
  if (note.trim().length < MIN_NOTE_LENGTH) {
    return {
      ok: false,
      error: `A resolution note of at least ${MIN_NOTE_LENGTH} characters is required.`,
    };
  }
  ticket.status = 'Resolved';
  ticket.note = note.trim();
  return { ok: true, message: `${ticket.id} has been resolved.` };
}

export function addComment(id: string, text: string): Result {
  const ticket = findTicket(id);
  if (!ticket || !text.trim()) return { ok: false, error: 'A comment cannot be empty.' };
  ticket.comments.push({ author: state.currentUser!.name, text: text.trim() });
  return { ok: true };
}
