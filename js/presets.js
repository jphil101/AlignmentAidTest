/**
 * Bioinformatics Dynamic Programming Presets
 * Pre-configured classic examples for students and educators.
 */

import { ALGORITHM } from './algorithms.js';

export const PRESETS = [
  {
    id: 'nw-classic-dna',
    name: 'Needleman-Wunsch: Textbook DNA Global',
    description: 'Classic textbook example comparing GCATGCG and GATTACA (Match: +1, Mismatch: -1, Gap: -1).',
    algorithm: ALGORITHM.NEEDLEMAN_WUNSCH,
    seq1: 'GCATGCG',
    seq2: 'GATTACA',
    match: 1,
    mismatch: -1,
    gap: -1
  },
  {
    id: 'nw-simple-dna',
    name: 'Needleman-Wunsch: Quick 4-mer Practice',
    description: 'Simple 4-letter matrix (AGTC vs ATCG) ideal for quick manual calculation practice.',
    algorithm: ALGORITHM.NEEDLEMAN_WUNSCH,
    seq1: 'AGTC',
    seq2: 'ATCG',
    match: 2,
    mismatch: -1,
    gap: -2
  },
  {
    id: 'sw-classic-local',
    name: 'Smith-Waterman: Classic DNA Local Motif',
    description: 'Local alignment finding high-scoring conserved motif TTAC between TGTTACGG and GGTTGACTA.',
    algorithm: ALGORITHM.SMITH_WATERMAN,
    seq1: 'TGTTACGG',
    seq2: 'GGTTGACTA',
    match: 3,
    mismatch: -3,
    gap: -2
  },
  {
    id: 'sw-protein-motif',
    name: 'Smith-Waterman: Protein AWHE Domain',
    description: 'Local alignment of short peptide segments finding the conserved AWHE domain.',
    algorithm: ALGORITHM.SMITH_WATERMAN,
    seq1: 'HEAGAWGHEE',
    seq2: 'PAWHEAE',
    match: 3,
    mismatch: -1,
    gap: -2
  },
  {
    id: 'nw-tied-backtrace',
    name: 'Needleman-Wunsch: Multiple Optimal Paths (Ties)',
    description: 'Example with multiple equal-scoring traceback routes demonstrating branching paths.',
    algorithm: ALGORITHM.NEEDLEMAN_WUNSCH,
    seq1: 'ACGT',
    seq2: 'ACCT',
    match: 2,
    mismatch: -1,
    gap: -1
  },
  {
    id: 'nw-rna-variant',
    name: 'Needleman-Wunsch: RNA Sequence Comparison',
    description: 'Global RNA sequence alignment with Uracil nucleotides (U).',
    algorithm: ALGORITHM.NEEDLEMAN_WUNSCH,
    seq1: 'AUGCCUAG',
    seq2: 'ACGCCUUG',
    match: 2,
    mismatch: -1,
    gap: -2
  }
];
