/**
 * Hono twin of `@almadar/server`'s `personasRouter`: the app's `[identity]` rows as Auth-emulator
 * users. Serves nothing unless `FIREBASE_AUTH_EMULATOR_HOST` is set.
 *   GET  /personas          the roster
 *   POST /personas/sign-in  { id } → { customToken, authEmulatorHost, projectId }
 */
import { Hono } from 'hono';
import { z } from 'zod';
import { emulatedUser } from '@almadar/auth/server';
import type { IdentityRoster } from '@almadar/server';

const SignInBodySchema = z.object({ id: z.string().min(1) });

export function personasRouter(roster: IdentityRoster): Hono {
  const router = new Hono();
  const authEmulatorHost = process.env['FIREBASE_AUTH_EMULATOR_HOST'];
  const projectId = process.env['FIREBASE_PROJECT_ID'];
  if (!authEmulatorHost || !projectId) return router;

  router.get('/personas', async (c) => {
    const personas = await roster();
    return c.json({ success: true, personas, source: personas.length > 0 ? 'identity-entity' : 'none' });
  });

  router.post('/personas/sign-in', async (c) => {
    const body = SignInBodySchema.safeParse(await c.req.json());
    if (!body.success) return c.json({ success: false, error: 'expected { id }' }, 400);
    const persona = (await roster()).find((p) => p.id === body.data.id);
    if (!persona) return c.json({ success: false, error: `no persona with id ${body.data.id}` }, 404);
    const { customToken } = await emulatedUser(persona, process.env);
    return c.json({ success: true, customToken, authEmulatorHost, projectId });
  });

  return router;
}
