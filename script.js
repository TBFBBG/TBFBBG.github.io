(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---- Thème clair / sombre ---- */
  const root = document.documentElement;
  const saved = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  if (saved) root.dataset.theme = saved;
  $('#themeToggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
  });

  /* ---- Menu mobile ---- */
  const menu = $('#menu'), burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  /* ---- Barre de navigation au scroll ---- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Lien actif selon la section ---- */
  const links = $$('#menu a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---- Texte animé ---- */
  const words = ['Maintenance', 'Réseaux', 'Systèmes', 'Développement'];
  const typed = $('#typed');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    typed.textContent = words.join(' · ');
  } else {
    let w = 0, c = 0, del = false;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 45 : 90);
    };
    tick();
  }

  /* ---- Apparition au scroll + compteurs + barres de langues ---- */
  const animateCount = el => {
    const target = +el.dataset.count, dur = 900, t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * p);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      $$('[data-count]', e.target).forEach(animateCount);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---- Filtre des compétences ---- */
  $('#filters').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $$('#filters button').forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.f;
    $$('.skill').forEach(card => {
      card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f);
      card.classList.add('visible');
    });
  });

  /* ---- Formulaire : ouvre le client mail avec le message ---- */
  const form = $('#contactForm'), msg = $('#formMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const nom = data.get('nom').trim(), email = data.get('email').trim(), message = data.get('message').trim();
    let ok = true;
    $$('input, textarea', form).forEach(f => f.classList.remove('invalid'));
    const mark = n => { form.elements[n].classList.add('invalid'); ok = false; };
    if (!nom) mark('nom');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) mark('email');
    if (!message) mark('message');
    if (!ok) {
      msg.className = 'form-msg err';
      msg.textContent = 'Merci de remplir correctement tous les champs.';
      return;
    }
    const subject = encodeURIComponent('Contact depuis votre portfolio — ' + nom);
    const body = encodeURIComponent(message + '\n\n— ' + nom + ' (' + email + ')');
    window.location.href = `mailto:contactboubacarmane@gmail.com?subject=${subject}&body=${body}`;
    msg.className = 'form-msg ok';
    msg.textContent = 'Votre application de messagerie va s\'ouvrir.';
    form.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
