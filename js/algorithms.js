/**
 * Bioinformatics Dynamic Programming Engine
 * Implements Needleman-Wunsch (Global Alignment) & Smith-Waterman (Local Alignment)
 */

export const ALGORITHM = {
  NEEDLEMAN_WUNSCH: 'needleman-wunsch',
  SMITH_WATERMAN: 'smith-waterman'
};

export const DIRECTION = {
  DIAG: 'diag', // North-West: (i-1, j-1) -> Match / Mismatch
  UP: 'up',     // North: (i-1, j) -> Gap in Seq2 / Deletion in Seq1
  LEFT: 'left'  // West: (i, j-1) -> Gap in Seq1 / Insertion in Seq1
};

/**
 * Calculates the full Dynamic Programming Matrix and Backpointers
 * @param {string} seq1 - Sequence 1 (Rows / Vertical)
 * @param {string} seq2 - Sequence 2 (Columns / Horizontal)
 * @param {object} params - { match, mismatch, gap, algorithm }
 * @returns {object} Full calculation result including matrix, steps, optimal paths, alignments
 */
export function computeAlignmentMatrix(seq1, seq2, params) {
  const s1 = (seq1 || '').toUpperCase().trim();
  const s2 = (seq2 || '').toUpperCase().trim();
  const matchScore = Number(params.match);
  const mismatchScore = Number(params.mismatch);
  const gapPenalty = Number(params.gap);
  const algorithm = params.algorithm || ALGORITHM.NEEDLEMAN_WUNSCH;
  const isLocal = algorithm === ALGORITHM.SMITH_WATERMAN;

  const m = s1.length;
  const n = s2.length;

  // Initialize Matrix data structure
  // Each cell: { score, arrows: [], isAutoFilled: bool, stepDetails: {} }
  const matrix = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({
      score: 0,
      arrows: [], // Array of DIRECTION strings
      isAutoFilled: false,
      stepDetails: null
    }))
  );

  // 1. Base Case / Boundary Initialization
  matrix[0][0].score = 0;
  matrix[0][0].isAutoFilled = true;
  matrix[0][0].stepDetails = {
    type: 'origin',
    explanation: 'Starting origin cell (0,0) initialized to 0.'
  };

  // Row 0 (j = 1..n)
  for (let j = 1; j <= n; j++) {
    if (isLocal) {
      matrix[0][j].score = 0;
      matrix[0][j].arrows = [];
    } else {
      matrix[0][j].score = j * gapPenalty;
      matrix[0][j].arrows = [DIRECTION.LEFT];
    }
    matrix[0][j].isAutoFilled = true;
    matrix[0][j].stepDetails = {
      type: 'boundary',
      explanation: isLocal
        ? `Local alignment (Smith-Waterman) boundary initialized to 0.`
        : `Global alignment gap penalty for leading gaps in Seq1: ${j} × (${gapPenalty}) = ${j * gapPenalty}`
    };
  }

  // Column 0 (i = 1..m)
  for (let i = 1; i <= m; i++) {
    if (isLocal) {
      matrix[i][0].score = 0;
      matrix[i][0].arrows = [];
    } else {
      matrix[i][0].score = i * gapPenalty;
      matrix[i][0].arrows = [DIRECTION.UP];
    }
    matrix[i][0].isAutoFilled = true;
    matrix[i][0].stepDetails = {
      type: 'boundary',
      explanation: isLocal
        ? `Local alignment (Smith-Waterman) boundary initialized to 0.`
        : `Global alignment gap penalty for leading gaps in Seq2: ${i} × (${gapPenalty}) = ${i * gapPenalty}`
    };
  }

  // 2. Fill the DP Matrix
  let maxScoreInMatrix = -Infinity;
  let maxScoreCells = []; // Coordinates [i, j] for SW traceback start

  for (let i = 1; i <= m; i++) {
    const char1 = s1[i - 1];
    for (let j = 1; j <= n; j++) {
      const char2 = s2[j - 1];
      const isMatch = char1 === char2;
      const substScore = isMatch ? matchScore : mismatchScore;

      // Three potential incoming scores:
      const diagScore = matrix[i - 1][j - 1].score + substScore;
      const upScore = matrix[i - 1][j].score + gapPenalty;
      const leftScore = matrix[i][j - 1].score + gapPenalty;

      let maxScore;
      const winningDirections = [];

      if (isLocal) {
        // Smith-Waterman: max(0, Diag, Up, Left)
        maxScore = Math.max(0, diagScore, upScore, leftScore);

        if (maxScore > 0) {
          if (diagScore === maxScore) winningDirections.push(DIRECTION.DIAG);
          if (upScore === maxScore) winningDirections.push(DIRECTION.UP);
          if (leftScore === maxScore) winningDirections.push(DIRECTION.LEFT);
        }
        // In SW, if maxScore === 0, no arrows originate from predecessor
      } else {
        // Needleman-Wunsch: max(Diag, Up, Left)
        maxScore = Math.max(diagScore, upScore, leftScore);

        if (diagScore === maxScore) winningDirections.push(DIRECTION.DIAG);
        if (upScore === maxScore) winningDirections.push(DIRECTION.UP);
        if (leftScore === maxScore) winningDirections.push(DIRECTION.LEFT);
      }

      matrix[i][j].score = maxScore;
      matrix[i][j].arrows = winningDirections;
      matrix[i][j].stepDetails = {
        i,
        j,
        char1,
        char2,
        isMatch,
        substScore,
        prevDiagScore: matrix[i - 1][j - 1].score,
        prevUpScore: matrix[i - 1][j].score,
        prevLeftScore: matrix[i][j - 1].score,
        diagScore,
        upScore,
        leftScore,
        gapPenalty,
        maxScore,
        winningDirections,
        isLocal
      };

      if (isLocal) {
        if (maxScore > maxScoreInMatrix) {
          maxScoreInMatrix = maxScore;
          maxScoreCells = [[i, j]];
        } else if (maxScore === maxScoreInMatrix && maxScore > 0) {
          maxScoreCells.push([i, j]);
        }
      }
    }
  }

  // 3. Traceback calculations
  let optimalPaths = [];
  let alignments = [];

  if (m > 0 && n > 0) {
    if (isLocal) {
      if (maxScoreInMatrix <= 0 || maxScoreCells.length === 0) {
        optimalPaths = [];
        alignments = [{
          seq1Aligned: 'No local match with score > 0',
          matchLine: '',
          seq2Aligned: '',
          score: 0,
          startPos: { i: 0, j: 0 },
          endPos: { i: 0, j: 0 },
          matches: 0,
          mismatches: 0,
          gaps: 0,
          identityPct: '0.0'
        }];
      } else {
        maxScoreCells.forEach(([startI, startJ]) => {
          const res = traceBackSmithWaterman(matrix, s1, s2, startI, startJ);
          optimalPaths.push(...res.paths);
          alignments.push(...res.alignments);
        });
      }
    } else {
      // Needleman-Wunsch: Traceback from bottom-right (m, n)
      const res = traceBackNeedlemanWunsch(matrix, s1, s2, m, n);
      optimalPaths = res.paths;
      alignments = res.alignments;
    }
  }

  // Deduplicate alignments
  const uniqueAlignments = [];
  const seenAlignments = new Set();
  alignments.forEach((align, idx) => {
    const key = `${align.seq1Aligned}::${align.seq2Aligned}::${align.startPos?.i}-${align.endPos?.i}`;
    if (!seenAlignments.has(key)) {
      seenAlignments.add(key);
      uniqueAlignments.push({ ...align, pathIndex: idx });
    }
  });

  return {
    seq1: s1,
    seq2: s2,
    params: { match: matchScore, mismatch: mismatchScore, gap: gapPenalty, algorithm },
    dimensions: { rows: m + 1, cols: n + 1 },
    matrix,
    optimalPaths,
    alignments: uniqueAlignments.length > 0 ? uniqueAlignments : alignments,
    maxScore: isLocal ? Math.max(0, maxScoreInMatrix) : (m > 0 && n > 0 ? matrix[m][n].score : 0),
    isLocal
  };
}

