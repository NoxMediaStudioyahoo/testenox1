import { useState } from 'react';

// Hook de autenticação JWT integrado ao backend
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // API URL from environment variable or fallback to localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Função para login real com backend
  async function login(username: string, password: string) {
    // Using environment variable for API URL
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      throw new Error('Usuário ou senha inválidos');
    }
    const data = await response.json();
    setToken(data.token); // O backend deve retornar { token, user }
    setUser(data.user);
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  // Função utilitária para fetch autenticado
  async function authFetch(input: RequestInfo, init: RequestInit = {}) {
    if (!token) throw new Error('Não autenticado');
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }

  // Retorna se está autenticado
  const isAuthenticated = !!token;

  return { token, user, isAuthenticated, login, logout, authFetch };
}
