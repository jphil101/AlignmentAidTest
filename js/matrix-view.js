/**
 * Interactive Matrix Grid and Arrow Engine
 * Handles dynamic grid construction, Sudoku-like cell inputs, directional shadow arrows,
 * single-arrow per cell constraint, left-hand Rough Work sidebar with per-cell caching,
 * eraser tool, 20-second fade validation, solution cell inspector, and hint calculation breakdown.
 */

import { DIRECTION, ALGORITHM } from './algorithms.js';
import { createCharBadgeHTML } from './color-map.js';

export class MatrixView {
  constructor(options) {
    this.container = options.container;
    this.answerContainer = options.answerContainer;
    this.inspectorContainer = options.inspectorContainer;
    this.hintInspectorContainer = options.hintInspectorContainer || document.getElementById('hint-inspector-container');
    this.hintSection = options.hintSection || document.getElementById('hint-inspector-section');
    this.alignmentContainer = options.alignmentContainer;
    this.onCellChange = options.onCellChange || (() => {});
    this.onInspectCell = options.onInspectCell || (() => {});

    this.data = null;          // Calculated ground-truth data
    this.userScores = {};      // Key: "i,j" -> string number
    this.userArrows = {};      // Key: "i,j" -> Set of DIRECTIONs (Max 1 arrow per cell)
    this.roughWork = {};       // Key: "i,j" -> { diag: string, up: string, left: string }
    this.eraserActive = false;
    this.activeTracebackPath = 0;
    this.validationTimer = null;
    this.highlightTimer = null;
    this.selectedCell = null;
    this.selectedAnswerCell = null;
    this.activeRoughCell = null;

    this.initRoughWorkSidebar();
  }

  initRoughWorkSidebar() {
    this.roughCellBadge = document.getElementById('rough-active-cell-badge');
    this.roughDiagInput = document.getElementById('sidebar-rough-diag');
    this.roughUpInput = document.getElementById('sidebar-rough-up');
    this.roughLeftInput = document.getElementById('sidebar-rough-left');
    this.btnClearRough = document.getElementById('btn-clear-rough');

    const onRoughInputChange = (field, e) => {
      if (!this.activeRoughCell) return;
      const key = `${this.activeRoughCell.i},${this.activeRoughCell.j}`;
      if (!this.roughWork[key]) {
        this.roughWork[key] = { diag: '', up: '', left: '' };
      }
      this.roughWork[key][field] = e.target.value;
    };

    if (this.roughDiagInput) {
      this.roughDiagInput.addEventListener('input', (e) => onRoughInputChange('diag', e));
    }
    if (this.roughUpInput) {
      this.roughUpInput.addEventListener('input', (e) => onRoughInputChange('up', e));
    }
    if (this.roughLeftInput) {
      this.roughLeftInput.addEventListener('input', (e) => onRoughInputChange('left', e));
    }

    if (this.btnClearRough) {
      this.btnClearRough.addEventListener('click', () => {
        if (!this.activeRoughCell) return;
        const key = `${this.activeRoughCell.i},${this.activeRoughCell.j}`;
        delete this.roughWork[key];
        if (this.roughDiagInput) this.roughDiagInput.value = '';
        if (this.roughUpInput) this.roughUpInput.value = '';
        if (this.roughLeftInput) this.roughLeftInput.value = '';
      });
    }

    const btnCloseHint = document.getElementById('btn-close-hint-inspector');
    if (btnCloseHint && this.hintSection) {
      btnCloseHint.addEventListener('click', () => {
        this.hintSection.classList.add('hidden');
      });
    }
  }

