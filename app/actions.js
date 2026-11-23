'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkLogin, setSession, clearSession, getUser } from '@/lib/session';
import { db } from '@/lib/db';

export async function login(formData) {
  const name = checkLogin(formData.get('username'), formData.get('passphrase'));
  if (!name) redirect('/login?error=1');
  await setSession(name);
  redirect('/');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}

export async function postLetter(body) {
  const me = await getUser();
  if (!me) return { ok: false };
  const text = String(body || '').trim().slice(0, 20000);
  if (!text) return { ok: false };
  const { error } = await db().from('letters').insert({ author: me, body: text });
  if (error) {
    console.error('INSERT FAILED:', error.message);
    return { ok: false };
  }
  revalidatePath('/');
  return { ok: true };
}
