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
    if (block.includes('openModal') && block.includes('showJourney')) {
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
      expect(document.title).toBe('Lucky Bajaj — Product Manager');
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

    it('article cards link to Medium', () => {
      document.querySelectorAll('.article-card').forEach((card) => {
        expect(card.getAttribute('href')).toContain('medium.com');
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
      expect(document.getElementById('journey-phonepe').style.display).toBe('block');
    });

    it('PolicyBazaar journey panel is hidden by default', () => {
      expect(document.getElementById('journey-policybazaar').style.display).toBe('none');
    });

    it('Ditto journey panel is hidden by default', () => {
      expect(document.getElementById('journey-ditto').style.display).toBe('none');
    });
  });
});

// ============================================================================
// 2. JAVASCRIPT BEHAVIOUR TESTS
// ============================================================================
describe('JavaScript behaviour', () => {
  /**
   * Evaluate the portfolio script once.
   * The script attaches event listeners (keydown) and we explicitly assign
   * openModal / closeModal / closeOnOverlay onto window so they survive
   * the eval scope and remain accessible from test callbacks.
   */
  beforeAll(() => {
    document.documentElement.innerHTML = htmlContent;

    const rawScript = extractPortfolioScript(htmlContent);
    // Append explicit window assignments so functions are reachable in tests.
    const script =
      rawScript +
      '\nwindow.openModal = openModal;' +
      '\nwindow.closeModal = closeModal;' +
      '\nwindow.closeOnOverlay = closeOnOverlay;\n';

    // eslint-disable-next-line no-eval
    eval(script);
  });

  // Reset the DOM to a clean copy before each individual test.
  beforeEach(() => {
    document.documentElement.innerHTML = htmlContent;
  });

  // ── openModal / closeModal ─────────────────────────────────────────────────
  describe('openModal / closeModal', () => {
    /** Returns the ID suffix of the first modal-overlay in the DOM. */
    function firstModalId() {
      return document.querySelector('.modal-overlay').id.replace('modal-', '');
    }

    it('openModal adds the "open" class to the correct modal', () => {
      const id = firstModalId();
      window.openModal(id);
      expect(document.getElementById('modal-' + id).classList.contains('open')).toBe(true);
    });

    it('openModal locks the body scroll', () => {
      window.openModal(firstModalId());
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('closeModal removes the "open" class', () => {
      const id = firstModalId();
      window.openModal(id);
      window.closeModal(id);
      expect(document.getElementById('modal-' + id).classList.contains('open')).toBe(false);
    });

    it('closeModal restores the body scroll', () => {
      const id = firstModalId();
      window.openModal(id);
      window.closeModal(id);
      expect(document.body.style.overflow).toBe('');
    });

    it('openModal and closeModal can be called on every modal', () => {
      document.querySelectorAll('.modal-overlay').forEach((m) => {
        const id = m.id.replace('modal-', '');
        window.openModal(id);
        expect(m.classList.contains('open')).toBe(true);
        window.closeModal(id);
        expect(m.classList.contains('open')).toBe(false);
      });
    });
  });

  // ── closeOnOverlay ─────────────────────────────────────────────────────────
  describe('closeOnOverlay', () => {
    function firstModal() {
      return document.querySelector('.modal-overlay');
    }

    it('closes the modal when the overlay itself is clicked', () => {
      const modal = firstModal();
      const id = modal.id.replace('modal-', '');
      modal.classList.add('open');

      window.closeOnOverlay({ target: modal, currentTarget: modal }, id);

      expect(modal.classList.contains('open')).toBe(false);
    });

    it('does NOT close the modal when a child element is clicked', () => {
      const modal = firstModal();
      const id = modal.id.replace('modal-', '');
      modal.classList.add('open');
      const child = modal.querySelector('.modal-close');

      window.closeOnOverlay({ target: child, currentTarget: modal }, id);

      expect(modal.classList.contains('open')).toBe(true);
    });
  });

  // ── Escape key ─────────────────────────────────────────────────────────────
  describe('Escape key', () => {
    it('closes all open modals when Escape is pressed', () => {
      document.querySelectorAll('.modal-overlay').forEach((m) =>
        m.classList.add('open')
      );

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      document.querySelectorAll('.modal-overlay').forEach((m) => {
        expect(m.classList.contains('open')).toBe(false);
      });
    });

    it('restores body overflow when Escape is pressed', () => {
      document.querySelectorAll('.modal-overlay').forEach((m) =>
        m.classList.add('open')
      );
      document.body.style.overflow = 'hidden';

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(document.body.style.overflow).toBe('');
    });

    it('does NOT close modals on other key presses', () => {
      const modal = document.querySelector('.modal-overlay');
      modal.classList.add('open');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

      expect(modal.classList.contains('open')).toBe(true);
    });
  });

  // ── showJourney ────────────────────────────────────────────────────────────
  describe('showJourney', () => {
    it.each([
      ['phonepe', 'journey-phonepe', ['journey-policybazaar', 'journey-ditto']],
      ['policybazaar', 'journey-policybazaar', ['journey-phonepe', 'journey-ditto']],
      ['ditto', 'journey-ditto', ['journey-phonepe', 'journey-policybazaar']],
    ])(
      'showJourney("%s") shows the correct panel and hides the others',
      (platform, visibleId, hiddenIds) => {
        window.showJourney(platform);

        expect(document.getElementById(visibleId).style.display).toBe('block');
        hiddenIds.forEach((id) => {
          expect(document.getElementById(id).style.display).toBe('none');
        });
      }
    );

    it('can switch between platforms multiple times', () => {
      window.showJourney('phonepe');
      expect(document.getElementById('journey-phonepe').style.display).toBe('block');

      window.showJourney('ditto');
      expect(document.getElementById('journey-ditto').style.display).toBe('block');
      expect(document.getElementById('journey-phonepe').style.display).toBe('none');

      window.showJourney('policybazaar');
      expect(document.getElementById('journey-policybazaar').style.display).toBe('block');
      expect(document.getElementById('journey-ditto').style.display).toBe('none');
    });
  });
});
