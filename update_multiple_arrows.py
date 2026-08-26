with open('js/matrix-view.js', 'r') as f:
    js = f.read()

# 1. In setData, preserve all user arrows:
old_set_data_arrows = """        if (this.userArrows[key] && this.userArrows[key].size > 0) {
          const arr = Array.from(this.userArrows[key]);
          newArrows[key] = new Set([arr[0]]);
        } else {
          newArrows[key] = new Set();
        }"""

new_set_data_arrows = """        if (this.userArrows[key]) {
          newArrows[key] = new Set(this.userArrows[key]);
        } else {
          newArrows[key] = new Set();
        }"""

js = js.replace(old_set_data_arrows, new_set_data_arrows)

# 2. In autoFillHint, include all optimal arrows for ties:
old_hint_arrow = """          const primaryArrow = matrix[i][j].arrows.length > 0 ? [matrix[i][j].arrows[0]] : [];
          this.userArrows[key] = new Set(primaryArrow);"""

new_hint_arrow = """          this.userArrows[key] = new Set(matrix[i][j].arrows);"""

js = js.replace(old_hint_arrow, new_hint_arrow)

# 3. In completeRemainingMatrix, include all optimal arrows for ties:
old_complete_arrow = """        const primaryArrow = matrix[i][j].arrows.length > 0 ? [matrix[i][j].arrows[0]] : [];
        this.userArrows[key] = new Set(primaryArrow);"""

new_complete_arrow = """        this.userArrows[key] = new Set(matrix[i][j].arrows);"""

js = js.replace(old_complete_arrow, new_complete_arrow)

# 4. In toggleArrow, allow multiple arrows per cell (toggle individual direction):
old_toggle_arrow = """  toggleArrow(i, j, dir) {
    const key = `${i},${j}`;
    if (!this.userArrows[key]) {
      this.userArrows[key] = new Set();
    }

    if (this.eraserActive) {
      this.userArrows[key].clear();
    } else {
      if (this.userArrows[key].has(dir)) {
        this.userArrows[key].clear();
      } else {
        this.userArrows[key].clear();
        this.userArrows[key].add(dir);
      }
    }"""

new_toggle_arrow = """  toggleArrow(i, j, dir) {
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
    }"""

js = js.replace(old_toggle_arrow, new_toggle_arrow)

with open('js/matrix-view.js', 'w') as f:
    f.write(js)

print("matrix-view.js updated to support multiple arrows per cell!")
