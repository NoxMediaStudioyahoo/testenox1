export interface Ticket {
  ticketNumber: string;
  createdAt: string; // ISO string
  status: 'pendente' | 'em atendimento' | 'finalizado' | 'aberto' | 'fechado';
  userName: string;
  messages: string[]; // array de ids das mensagens
}

const STORAGE_KEY = 'noxmedia-tickets';

export function getTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function addTicket(ticket: Ticket) {
  const tickets = getTickets();
  tickets.push(ticket);
  saveTickets(tickets);
}

export function updateTicket(ticketNumber: string, update: Partial<Ticket>) {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.ticketNumber === ticketNumber);
  if (idx !== -1) {
    tickets[idx] = { ...tickets[idx], ...update };
    saveTickets(tickets);
  }
}

export function getTicket(ticketNumber: string): Ticket | undefined {
  return getTickets().find(t => t.ticketNumber === ticketNumber);
}

export function removeTicket(ticketNumber: string) {
  const tickets = getTickets();
  const filtered = tickets.filter(t => t.ticketNumber !== ticketNumber);
  saveTickets(filtered);
}
