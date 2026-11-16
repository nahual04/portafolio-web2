/* ==========================================================
   Casos de estudio — animaciones de scroll
   Stack inspirado en heronaiapp.com: Lenis (smooth scroll) +
   GSAP ScrollTrigger (pins, scrub, horizontal) + split de texto.
   Si GSAP no carga o el usuario prefiere menos movimiento,
   todo el contenido queda visible sin animar.
   ========================================================== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  let lenis = null;

  /* ---------- Loader: contador 0→100 + coordenadas del cursor ---------- */
  const ld = $('.ld');
  const loaderDone = new Promise(res => {
    if (!ld || reduce) { ld && ld.remove(); return res(); }
    root.classList.add('is-loading');
    const n = $('.ld-n', ld), bar = $('.ld-bar i', ld), xy = $('.ld-xy', ld);
    const pad = v => String(Math.round(v)).padStart(4, '0');
    const mv = e => { xy.textContent = `X:${pad(e.clientX)}PX / Y:${pad(e.clientY)}PX`; };
    addEventListener('pointermove', mv);
    const t0 = performance.now(), D = 1500;
    (function f(t) {
      const p = Math.min((t - t0) / D, 1), e = 1 - Math.pow(1 - p, 3);
      n.textContent = Math.round(e * 100);
      bar.style.transform = `scaleX(${e})`;
      if (p < 1) return requestAnimationFrame(f);
      ld.classList.add('out');
      root.classList.remove('is-loading');
      removeEventListener('pointermove', mv);
      setTimeout(() => ld.remove(), 1100);
      res();
    })(t0);
  });

  /* ---------- Menú móvil ---------- */
  const mnu = $('.mnu'), hdr = $('header');
  if (mnu && hdr) {
    const setOpen = o => { hdr.classList.toggle('open', o); mnu.setAttribute('aria-expanded', String(o)); mnu.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú'); };
    mnu.addEventListener('click', e => { e.stopPropagation(); setOpen(!hdr.classList.contains('open')); });
    $$('nav a', hdr).forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', e => { if (!hdr.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && hdr.classList.contains('open')) { setOpen(false); mnu.focus(); } });
  }

  /* ---------- Mazo de tarjetas apiladas con flechas ----------
     La tarjeta leída sale volando y regresa al fondo del mazo. */
  const POS = [
    'translate(0px,0px) rotate(0deg)',
    'translate(14px,-14px) rotate(3.5deg)',
    'translate(26px,-26px) rotate(-2.5deg)',
    'translate(36px,-36px) rotate(5deg)'
  ];
  $$('[data-deck]').forEach(dk => {
    const all = $$('.dk-c', dk), tabs = $$('.dk-tab', dk);
    let cards = all, total = cards.length;
    const num = $('.dk-n', dk);
    let read = 0, busy = false;
    const pad = n => String(n).padStart(2, '0');
    const layout = () => {
      cards.forEach((c, p) => {
        c.style.zIndex = String(100 - p);
        c.style.transform = POS[Math.min(p, POS.length - 1)];
        c.style.opacity = p < POS.length ? '1' : '0';
        c.setAttribute('aria-hidden', p === 0 ? 'false' : 'true');
      });
      num.textContent = `${pad(read + 1)} / ${pad(total)}`;
    };
    // Tabs & pills: filtran el mazo por categoría (éxito / oportunidad / dolor)
    const show = (k, animate) => {
      tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.f === k)));
      cards = all.filter(c => c.dataset.k === k);
      total = cards.length; read = 0;
      all.forEach(c => { const on = c.dataset.k === k; c.classList.toggle('hid', !on); });
      if (animate && !reduce) {
        cards.forEach((c, p) => {
          c.classList.add('noanim');
          c.style.transform = 'translate(0,70px) rotate(8deg)';
          c.style.opacity = '0';
          c.offsetWidth;
          c.classList.remove('noanim');
          c.style.transitionDelay = `${p * 40}ms`;
          setTimeout(() => { c.style.transitionDelay = ''; }, 700 + p * 40);
        });
      }
      layout();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        // lleva la pestaña elegida a la vista dentro de la fila deslizable
        const bar = t.parentElement;
        bar.scrollTo({ left: t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
        if (t.getAttribute('aria-selected') !== 'true') show(t.dataset.f, true);
      });
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault(); e.stopPropagation();
        const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); n.click();
      });
    });
    const next = () => {
      if (busy) return; busy = true;
      const top = cards[0];
      top.style.transform = 'translate(-115%,30px) rotate(-14deg)';
      setTimeout(() => {
        cards = cards.slice(1).concat(top); // al fondo del mazo
        read = (read + 1) % total;
        layout();
        setTimeout(() => { busy = false; }, 350);
      }, reduce ? 0 : 320);
    };
    const prev = () => {
      if (busy) return; busy = true;
      const last = cards[total - 1];
      last.classList.add('noanim');
      last.style.zIndex = '200';
      last.style.opacity = '1';
      last.style.transform = 'translate(-115%,30px) rotate(-14deg)';
      last.offsetWidth; // aplica la posición de salida sin animar
      last.classList.remove('noanim');
      cards = [last].concat(cards.slice(0, total - 1));
      read = (read - 1 + total) % total;
      layout();
      setTimeout(() => { busy = false; }, 450);
    };
    $('[data-next]', dk).addEventListener('click', next);
    $('[data-prev]', dk).addEventListener('click', prev);
    dk.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });
    if (tabs.length) show(tabs[0].dataset.f, false); else layout();
  });

  /* ---------- Transición entre páginas (cortina con el color del proyecto) ---------- */
  let pt = $('.pt');
  if (!pt) {
    pt = document.createElement('div');
    pt.className = 'pt'; pt.setAttribute('aria-hidden', 'true');
    pt.innerHTML = '<span class="mono"></span>';
    document.body.append(pt);
  }
  const reveal = () => requestAnimationFrame(() => requestAnimationFrame(() => pt.classList.remove('cover', 'in')));
  if (pt.classList.contains('cover')) reveal();
  addEventListener('pageshow', e => { if (e.persisted) reveal(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-pt]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const href = a.getAttribute('href');
    if (reduce) return; // navegación normal
    e.preventDefault();
    pt.style.setProperty('--ptc', a.dataset.pt);
    const name = a.querySelector('.tx b, b');
    $('.mono', pt).textContent = name ? name.textContent : '';
    pt.classList.add('in');
    setTimeout(() => { location.href = href; }, 750);
  });

  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (ld) { lenis.stop(); loaderDone.then(() => lenis.start()); }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -70, duration: 1.5 });
    });
  }

  /* ---------- Utilidades de split ---------- */
  const textNodes = el => {
    const out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  };
  // Palabras sueltas (para el "highlight" con scrub)
  const splitWords = el => {
    textNodes(el).forEach(node => {
      const f = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (!t.trim()) return f.append(t);
        const s = document.createElement('span');
        s.className = 'hw'; s.textContent = t; f.append(s);
      });
      node.replaceWith(f);
    });
    return $$('.hw', el);
  };
  // Letras dentro de una máscara por palabra (para títulos)
  const splitChars = el => {
    textNodes(el).forEach(node => {
      const f = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (!t.trim()) return f.append(t);
        const w = document.createElement('span'); w.className = 'cw';
        [...t].forEach(ch => { const c = document.createElement('span'); c.className = 'cc'; c.textContent = ch; w.append(c); });
        f.append(w);
      });
      node.replaceWith(f);
    });
    el.setAttribute('aria-label', el.textContent);
    return $$('.cc', el);
  };

  /* ---------- 1) Pins (se crean primero y en orden del documento) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    $$('.caso').forEach(caso => {
      // Intro: el panel de marca crece al entrar y se fija mientras el mockup sube
      const intro = $('.cs-intro', caso);
      const panel = $('.cs-panel', intro), shot = $('.cs-shot .fr', intro);
      const stk = $('.cs-stk', intro), bgn = $('.cs-bgn', intro);
      gsap.fromTo(panel, { scale: 0.84, borderRadius: 90 }, {
        scale: 1, borderRadius: 40, ease: 'none',
        scrollTrigger: { trigger: intro, start: 'top bottom', end: 'top top', scrub: true }
      });
      gsap.timeline({ scrollTrigger: { trigger: intro, start: 'top top', end: '+=90%', pin: true, scrub: 0.8 } })
        .fromTo(shot, { yPercent: 28, rotate: 6 }, { yPercent: -4, rotate: -2, ease: 'none' }, 0)
        .fromTo(bgn, { xPercent: 10 }, { xPercent: -25, ease: 'none' }, 0)
        .to(stk, { rotate: 300, ease: 'none' }, 0);

      // Proceso horizontal
      $$('.hs', caso).forEach(sec => {
        const tr = $('.hs-tr', sec), pg = $('.hs-pg i', sec);
        const dist = () => Math.max(0, tr.scrollWidth - innerWidth);
        const tw = gsap.to(tr, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8,
            invalidateOnRefresh: true, onUpdate: st => { pg.style.transform = `scaleX(${st.progress})`; }
          }
        });
        $$('.st', sec).forEach((c, i) => {
          if (i < 2) return; // las primeras ya están en pantalla
          gsap.from(c, {
            yPercent: 18, rotate: 5, opacity: 0.2, ease: 'none',
            scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 100%', end: 'left 65%', scrub: true }
          });
        });
      });
    });

    // Pila de tarjetas: la anterior se encoge cuando llega la siguiente
    $$('.sk').forEach(sk => {
      const cards = $$('.sk-c', sk);
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        gsap.fromTo(c, { scale: 1, filter: 'brightness(1)' }, {
          scale: 0.92 + i * 0.012, filter: 'brightness(0.9)', ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 30%', scrub: true }
        });
      });
    });
  });

  /* ---------- 2) Títulos: letras que suben desde una máscara ---------- */
  $$('[data-split]').forEach(h => {
    const chars = splitChars(h);
    gsap.from(chars, {
      yPercent: 115, rotate: 12, duration: 1.1, ease: 'expo.out', stagger: 0.022,
      scrollTrigger: { trigger: h, start: 'top 88%' }
    });
  });

  /* ---------- 3) Párrafos que se "encienden" palabra por palabra ---------- */
  $$('[data-hl]').forEach(p => {
    const words = splitWords(p);
    gsap.fromTo(words, { opacity: 0.13 }, {
      opacity: 1, ease: 'none', stagger: 0.08,
      scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 52%', scrub: true }
    });
  });

  /* ---------- 4) Entradas con desenfoque + escalonado ---------- */
  $$('[data-rise]').forEach(el => {
    gsap.from(el, {
      y: 60, opacity: 0, filter: 'blur(12px)', duration: 1.2, ease: 'expo.out', clearProps: 'filter',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  $$('[data-stagger]').forEach(g => {
    gsap.from(g.children, {
      y: 70, opacity: 0, rotate: () => gsap.utils.random(-4, 4), filter: 'blur(8px)',
      duration: 1.1, ease: 'expo.out', stagger: 0.09, clearProps: 'transform,filter',
      scrollTrigger: { trigger: g, start: 'top 88%' }
    });
  });
  $$('.cs-txt .cs-goal, .cs-txt .cs-meta > div').forEach((el, i) => {
    gsap.from(el, {
      y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.25 + (i % 5) * 0.06,
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });

  /* ---------- 5) Matriz de usabilidad: los resultados "aparecen" ---------- */
  $$('[data-matrix]').forEach(m => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 75%' } });
    tl.from($$('tbody tr', m), { x: -40, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 })
      .from($$('tbody i', m), { scale: 0, rotate: -140, duration: 0.55, ease: 'back.out(2.2)', stagger: { each: 0.03, from: 'start' } }, 0.25);
  });

  /* ---------- 6) Contadores ---------- */
  $$('[data-count]').forEach(b => {
    const n = +b.dataset.count, suf = b.dataset.suf || '', o = { v: 0 };
    b.textContent = '0' + suf;
    ScrollTrigger.create({
      trigger: b, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v) + suf; } })
    });
  });

  /* ---------- 7) Parallax de fotos ---------- */
  $$('.cs-ph').forEach(f => {
    const img = $('img', f);
    gsap.fromTo(img, { yPercent: -7, scale: 1.18 }, {
      yPercent: 7, scale: 1.18, ease: 'none',
      scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.fromTo(f, { clipPath: 'inset(30% 12% 30% 12% round 30px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.4, ease: 'expo.out', clearProps: 'clipPath',
      scrollTrigger: { trigger: f, start: 'top 85%' }
    });
  });

  /* ---------- 7b) Captura completa que se recorre con el scroll ---------- */
  $$('.brw').forEach(b => {
    const v = $('.brw-v', b), img = $('img', v);
    b.classList.add('js');
    gsap.to(img, {
      y: () => -Math.max(0, img.offsetHeight - v.clientHeight), ease: 'none',
      scrollTrigger: { trigger: b, start: 'top 75%', end: 'bottom 25%', scrub: 0.6, invalidateOnRefresh: true }
    });
  });

  /* ---------- 8) Pasos sticky (Btravel) ---------- */
  $$('.ss').forEach(s => {
    const items = $$('.ss-it', s), steps = $$('.ss-step', s);
    steps.forEach((st, i) => ScrollTrigger.create({
      trigger: st, start: 'top 55%', end: 'bottom 55%',
      onToggle: e => {
        if (!e.isActive) return;
        steps.forEach(x => x.classList.toggle('on', x === st));
        items.forEach((it, k) => it.classList.toggle('on', k === i));
      }
    }));
  });

  /* ---------- 9) Barra de progreso + HUD de caso ---------- */
  gsap.to('.sp i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  const hud = $('.hud');
  if (hud) {
    const hi = $('.hud-i', hud), hn = $('.hud-n', hud), hp = $('.hud-p', hud), active = new Set();
    const cases = $$('.caso');
    cases.forEach((c, i) => ScrollTrigger.create({
      trigger: c, start: 'top 50%', end: 'bottom 50%',
      onToggle: e => {
        e.isActive ? active.add(c) : active.delete(c);
        if (e.isActive) { hi.textContent = `[${c.dataset.n || '0' + (i + 1)}/04]`; hn.textContent = c.dataset.case; }
        hud.classList.toggle('on', active.size > 0);
      },
      onUpdate: e => { if (active.has(c)) hp.textContent = String(Math.round(e.progress * 100)).padStart(3, '0') + '%'; }
    }));
  }

  // Recalcular cuando terminen de cargar imágenes y fuentes
  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
