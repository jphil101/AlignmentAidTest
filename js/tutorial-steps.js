/**
 * Tutorial steps for the Bio-DP Alignment Aid.
 * Opens automatically on first visit; skippable; replay with the "❓ Tutorial" button.
 */
import { TutorialTour } from './tutorial.js';

const STEPS = [
  {
    target: null,
    title: '👋 Welcome to Bio-DP Alignment Aid',
    body: `
      <p>This tool lets you <strong>practise filling a dynamic-programming alignment matrix by hand</strong>
      and checks your work — the same thing you do on paper in a bioinformatics exam.</p>
      <p>This 1-minute tour shows you every control. You can <strong>skip it any time</strong>
      (<kbd>Esc</kbd>) and replay it later from the <strong>❓ Tutorial</strong> button at the top.</p>
      <p>Tip: use <kbd>←</kbd> <kbd>→</kbd> to move between steps.</p>`,
  },
  {
    target: '.algo-switcher-container',
    title: '1 · Pick the algorithm',
    body: `
      <ul>
        <li><strong>🌐 Needleman-Wunsch</strong> — global alignment. Row 0 / column 0 hold cumulative gap penalties; traceback runs from the bottom-right corner to (0,0).</li>
        <li><strong>🔍 Smith-Waterman</strong> — local alignment. Boundaries are 0, scores never drop below 0, and traceback starts at the highest cell and stops at a 0.</li>
      </ul>
      <p>The blue banner below always summarises the rules of the selected method.</p>`,
  },
  {
    target: '#preset-select',
    title: '2 · Or load a ready-made example',
    body: `<p>Presets fill in both sequences, the scoring scheme and the algorithm for classic textbook problems — a quick way to start practising.</p>`,
  },
  {
    target: '.config-card',
    title: '3 · Enter your sequences and scoring rules',
    body: `
      <ul>
        <li><strong>Sequence 1</strong> runs down the rows (<em>i</em>), <strong>Sequence 2</strong> across the columns (<em>j</em>). Up to 20 letters each — DNA, RNA or protein.</li>
        <li><strong>⇄</strong> swaps the two sequences.</li>
        <li>Set <strong>Match</strong>, <strong>Mismatch</strong> and <strong>Gap (d)</strong>. Positive and negative values both work — use whatever your course uses.</li>
      </ul>
      <p>Changing anything rebuilds the matrix instantly.</p>`,
  },
  {
    target: '#interactive-matrix-container',
    title: '4 · Fill in the matrix',
    placement: 'top',
    body: `
      <p>Row 0 and column 0 are pre-filled for you. For every other cell:</p>
      <ul>
        <li><strong>Click a cell and type its score</strong> (the <code>?</code> box).</li>
        <li>Move with <kbd>Tab</kbd>, the arrow keys, or <kbd>Enter</kbd>.</li>
        <li>Each cell shows its coordinates <code>(i,j)</code> in the corner.</li>
      </ul>`,
  },
  {
    target: '#interactive-matrix-container .interactive-cell[data-i="1"][data-j="1"]',
    title: '5 · Draw traceback arrows',
    body: `
      <p>Hover near an <strong>edge of a cell</strong> to see a faint "ghost" arrow, then click to place it:</p>
      <ul>
        <li><strong>top-left corner</strong> → ↖ diagonal (match / mismatch)</li>
        <li><strong>top edge</strong> → ↑ up (gap in Sequence 2)</li>
        <li><strong>left edge</strong> → ← left (gap in Sequence 1)</li>
      </ul>
      <p>If two directions tie for the maximum, place <strong>both</strong> arrows. Click an arrow again to remove it.</p>`,
  },
  {
    target: '.rough-work-sidebar',
    title: '6 · Rough work for each cell',
    placement: 'right',
    body: `
      <p>When you select a cell, write the three candidate calculations here
      (↖ diagonal, ↑ up, ← left) before deciding the maximum.</p>
      <p>Notes are <strong>saved per cell</strong> — switch cells and come back, your working is still there.</p>`,
  },
  {
    target: '#btn-check-answers',
    title: '7 · Check your answers',
    body: `<p>Checks <strong>every cell you have filled</strong> at once: correct cells glow <span style="color:#16a34a;font-weight:700">green</span>, wrong ones <span style="color:#dc2626;font-weight:700">red</span>. The colours fade away over 20 seconds so they don't get in your way.</p>`,
  },
  {
    target: '#btn-eraser',
    title: '8 · Eraser',
    body: `<p>Turn on the eraser, then click an arrow to delete it or click a cell to clear its score. Click the button again to switch it off.</p>`,
  },
  {
    target: '#btn-hint',
    title: '9 · Stuck? Get a hint',
    body: `<p>Fills in the <strong>next cell</strong> for you and opens a breakdown card showing the diagonal, up and left candidates and which one wins — so you learn <em>why</em>, not just the number.</p>`,
  },
  {
    target: '#btn-complete-matrix',
    title: '10 · Complete the rest',
    body: `<p>Once you have filled <strong>at least 5 cells correctly</strong> yourself, this auto-fills the remaining scores and arrows (after asking you to confirm). With fewer than 5, it highlights what's missing or wrong instead.</p>`,
  },
  {
    target: '#btn-toggle-answer',
    title: '11 · See the full solution',
    body: `
      <p>Reveals the complete answer matrix with the <strong>optimal traceback path</strong> glowing gold, the final alignment, score, identity % and match / mismatch / gap counts.</p>
      <p>Click any cell in the solution to see its step-by-step recurrence calculation. If there are several optimal alignments you can switch between them.</p>`,
  },
  {
    target: '.toolbar-card .toolbar-group:last-child',
    title: '12 · Reset, zoom & export',
    body: `
      <ul>
        <li><strong>Clear Scores / Clear Arrows / Reset All</strong> — start over.</li>
        <li><strong>− / + / 1:1</strong> — zoom the matrix for long sequences.</li>
        <li><strong>📋 Copy Report</strong> — copies the alignment summary to your clipboard.</li>
      </ul>`,
  },
  {
    target: '.theory-card',
    title: '13 · Theory reference',
    placement: 'top',
    body: `<p>Expand this panel for the initialisation rules, recurrence relations and traceback rules of both algorithms — handy for revision.</p>`,
  },
  {
    target: null,
    title: '🎉 You\'re ready!',
    body: `
      <p>Suggested workflow: <strong>load a preset → fill a few cells → Check Answers → use hints when stuck → compare with the full solution</strong>.</p>
      <p>You can replay this tour any time from the <strong>❓ Tutorial</strong> button at the top of the page.</p>`,
  },
];

export function initTutorial() {
  const tour = new TutorialTour({ steps: STEPS, storageKey: 'bio-dp-alignment-aid:tutorial-v1', stickyHeader: '.app-header' });
  const btn = document.getElementById('btn-start-tutorial');
  if (btn) btn.addEventListener('click', () => tour.start());
  tour.maybeAutoStart();
  return tour;
}
