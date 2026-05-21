/* client.js — Async wrapper that simulates a real REST client.
 * Adds latency, surfaces error states, and keeps API services pure. */

const LATENCY = [150, 450];   // ms range
const ERROR_RATE = 0;          // 0..1, can be flipped on for testing

function rand(min, max) { return min + Math.random() * (max - min); }

export function request(fn, { canFail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (canFail && Math.random() < ERROR_RATE) {
        reject(new ApiError('Erro de rede simulado. Tenta novamente.'));
        return;
      }
      try {
        resolve(fn());
      } catch (err) {
        reject(err instanceof ApiError ? err : new ApiError(err.message || 'Erro desconhecido'));
      }
    }, rand(...LATENCY));
  });
}

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
