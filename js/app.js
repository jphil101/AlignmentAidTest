/**
 * Main Application Controller for Bioinformatics Dynamic Programming Aid
 */

import { computeAlignmentMatrix, ALGORITHM } from './algorithms.js';
import { PRESETS } from './presets.js';
import { MatrixView } from './matrix-view.js';
import { createCharBadgeHTML } from './color-map.js';

class DynamicProgrammingApp {
  constructor() {
    this.currentAlgorithm = ALGORITHM.NEEDLEMAN_WUNSCH;
    this.seq1 = 'GCATGCG';
    this.seq2 = 'GATTACA';
    this.matchScore = 1;
    this.mismatchScore = -1;
    this.gapPenalty = -1;
    this.isEraserActive = false;
    this.isAnswerVisible = false;
    this.zoomLevel = 1.0;

    this.initDOMReferences();
    this.initMatrixView();
    this.populatePresets();
    this.attachEventListeners();
    this.updateApp();
  }

  initDOMReferences() {
    // Inputs & Toggles
    this.algoNwRadio = document.getElementById('algo-nw');
    this.algoSwRadio = document.getElementById('algo-sw');
    this.seq1Input = document.getElementById('seq1-input');
    this.seq2Input = document.getElementById('seq2-input');
    this.matchInput = document.getElementById('match-input');
    this.mismatchInput = document.getElementById('mismatch-input');
    this.gapInput = document.getElementById('gap-input');
    this.presetSelect = document.getElementById('preset-select');
    this.swapSeqsBtn = document.getElementById('btn-swap-seqs');

    // UI Badges & Previews
    this.seq1BadgePreview = document.getElementById('seq1-badge-preview');
    this.seq2BadgePreview = document.getElementById('seq2-badge-preview');
    this.algoDescription = document.getElementById('algo-description-text');
    this.algoTitle = document.getElementById('algo-title-badge');

    // Action Controls
    this.btnCheckAnswers = document.getElementById('btn-check-answers');
    this.btnCompleteMatrix = document.getElementById('btn-complete-matrix');
    this.btnEraser = document.getElementById('btn-eraser');
    this.btnHint = document.getElementById('btn-hint');
    this.btnToggleAnswer = document.getElementById('btn-toggle-answer');
    this.btnResetScores = document.getElementById('btn-reset-scores');
    this.btnResetArrows = document.getElementById('btn-reset-arrows');
    this.btnResetAll = document.getElementById('btn-reset-all');
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.btnZoomReset = document.getElementById('btn-zoom-reset');
    this.btnExportReport = document.getElementById('btn-export-report');
    this.toastNotification = document.getElementById('toast-notification');

    // Modal elements
    this.modalOverlay = document.getElementById('confirm-modal-overlay');
    this.modalMessage = document.getElementById('modal-message');
    this.btnModalCancel = document.getElementById('btn-modal-cancel');
    this.btnModalConfirm = document.getElementById('btn-modal-confirm');

    // Containers
    this.interactiveMatrixContainer = document.getElementById('interactive-matrix-container');
    this.answerMatrixContainer = document.getElementById('answer-matrix-container');
    this.inspectorContainer = document.getElementById('cell-inspector-container');
    this.alignmentContainer = document.getElementById('alignment-summary-container');
    this.answerSection = document.getElementById('answer-solution-section');
  }

  initMatrixView() {
    this.matrixView = new MatrixView({
      container: this.interactiveMatrixContainer,
      answerContainer: this.answerMatrixContainer,
      inspectorContainer: this.inspectorContainer,
      alignmentContainer: this.alignmentContainer,
      onCellChange: (info) => {
        // User changed a cell
      },
      onInspectCell: (info) => {
        // Inspected cell
      }
    });
  }

  populatePresets() {
    if (!this.presetSelect) return;
    this.presetSelect.innerHTML = '<option value="">-- Choose a Preset Example --</option>';
    PRESETS.forEach(preset => {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = `${preset.name}`;
      this.presetSelect.appendChild(opt);
    });
  }