  setData(truthData) {
    this.data = truthData;
    const newScores = {};
    const newArrows = {};
    const newRough = {};
    const m = truthData.dimensions.rows;
    const n = truthData.dimensions.cols;

    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        const key = `${i},${j}`;
        if (this.userScores[key] !== undefined) {
          newScores[key] = this.userScores[key];
        }
        if (this.userArrows[key]) {
          newArrows[key] = new Set(this.userArrows[key]);
        } else {
          newArrows[key] = new Set();
        }
        if (this.roughWork[key]) {
          newRough[key] = this.roughWork[key];
        }
      }
    }
    this.userScores = newScores;
    this.userArrows = newArrows;
    this.roughWork = newRough;
    this.activeTracebackPath = 0;
    this.selectedCell = null;
    this.selectedAnswerCell = null;
    this.activeRoughCell = null;
    this.resetRoughWorkUI();
    if (this.hintSection) this.hintSection.classList.add('hidden');
    this.render();
  }

  resetRoughWorkUI() {
    if (this.roughCellBadge) this.roughCellBadge.textContent = 'Select a cell';
    if (this.roughDiagInput) this.roughDiagInput.value = '';
    if (this.roughUpInput) this.roughUpInput.value = '';
    if (this.roughLeftInput) this.roughLeftInput.value = '';
  }

  setEraserMode(enabled) {
    this.eraserActive = enabled;
    if (this.container) {
      if (enabled) {
        this.container.classList.add('eraser-mode-active');
      } else {
        this.container.classList.remove('eraser-mode-active');
      }
    }
  }

  clearUserScores() {
    this.userScores = {};
    this.render();
  }

  clearUserArrows() {
    for (const key in this.userArrows) {
      this.userArrows[key].clear();
    }
    this.render();
  }

  resetAll() {
    this.userScores = {};
    this.userArrows = {};
    this.roughWork = {};
    this.resetRoughWorkUI();
    this.clearValidationEffects();
    this.clearHighlights();
    if (this.hintSection) this.hintSection.classList.add('hidden');
    this.render();
  }

  /**
   * Auto fills the next unsolved or incorrect cell as a hint
   */
  autoFillHint() {
    if (!this.data) return null;
    const { matrix, dimensions } = this.data;
    const { rows, cols } = dimensions;

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const key = `${i},${j}`;
        const userVal = this.userScores[key];
        const trueVal = matrix[i][j].score;

        if (userVal === undefined || userVal === '' || Number(userVal) !== trueVal) {
          this.userScores[key] = String(trueVal);
          this.userArrows[key] = new Set(matrix[i][j].arrows);
          this.render();
          this.highlightCellTemporarily(i, j);
          this.selectCell(i, j);
          this.showHintCalculation(i, j);
          return { i, j, score: trueVal };
        }
      }
    }
    return null;
  }

  showHintCalculation(i, j) {
    if (!this.hintInspectorContainer || !this.hintSection) return;
    this.hintSection.classList.remove('hidden');
    this.renderCalculationCardInto(i, j, this.hintInspectorContainer);
    this.hintSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  highlightCellTemporarily(i, j) {
    const input = this.container.querySelector(`.cell-input[data-i="${i}"][data-j="${j}"]`);
    if (input) {
      input.focus();
      const cell = input.closest('.matrix-cell');
      if (cell) {
        cell.classList.add('hint-pulse');
        setTimeout(() => cell.classList.remove('hint-pulse'), 1500);
      }
    }
  }

  /**
   * Evaluates manual correct fills for "Complete this" criteria
   * Minimum criteria: 5 correct manual fills
   */
  getManualStats() {
    if (!this.data) return null;
    const { matrix, dimensions } = this.data;
    const { rows, cols } = dimensions;

    let correctCount = 0;
    let incorrectCount = 0;
    let missingCount = 0;
    const totalCells = (rows - 1) * (cols - 1);
    const correctCells = [];
    const incorrectCells = [];
    const missingCells = [];

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const key = `${i},${j}`;
        const userVal = this.userScores[key];
        const isFilled = (userVal !== undefined && String(userVal).trim() !== '');

        if (isFilled) {
          if (Number(userVal) === matrix[i][j].score) {
            correctCount++;
            correctCells.push({ i, j });
          } else {
            incorrectCount++;
            incorrectCells.push({ i, j });
          }
        } else {
          missingCount++;
          missingCells.push({ i, j });
        }
      }
    }

    const minRequired = Math.min(5, totalCells);
    const canComplete = correctCount >= minRequired;

    return {
      correctCount,
      incorrectCount,
      missingCount,
      totalCells,
      minRequired,
      canComplete,
      correctCells,
      incorrectCells,
      missingCells
    };
  }

  highlightMissingAndErrors(stats) {
    this.clearHighlights();

    stats.missingCells.forEach(({ i, j }) => {
      const cellElem = this.container.querySelector(`.matrix-cell[data-i="${i}"][data-j="${j}"]`);
      if (cellElem) {
        cellElem.classList.add('cell-missing-highlight');
      }
    });

    stats.incorrectCells.forEach(({ i, j }) => {
      const cellElem = this.container.querySelector(`.matrix-cell[data-i="${i}"][data-j="${j}"]`);
      if (cellElem) {
        cellElem.classList.remove('val-correct');
        cellElem.classList.add('val-incorrect');
      }
    });

    if (this.highlightTimer) clearTimeout(this.highlightTimer);
    this.highlightTimer = setTimeout(() => {
      this.clearHighlights();
    }, 6000);
  }

  clearHighlights() {
    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer);
      this.highlightTimer = null;
    }
    if (this.container) {
      this.container.querySelectorAll('.cell-missing-highlight').forEach(el => {
        el.classList.remove('cell-missing-highlight');
      });
    }
  }

  completeRemainingMatrix() {
    if (!this.data) return;
    const { matrix, dimensions } = this.data;
    const { rows, cols } = dimensions;

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const key = `${i},${j}`;
        this.userScores[key] = String(matrix[i][j].score);
        this.userArrows[key] = new Set(matrix[i][j].arrows);
      }
    }

    this.clearHighlights();
    this.clearValidationEffects();
    this.render();

    this.container.querySelectorAll('.interactive-cell').forEach(cell => {
      cell.classList.add('hint-pulse');
      setTimeout(() => cell.classList.remove('hint-pulse'), 1500);
    });

    this.selectCell(rows - 1, cols - 1);
  }

  render() {
    if (!this.data || !this.container) return;
    this.renderInteractiveMatrix();
    this.renderAnswerMatrix();
    this.renderAlignmentSummary();
  }

  /**
   * Builds the interactive Sudoku-like matrix for the student
   */
  renderInteractiveMatrix() {
    const { seq1, seq2, dimensions, matrix } = this.data;
    const { rows, cols } = dimensions;

    let html = `
      <div class="matrix-wrapper">
        <table class="dp-table" role="grid" aria-label="Dynamic Programming Alignment Matrix">
          <thead>
            <!-- Sequence 2 Header Row -->
            <tr class="header-seq-row">
              <th class="corner-header" colspan="2" rowspan="2">
                <div class="corner-label">
                  <span class="seq1-axis-label" title="Sequence 1 (Rows / Vertical)">Seq 1 ↓</span>
                  <span class="seq2-axis-label" title="Sequence 2 (Columns / Horizontal)">Seq 2 →</span>
                </div>
              </th>
              <th class="header-cell seq-char-header base-header" title="Initial Gap (-)">
                <span class="char-badge char-gap">-</span>
              </th>
    `;

    for (let j = 1; j < cols; j++) {
      const char = seq2[j - 1];
      html += `
        <th class="header-cell seq-char-header">
          ${createCharBadgeHTML(char)}
        </th>
      `;
    }
    html += `</tr><tr class="header-idx-row"><th class="header-idx">0</th>`;
    for (let j = 1; j < cols; j++) {
      html += `<th class="header-idx">${j}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let i = 0; i < rows; i++) {
      const char1 = i === 0 ? '-' : seq1[i - 1];
      html += `<tr>`;

      if (i === 0) {
        html += `
          <th class="header-cell seq-char-header base-header" title="Initial Gap (-)">
            <span class="char-badge char-gap">-</span>
          </th>
          <th class="header-idx">0</th>
        `;
      } else {
        html += `
          <th class="header-cell seq-char-header">
            ${createCharBadgeHTML(char1)}
          </th>
          <th class="header-idx">${i}</th>
        `;
      }

      for (let j = 0; j < cols; j++) {
        const isAuto = i === 0 || j === 0;
        const key = `${i},${j}`;
        const trueCell = matrix[i][j];

        if (isAuto) {
          const score = trueCell.score;
          const arrows = trueCell.arrows;
          html += `
            <td class="matrix-cell auto-cell" data-i="${i}" data-j="${j}">
              <div class="cell-content">
                <div class="cell-coords">(${i},${j})</div>
                <div class="auto-score">${score}</div>
                <div class="arrow-layer static-arrows">
                  ${this.renderArrowSVG(arrows)}
                </div>
              </div>
            </td>
          `;
        } else {
          const userVal = this.userScores[key] !== undefined ? this.userScores[key] : '';
          const userArrowSet = this.userArrows[key] || new Set();

          const hasDiag = userArrowSet.has(DIRECTION.DIAG);
          const hasUp = userArrowSet.has(DIRECTION.UP);
          const hasLeft = userArrowSet.has(DIRECTION.LEFT);

          html += `
            <td class="matrix-cell interactive-cell" data-i="${i}" data-j="${j}">
              <div class="cell-content">
                <div class="cell-coords">(${i},${j})</div>
                
                <!-- Directional Arrow Trigger & Display Layer -->
                <div class="arrow-interactive-container">
                  <!-- Diagonal Trigger Zone (Top-Left) -->
                  <div class="arrow-trigger-zone zone-diag ${hasDiag ? 'is-active' : ''}" 
                       data-dir="${DIRECTION.DIAG}" 
                       data-i="${i}" data-j="${j}" 
                       title="Diagonal arrow (NW) from (${i-1},${j-1})">
                    <svg class="arrow-svg arrow-diag" viewBox="0 0 24 24">
                      <path d="M6 6 L18 18 M6 6 L14 6 M6 6 L6 14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>

                  <!-- Up Trigger Zone (Top-Center) -->
                  <div class="arrow-trigger-zone zone-up ${hasUp ? 'is-active' : ''}" 
                       data-dir="${DIRECTION.UP}" 
                       data-i="${i}" data-j="${j}" 
                       title="Up arrow (N) from (${i-1},${j})">
                    <svg class="arrow-svg arrow-up" viewBox="0 0 24 24">
                      <path d="M12 5 L12 20 M12 5 L7 10 M12 5 L17 10" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>

                  <!-- Left Trigger Zone (Center-Left) -->
                  <div class="arrow-trigger-zone zone-left ${hasLeft ? 'is-active' : ''}" 
                       data-dir="${DIRECTION.LEFT}" 
                       data-i="${i}" data-j="${j}" 
                       title="Left arrow (W) from (${i},${j-1})">
                    <svg class="arrow-svg arrow-left" viewBox="0 0 24 24">
                      <path d="M5 12 L20 12 M5 12 L10 7 M5 12 L10 17" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- Sudoku-Style Numeric Input -->
                <input type="text" 
                       inputmode="numeric" 
                       class="cell-input" 
                       data-i="${i}" 
                       data-j="${j}" 
                       value="${userVal}" 
                       placeholder="?" 
                       autocomplete="off" 
                       spellcheck="false" />
              </div>
            </td>
          `;
        }
      }
      html += `</tr>`;
    }

    html += `</tbody></table></div>`;
    this.container.innerHTML = html;
    this.attachInteractiveListeners();
  }

  renderArrowSVG(arrows) {
    if (!arrows || arrows.length === 0) return '';
    let svg = '';
    if (arrows.includes(DIRECTION.DIAG)) {
      svg += `
        <svg class="arrow-svg arrow-diag static-arrow" viewBox="0 0 24 24" title="Diagonal">
          <path d="M6 6 L18 18 M6 6 L14 6 M6 6 L6 14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    if (arrows.includes(DIRECTION.UP)) {
      svg += `
        <svg class="arrow-svg arrow-up static-arrow" viewBox="0 0 24 24" title="Up">
          <path d="M12 5 L12 20 M12 5 L7 10 M12 5 L17 10" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    if (arrows.includes(DIRECTION.LEFT)) {
      svg += `
        <svg class="arrow-svg arrow-left static-arrow" viewBox="0 0 24 24" title="Left">
          <path d="M5 12 L20 12 M5 12 L10 7 M5 12 L10 17" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    return svg;
  }

  attachInteractiveListeners() {
    const inputs = this.container.querySelectorAll('.cell-input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.i, 10);
        const j = parseInt(e.target.dataset.j, 10);
        const cleanVal = e.target.value.replace(/[^0-9-]/g, '');
        e.target.value = cleanVal;
        this.userScores[`${i},${j}`] = cleanVal;
        this.onCellChange({ i, j, score: cleanVal });
        this.updateRoughWorkSidebar(i, j);
      });

      input.addEventListener('focus', (e) => {
        const i = parseInt(e.target.dataset.i, 10);
        const j = parseInt(e.target.dataset.j, 10);
        this.selectCell(i, j);
      });

      input.addEventListener('keydown', (e) => {
        this.handleInputKeydown(e);
      });
    });

    const zones = this.container.querySelectorAll('.arrow-trigger-zone');
    zones.forEach(zone => {
      zone.addEventListener('click', (e) => {
        e.stopPropagation();
        const dir = zone.dataset.dir;
        const i = parseInt(zone.dataset.i, 10);
        const j = parseInt(zone.dataset.j, 10);
        this.toggleArrow(i, j, dir);
      });
    });

    const cells = this.container.querySelectorAll('.matrix-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        const i = parseInt(cell.dataset.i, 10);
        const j = parseInt(cell.dataset.j, 10);

        if (this.eraserActive) {
          if (i >= 1 && j >= 1) {
            delete this.userScores[`${i},${j}`];
            if (this.userArrows[`${i},${j}`]) {
              this.userArrows[`${i},${j}`].clear();
            }
            if (this.roughWork[`${i},${j}`]) {
              delete this.roughWork[`${i},${j}`];
            }
            this.updateRoughWorkSidebar(i, j);
            this.render();
          }
          return;
        }

        this.selectCell(i, j);
        const input = cell.querySelector('.cell-input');
        if (input && document.activeElement !== input) {
          input.focus();
        }
      });
    });
  }

  /**
   * Updates the Left-hand Rough Work sidebar section when a cell is clicked/focused
   */
  updateRoughWorkSidebar(i, j) {
    if (i < 1 || j < 1 || !this.data) {
      this.resetRoughWorkUI();
      return;
    }

    this.activeRoughCell = { i, j };
    const { seq1, seq2 } = this.data;
    const char1 = seq1[i - 1] || '-';
    const char2 = seq2[j - 1] || '-';

    if (this.roughCellBadge) {
      this.roughCellBadge.textContent = `Cell (${i},${j}) : ${char1} vs ${char2}`;
    }

    const key = `${i},${j}`;
    const rough = this.roughWork[key] || { diag: '', up: '', left: '' };

    // Set values (or reset to empty if no cached entry)
    if (this.roughDiagInput) this.roughDiagInput.value = rough.diag || '';
    if (this.roughUpInput) this.roughUpInput.value = rough.up || '';
    if (this.roughLeftInput) this.roughLeftInput.value = rough.left || '';
  }

  handleInputKeydown(e) {
    const input = e.target;
    const i = parseInt(input.dataset.i, 10);
    const j = parseInt(input.dataset.j, 10);
    const { rows, cols } = this.data.dimensions;

    if (e.key === 'ArrowUp' && i > 1) {
      e.preventDefault();
      this.focusCell(i - 1, j);
    } else if (e.key === 'ArrowDown' && i < rows - 1) {
      e.preventDefault();
      this.focusCell(i + 1, j);
    } else if (e.key === 'ArrowLeft' && j > 1 && input.selectionStart === 0) {
      e.preventDefault();
      this.focusCell(i, j - 1);
    } else if (e.key === 'ArrowRight' && j < cols - 1 && input.selectionEnd === input.value.length) {
      e.preventDefault();
      this.focusCell(i, j + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (j < cols - 1) {
        this.focusCell(i, j + 1);
      } else if (i < rows - 1) {
        this.focusCell(i + 1, 1);
      }
    }
  }

  focusCell(i, j) {
    const target = this.container.querySelector(`.cell-input[data-i="${i}"][data-j="${j}"]`);
    if (target) {
      target.focus();
      target.select();
      this.selectCell(i, j);
    }
  }

  selectCell(i, j) {
    this.selectedCell = { i, j };
    this.container.querySelectorAll('.matrix-cell.selected-focus').forEach(el => {
      el.classList.remove('selected-focus');
    });

    const activeCell = this.container.querySelector(`.matrix-cell[data-i="${i}"][data-j="${j}"]`);
    if (activeCell) {
      activeCell.classList.add('selected-focus');
    }

    this.updateRoughWorkSidebar(i, j);
    this.onInspectCell({ i, j });
  }

  toggleArrow(i, j, dir) {
    const key = `${i},${j}`;
    if (!this.userArrows[key]) {
      this.userArrows[key] = new Set();
    }

    if (this.eraserActive) {
      // Eraser mode: remove clicked arrow direction
      this.userArrows[key].delete(dir);
    } else {
      // Toggle this specific direction (supports multiple simultaneous arrows for ties)
      if (this.userArrows[key].has(dir)) {
        this.userArrows[key].delete(dir);
      } else {
        this.userArrows[key].add(dir);
      }
    }

    const cellElem = this.container.querySelector(`.matrix-cell[data-i="${i}"][data-j="${j}"]`);
    if (cellElem) {
      cellElem.querySelectorAll('.arrow-trigger-zone').forEach(zone => {
        const zDir = zone.dataset.dir;
        if (this.userArrows[key].has(zDir)) {
          zone.classList.add('is-active');
        } else {
          zone.classList.remove('is-active');
        }
      });
    }
  }

  /**
   * Validates ALL cells manually filled by the user.
   * All filled correct cells light up green, all filled incorrect cells light up red.
   * Smoothly fades colors over 20 seconds.
   */
  checkAnswers() {
    if (!this.data) return null;
    this.clearValidationEffects();
    this.clearHighlights();

    const { matrix, dimensions } = this.data;
    const { rows, cols } = dimensions;

    let totalFilled = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let totalCells = (rows - 1) * (cols - 1);

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const key = `${i},${j}`;
        const userVal = this.userScores[key];
        const cellElem = this.container.querySelector(`.matrix-cell[data-i="${i}"][data-j="${j}"]`);
        
        if (!cellElem) continue;

        if (userVal !== undefined && String(userVal).trim() !== '') {
          totalFilled++;
          const isScoreCorrect = Number(userVal) === matrix[i][j].score;
          
          cellElem.classList.remove('val-correct', 'val-incorrect');
          void cellElem.offsetWidth; // Force CSS reflow

          if (isScoreCorrect) {
            correctCount++;
            cellElem.classList.add('val-correct');
          } else {
            incorrectCount++;
            cellElem.classList.add('val-incorrect');
          }
        }
      }
    }

    this.validationTimer = setTimeout(() => {
      this.clearValidationEffects();
    }, 20000);

    return {
      totalFilled,
      correctCount,
      incorrectCount,
      totalCells,
      isComplete: totalFilled === totalCells && incorrectCount === 0
    };
  }

  clearValidationEffects() {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer);
      this.validationTimer = null;
    }
    if (this.container) {
      this.container.querySelectorAll('.val-correct, .val-incorrect').forEach(el => {
        el.classList.remove('val-correct', 'val-incorrect');
      });
    }
  }

  /**
   * Renders the complete Ground-Truth Answer Matrix with Traceback path
   */
  renderAnswerMatrix() {
    if (!this.data || !this.answerContainer) return;
    const { seq1, seq2, dimensions, matrix, optimalPaths } = this.data;
    const { rows, cols } = dimensions;

    const currentPath = optimalPaths[this.activeTracebackPath] || [];
    const pathCoordsSet = new Set(currentPath.map(([i, j]) => `${i},${j}`));

    let html = `
      <div class="matrix-wrapper answer-matrix-wrapper">
        <table class="dp-table dp-answer-table">
          <thead>
            <tr class="header-seq-row">
              <th class="corner-header" colspan="2" rowspan="2">
                <div class="corner-label">
                  <span class="seq1-axis-label">Seq 1 ↓</span>
                  <span class="seq2-axis-label">Seq 2 →</span>
                </div>
              </th>
              <th class="header-cell seq-char-header base-header">
                <span class="char-badge char-gap">-</span>
              </th>
    `;

    for (let j = 1; j < cols; j++) {
      html += `
        <th class="header-cell seq-char-header">
          ${createCharBadgeHTML(seq2[j - 1])}
        </th>
      `;
    }
    html += `</tr><tr class="header-idx-row"><th class="header-idx">0</th>`;
    for (let j = 1; j < cols; j++) {
      html += `<th class="header-idx">${j}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let i = 0; i < rows; i++) {
      const char1 = i === 0 ? '-' : seq1[i - 1];
      html += `<tr>`;

      if (i === 0) {
        html += `
          <th class="header-cell seq-char-header base-header">
            <span class="char-badge char-gap">-</span>
          </th>
          <th class="header-idx">0</th>
        `;
      } else {
        html += `
          <th class="header-cell seq-char-header">
            ${createCharBadgeHTML(char1)}
          </th>
          <th class="header-idx">${i}</th>
        `;
      }

      for (let j = 0; j < cols; j++) {
        const cell = matrix[i][j];
        const isPath = pathCoordsSet.has(`${i},${j}`);

        html += `
          <td class="matrix-cell answer-cell ${isPath ? 'traceback-path-cell' : ''}" 
              data-i="${i}" data-j="${j}" 
              title="Click to inspect exact calculation for cell (${i},${j})">
            <div class="cell-content">
              <div class="cell-coords">(${i},${j})</div>
              <div class="answer-score">${cell.score}</div>
              <div class="arrow-layer static-arrows">
                ${this.renderArrowSVG(cell.arrows)}
              </div>
              ${isPath ? '<div class="traceback-dot" title="Optimal Traceback Step"></div>' : ''}
            </div>
          </td>
        `;
      }
      html += `</tr>`;
    }

    html += `</tbody></table></div>`;
    this.answerContainer.innerHTML = html;

    this.answerContainer.querySelectorAll('.answer-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const i = parseInt(cell.dataset.i, 10);
        const j = parseInt(cell.dataset.j, 10);
        this.inspectAnswerCell(i, j);
      });
    });
  }

  inspectAnswerCell(i, j) {
    this.selectedAnswerCell = { i, j };
    if (!this.answerContainer) return;

    this.answerContainer.querySelectorAll('.answer-cell').forEach(el => {
      el.classList.remove('selected-focus', 'diag-source', 'up-source', 'left-source');
    });

    const activeCell = this.answerContainer.querySelector(`.answer-cell[data-i="${i}"][data-j="${j}"]`);
    if (activeCell) {
      activeCell.classList.add('selected-focus');
    }

    if (i >= 1 && j >= 1) {
      const diagCell = this.answerContainer.querySelector(`.answer-cell[data-i="${i-1}"][data-j="${j-1}"]`);
      const upCell = this.answerContainer.querySelector(`.answer-cell[data-i="${i-1}"][data-j="${j}"]`);
      const leftCell = this.answerContainer.querySelector(`.answer-cell[data-i="${i}"][data-j="${j-1}"]`);

      if (diagCell) diagCell.classList.add('diag-source');
      if (upCell) upCell.classList.add('up-source');
      if (leftCell) leftCell.classList.add('left-source');
    }

    if (this.inspectorContainer) {
      this.renderCalculationCardInto(i, j, this.inspectorContainer);
    }
  }

  renderAlignmentSummary() {
    if (!this.data || !this.alignmentContainer) return;
    const { alignments, params, isLocal, maxScore } = this.data;

    if (!alignments || alignments.length === 0) {
      this.alignmentContainer.innerHTML = `<div class="empty-state">No alignment available for current inputs.</div>`;
      return;
    }

    const currentAlign = alignments[this.activeTracebackPath] || alignments[0];
    const totalPaths = alignments.length;

    let pathSelectorHTML = '';
    if (totalPaths > 1) {
      pathSelectorHTML = `
        <div class="path-switcher">
          <span class="path-label"><strong>Optimal Traceback Paths (${totalPaths} ties found):</strong></span>
          <div class="btn-group-paths">
            ${alignments.map((a, idx) => `
              <button class="btn btn-path ${idx === this.activeTracebackPath ? 'btn-path-active' : ''}" data-path-idx="${idx}">
                Path #${idx + 1}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    let html = `
      <div class="alignment-card">
        <div class="alignment-card-header">
          <div class="alignment-meta">
            <span class="meta-tag tag-algo">${isLocal ? 'Smith-Waterman (Local)' : 'Needleman-Wunsch (Global)'}</span>
            <span class="meta-tag tag-score">Optimal Score: <strong>${maxScore}</strong></span>
            <span class="meta-tag tag-identity">Identity: <strong>${currentAlign.identityPct}%</strong></span>
          </div>
          ${pathSelectorHTML}
        </div>

        <div class="alignment-pre-container">
          <div class="alignment-row">
            <span class="align-seq-label">Seq 1:</span>
            <div class="align-seq-chars">
              ${currentAlign.seq1Aligned.split('').map(c => createCharBadgeHTML(c, 'align-char-badge')).join('')}
            </div>
          </div>
          <div class="alignment-row match-bar-row">
            <span class="align-seq-label"></span>
            <div class="align-match-chars">
              ${currentAlign.matchLine.split('').map(c => `<span class="match-bar-char">${c}</span>`).join('')}
            </div>
          </div>
          <div class="alignment-row">
            <span class="align-seq-label">Seq 2:</span>
            <div class="align-seq-chars">
              ${currentAlign.seq2Aligned.split('').map(c => createCharBadgeHTML(c, 'align-char-badge')).join('')}
            </div>
          </div>
        </div>

        <div class="align-stats-grid">
          <div class="stat-box">
            <div class="stat-val stat-match">${currentAlign.matches}</div>
            <div class="stat-label">Matches</div>
          </div>
          <div class="stat-box">
            <div class="stat-val stat-mismatch">${currentAlign.mismatches}</div>
            <div class="stat-label">Mismatches</div>
          </div>
          <div class="stat-box">
            <div class="stat-val stat-gap">${currentAlign.gaps}</div>
            <div class="stat-label">Gaps</div>
          </div>
          <div class="stat-box">
            <div class="stat-val stat-len">${currentAlign.length}</div>
            <div class="stat-label">Aligned Length</div>
          </div>
        </div>
      </div>
    `;

    this.alignmentContainer.innerHTML = html;

    this.alignmentContainer.querySelectorAll('.btn-path').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.pathIdx, 10);
        this.activeTracebackPath = idx;
        this.renderAnswerMatrix();
        this.renderAlignmentSummary();
      });
    });
  }

  /**
   * Helper to render calculation breakdown card into any target container (inspector or hint section)
   */
  renderCalculationCardInto(i, j, container) {
    if (!this.data || !container) return;
    const { matrix, isLocal } = this.data;
    const cell = matrix[i][j];
    const details = cell.stepDetails;

    if (!details) {
      container.innerHTML = `<div class="inspector-placeholder">Click a cell to see its detailed derivation.</div>`;
      return;
    }

    if (details.type === 'origin') {
      container.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-header">
            <span class="inspector-coords">Cell (${i},${j}) - Origin</span>
            <span class="inspector-score">Score: 0</span>
          </div>
          <p class="inspector-note">Base origin condition initialized to 0.</p>
        </div>
      `;
      return;
    }

    if (details.type === 'boundary') {
      container.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-header">
            <span class="inspector-coords">Cell (${i},${j}) - Boundary Header</span>
            <span class="inspector-score">Score: ${cell.score}</span>
          </div>
          <p class="inspector-note">${details.explanation}</p>
        </div>
      `;
      return;
    }

    const {
      char1,
      char2,
      isMatch,
      substScore,
      prevDiagScore,
      prevUpScore,
      prevLeftScore,
      diagScore,
      upScore,
      leftScore,
      gapPenalty,
      maxScore,
      winningDirections
    } = details;

    const isDiagWinner = winningDirections.includes(DIRECTION.DIAG);
    const isUpWinner = winningDirections.includes(DIRECTION.UP);
    const isLeftWinner = winningDirections.includes(DIRECTION.LEFT);
    const isZeroWinner = isLocal && maxScore === 0 && winningDirections.length === 0;

    let html = `
      <div class="inspector-card">
        <div class="inspector-header">
          <div class="inspector-title">
            <span class="inspector-coords">Cell (${i},${j})</span>
            <span class="inspector-chars">
              Seq1[${i}]: ${createCharBadgeHTML(char1)} vs Seq2[${j}]: ${createCharBadgeHTML(char2)}
              <span class="char-match-status ${isMatch ? 'match-true' : 'match-false'}">
                (${isMatch ? `Match +${substScore}` : `Mismatch ${substScore}`})
              </span>
            </span>
          </div>
          <div class="inspector-score-pill">
            Calculated Score: <strong>${maxScore}</strong>
          </div>
        </div>

        <div class="formula-grid">
          <div class="formula-card formula-diag ${isDiagWinner ? 'winner-card' : ''}">
            <div class="formula-card-header">
              <span class="formula-dir">↖ Diagonal (Match / Mismatch)</span>
              ${isDiagWinner ? '<span class="winner-badge">★ Max Chosen</span>' : ''}
            </div>
            <div class="formula-math">
              <code>H(${i-1},${j-1}) + ${isMatch ? 'Match' : 'Mismatch'}</code>
              <div class="math-eval">
                = ${prevDiagScore} + (${substScore}) = <strong>${diagScore}</strong>
              </div>
            </div>
          </div>

          <div class="formula-card formula-up ${isUpWinner ? 'winner-card' : ''}">
            <div class="formula-card-header">
              <span class="formula-dir">↑ Up (Gap in Seq 2 / Insertion)</span>
              ${isUpWinner ? '<span class="winner-badge">★ Max Chosen</span>' : ''}
            </div>
            <div class="formula-math">
              <code>H(${i-1},${j}) + Gap</code>
              <div class="math-eval">
                = ${prevUpScore} + (${gapPenalty}) = <strong>${upScore}</strong>
              </div>
            </div>
          </div>

          <div class="formula-card formula-left ${isLeftWinner ? 'winner-card' : ''}">
            <div class="formula-card-header">
              <span class="formula-dir">← Left (Gap in Seq 1 / Deletion)</span>
              ${isLeftWinner ? '<span class="winner-badge">★ Max Chosen</span>' : ''}
            </div>
            <div class="formula-math">
              <code>H(${i},${j-1}) + Gap</code>
              <div class="math-eval">
                = ${prevLeftScore} + (${gapPenalty}) = <strong>${leftScore}</strong>
              </div>
            </div>
          </div>

          ${isLocal ? `
            <div class="formula-card formula-zero ${isZeroWinner ? 'winner-card' : ''}">
              <div class="formula-card-header">
                <span class="formula-dir">0 Zero Floor (Smith-Waterman)</span>
                ${isZeroWinner ? '<span class="winner-badge">★ Max Chosen (Reset)</span>' : ''}
              </div>
              <div class="formula-math">
                <code>Reset if negative</code>
                <div class="math-eval">= <strong>0</strong></div>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="inspector-summary-bar">
          <strong>Recurrence Formula:</strong>
          <code>H(${i},${j}) = max(${isLocal ? '0, ' : ''}${diagScore}, ${upScore}, ${leftScore}) = <span class="calc-highlight">${maxScore}</span></code>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}
