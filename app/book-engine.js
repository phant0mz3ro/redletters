// Imperative engine for the book: page layout, page-turn animation and the writing quill.
const NAMES = ['redhead', 'jughead'];
const DISPLAY_NAMES = {
  redhead: 'Red',
  jughead: 'Dan',
};

export function initBook({ letters, me, post }) {
  const $ = (id) => document.getElementById(id);
  const L = $('pl'), R = $('pr'), Q = $('qpen'), book = document.querySelector('.book');
  const offs = [];
  const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
  const per = () => (window.innerWidth < 720 ? 1 : 2);
  const st = (i) => { const p = per(); return Math.floor(i / p) * p; };
  const first = () => (per() === 2 ? 0 : 1);
  const meIdx = Math.max(0, NAMES.indexOf(me));
  const fmt = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });

  let pages = [], sig = '', pending = null, cur = 0, editing = false, busy = false, qt = null, lastPer = per();
  const last = () => st(pages.length - 1);

  function build(ls) {
    sig = ls.map((l) => l.id).join(',');
    pages = [{ none: true }, { cover: true }]
      .concat(ls.map((l) => ({ a: Math.max(0, NAMES.indexOf(l.author)), d: fmt(l.created_at), t: l.body })))
      .concat([{ blank: true }]);
  }
  function apply(ls) {
    if (ls.map((l) => l.id).join(',') === sig) return;
    build(ls);
    cur = Math.min(Math.max(cur, first()), last());
    render();
  }
  function applyPending() {
    if (pending) { const p = pending; pending = null; apply(p); }
  }

  function h(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function header(a, d) {
    const name = NAMES[a];
    const label = DISPLAY_NAMES[name] || name;
    const hd = h('div', 'hd'), ic = h('div', 'ico ' + (a === 1 ? 'a2' : 'a1')), w = h('div', 'who');
    const img = document.createElement('img');
    img.src = '/avatars/' + name + '.jpg';
    img.alt = label;
    img.onerror = () => { img.remove(); ic.textContent = label[0].toUpperCase(); };
    ic.appendChild(img);
    w.appendChild(h('b', null, label));
    w.appendChild(h('small', null, d));
    hd.appendChild(ic);
    hd.appendChild(w);
    return hd;
  }
  function decor(i) {
    const d = h('div', 'deco');
    d.innerHTML = i % 2 === 0
      ? '<span class="tape" style="left:-24px;top:16px;transform:rotate(-38deg)"></span><div class="scrap tk">N° 0007<br>ADMIT ONE</div><svg class="leaf" viewBox="0 0 120 80"><path d="M4 70C10 25 60 2 116 8 112 52 62 82 4 70Z" fill="#5d6b3a"/><path d="M4 70C40 50 80 30 112 12" stroke="#d9c08a" stroke-width="1.4" fill="none"/></svg>'
      : '<span class="tape" style="right:-24px;top:16px;transform:rotate(38deg)"></span><div class="scrap s2"></div><div class="scrap s1"></div><div class="scrap s3">✦</div>';
    return d;
  }

  function fill(el, i) {
    el.innerHTML = '';
    el.classList.remove('empty', 'cover');
    delete el.dataset.editing;
    if (i < 0 || i >= pages.length || pages[i].none) { el.classList.add('empty'); return; }
    const p = pages[i];
    if (p.cover) {
      el.classList.add('cover');
      el.innerHTML = '<header class="plate"><span class="tape tl"></span><span class="tape tr"></span><h1>Red Letters</h1><div class="fl">❦ ❦ ❦</div><span class="seal0">R</span></header><span class="corner" style="left:14px;top:10px">❦</span><span class="corner" style="right:14px;top:10px">❦</span><span class="corner" style="left:14px;bottom:10px">❦</span><span class="corner" style="right:14px;bottom:10px">❦</span>';
      return;
    }
    el.appendChild(decor(i));
    if (p.blank) {
      if (editing) {
        el.dataset.editing = 'true';
        const t = h('div', 'txt');
        t.contentEditable = 'true';
        t.dataset.ph = 'Dearest friend…';
        t.id = 'ed';
        t.addEventListener('paste', (e) => {
          e.preventDefault();
          document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text'));
        });
        const msg = h('div', 'errline'), ac = h('div', 'acts');
        const no = h('button', 'ghost', 'Never mind'), ok = h('button', 'seal', 'Seal & post');
        no.onclick = () => { editing = false; applyPending(); render(); };
        ok.onclick = async () => {
          const v = t.innerText.trim();
          if (!v) return;
          ok.disabled = true; ok.textContent = 'Sealing…'; msg.textContent = '';
          try { await post(v); }
          catch (e) { ok.disabled = false; ok.textContent = 'Seal & post'; msg.textContent = 'Could not send it. Try again.'; return; }
          pages.splice(pages.length - 1, 0, { a: meIdx, d: fmt(new Date().toISOString()), t: v });
          editing = false;
          cur = st(pages.length - 2);
          render();
          applyPending();
        };
        ac.appendChild(no); ac.appendChild(ok);
        el.appendChild(header(meIdx, 'a fresh page'));
        el.appendChild(t); el.appendChild(msg); el.appendChild(ac);
        setTimeout(() => { t.focus(); placeQuill(); }, 60);
      } else {
        const inv = h('div', 'inv');
        inv.appendChild(h('div', null, '❦'));
        inv.appendChild(h('div', null, 'This page is still unwritten.'));
        inv.appendChild(h('div', null, 'Tap the quill to leave your mark.'));
        el.appendChild(inv);
      }
    } else {
      el.appendChild(header(p.a, p.d));
      el.appendChild(h('div', 'txt', p.t));
    }
    el.appendChild(h('div', 'pn', String(i - 1)));
  }

  function render() {
    fill(L, cur);
    if (per() === 2) fill(R, cur + 1);
    const p = per(), tot = pages.length - 2;
    book.classList.toggle('closed', p === 2 && cur === 0);
    $('info').textContent = p === 2
      ? (cur === 0 ? 'front cover' : 'pages ' + (cur - 1) + (cur + 1 < pages.length ? '–' + cur : '') + ' of ' + tot)
      : (cur <= 1 ? 'front cover' : 'page ' + (cur - 1) + ' of ' + tot);
    $('prev').disabled = editing || cur <= first();
    $('next').disabled = editing || cur >= last();
    $('latest').disabled = editing || cur === st(pages.length - 2);
    $('quill').hidden = editing;
    placeQuill();
  }

  /* the quill follows the caret and scratches while you type */
  function placeQuill() {
    const ed = $('ed');
    if (!editing || !ed) { Q.style.display = 'none'; return; }
    const s = window.getSelection();
    let x = null, y = null;
    if (s.rangeCount && ed.contains(s.anchorNode)) {
      const r = s.getRangeAt(0).cloneRange();
      r.collapse(true);
      const rc = r.getClientRects()[0];
      if (rc && rc.height > 0) { x = rc.left; y = rc.bottom; }
    }
    if (x === null) { const b = ed.getBoundingClientRect(); x = b.left + 2; y = b.top + 22; }
    Q.style.display = 'block';
    Q.style.left = (x - 3) + 'px';
    Q.style.top = (y - 51) + 'px';
  }
  function scratch() {
    Q.classList.add('writing');
    clearTimeout(qt);
    qt = setTimeout(() => Q.classList.remove('writing'), 450);
    placeQuill();
  }

  function go(dir, tt) {
    if (busy || editing) return;
    const p = per(), t = tt != null ? tt : cur + dir * p;
    if (t < first() || t > last() || t === cur) return;
    let out, inn, oo, io, od, id;
    if (p === 2) {
      if (dir > 0) { out = R; oo = 'left center'; od = -90; inn = L; io = 'right center'; id = 90; }
      else { out = L; oo = 'right center'; od = 90; inn = R; io = 'left center'; id = -90; }
    } else { out = L; inn = L; oo = io = 'left center'; od = dir > 0 ? -90 : 90; id = -od; }
    busy = true;
    out.style.transformOrigin = oo;
    const a = out.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(' + od + 'deg)' }], { duration: 300, easing: 'ease-in' });
    a.onfinish = () => {
      cur = t; render();
      inn.style.transformOrigin = io;
      const b = inn.animate([{ transform: 'rotateY(' + id + 'deg)' }, { transform: 'rotateY(0)' }], { duration: 300, easing: 'ease-out' });
      b.onfinish = () => { busy = false; };
    };
  }

  $('prev').onclick = () => go(-1);
  $('next').onclick = () => go(1);
  $('latest').onclick = () => { const t = st(pages.length - 2); go(t > cur ? 1 : -1, t); };
  $('quill').onclick = () => { cur = st(pages.length - 1); editing = true; render(); };

  on(document, 'keydown', (e) => {
    if (editing) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
 let sx = null, sy = null;

  on(book, 'pointerdown', (e) => {
    if (editing || busy) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button, select, input, [contenteditable]')) return;
    sx = e.clientX;
    sy = e.clientY;
  });

  on(document, 'pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    sx = null;
    sy = null;
    if (editing || busy) return;

    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    }
  });
  on(document, 'input', (e) => { if (e.target.id === 'ed') scratch(); });
  on(document, 'selectionchange', placeQuill);
  on(document, 'scroll', placeQuill, true);
  on(window, 'resize', () => {
    if (per() !== lastPer) { lastPer = per(); cur = Math.max(st(cur), first()); render(); }
    else placeQuill();
  });

  build(letters);
  cur = first();
  render();

  return {
    sync(ls) { if (editing) { pending = ls; return; } apply(ls); },
    isEditing() { return editing; },
    destroy() { offs.forEach((f) => f()); clearTimeout(qt); },
  };
}
