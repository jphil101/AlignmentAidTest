with open('index.html', 'r') as f:
    html = f.read()

# 1. Add "Complete this" button in toolbar
old_toolbar = """        <!-- 3. Hint / Auto-Solve Cell -->
        <button id="btn-hint" class="btn btn-secondary" title="Auto-fill the next cell and show its derivation">
          <span>💡</span> Give Hint
        </button>"""

new_toolbar = """        <!-- 3. Complete this Button -->
        <button id="btn-complete-matrix" class="btn btn-complete-tool" title="Complete the rest of the matrix once you have filled at least 5 correct cells manually">
          <span>⚡</span> Complete this
        </button>

        <!-- 4. Hint / Auto-Solve Cell -->
        <button id="btn-hint" class="btn btn-secondary" title="Auto-fill the next cell and show its derivation">
          <span>💡</span> Give Hint
        </button>"""

html = html.replace(old_toolbar, new_toolbar)

# 2. Add Rough Work Popover and Confirmation Modal before </body>
modals_html = """  <!-- ========================================================================
       Floating Rough Work Scratchpad Pop-up
       ======================================================================== -->
  <div id="rough-work-popover" class="rough-work-popover hidden" role="region" aria-label="Rough Work Scratchpad">
    <div class="rough-header">
      <div class="rough-title">
        <span class="rough-icon">📝</span>
        <span>Rough Work <strong id="rough-coords-text">(i,j)</strong></span>
      </div>
      <button type="button" id="btn-rough-close" class="rough-close-btn" title="Close scratchpad">✕</button>
    </div>
    <div class="rough-body">
      <div class="rough-row">
        <label class="rough-label rough-label-diag" for="rough-diag" title="Diagonal: NW predecessor + Match/Mismatch">↖ Diag:</label>
        <input type="text" id="rough-diag" class="rough-input" placeholder="e.g. 2+1=3" spellcheck="false" autocomplete="off" />
      </div>
      <div class="rough-row">
        <label class="rough-label rough-label-up" for="rough-input-up" title="Up: North predecessor + Gap">↑ Up:</label>
        <input type="text" id="rough-input-up" class="rough-input" placeholder="e.g. 0-2=-2" spellcheck="false" autocomplete="off" />
      </div>
      <div class="rough-row">
        <label class="rough-label rough-label-left" for="rough-input-left" title="Left: West predecessor + Gap">← Left:</label>
        <input type="text" id="rough-input-left" class="rough-input" placeholder="e.g. -2-2=-4" spellcheck="false" autocomplete="off" />
      </div>
    </div>
    <div class="rough-footer">
      <span class="rough-hint">Scratchpad for manual score calculations</span>
    </div>
  </div>

  <!-- ========================================================================
       Confirmation Modal for Complete This
       ======================================================================== -->
  <div id="confirm-modal-overlay" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-icon-badge">⚡</div>
        <h3 id="modal-title" class="modal-title">Auto-Complete Remaining Matrix?</h3>
      </div>
      <div class="modal-body">
        <p id="modal-message">
          Great job! You have filled <strong>5</strong> correct manual cells. Would you like to automatically complete the remaining matrix with accurate scores and arrows?
        </p>
      </div>
      <div class="modal-actions">
        <button id="btn-modal-cancel" class="btn btn-secondary">Cancel</button>
        <button id="btn-modal-confirm" class="btn btn-primary btn-modal-yes">Yes, Complete Matrix</button>
      </div>
    </div>
  </div>
"""

html = html.replace('  <!-- Toast Notifications Container -->', modals_html + '\n  <!-- Toast Notifications Container -->')

with open('index.html', 'w') as f:
    f.write(html)

print("index.html updated successfully!")