  attachEventListeners() {
    // Algorithm Switcher
    if (this.algoNwRadio) {
      this.algoNwRadio.addEventListener('change', () => {
        if (this.algoNwRadio.checked) {
          this.setAlgorithm(ALGORITHM.NEEDLEMAN_WUNSCH);
        }
      });
    }
    if (this.algoSwRadio) {
      this.algoSwRadio.addEventListener('change', () => {
        if (this.algoSwRadio.checked) {
          this.setAlgorithm(ALGORITHM.SMITH_WATERMAN);
        }
      });
    }

    // Sequence Inputs
    const onSeqChange = () => {
      this.seq1 = (this.seq1Input.value || '').toUpperCase().trim();
      this.seq2 = (this.seq2Input.value || '').toUpperCase().trim();
      this.updateSequencePreviews();
      this.updateApp();
    };

    if (this.seq1Input) this.seq1Input.addEventListener('input', onSeqChange);
    if (this.seq2Input) this.seq2Input.addEventListener('input', onSeqChange);

    // Swap Sequences
    if (this.swapSeqsBtn) {
      this.swapSeqsBtn.addEventListener('click', () => {
        const temp = this.seq1Input.value;
        this.seq1Input.value = this.seq2Input.value;
        this.seq2Input.value = temp;
        onSeqChange();
        this.showToast('Swapped Sequence 1 and Sequence 2');
      });
    }

    // Scoring Parameters
    const onScoreParamChange = () => {
      this.matchScore = Number(this.matchInput.value) || 0;
      this.mismatchScore = Number(this.mismatchInput.value) || 0;
      this.gapPenalty = Number(this.gapInput.value) || 0;
      this.updateApp();
    };

    if (this.matchInput) this.matchInput.addEventListener('input', onScoreParamChange);
    if (this.mismatchInput) this.mismatchInput.addEventListener('input', onScoreParamChange);
    if (this.gapInput) this.gapInput.addEventListener('input', onScoreParamChange);

    // Presets
    if (this.presetSelect) {
      this.presetSelect.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        if (!selectedId) return;
        const preset = PRESETS.find(p => p.id === selectedId);
        if (preset) {
          this.loadPreset(preset);
        }
      });
    }

    // Action Buttons
    if (this.btnCheckAnswers) {
      this.btnCheckAnswers.addEventListener('click', () => this.handleCheckAnswers());
    }

    // Complete this Button
    if (this.btnCompleteMatrix) {
      this.btnCompleteMatrix.addEventListener('click', () => this.handleCompleteThis());
    }

    // Confirmation Modal Actions
    if (this.btnModalCancel) {
      this.btnModalCancel.addEventListener('click', () => this.closeConfirmModal());
    }

    if (this.btnModalConfirm) {
      this.btnModalConfirm.addEventListener('click', () => {
        this.closeConfirmModal();
        this.matrixView.completeRemainingMatrix();
        this.showToast('🎉 Matrix completed with accurate scores and arrows!', 'success');
      });
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeConfirmModal();
        }
      });
    }

    if (this.btnEraser) {
      this.btnEraser.addEventListener('click', () => this.toggleEraserMode());
    }

    if (this.btnHint) {
      this.btnHint.addEventListener('click', () => this.handleGiveHint());
    }

    if (this.btnToggleAnswer) {
      this.btnToggleAnswer.addEventListener('click', () => this.toggleAnswerSection());
    }

    if (this.btnResetScores) {
      this.btnResetScores.addEventListener('click', () => {
        this.matrixView.clearUserScores();
        this.showToast('Cleared your entered scores.');
      });
    }

    if (this.btnResetArrows) {
      this.btnResetArrows.addEventListener('click', () => {
        this.matrixView.clearUserArrows();
        this.showToast('Cleared your custom arrows.');
      });
    }

    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => {
        this.matrixView.resetAll();
        this.showToast('Reset the entire interactive matrix.');
      });
    }

    // Zoom Controls
    if (this.btnZoomIn) this.btnZoomIn.addEventListener('click', () => this.adjustZoom(0.1));
    if (this.btnZoomOut) this.btnZoomOut.addEventListener('click', () => this.adjustZoom(-0.1));
    if (this.btnZoomReset) this.btnZoomReset.addEventListener('click', () => this.setZoom(1.0));

    // Export Report
    if (this.btnExportReport) {
      this.btnExportReport.addEventListener('click', () => this.exportAlignmentReport());
    }
  }

  setAlgorithm(algo) {
    this.currentAlgorithm = algo;
    if (algo === ALGORITHM.NEEDLEMAN_WUNSCH) {
      if (this.algoNwRadio) this.algoNwRadio.checked = true;
      if (this.algoTitle) this.algoTitle.textContent = 'Needleman-Wunsch (Global Alignment)';
      if (this.algoDescription) {
        this.algoDescription.innerHTML = `
          <strong>Global Alignment:</strong> Aligns sequences end-to-end from start to finish. 
          Row 0 and Column 0 are initialized with cumulative gap penalties (e.g. 0, -1, -2...). 
          Scores can be negative. Traceback starts at the bottom-right corner <code>(M, N)</code> and travels to <code>(0,0)</code>.
        `;
      }
    } else {
      if (this.algoSwRadio) this.algoSwRadio.checked = true;
      if (this.algoTitle) this.algoTitle.textContent = 'Smith-Waterman (Local Alignment)';
      if (this.algoDescription) {
        this.algoDescription.innerHTML = `
          <strong>Local Alignment:</strong> Identifies high-scoring conserved regions and motifs. 
          Row 0 and Column 0 are initialized to 0. Cell scores are bounded below by 0 (no negative values). 
          Traceback begins at the <em>maximum score in the entire matrix</em> and stops when reaching a score of 0.
        `;
      }
    }
    this.updateApp();
    this.showToast(`Switched mode to ${algo === ALGORITHM.NEEDLEMAN_WUNSCH ? 'Needleman-Wunsch (Global)' : 'Smith-Waterman (Local)'}`);
  }

  loadPreset(preset) {
    this.currentAlgorithm = preset.algorithm;
    if (preset.algorithm === ALGORITHM.NEEDLEMAN_WUNSCH) {
      if (this.algoNwRadio) this.algoNwRadio.checked = true;
    } else {
      if (this.algoSwRadio) this.algoSwRadio.checked = true;
    }

    this.seq1Input.value = preset.seq1;
    this.seq2Input.value = preset.seq2;
    this.matchInput.value = preset.match;
    this.mismatchInput.value = preset.mismatch;
    this.gapInput.value = preset.gap;

    this.seq1 = preset.seq1;
    this.seq2 = preset.seq2;
    this.matchScore = preset.match;
    this.mismatchScore = preset.mismatch;
    this.gapPenalty = preset.gap;

    this.setAlgorithm(preset.algorithm);
    this.matrixView.resetAll();
    this.updateSequencePreviews();
    this.showToast(`Loaded preset: ${preset.name}`);
  }

  updateSequencePreviews() {
    if (this.seq1BadgePreview) {
      this.seq1BadgePreview.innerHTML = this.seq1.split('').map(c => createCharBadgeHTML(c, 'header-badge-preview')).join('');
    }
    if (this.seq2BadgePreview) {
      this.seq2BadgePreview.innerHTML = this.seq2.split('').map(c => createCharBadgeHTML(c, 'header-badge-preview')).join('');
    }
  }

  updateApp() {
    if (!this.seq1 || !this.seq2) return;

    // Calculate full ground truth solution
    this.truthData = computeAlignmentMatrix(this.seq1, this.seq2, {
      match: this.matchScore,
      mismatch: this.mismatchScore,
      gap: this.gapPenalty,
      algorithm: this.currentAlgorithm
    });

    this.matrixView.setData(this.truthData);
    this.updateSequencePreviews();
  }

  handleCheckAnswers() {
    const result = this.matrixView.checkAnswers();
    if (!result) return;

    if (result.totalFilled === 0) {
      this.showToast('No scores have been entered yet! Type numbers into the matrix cells first.', 'warning');
      return;
    }

    const pct = ((result.correctCount / result.totalFilled) * 100).toFixed(0);
    const msg = `Checked all ${result.totalFilled} filled cells: ${result.correctCount} correct (${pct}%), ${result.incorrectCount} incorrect. Feedback will fade over 20s.`;

    if (result.isComplete) {
      this.showToast(`🎉 Outstanding! All ${result.totalCells} cells are 100% correct!`, 'success');
    } else if (result.incorrectCount === 0) {
      this.showToast(`✨ Great job! All ${result.correctCount} filled cells are correct! (${result.totalFilled}/${result.totalCells} completed)`, 'success');
    } else {
      this.showToast(msg, 'error');
    }
  }

  handleCompleteThis() {
    const stats = this.matrixView.getManualStats();
    if (!stats) return;

    if (!stats.canComplete) {
      // Highlight missing and errors
      this.matrixView.highlightMissingAndErrors(stats);
      this.showToast(`⚠️ Minimum criteria for auto-fill is ${stats.minRequired} correct manual fills (You currently have ${stats.correctCount}/${stats.minRequired}). Missing cells and errors are highlighted.`, 'warning');
      return;
    }

    // If >= minRequired correct, open confirmation modal
    this.openConfirmModal(stats);
  }

  openConfirmModal(stats) {
    if (!this.modalOverlay) return;
    if (this.modalMessage) {
      this.modalMessage.innerHTML = `
        You have manually solved <strong>${stats.correctCount}</strong> cells correctly! (Remaining: ${stats.missingCount + stats.incorrectCount} cells).<br/><br/>
        Would you like to automatically complete the remaining matrix with accurate scores and arrows?
      `;
    }
    this.modalOverlay.classList.remove('hidden');
  }

  closeConfirmModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('hidden');
    }
  }

  toggleEraserMode() {
    this.isEraserActive = !this.isEraserActive;
    this.matrixView.setEraserMode(this.isEraserActive);

    if (this.btnEraser) {
      if (this.isEraserActive) {
        this.btnEraser.classList.add('btn-eraser-active');
        this.btnEraser.innerHTML = `<span>🧹</span> Eraser Active (Click arrow/cell)`;
        this.showToast('Eraser Tool Active: Click any arrow to erase it, or click a cell to clear it.', 'info');
      } else {
        this.btnEraser.classList.remove('btn-eraser-active');
        this.btnEraser.innerHTML = `<span>🧹</span> Eraser`;
        this.showToast('Eraser Tool Deactivated.');
      }
    }
  }

  handleGiveHint() {
    const hint = this.matrixView.autoFillHint();
    if (hint) {
      this.showToast(`Filled Hint for Cell (${hint.i}, ${hint.j}) = ${hint.score}. Derivation loaded in inspector!`, 'info');
    } else {
      this.showToast('All cells in the matrix are already correctly filled!', 'success');
    }
  }

  toggleAnswerSection() {
    this.isAnswerVisible = !this.isAnswerVisible;
    if (this.answerSection) {
      if (this.isAnswerVisible) {
        this.answerSection.classList.remove('hidden');
        if (this.btnToggleAnswer) {
          this.btnToggleAnswer.innerHTML = `<span>👁️</span> Hide Full Solution`;
          this.btnToggleAnswer.classList.add('btn-active');
        }
        this.answerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        this.answerSection.classList.add('hidden');
        if (this.btnToggleAnswer) {
          this.btnToggleAnswer.innerHTML = `<span>👁️</span> Show Full Solution`;
          this.btnToggleAnswer.classList.remove('btn-active');
        }
      }
    }
  }

  adjustZoom(delta) {
    this.setZoom(Math.max(0.6, Math.min(1.8, this.zoomLevel + delta)));
  }

  setZoom(val) {
    this.zoomLevel = Number(val.toFixed(1));
    const wrappers = document.querySelectorAll('.matrix-wrapper');
    wrappers.forEach(w => {
      w.style.transform = `scale(${this.zoomLevel})`;
      w.style.transformOrigin = 'top left';
    });
    const zoomText = document.getElementById('zoom-display-value');
    if (zoomText) {
      zoomText.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  exportAlignmentReport() {
    if (!this.truthData) return;
    const { seq1, seq2, params, alignments, maxScore, dimensions } = this.truthData;
    const align = alignments[0] || {};

    const report = [
      `=============================================================`,
      `  BIOINFORMATICS DYNAMIC PROGRAMMING ALIGNMENT REPORT`,
      `=============================================================`,
      `Algorithm:       ${params.algorithm === ALGORITHM.NEEDLEMAN_WUNSCH ? 'Needleman-Wunsch (Global)' : 'Smith-Waterman (Local)'}`,
      `Sequence 1:      ${seq1} (Length: ${seq1.length})`,
      `Sequence 2:      ${seq2} (Length: ${seq2.length})`,
      `Scoring Rules:   Match: +${params.match} | Mismatch: ${params.mismatch} | Gap: ${params.gap}`,
      `Matrix Size:     ${dimensions.rows} × ${dimensions.cols}`,
      `Optimal Score:   ${maxScore}`,
      `Alignment Identity: ${align.identityPct}%`,
      `-------------------------------------------------------------`,
      `OPTIMAL ALIGNMENT:`,
      `  Seq1:  ${align.seq1Aligned}`,
      `         ${align.matchLine}`,
      `  Seq2:  ${align.seq2Aligned}`,
      `-------------------------------------------------------------`,
      `Statistics:`,
      `  Matches:       ${align.matches}`,
      `  Mismatches:    ${align.mismatches}`,
      `  Gaps:          ${align.gaps}`,
      `  Aligned Len:   ${align.length}`,
      `=============================================================`
    ].join('\n');

    navigator.clipboard.writeText(report).then(() => {
      this.showToast('Copied full alignment report to clipboard!', 'success');
    }).catch(() => {
      console.log(report);
      this.showToast('Alignment report logged to browser console.', 'info');
    });
  }

  showToast(message, type = 'info') {
    if (!this.toastNotification) return;
    this.toastNotification.textContent = message;
    this.toastNotification.className = `toast-notification toast-${type} toast-show`;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastNotification.className = 'toast-notification';
    }, 4500);
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.dpApp = new DynamicProgrammingApp();
});
