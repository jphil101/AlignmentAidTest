with open('styles.css', 'r') as f:
    css = f.read()

sidebar_styles = """
/* ==========================================================================
   Practice Board Layout: Left Rough Work Sidebar + Right Matrix Viewport
   ========================================================================== */
.practice-board-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 960px) {
  .practice-board-layout {
    grid-template-columns: 1fr;
  }
}

/* Rough Work Sidebar Card */
.rough-work-sidebar {
  display: flex;
  flex-direction: column;
}

.rough-work-card {
  background: var(--bg-card);
  border: 1.5px solid #3b82f6;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  position: sticky;
  top: 80px;
}

.rough-work-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.6rem;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.rough-work-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1e40af;
}

.rough-cell-badge {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-family: var(--font-mono);
  font-weight: 700;
}

.rough-work-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.rough-inputs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rough-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rough-field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
}

.rough-sublabel {
  font-size: 0.68rem;
  font-family: var(--font-sans);
  color: #94a3b8;
  font-weight: 500;
}

.rough-sidebar-input {
  width: 100%;
  padding: 0.45rem 0.65rem;
  font-size: 0.88rem;
  background: #f8fafc;
  border-radius: 6px;
}

.rough-sidebar-input:focus {
  background: #ffffff;
}

.rough-sidebar-footer {
  margin-top: 0.25rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.65rem;
}

/* ==========================================================================
   Hint Step-by-Step Inspector Card
   ========================================================================== */
.hint-inspector-section {
  animation: fadeIn 0.25s ease-out;
}

.hint-card {
  border: 1.5px solid #f59e0b;
  background: #fffbeb;
}
"""

css += sidebar_styles

with open('styles.css', 'w') as f:
    f.write(css)

print("styles.css updated with sidebar styles!")
