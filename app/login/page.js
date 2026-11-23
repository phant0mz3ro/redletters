import { login } from '../actions';

export default async function Login({ searchParams }) {
  const { error } = await searchParams;
  return (
    <main className="loginwrap">
      <header className="plate">
        <span className="tape tl"></span>
        <span className="tape tr"></span>
        <h1>Red Letters</h1>
        <div className="fl">❦ ❦ ❦</div>
        <span className="seal0">R</span>
      </header>
      <form action={login} className="lockform">
        <input name="username" placeholder="username" autoCapitalize="none" autoComplete="username" required />
        <input name="passphrase" type="password" placeholder="passphrase" autoComplete="current-password" required />
        {error && <p className="err">That does not match our records.</p>}
        <button type="submit">Open the book</button>
      </form>
    </main>
  );
}
