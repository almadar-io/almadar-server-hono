import { describe, it, expect } from 'vitest';
import { personasRouter } from '../routes/personas.js';

describe('Hono personasRouter', () => {
  it('serves nothing without the Auth emulator', async () => {
    delete process.env['FIREBASE_AUTH_EMULATOR_HOST'];
    const router = personasRouter(async () => [{ id: 'maya', role: 'member' }]);
    expect((await router.request('/personas')).status).toBe(404);
    expect((await router.request('/personas/sign-in', { method: 'POST', body: JSON.stringify({ id: 'maya' }) })).status).toBe(404);
  });

  it('with the emulator host declared, lists the roster and refuses an unknown id', async () => {
    process.env['FIREBASE_AUTH_EMULATOR_HOST'] = '127.0.0.1:1';
    process.env['FIREBASE_PROJECT_ID'] = 'demo-test';
    try {
      const router = personasRouter(async () => [{ id: 'maya', role: 'member' }]);
      expect(await (await router.request('/personas')).json()).toEqual({ success: true, personas: [{ id: 'maya', role: 'member' }], source: 'identity-entity' });
      const res = await router.request('/personas/sign-in', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: 'mallory' }) });
      expect(res.status).toBe(404);
    } finally {
      delete process.env['FIREBASE_AUTH_EMULATOR_HOST'];
      delete process.env['FIREBASE_PROJECT_ID'];
    }
  });
});
