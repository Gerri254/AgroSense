/**
 * Tailwind Color Class Mapping
 *
 * This prevents dynamic class names that Tailwind can't detect during purge.
 * All color variants are pre-defined here.
 */

export const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-500',
    progress: 'bg-blue-500',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-500',
    progress: 'bg-orange-500',
  },
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-600',
    border: 'border-teal-500',
    progress: 'bg-teal-500',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
    border: 'border-cyan-500',
    progress: 'bg-cyan-500',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-500',
    progress: 'bg-indigo-500',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-500',
    progress: 'bg-green-500',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-500',
    progress: 'bg-red-500',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-500',
    progress: 'bg-yellow-500',
  },
};

/**
 * Get color classes for a given color
 * Falls back to blue if color not found
 */
export const getColorClasses = (color) => {
  return colorClasses[color] || colorClasses.blue;
};
