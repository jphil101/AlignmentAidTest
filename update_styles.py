with open('styles.css', 'r') as f:
    css = f.read()

new_styles = """
/* ==========================================================================
   Complete This Button & Highlights
   ========================================================================== */
.btn-complete-tool {
  background: #7c3aed;
  color: #ffffff;
  border-color: #6d28d9;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
}

.btn-complete-tool:hover {
  background: #6d28d9;
  border-color: #5b21b6;
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
}

/* Missing Cell Highlight when < 5 correct fills */
.cell-missing-highlight {
  border: 2px dashed #f59e0b !important;
  background-color: rgba(245, 158, 11, 0.15) !important;
  animation: missingPulseAnim 1.4s ease-in-out infinite;
}

@keyframes missingPulseAnim {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
  }
}

/* ==========================================================================
   Floating Rough Work Pop-up (Scratchpad)
   ========================================================================== */
.rough-work-popover {
  position: fixed;
  z-index: 1000;
  width: 220px;
  background: #ffffff;
  border: 1.5px solid #3b82f6;
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 6px 12px -2px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: var(--font-sans);
  animation: popoverFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  transition: top 0.15s ease, left 0.15s ease;
}

@keyframes popoverFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.rough-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.4rem;
}

.rough-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e40af;
}

.rough-coords {
  font-family: var(--font-mono);
  color: #2563eb;
}

.rough-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0 0.25rem;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s;
}

.rough-close-btn:hover {
  color: #ef4444;
}

.rough-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.rough-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.rough-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  width: 58px;
  color: #475569;
  user-select: none;
}

.rough-label-diag { color: #8b5cf6; }
.rough-label-up { color: #0284c7; }
.rough-label-left { color: #059669; }

.rough-input {
  flex: 1;
  padding: 0.25rem 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: #f8fafc;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.15s;
}

.rough-input:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.rough-footer {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.35rem;
}

.rough-hint {
  font-size: 0.68rem;
  color: #94a3b8;
  display: block;
  text-align: center;
}

/* ==========================================================================
   Confirmation Modal
   ========================================================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  animation: modalOverlayFadeIn 0.2s ease;
}

@keyframes modalOverlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  max-width: 460px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: modalCardPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--border-subtle);
}

@keyframes modalCardPop {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon-badge {
  width: 36px;
  height: 36px;
  background: #ede9fe;
  color: #7c3aed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.modal-body {
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.55;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-modal-yes {
  background: #7c3aed !important;
  border-color: #6d28d9 !important;
}

.btn-modal-yes:hover {
  background: #6d28d9 !important;
}
"""

css += new_styles

with open('styles.css', 'w') as f:
    f.write(css)

print("styles.css updated with new styles!")
