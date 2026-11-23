'use client';
import { useState } from 'react';

// Looks for /public/avatars/<name>.jpg; falls back to the initial if it's missing.
export default function Avatar({ name }) {
  const [ok, setOk] = useState(true);
  return (
    <div className={'ico ' + (name === 'redhead' ? 'a1' : 'a2')}>
      {ok ? (
        <img src={'/avatars/' + name + '.jpg'} alt={name} onError={() => setOk(false)} />
      ) : (
        name[0].toUpperCase()
      )}
    </div>
  );
}
