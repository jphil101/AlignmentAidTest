/**
 * Guided Tutorial Tour (skippable)
 * --------------------------------
 * A small, dependency-free spotlight tour. Each step highlights one part of the
 * page and explains how to use it. The tour:
 *   - opens automatically on a visitor's first visit (remembered in localStorage),
 *   - can be skipped at any time (Skip button, ✕, or Esc),
 *   - can be replayed from the "❓ Tutorial" button in the header,
 *   - supports keyboard navigation (← / → / Enter / Esc).
 *
 * Usage:
 *   const tour = new TutorialTour({ steps, storageKey: 'my-app-tour-v1', stickyHeader: '.app-header' });
 *   tour.maybeAutoStart();         // first visit only
 *   button.onclick = () => tour.start();
 *
 * Step shape:
 *   { target: '.css-selector' | null, title, body (HTML), placement?: 'bottom'|'top'|'left'|'right'|'center',
 *     before?: () => void   // e.g. open a collapsed section before highlighting it
 *     after?: () => void }  // undo what `before` did when leaving the step
 */

const PAD = 8;           // spotlight padding around the target (px)
const GAP = 14;          // distance between spotlight and the tooltip card (px)

function safeGet(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* private mode etc. */ }
}

export class TutorialTour {
  constructor({ steps, storageKey = 'tutorial-tour-seen', onFinish, stickyHeader = null } = {}) {
    this.steps = steps || [];
    this.stickyHeader = stickyHeader; // selector of a sticky header the tour must not hide targets under
    this.storageKey = storageKey;
    this.onFinish = onFinish;
    this.index = -1;
    this.active = false;
    this._onKey = this._onKey.bind(this);
    this._reposition = this._reposition.bind(this);
    this._build();
  }

  /** Start automatically only if the visitor has never finished/skipped the tour. */
  maybeAutoStart(delayMs = 600) {
    if (safeGet(this.storageKey)) return;
    setTimeout(() => { if (!this.active) this.start(); }, delayMs);
  }

  start(at = 0) {
    if (!this.steps.length) return;
    this.active = true;
    this.root.classList.add('tour-open');
    this.root.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', this._onKey, true);
    window.addEventListener('resize', this._reposition);
    window.addEventListener('scroll', this._reposition, true);
    this._go(at);
  }

  /** Skip / close. The tour will not auto-open again. */
  end(completed = false) {
    if (!this.active) return;
    this._leaveStep();
    this.active = false;
    this.index = -1;
    this.root.classList.remove('tour-open');
    this.root.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', this._onKey, true);
    window.removeEventListener('resize', this._reposition);
    window.removeEventListener('scroll', this._reposition, true);
    safeSet(this.storageKey, completed ? 'completed' : 'skipped');
    if (this.onFinish) this.onFinish(completed);
  }

  next() { this.index >= this.steps.length - 1 ? this.end(true) : this._go(this.index + 1); }
  prev() { if (this.index > 0) this._go(this.index - 1); }

  // ------------------------------------------------------------------ internals

