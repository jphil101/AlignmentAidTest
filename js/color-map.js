/**
 * Sequence Character Color Coding and Badges
 * Provides distinct, accessible, and standard bioinformatics color schemes for DNA, RNA, and Amino Acids.
 */

export const CHAR_COLORS = {
  // Nucleotides
  'A': { bg: '#ef4444', text: '#ffffff', label: 'Adenine (A)', group: 'Purine' },
  'T': { bg: '#3b82f6', text: '#ffffff', label: 'Thymine (T)', group: 'Pyrimidine' },
  'U': { bg: '#6366f1', text: '#ffffff', label: 'Uracil (U)', group: 'Pyrimidine' },
  'G': { bg: '#10b981', text: '#ffffff', label: 'Guanine (G)', group: 'Purine' },
  'C': { bg: '#f59e0b', text: '#ffffff', label: 'Cytosine (C)', group: 'Pyrimidine' },
  'N': { bg: '#6b7280', text: '#ffffff', label: 'Any Nucleotide (N)', group: 'Ambiguous' },

  // Amino Acids - standard biochemical groupings
  // Hydrophobic / Non-polar (A, V, I, L, M, F, W, P)
  'V': { bg: '#0284c7', text: '#ffffff', label: 'Valine (V)', group: 'Hydrophobic' },
  'I': { bg: '#0284c7', text: '#ffffff', label: 'Isoleucine (I)', group: 'Hydrophobic' },
  'L': { bg: '#0284c7', text: '#ffffff', label: 'Leucine (L)', group: 'Hydrophobic' },
  'M': { bg: '#0284c7', text: '#ffffff', label: 'Methionine (M)', group: 'Hydrophobic' },
  'F': { bg: '#0891b2', text: '#ffffff', label: 'Phenylalanine (F)', group: 'Aromatic' },
  'W': { bg: '#0891b2', text: '#ffffff', label: 'Tryptophan (W)', group: 'Aromatic' },
  'Y': { bg: '#0891b2', text: '#ffffff', label: 'Tyrosine (Y)', group: 'Aromatic' },
  'P': { bg: '#d97706', text: '#ffffff', label: 'Proline (P)', group: 'Special' },

  // Polar / Uncharged (S, T, N, Q)
  'S': { bg: '#059669', text: '#ffffff', label: 'Serine (S)', group: 'Polar' },
  'N': { bg: '#059669', text: '#ffffff', label: 'Asparagine (N)', group: 'Polar' },
  'Q': { bg: '#059669', text: '#ffffff', label: 'Glutamine (Q)', group: 'Polar' },

  // Basic / Positively Charged (K, R, H)
  'K': { bg: '#7c3aed', text: '#ffffff', label: 'Lysine (K)', group: 'Basic (+)' },
  'R': { bg: '#7c3aed', text: '#ffffff', label: 'Arginine (R)', group: 'Basic (+)' },
  'H': { bg: '#9333ea', text: '#ffffff', label: 'Histidine (H)', group: 'Basic (+)' },

  // Acidic / Negatively Charged (D, E)
  'D': { bg: '#e11d48', text: '#ffffff', label: 'Aspartate (D)', group: 'Acidic (-)' },
  'E': { bg: '#e11d48', text: '#ffffff', label: 'Glutamate (E)', group: 'Acidic (-)' },

  // Default / Gap / Empty
  '-': { bg: '#9ca3af', text: '#ffffff', label: 'Gap (-)', group: 'Gap' },
  'default': { bg: '#64748b', text: '#ffffff', label: 'Residue', group: 'Other' }
};

/**
 * Get color object for a character
 */
export function getCharColor(char) {
  if (!char) return CHAR_COLORS['default'];
  const upper = String(char).toUpperCase();
  return CHAR_COLORS[upper] || CHAR_COLORS['default'];
}

/**
 * Render an HTML badge element for a character
 */
export function createCharBadgeHTML(char, extraClass = '') {
  if (!char) return '';
  const upper = String(char).toUpperCase();
  const info = getCharColor(upper);
  return `<span class="char-badge ${extraClass}" style="background-color: ${info.bg}; color: ${info.text};" title="${info.label} (${info.group})">${upper}</span>`;
}
