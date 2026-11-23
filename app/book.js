'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { initBook } from './book-engine';
import { postLetter } from './actions';

export default function Book({ me, letters }) {
  const api = useRef(null);
  const router = useRouter();

  useEffect(() => {
    api.current = initBook({
      letters,
      me,
      post: async (text) => {
        const r = await postLetter(text);
        if (!r || !r.ok) throw new Error('post failed');
      },
    });
    return () => api.current && api.current.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.current && api.current.sync(letters);
  }, [letters]);

  // pick up letters from the other author every so often
  useEffect(() => {
    const t = setInterval(() => {
      if (!(api.current && api.current.isEditing())) router.refresh();
    }, 45000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <>
      <div className="wrap">
        <div className="book">
          <svg className="leaf0 lf1" viewBox="0 0 120 80"><path d="M4 70C10 25 60 2 116 8 112 52 62 82 4 70Z" fill="#26361f" /><path d="M4 70C40 50 80 30 112 12M40 56l10-22M62 44l8-24M84 30l4-16" stroke="#6f8a58" strokeWidth="1.4" fill="none" /></svg>
          <svg className="leaf0 lf2" viewBox="0 0 120 80"><path d="M4 70C10 25 60 2 116 8 112 52 62 82 4 70Z" fill="#26361f" /><path d="M4 70C40 50 80 30 112 12M40 56l10-22M62 44l8-24M84 30l4-16" stroke="#c98a5a" strokeWidth="1.4" fill="none" /></svg>
          <div className="pages">
            <div className="page l" id="pl"></div>
            <div className="page r" id="pr"></div>
          </div>
        </div>
      </div>
      <div className="nav">
        <button id="prev" aria-label="Previous page">‹</button>
        <span id="info"></span>
        <button id="next" aria-label="Next page">›</button>
        <button id="latest" className="lt">jump to latest »</button>
      </div>
      <button className="quill" id="quill">✒ Write</button>
      <svg id="qpen" className="qpen" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="qg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#efe2c4" /><stop offset="1" stopColor="#b8323a" /></linearGradient>
        </defs>
        <path d="M4 60L12 47C16 24 40 8 60 4 58 24 44 44 22 52Z" fill="url(#qg)" stroke="#2b1d14" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M4 60L56 8" stroke="#2b1d14" strokeWidth="1.4" fill="none" />
        <path d="M16 44l10-8M22 38l10-10M30 32l10-10M38 24l10-8" stroke="rgba(43,29,20,.45)" strokeWidth="1" fill="none" />
        <circle cx="4" cy="60" r="1.8" fill="#14070a" />
      </svg>
    </>
  );
}
