/**
 * @jest-environment jsdom
 *
 * Tests for Lucky Bajaj's portfolio site (index.html).
 *
 * Two categories of tests:
 *  1. DOM Structure  – verifies the HTML contains the expected elements.
 *  2. JS Behaviour   – exercises the interactive JavaScript (modals,
 *                      journey switcher, keyboard shortcuts).
 */

const fs = require('fs');
const path = require('path');

// ─── Load portfolio HTML ────────────────────────────────────────────────────
const htmlContent = fs.readFileSync(
  path.join(__dirname, '..', 'index.html'),
  'utf8'
);

// ─── Helpers ────────────────────────────────────────────────────────────────
/**
 * Finds the inline <script> block that contains the portfolio's interactive
 * logic (openModal, closeModal, showJourney, …).
 */
function extractPortfolioScript(html) {
  const regex = /<script>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const block = match[1];
    if (block.includes('openModal') && block.includes('data-journey')) {
      return block;
    }
  }
  return '';
}

// ─── Global mocks ───────────────────────────────────────────────────────────
// jsdom does not implement IntersectionObserver; provide a no-op stub.
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom does not implement matchMedia; stub with non-matching queries
// (matches: false → reduced-motion off, coarse pointer — matches the
// plain-JS fallback paths).
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false; },
  });
}

