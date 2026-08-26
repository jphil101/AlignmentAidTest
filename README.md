# Bioinformatics Dynamic Programming Visualizer
### Interactive Pedagogical Tool for Needleman-Wunsch & Smith-Waterman Algorithms

An interactive, responsive web application designed for students, educators, and computational biologists to study and practice Dynamic Programming algorithms in sequence alignment.

---

## 🌟 Key Features

1. **Algorithm Switcher**:
   - **Needleman-Wunsch (Global Alignment)**: Full end-to-end alignment, boundary gap initialization ($i \times d, j \times d$), negative score support, traceback from $(M, N) \to (0,0)$.
   - **Smith-Waterman (Local Alignment)**: Conserved motif discovery, 0-initialized boundaries, floor of 0 on cell scores, traceback from matrix $\max \to 0$.

2. **Custom Sequences & Scoring Parameters**:
   - Enter Sequence 1 (Vertical / Rows) and Sequence 2 (Horizontal / Columns).
   - Configure **Match score**, **Mismatch penalty**, and **Gap penalty ($d$)** with full support for positive and negative integers.
   - Quick sequence swap button (⇄).

3. **Color-Coded Sequence Characters**:
   - **Adenine (A)**: Red (`#ef4444`)
   - **Thymine (T)**: Blue (`#3b82f6`)
   - **Uracil (U)**: Indigo (`#6366f1`)
   - **Guanine (G)**: Emerald (`#10b981`)
   - **Cytosine (C)**: Amber/Gold (`#f59e0b`)
   - **Amino Acids**: Categorized by biochemical groups (Hydrophobic, Polar, Acidic, Basic, Aromatic, Special).

4. **Dedicated Left-Hand Rough Work Section (📝)**:
   - Placed to the **left of the interactive practice matrix**.
   - Displays 3 dedicated scratch entry fields for the currently selected cell:
     - **↖ Diagonal:** Scratch space for calculating candidate from North-West + Match/Mismatch
     - **↑ Up:** Scratch space for calculating candidate from North + Gap
     - **← Left:** Scratch space for calculating candidate from West + Gap
   - **Per-Cell Caching**: Values you enter into the rough work section are automatically preserved per cell in memory. Clicking another cell resets the inputs (or loads that cell's previous notes), and returning to an earlier cell restores your notes.

5. **Multi-Arrow Support for Ties & Shadow Arrow Hover**:
   - **Multiple Arrows Per Cell**: When scores tie (e.g. Diagonal and Up yield the same maximum), users can activate multiple arrows simultaneously in the same cell.
   - Hovering near the top-left, top, or left edge of any cell renders a ghost preview arrow. Clicking toggles that direction's arrow on/off without affecting other arrows in the cell.
   - **Eraser Tool (🧹)**: Toggle eraser mode to quickly remove arrows or clear cell scores.

6. **Full Validation with 20-Second Smooth Fade**:
   - Clicking **"Check Answers"** evaluates **ALL** cells manually filled by the user simultaneously.
   - Correct values illuminate in **Green**; incorrect values illuminate in **Red**.
   - Colors smoothly and gently fade back to normal over **20 seconds** without disrupting active input.

7. **"Complete this" (⚡) with 5-Correct Criteria & Confirmation**:
   - When clicked, verifies if the student has filled at least **5 cells correctly manually**.
   - **If < 5 correct**: Informs user of the minimum criteria and highlights missing cells (amber dashed border) and error cells (red).
   - **If ≥ 5 correct**: Opens a confirmation dialog asking if they wish to proceed with auto-fill. On confirmation, auto-completes the remaining matrix with accurate scores and all optimal tied arrows.

8. **"Give Hint" (💡) with On-Demand Calculation Breakdown**:
   - Clicking **"Give Hint"** fills the next cell and reveals a dedicated step-by-step mathematical breakdown card showing the exact calculations ($\text{Diagonal}$, $\text{Up}$, $\text{Left}$, and winning max).
   - Can be closed with the "✕ Close Hint" button.

9. **Full Solution & Traceback Visualizer**:
   - Click **"Show Full Solution"** to reveal the complete answer matrix, glowing golden traceback trail, and formatted alignment strings (`Seq1`, match line `|`, `Seq2`), total score, identity %, match/mismatch/gap statistics.

---

## 🚀 How to Host on Vercel

This app is built with pure client-side standard HTML5, CSS3, and modern JavaScript (ES Modules). It has **zero external build dependencies**, ensuring 100% reliable deployment on Vercel.

### Option 1: Vercel CLI
```bash
npx vercel
```

### Option 2: GitHub Integration
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. Framework Preset: **Other** (Root directory: `./`).
5. Click **Deploy**. Vercel will host it instantly on its global Edge network!

---

## 🧪 Local Development

To run locally:
```bash
python3 -m http.server 3000
```
Open `http://localhost:3000` in your browser.
