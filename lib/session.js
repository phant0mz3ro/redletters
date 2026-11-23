import crypto from 'crypto';
import { cookies } from 'next/headers';

export const NAMES = ['redhead', 'jughead'];
const sign = (v) =>
  crypto.createHmac('sha256', process.env.SESSION_SECRET).update(v).digest('hex');

export function checkLogin(user, pass) {
  const name = String(user || '').trim().toLowerCase();
  if (!NAMES.includes(name)) return null;
  const real = process.env[name.toUpperCase() + '_PASSPHRASE'] || '';
  if (!real) return null;
  const a = Buffer.from(sign('p:' + String(pass || '')));
  const b = Buffer.from(sign('p:' + real));
  return crypto.timingSafeEqual(a, b) ? name : null;
}

export async function setSession(name) {
  (await cookies()).set('rl', name + '.' + sign(name), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function clearSession() {
  (await cookies()).delete('rl');
}

export async function getUser() {
  const c = (await cookies()).get('rl')?.value || '';
  const [name, sig] = c.split('.');
  if (!name || !sig || !NAMES.includes(name)) return null;
  const good = sign(name);
  if (sig.length !== good.length) return null;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)) ? name : null;
}
