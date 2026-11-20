/* Professional experience document viewer.
   Renders the PDF with a self-hosted copy of PDF.js (assets/vendor/pdfjs) so pages
   display the same on desktop and mobile. Falls back to the browser's own viewer. */
(function () {
  'use strict';
  const viewer = document.getElementById('pdf-viewer');
  if (!viewer) return;

  const SRC = viewer.dataset.src;
  const LIB = 'assets/vendor/pdfjs/pdf.min.js';
  const WORKER = 'assets/vendor/pdfjs/pdf.worker.min.js';
  const ZOOMS = [0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2];

  const well = viewer.querySelector('.doc__well');
  const pagesEl = viewer.querySelector('[data-pdf-pages-container]');
  const currentEl = viewer.querySelector('[data-pdf-current]');
  const countEl = viewer.querySelector('[data-pdf-pages]');
  const zoomOut = viewer.querySelector('[data-zoom="-1"]');
  const zoomIn = viewer.querySelector('[data-zoom="1"]');
  const zoomLabel = viewer.querySelector('[data-zoom-level]');

  let pdf = null, zoomIndex = ZOOMS.indexOf(1), lastWidth = 0, renderToken = 0;

  function status(html) { pagesEl.innerHTML = `<p class="doc__status">${html}</p>`; }

  function missing() {
    status('The document isn’t available yet. Place the PDF at <code>' + SRC + '</code> in the repository.');
    viewer.querySelectorAll('.doc__tools a, .doc__zoom button').forEach(el => el.setAttribute('aria-disabled', 'true'));
  }

  function nativeFallback() {
    // Browser's built-in viewer (used if PDF.js can't load, e.g. opened via file://)
    pagesEl.innerHTML = '';
    const frame = document.createElement('iframe');
    frame.className = 'doc__fallback';
    frame.title = 'Professional project experience PDF';
    frame.src = SRC + '#view=FitH';
    frame.loading = 'lazy';
    well.style.padding = '0';
    pagesEl.style.height = '100%';
    pagesEl.appendChild(frame);
    viewer.querySelector('.doc__zoom').hidden = true;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (location.protocol === 'file:') { nativeFallback(); return; }
    try {
      const head = await fetch(SRC, { method: 'HEAD' });
      if (!head.ok) { missing(); return; }
    } catch (e) { /* network quirk: let PDF.js try anyway */ }

    try {
      await loadScript(LIB);
      const lib = window.pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = WORKER;
      pdf = await lib.getDocument({ url: SRC }).promise;
    } catch (err) {
      console.warn('[pdf-viewer] PDF.js unavailable, using browser viewer.', err);
      nativeFallback();
      return;
    }
    countEl.textContent = `(${pdf.numPages} ${pdf.numPages === 1 ? 'page' : 'pages'})`;
    await render();
    well.addEventListener('scroll', updateCurrent, { passive: true });
    window.addEventListener('resize', debounce(() => {
      if (Math.abs(well.clientWidth - lastWidth) > 24) render();
    }, 200));
  }

  async function render() {
    const token = ++renderToken;
    const pad = parseFloat(getComputedStyle(well).paddingLeft) * 2;
    const available = well.clientWidth - pad;
    lastWidth = well.clientWidth;
    const fitWidth = Math.min(available, 880);
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const frag = document.createDocumentFragment();

    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      if (token !== renderToken) return;            // a newer render started
      const base = page.getViewport({ scale: 1 });
      const cssScale = (fitWidth / base.width) * ZOOMS[zoomIndex];
      const vp = page.getViewport({ scale: cssScale * dpr });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = Math.floor(vp.width / dpr) + 'px';
      canvas.style.height = Math.floor(vp.height / dpr) + 'px';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Page ${n} of ${pdf.numPages}`);
      canvas.dataset.page = n;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      if (token !== renderToken) return;
      frag.appendChild(canvas);
    }
    const ratio = well.scrollTop / Math.max(1, well.scrollHeight);
    pagesEl.innerHTML = '';
    pagesEl.appendChild(frag);
    well.scrollTop = ratio * well.scrollHeight;
    zoomLabel.textContent = Math.round(ZOOMS[zoomIndex] * 100) + '%';
    zoomOut.disabled = zoomIndex === 0;
    zoomIn.disabled = zoomIndex === ZOOMS.length - 1;
    updateCurrent();
  }

  function updateCurrent() {
    if (!pdf) return;
    const mid = well.getBoundingClientRect().top + well.clientHeight * 0.35;
    let current = 1;
    pagesEl.querySelectorAll('canvas').forEach(c => { if (c.getBoundingClientRect().top <= mid) current = +c.dataset.page; });
    currentEl.textContent = `Page ${current} of ${pdf.numPages}`;
  }

  [zoomOut, zoomIn].forEach(btn => btn.addEventListener('click', () => {
    if (!pdf) return;
    zoomIndex = Math.max(0, Math.min(ZOOMS.length - 1, zoomIndex + Number(btn.dataset.zoom)));
    render();
  }));

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  // Lazy-load: only fetch PDF.js (≈1.4 MB) when the section is close to the viewport
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); init(); }
    }, { rootMargin: '600px 0px' });
    io.observe(viewer);
  } else {
    init();
  }
})();