/**
 * Needleman-Wunsch Global Alignment Traceback (Finds all optimal paths from (m, n) to (0, 0))
 */
function traceBackNeedlemanWunsch(matrix, s1, s2, startI, startJ) {
  const paths = [];
  const alignments = [];

  function dfs(i, j, currentPath, currentS1, currentS2) {
    if (i === 0 && j === 0) {
      paths.push([...currentPath, [0, 0]]);
      const revS1 = currentS1.split('').reverse().join('');
      const revS2 = currentS2.split('').reverse().join('');
      alignments.push(createAlignmentSummary(revS1, revS2, matrix[startI][startJ].score, { i: 0, j: 0 }, { i: startI, j: startJ }));
      return;
    }

    const cell = matrix[i][j];
    const newPath = [...currentPath, [i, j]];

    if (i === 0) {
      dfs(0, j - 1, newPath, currentS1 + '-', currentS2 + s2[j - 1]);
      return;
    }
    if (j === 0) {
      dfs(i - 1, 0, newPath, currentS1 + s1[i - 1], currentS2 + '-');
      return;
    }

    if (cell.arrows.includes(DIRECTION.DIAG)) {
      dfs(i - 1, j - 1, newPath, currentS1 + s1[i - 1], currentS2 + s2[j - 1]);
    }
    if (cell.arrows.includes(DIRECTION.UP)) {
      dfs(i - 1, j, newPath, currentS1 + s1[i - 1], currentS2 + '-');
    }
    if (cell.arrows.includes(DIRECTION.LEFT)) {
      dfs(i, j - 1, newPath, currentS1 + '-', currentS2 + s2[j - 1]);
    }
  }

  dfs(startI, startJ, [], '', '');
  return { paths, alignments };
}

