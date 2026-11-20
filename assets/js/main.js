/* Siziwe Sithole portfolio — shared behaviour (homepage + case studies) */
(function () {
  'use strict';

  const root = document.documentElement;

  /* ---- Draft mode: add ?draft to any URL to see where media/details go ---- */
  if (new URLSearchParams(location.search).has('draft')) {
    root.classList.add('is-draft');
  }

  /* ---- Year ---- */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---- Header border on scroll ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    const close = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menu'; };
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---- Highlight current section in nav ---- */
  const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---- Hero load sequence ---- */
  const hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));

  /* ---- Personal CV: if the file isn't uploaded yet, don't serve a broken download ---- */
  const cvLinks = document.querySelectorAll('[data-cv-link]');
  if (cvLinks.length && location.protocol.startsWith('http')) {
    fetch(cvLinks[0].getAttribute('href'), { method: 'HEAD' })
      .then(r => { if (!r.ok) throw new Error('missing'); })
      .catch(() => {
        const mail = document.querySelector('a[href^="mailto:"]');
        cvLinks.forEach(a => {
          a.removeAttribute('download');
          a.title = 'CV available on request';
          const value = a.querySelector('.contact__value');
          if (value) {                       // contact row: ask by email
            value.textContent = 'Available on request';
            a.href = mail ? mail.href + '?subject=CV%20request' : '#contact';
          } else {                            // header / hero buttons: go to contact
            a.href = a.dataset.cvFallback || '#contact';
          }
        });
        if (root.classList.contains('is-draft')) console.warn('[portfolio] Personal CV not found. Add it at assets/documents/Siziwe Sithole CV.pdf');
      });
  }

  /* ---- Case study video: fall back to the poster image if the file is missing ---- */
  document.querySelectorAll('.project__media video, .case-media video').forEach(video => {
    const frame = video.closest('.project__media, .case-media');
    const sources = video.querySelectorAll('source');
    const markMissing = () => frame.classList.add('is-missing');
    if (!sources.length) { markMissing(); return; }
    sources[sources.length - 1].addEventListener('error', markMissing);
    // preload="none" means errors only surface on play; probe the file cheaply instead
    if (location.protocol.startsWith('http')) {
      fetch(sources[0].src, { method: 'HEAD' }).then(r => { if (!r.ok) markMissing(); }).catch(markMissing);
    }
  });
})();
