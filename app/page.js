import { redirect } from 'next/navigation';
import { getUser } from '@/lib/session';
import { db } from '@/lib/db';
import { logout } from './actions';
import Book from './book';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const me = await getUser();
  if (!me) redirect('/login');
  const { data } = await db()
    .from('letters')
    .select('id,author,body,created_at')
    .order('created_at', { ascending: true });

  return (
    <main>
      <Book me={me} letters={data || []} />
      <form action={logout} className="leave">
        <button type="submit">leave quietly</button>
      </form>
    </main>
  );
}