/**
 * Smith-Waterman Local Alignment Traceback (Starts from (startI, startJ) and stops at score <= 0)
 */
function traceBackSmithWaterman(matrix, s1, s2, startI, startJ) {
  const paths = [];
  const alignments = [];

  function dfs(i, j, currentPath, currentS1, currentS2) {
    const cell = matrix[i][j];
    const newPath = [...currentPath, [i, j]];

    if (cell.score <= 0 || cell.arrows.length === 0 || i === 0 || j === 0) {
      paths.push(newPath);
      const revS1 = currentS1.split('').reverse().join('');
      const revS2 = currentS2.split('').reverse().join('');
      alignments.push(createAlignmentSummary(revS1, revS2, matrix[startI][startJ].score, { i, j }, { i: startI, j: startJ }));
      return;
    }

    if (cell.arrows.includes(DIRECTION.DIAG)) {
      dfs(i - 1, j - 1, newPath, currentS1 + s1[i - 1], currentS2 + s2[j - 1]);
    }
    if (cell.arrows.includes(DIRECTION.UP)) {
      dfs(i - 1, j, newPath, currentS1 + s1[i - 1], currentS2 + '-');
    }
    if (cell.arrows.includes(DIRECTION.LEFT)) {
      dfs(i, j - 1, newPath, currentS1 + '-', currentS2 + s2[j - 1]);
    }
  }

  dfs(startI, startJ, [], '', '');
  return { paths, alignments };
}

function createAlignmentSummary(seq1Aligned, seq2Aligned, score, startPos, endPos) {
  let matchLine = '';
  let matches = 0;
  let mismatches = 0;
  let gaps = 0;

  for (let k = 0; k < seq1Aligned.length; k++) {
    const c1 = seq1Aligned[k];
    const c2 = seq2Aligned[k];

    if (c1 === '-' || c2 === '-') {
      matchLine += ' ';
      gaps++;
    } else if (c1 === c2) {
      matchLine += '|';
      matches++;
    } else {
      matchLine += '.';
      mismatches++;
    }
  }

  const alignedLen = seq1Aligned.length;
  const identityPct = alignedLen > 0 ? ((matches / alignedLen) * 100).toFixed(1) : '0.0';

  return {
    seq1Aligned,
    matchLine,
    seq2Aligned,
    score,
    startPos,
    endPos,
    matches,
    mismatches,
    gaps,
    length: alignedLen,
    identityPct
  };
}
