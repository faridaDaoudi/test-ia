/* eslint-disable no-inner-declarations */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Header elevation on scroll
const header = $('[data-elevate-on-scroll]');
if (header) {
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-elevated', y > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Mobile menu toggle
const menuToggle = $('[data-menu-toggle]');
const nav = $('[data-nav]');
if (menuToggle && nav) {
  const setExpanded = (expanded) => {
    menuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    nav.classList.toggle('is-open', expanded);
  };

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  // Close when clicking a nav link (mobile)
  $$('#primary-nav a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => setExpanded(false));
  });
}

// Smooth scrolling for internal links
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$$('[data-scroll][href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href') || '';
    const id = href.startsWith('#') ? href.slice(1) : '';
    if (!id) return;
    e.preventDefault();
    scrollToId(id);
  });
});

// Active section highlighting
const navLinks = $$('#primary-nav .nav-link[href^="#"]');
const sectionIds = navLinks
  .map((a) => (a.getAttribute('href') || '').slice(1))
  .filter(Boolean);

if (sectionIds.length && 'IntersectionObserver' in window) {
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const io = new IntersectionObserver(
    (entries) => {
      // Pick the most visible intersecting section
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

      if (!visible) return;
      const id = visible.target.id;
      navLinks.forEach((a) => {
        const href = (a.getAttribute('href') || '').slice(1);
        a.classList.toggle('is-active', href === id);
      });
    },
    { root: null, threshold: [0.15, 0.35, 0.6], rootMargin: '-20% 0px -55% 0px' }
  );

  sections.forEach((s) => io.observe(s));
}

// Parallax background on hero
const hero = $('#home');
const heroBg = $('.hero-bg');
if (hero && heroBg) {
  const update = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const mx = Math.round((x / rect.width) * 28);
    const my = Math.round((y / rect.height) * 18);
    heroBg.style.setProperty('--mx', `${mx}px`);
    heroBg.style.setProperty('--my', `${my}px`);
  };

  window.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 720) return;
    update(e.clientX, e.clientY);
  });
}

// Service modal
const modal = $('#serviceModal');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');
const openButtons = $$('[data-open-modal]');

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function openModalFromTemplate(templateId) {
  const tpl = document.getElementById(templateId);
  if (!tpl) return;

  const frag = tpl.content.cloneNode(true);
  const h3 = frag.querySelector('h3');
  const title = h3 ? (h3.textContent || 'Service') : 'Service';
  if (h3) h3.remove();

  modalTitle.textContent = title;
  modalBody.innerHTML = '';
  modalBody.appendChild(frag);

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

openButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const templateId = btn.getAttribute('data-template') || '';
    if (!templateId) return;
    openModalFromTemplate(templateId);
  });
});

$$('[data-close-modal]').forEach((el) => {
  el.addEventListener('click', closeModal);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
});

// Gallery filtering
const chips = $$('.chip[data-filter]');
const items = $$('#galleryGrid .gallery-item');

function setGalleryFilter(filter) {
  chips.forEach((c) => {
    const active = c.getAttribute('data-filter') === filter;
    c.classList.toggle('is-active', active);
    c.setAttribute('aria-selected', active ? 'true' : 'false');
    if (active) c.tabIndex = 0;
  });

  items.forEach((it) => {
    const cat = it.getAttribute('data-cat');
    const show = filter === 'all' || cat === filter;
    it.hidden = !show;
  });
}

chips.forEach((c) => {
  c.addEventListener('click', () => {
    const filter = c.getAttribute('data-filter') || 'all';
    setGalleryFilter(filter);
  });
});

// FAQ accordion
const acc = $('[data-accordion]');
if (acc) {
  const btns = $$('[data-acc-toggle]', acc);
  const panels = $$('[data-acc-panel]', acc);

  // Set initial state markers
  acc.querySelectorAll('.acc-item').forEach((item) => {
    const btn = item.querySelector('[data-acc-toggle]');
    const expanded = btn ? btn.getAttribute('aria-expanded') === 'true' : false;
    item.dataset.open = expanded ? 'true' : 'false';
  });

  const openOnly = (toggleKey) => {
    panels.forEach((p) => (p.hidden = true));
    btns.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    acc.querySelectorAll('.acc-item').forEach((it) => (it.dataset.open = 'false'));

    const panel = $(`[data-acc-panel="${toggleKey}"]`, acc);
    const btn = $(`[data-acc-toggle="${toggleKey}"]`, acc);
    if (!panel || !btn) return;

    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const wrap = btn.closest('.acc-item');
    if (wrap) wrap.dataset.open = 'true';
  };

  btns.forEach((btn) => {
    const key = btn.getAttribute('data-acc-toggle') || '';
    btn.addEventListener('click', () => {
      const already = btn.getAttribute('aria-expanded') === 'true';
      if (already) {
        // Keep one open: reopen by setting it open again
        openOnly(key);
        return;
      }
      openOnly(key);
    });
  });
}

// Toast helper
const toast = $('#toast');
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-show');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-show'), 3200);
}

// Contact form (presentation only)
const form = $('#contactForm');
if (form) {
  const resetBtn = $('[data-reset-form]');
  resetBtn?.addEventListener('click', () => {
    form.reset();
    showToast('Formulaire reinitialise.');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = ($('#name')?.value || '').trim();
    if (!name) return;
    showToast(`Merci ${name}! Votre message est pret. Nous vous recontactons bientot.`);
    form.reset();
  });
}