// ============================================================================
// 1. DOM STRUCTURE TESTS
// ============================================================================
describe('DOM Structure', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = htmlContent;
  });

  // ── Page metadata ──────────────────────────────────────────────────────────
  describe('Page metadata', () => {
    it('has the correct <title>', () => {
      expect(document.title).toBe('Lucky Bajaj — Product Manager · Agentic AI');
    });

    it('has a viewport <meta> tag', () => {
      expect(document.querySelector('meta[name="viewport"]')).not.toBeNull();
    });

    it('links to an SVG favicon', () => {
      const favicon = document.querySelector('link[rel="icon"]');
      expect(favicon).not.toBeNull();
      expect(favicon.getAttribute('href')).toBe('favicon.svg');
    });
  });

  // ── Sections ───────────────────────────────────────────────────────────────
  describe('Sections', () => {
    const SECTIONS = [
      'hero',
      'about',
      'experience',
      'projects',
      'blog',
      'skills',
      'contact',
    ];

    it.each(SECTIONS)('renders the #%s section', (id) => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('renders a <nav> element', () => {
      expect(document.querySelector('nav')).not.toBeNull();
    });

    it('has at least one hash anchor inside .nav-links', () => {
      const links = document.querySelectorAll('.nav-links a[href^="#"]');
      expect(links.length).toBeGreaterThan(0);
    });

    it('every .nav-links anchor targets an existing section', () => {
      const links = document.querySelectorAll('.nav-links a[href^="#"]');
      links.forEach((a) => {
        const id = a.getAttribute('href').slice(1);
        if (id) {
          expect(document.getElementById(id)).not.toBeNull();
        }
      });
    });
  });

  // ── Contact form ───────────────────────────────────────────────────────────
  describe('Contact form', () => {
    it('exists on the page', () => {
      expect(document.querySelector('.contact-form')).not.toBeNull();
    });

    it('submits to Formspree', () => {
      const form = document.querySelector('.contact-form');
      expect(form.action).toContain('formspree.io');
    });

    it('name field is required', () => {
      const input = document.querySelector('input[name="name"]');
      expect(input).not.toBeNull();
      expect(input.required).toBe(true);
    });

    it('email field has type="email" and is required', () => {
      const input = document.querySelector('input[name="email"]');
      expect(input).not.toBeNull();
      expect(input.type).toBe('email');
      expect(input.required).toBe(true);
    });

    it('message textarea is required', () => {
      const ta = document.querySelector('textarea[name="message"]');
      expect(ta).not.toBeNull();
      expect(ta.required).toBe(true);
    });

    it('has a submit button', () => {
      expect(
        document.querySelector('.contact-form button[type="submit"]')
      ).not.toBeNull();
    });
  });

  // ── Resume download ────────────────────────────────────────────────────────
  describe('Resume download', () => {
    it('has a downloadable link', () => {
      expect(document.querySelector('a[download]')).not.toBeNull();
    });

    it('the download link points to a PDF file', () => {
      const link = document.querySelector('a[download]');
      expect(link.getAttribute('href')).toMatch(/\.pdf$/i);
    });
  });

  // ── Project modals ─────────────────────────────────────────────────────────
  describe('Project modals', () => {
    it('has at least one .modal-overlay element', () => {
      expect(document.querySelectorAll('.modal-overlay').length).toBeGreaterThan(0);
    });

    it('every modal has a .modal-close button', () => {
      document.querySelectorAll('.modal-overlay').forEach((m) => {
        expect(m.querySelector('.modal-close')).not.toBeNull();
      });
    });

    it('all modals start in the closed state', () => {
      document.querySelectorAll('.modal-overlay').forEach((m) => {
        expect(m.classList.contains('open')).toBe(false);
      });
    });
  });

  // ── Skills section ─────────────────────────────────────────────────────────
  describe('Skills section', () => {
    it('renders skill pills', () => {
      expect(document.querySelectorAll('.skill-pill').length).toBeGreaterThan(0);
    });

    it('shows at least two certification badges', () => {
      expect(document.querySelectorAll('.cert-badge').length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Blog section ───────────────────────────────────────────────────────────
  describe('Blog section', () => {
    it('has at least one article card', () => {
      expect(document.querySelectorAll('.article-card').length).toBeGreaterThan(0);
    });

    it('article cards link to external publications', () => {
      document.querySelectorAll('.article-card').forEach((card) => {
        const href = card.getAttribute('href');
        expect(
          href.includes('medium.com') || href.includes('thoughtworks.com')
        ).toBe(true);
      });
    });
  });

  // ── External links ─────────────────────────────────────────────────────────
  describe('External links', () => {
    it('has a LinkedIn link', () => {
      expect(document.querySelector('a[href*="linkedin.com"]')).not.toBeNull();
    });

    it('has a Medium link', () => {
      expect(document.querySelector('a[href*="medium.com"]')).not.toBeNull();
    });

    it('all http(s) links open in a new tab', () => {
      document.querySelectorAll('a[href^="http"]').forEach((a) => {
        expect(a.getAttribute('target')).toBe('_blank');
      });
    });
  });

  // ── Insurance journey comparison ───────────────────────────────────────────
  describe('Insurance journey comparison', () => {
    it('has a journey panel for each of the three platforms', () => {
      ['journey-phonepe', 'journey-policybazaar', 'journey-ditto'].forEach((id) => {
        expect(document.getElementById(id)).not.toBeNull();
      });
    });

    it('PhonePe journey panel is visible by default', () => {
      expect(document.getElementById('journey-phonepe').classList.contains('show')).toBe(true);
    });

    it('PolicyBazaar journey panel is hidden by default', () => {
      expect(document.getElementById('journey-policybazaar').classList.contains('show')).toBe(false);
    });

    it('Ditto journey panel is hidden by default', () => {
      expect(document.getElementById('journey-ditto').classList.contains('show')).toBe(false);
    });
  });
});

// ============================================================================
// 2. JAVASCRIPT BEHAVIOUR TESTS
// ============================================================================
describe('JavaScript behaviour', () => {
  /**
   * The redesigned portfolio ships its logic inside an IIFE that runs init()
   * immediately when the document is ready (jsdom readyState is "complete").
   * Re-evaluating the script per test attaches fresh per-element listeners to
   * the current DOM. Document-level handlers accumulate, but every state
   * mutation they perform is idempotent (class-based), so this is safe.
   */
  const rawScript = extractPortfolioScript(htmlContent);

  beforeEach(() => {
    document.documentElement.innerHTML = htmlContent;
    // eslint-disable-next-line no-eval
    eval(rawScript);
  });

  const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  // ── Modal open/close via card interaction ──────────────────────────────────
  describe('modal open/close (event delegation)', () => {
    it('clicking a project card opens its modal and locks body scroll', () => {
      const card = document.querySelector('[data-modal="mealtime"]');
      click(card);
      const overlay = document.getElementById('modal-mealtime');
      expect(overlay.classList.contains('open')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('pressing Enter on a focused card opens the modal', () => {
      const card = document.querySelector('[data-modal="food"]');
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(document.getElementById('modal-food').classList.contains('open')).toBe(true);
    });

    it('clicking the close button closes the modal and restores scroll', () => {
      const card = document.querySelector('[data-modal="commute"]');
      click(card);
      const overlay = document.getElementById('modal-commute');
      click(overlay.querySelector('[data-modal-close]'));
      expect(overlay.classList.contains('open')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('every modal opens and closes via its card', () => {
      document.querySelectorAll('[data-modal]').forEach((card) => {
        click(card);
        const overlay = document.getElementById('modal-' + card.dataset.modal);
        expect(overlay.classList.contains('open')).toBe(true);
        click(overlay.querySelector('[data-modal-close]'));
        expect(overlay.classList.contains('open')).toBe(false);
      });
    });
  });

  // ── Overlay click behaviour ────────────────────────────────────────────────
  describe('overlay click', () => {
    it('closes the modal when the overlay itself is clicked', () => {
      const card = document.querySelector('[data-modal="insurance"]');
      click(card);
      const overlay = document.getElementById('modal-insurance');
      click(overlay); // e.target === overlay
      expect(overlay.classList.contains('open')).toBe(false);
    });

    it('does NOT close when a child element is clicked', () => {
      const card = document.querySelector('[data-modal="insurance"]');
      click(card);
      const overlay = document.getElementById('modal-insurance');
      const child = overlay.querySelector('.modal-section-title');
      click(child);
      expect(overlay.classList.contains('open')).toBe(true);
    });
  });

  // ── Escape key ────────────────────────────────────────────────────────────
  describe('Escape key', () => {
    it('closes all open modals when Escape is pressed', () => {
      const card = document.querySelector('[data-modal="mealtime"]');
      click(card);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(document.getElementById('modal-mealtime').classList.contains('open')).toBe(false);
    });

    it('restores body overflow when Escape is pressed', () => {
      const card = document.querySelector('[data-modal="mealtime"]');
      click(card);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(document.body.style.overflow).toBe('');
    });

    it('does NOT close modals on other key presses', () => {
      const card = document.querySelector('[data-modal="mealtime"]');
      click(card);
      const overlay = document.getElementById('modal-mealtime');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(overlay.classList.contains('open')).toBe(true);
    });
  });

  // ── Journey switcher ──────────────────────────────────────────────────────
  describe('journey switcher', () => {
    it.each([
      ['phonepe', 'journey-phonepe', 'active-p1', ['journey-policybazaar', 'journey-ditto']],
      ['policybazaar', 'journey-policybazaar', 'active-p2', ['journey-phonepe', 'journey-ditto']],
      ['ditto', 'journey-ditto', 'active-p3', ['journey-phonepe', 'journey-policybazaar']],
    ])(
      'clicking "%s" shows the right panel, activates the button, hides others',
      (platform, visibleId, activeClass, hiddenIds) => {
        const button = document.querySelector('[data-journey="' + platform + '"]');
        click(button);

        expect(document.getElementById(visibleId).classList.contains('show')).toBe(true);
        expect(button.classList.contains(activeClass)).toBe(true);
        expect(button.getAttribute('aria-pressed')).toBe('true');
        hiddenIds.forEach((id) => {
          expect(document.getElementById(id).classList.contains('show')).toBe(false);
        });
      }
    );

    it('can switch between platforms multiple times', () => {
      click(document.querySelector('[data-journey="phonepe"]'));
      expect(document.getElementById('journey-phonepe').classList.contains('show')).toBe(true);

      click(document.querySelector('[data-journey="ditto"]'));
      expect(document.getElementById('journey-ditto').classList.contains('show')).toBe(true);
      expect(document.getElementById('journey-phonepe').classList.contains('show')).toBe(false);

      click(document.querySelector('[data-journey="policybazaar"]'));
      expect(document.getElementById('journey-policybazaar').classList.contains('show')).toBe(true);
      expect(document.getElementById('journey-ditto').classList.contains('show')).toBe(false);
    });
  });
});
