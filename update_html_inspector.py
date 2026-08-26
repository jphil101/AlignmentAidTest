with open('index.html', 'r') as f:
    html = f.read()

# Remove inspector section from below practice board
old_inspector_section = """    <!-- ========================================================================
         Live Mathematical Derivation Inspector Card
         ======================================================================== -->
    <section aria-label="Cell Math Inspector">
      <div id="cell-inspector-container">
        <div class="inspector-placeholder">
          👈 Click any cell in the practice board or answer board to inspect its dynamic programming derivation step-by-step.
        </div>
      </div>
    </section>"""

html = html.replace(old_inspector_section, "")

# Insert inspector section INSIDE answer-solution-section (after answer matrix)
old_answer_section_end = """        <div class="matrix-viewport">
          <div id="answer-matrix-container">
            <!-- Rendered dynamically by MatrixView -->
          </div>
        </div>
      </div>
    </section>"""

new_answer_section_end = """        <div class="matrix-viewport">
          <div id="answer-matrix-container">
            <!-- Rendered dynamically by MatrixView -->
          </div>
        </div>
      </div>

      <!-- Step-by-Step Mathematical Derivation Inspector (Visible in Solution Section) -->
      <div class="matrix-section-card" aria-label="Cell Math Inspector">
        <div class="matrix-section-header">
          <div class="matrix-section-title">
            <span>🔬 Step-by-Step Mathematical Calculation Inspector</span>
          </div>
          <div class="text-muted text-xs">
            Click any cell in the solution matrix above to view its exact recurrence derivation.
          </div>
        </div>
        <div id="cell-inspector-container">
          <div class="inspector-placeholder">
            👈 Click any cell in the solution matrix above to inspect its dynamic programming derivation step-by-step.
          </div>
        </div>
      </div>
    </section>"""

html = html.replace(old_answer_section_end, new_answer_section_end)

with open('index.html', 'w') as f:
    f.write(html)

print("index.html updated successfully!")
