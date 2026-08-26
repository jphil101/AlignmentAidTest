with open('index.html', 'r') as f:
    html = f.read()

# Remove the old rough-work-popover if present
import re
html = re.sub(r'<!-- =+\s+Floating Rough Work Scratchpad Pop-up[\s\S]+?</div>\s+</div>', '', html)

# Replace the interactive matrix section with the two-column layout (Rough Work sidebar on left + Matrix on right) + Hint Inspector
old_matrix_section = """    <!-- ========================================================================
         Interactive Sudoku-Style DP Practice Matrix
         ======================================================================== -->
    <section class="matrix-section-card" aria-label="Interactive Score Filling Board">
      <div class="matrix-section-header">
        <div class="matrix-section-title">
          <span>✍️ Interactive Practice Board</span>
        </div>
        <div class="matrix-instructions-hint">
          <strong>How to play:</strong> Type numbers into cells (Arrow keys / Tab to navigate). 
          <strong>Hover near top-left, top, or left cell edge to reveal shadow arrows</strong> — click shadow to fix arrow. 
          Use <strong>🧹 Eraser</strong> to remove arrows.
        </div>
      </div>

      <!-- Matrix Scroll Viewport -->
      <div class="matrix-viewport">
        <div id="interactive-matrix-container">
          <!-- Rendered dynamically by MatrixView -->
        </div>
      </div>
    </section>"""

new_matrix_section = """    <!-- ========================================================================
         Interactive Practice Board & Rough Work Sidebar Layout
         ======================================================================== -->
    <div class="practice-board-layout">
      
      <!-- Left Column: Rough Work Section -->
      <aside class="rough-work-sidebar" aria-label="Rough Work Scratchpad">
        <div class="rough-work-card">
          <div class="rough-work-header">
            <div class="rough-work-title">
              <span class="rough-work-icon">📝</span>
              <span>Rough Work</span>
            </div>
            <span class="rough-cell-badge" id="rough-active-cell-badge">Select a cell</span>
          </div>

          <p class="rough-work-desc">
            Enter your intermediate calculations here for the selected cell. Notes are cached per cell.
          </p>

          <div class="rough-inputs-list">
            <!-- 1. Diagonal Candidate -->
            <div class="rough-field-group">
              <label class="rough-field-label rough-label-diag" for="sidebar-rough-diag">
                <span>↖ Diagonal:</span>
                <span class="rough-sublabel">NW + Match/Mismatch</span>
              </label>
              <input type="text" id="sidebar-rough-diag" class="form-input rough-sidebar-input" placeholder="e.g. 2 + 1 = 3" spellcheck="false" autocomplete="off" />
            </div>

            <!-- 2. Up Candidate -->
            <div class="rough-field-group">
              <label class="rough-field-label rough-label-up" for="sidebar-rough-up">
                <span>↑ Up:</span>
                <span class="rough-sublabel">North + Gap</span>
              </label>
              <input type="text" id="sidebar-rough-up" class="form-input rough-sidebar-input" placeholder="e.g. 0 - 2 = -2" spellcheck="false" autocomplete="off" />
            </div>

            <!-- 3. Left Candidate -->
            <div class="rough-field-group">
              <label class="rough-field-label rough-label-left" for="sidebar-rough-left">
                <span>← Left:</span>
                <span class="rough-sublabel">West + Gap</span>
              </label>
              <input type="text" id="sidebar-rough-left" class="form-input rough-sidebar-input" placeholder="e.g. -2 - 2 = -4" spellcheck="false" autocomplete="off" />
            </div>
          </div>

          <div class="rough-sidebar-footer">
            <button type="button" id="btn-clear-rough" class="btn btn-secondary btn-sm" style="width: 100%;">Clear This Cell's Notes</button>
          </div>
        </div>
      </aside>

      <!-- Right Column: Interactive Practice Matrix -->
      <div class="practice-matrix-column">
        <section class="matrix-section-card" aria-label="Interactive Score Filling Board">
          <div class="matrix-section-header">
            <div class="matrix-section-title">
              <span>✍️ Interactive Practice Board</span>
            </div>
            <div class="matrix-instructions-hint">
              <strong>How to play:</strong> Click a cell to open its <strong>Rough Work</strong> on the left. Type numbers into cells. 
              <strong>Hover near cell edges to place arrows</strong>. Use <strong>🧹 Eraser</strong> to remove.
            </div>
          </div>

          <!-- Matrix Scroll Viewport -->
          <div class="matrix-viewport">
            <div id="interactive-matrix-container">
              <!-- Rendered dynamically by MatrixView -->
            </div>
          </div>
        </section>
      </div>

    </div>

    <!-- ========================================================================
         Hint Step-by-Step Calculation Breakdown (Opens on 'Give Hint')
         ======================================================================== -->
    <section id="hint-inspector-section" class="hint-inspector-section hidden" aria-label="Hint Cell Calculation Breakdown">
      <div class="matrix-section-card hint-card">
        <div class="matrix-section-header">
          <div class="matrix-section-title">
            <span>💡 Hint: Step-by-Step Calculation Breakdown</span>
          </div>
          <button type="button" id="btn-close-hint-inspector" class="btn btn-secondary btn-sm">✕ Close Hint</button>
        </div>
        <div id="hint-inspector-container">
          <!-- Rendered dynamically when Give Hint is clicked -->
        </div>
      </div>
    </section>"""

html = html.replace(old_matrix_section, new_matrix_section)

with open('index.html', 'w') as f:
    f.write(html)

print("index.html updated successfully with rough work sidebar and hint inspector!")