  _build() {
    const root = document.createElement('div');
    root.className = 'tour-root';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = `
      <div class="tour-backdrop" data-tour-backdrop></div>
      <div class="tour-spotlight" data-tour-spotlight></div>
      <div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title" data-tour-card>
        <button type="button" class="tour-close" data-tour-skip aria-label="Skip tutorial">✕</button>
        <div class="tour-progress" data-tour-progress></div>
        <h3 class="tour-title" id="tour-title" data-tour-title></h3>
        <div class="tour-body" data-tour-body></div>
        <div class="tour-dots" data-tour-dots aria-hidden="true"></div>
        <div class="tour-actions">
          <button type="button" class="tour-btn tour-btn-ghost" data-tour-skip>Skip tutorial</button>
          <span class="tour-spacer"></span>
          <button type="button" class="tour-btn tour-btn-secondary" data-tour-prev>← Back</button>
          <button type="button" class="tour-btn tour-btn-primary" data-tour-next>Next →</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    this.root = root;
    this.spot = root.querySelector('[data-tour-spotlight]');
    this.card = root.querySelector('[data-tour-card]');
    this.titleEl = root.querySelector('[data-tour-title]');
    this.bodyEl = root.querySelector('[data-tour-body]');
    this.progressEl = root.querySelector('[data-tour-progress]');
    this.dotsEl = root.querySelector('[data-tour-dots]');
    this.prevBtn = root.querySelector('[data-tour-prev]');
    this.nextBtn = root.querySelector('[data-tour-next]');

    root.querySelectorAll('[data-tour-skip]').forEach(b => b.addEventListener('click', () => this.end(false)));
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    // The page stays interactive during highlighted steps, so learners can try the
    // control under the spotlight. Only the centered (intro/outro) steps block the page.
  }

  _leaveStep() {
    const step = this.steps[this.index];
    if (step && typeof step.after === 'function') {
      try { step.after(); } catch (e) { console.warn(e); }
    }
  }

  _go(i) {
    this._leaveStep();
    this.index = i;
    const step = this.steps[i];
    if (typeof step.before === 'function') {
      try { step.before(); } catch (e) { console.warn(e); }
    }

    this.titleEl.textContent = step.title || '';
    this.bodyEl.innerHTML = step.body || '';
    this.progressEl.textContent = `Step ${i + 1} of ${this.steps.length}`;
    this.dotsEl.innerHTML = this.steps.map((_, k) =>
      `<span class="tour-dot ${k === i ? 'is-current' : ''} ${k < i ? 'is-done' : ''}"></span>`).join('');
    this.prevBtn.disabled = i === 0;
    this.prevBtn.style.visibility = i === 0 ? 'hidden' : 'visible';
    this.nextBtn.textContent = i === this.steps.length - 1 ? 'Finish ✓' : 'Next →';

    const target = this._target();
    if (target) this._scrollIntoView(target);
    // Wait one frame for layout (e.g. after `before()` opened something).
    requestAnimationFrame(() => {
      this._reposition();
      this.nextBtn.focus({ preventScroll: true });
    });
  }

  /** Height covered by sticky/fixed headers at the top of the viewport. */
  _topInset() {
    if (!this.stickyHeader) return 0;
    const h = document.querySelector(this.stickyHeader);
    if (!h) return 0;
    const pos = getComputedStyle(h).position;
    if (pos !== 'sticky' && pos !== 'fixed') return 0;
    return Math.max(0, h.getBoundingClientRect().bottom);
  }

  _scrollIntoView(el) {
    const inset = this._topInset() + PAD + 6;
    const r = el.getBoundingClientRect();
    const avail = window.innerHeight - inset - 16;
    if (r.top >= inset && r.bottom <= window.innerHeight - 16) return; // already fully visible
    // Center it in the visible area below the header; tall elements align to the top.
    const offset = r.height >= avail ? 0 : (avail - r.height) / 2;
    window.scrollTo({ top: window.scrollY + r.top - inset - offset, behavior: 'auto' });
  }

  _target() {
    const step = this.steps[this.index];
    if (!step || !step.target) return null;
    const el = document.querySelector(step.target);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null; // hidden element -> centered card
    return el;
  }

  _reposition() {
    if (!this.active) return;
    const step = this.steps[this.index];
    const target = this._target();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!target || step.placement === 'center') {
      this.spot.classList.add('tour-spot-none');
      this.root.classList.add('tour-centered');
      this.card.style.left = '';
      this.card.style.top = '';
      return;
    }
    this.root.classList.remove('tour-centered');
    this.spot.classList.remove('tour-spot-none');

    const r = target.getBoundingClientRect();
    const sx = Math.max(4, r.left - PAD);
    const sy = Math.max(4, r.top - PAD);
    const sw = Math.min(vw - 8, r.right + PAD) - sx;
    const sh = Math.min(vh - 8, r.bottom + PAD) - sy;
    Object.assign(this.spot.style, { left: `${sx}px`, top: `${sy}px`, width: `${sw}px`, height: `${sh}px` });

    // Card placement
    const cw = this.card.offsetWidth;
    const ch = this.card.offsetHeight;
    const narrow = vw < 640;
    let left; let top;

    if (narrow) {
      // On phones: dock the card at the bottom (or top if the target is low on screen).
      left = (vw - cw) / 2;
      top = (sy + sh / 2 > vh / 2) ? 12 : vh - ch - 12;
    } else {
      const order = [step.placement || 'bottom', 'bottom', 'top', 'right', 'left'];
      const fits = {
        bottom: sy + sh + GAP + ch <= vh - 8,
        top: sy - GAP - ch >= 8,
        right: sx + sw + GAP + cw <= vw - 8,
        left: sx - GAP - cw >= 8,
      };
      const place = order.find(p => fits[p]) || 'overlay';
      if (place === 'bottom') { top = sy + sh + GAP; left = sx + sw / 2 - cw / 2; }
      else if (place === 'top') { top = sy - GAP - ch; left = sx + sw / 2 - cw / 2; }
      else if (place === 'right') { left = sx + sw + GAP; top = sy + sh / 2 - ch / 2; }
      else if (place === 'left') { left = sx - GAP - cw; top = sy + sh / 2 - ch / 2; }
      else { left = vw - cw - 16; top = vh - ch - 16; } // large target: float bottom-right
    }
    left = Math.max(8, Math.min(left, vw - cw - 8));
    top = Math.max(8, Math.min(top, vh - ch - 8));
    this.card.style.left = `${left}px`;
    this.card.style.top = `${top}px`;
  }

  _onKey(e) {
    if (!this.active) return;
    // Let people type in inputs that sit inside the spotlight.
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !this.root.contains(e.target);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.end(false); }
    else if (typing) return;
    else if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
  }
}
