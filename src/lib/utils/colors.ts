export const colorPalette = [
  "#5a7fc9", // Medium blue
  "#c9618f", // Medium pink
  "#4dacb9", // Medium sky blue
  "#8864ad", // Medium purple
  "#65ac55", // Medium green
  "#d99456", // Medium orange
  "#7a7dcb", // Medium lavender
  "#97b967", // Medium lime
  "#4daa95", // Medium mint
  "#c26674", // Medium coral
];

/**
 * Get a color from the palette by index, cycling through colors if index exceeds palette length
 */
export const getColorByIndex = (index: number): string => {
  return colorPalette[index % colorPalette.length];
};

/**
 * Get a color for a specific item (string-based), provides consistent color for same item
 */
export const getColorByName = (name: string): string => {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

/**
 * Get multiple colors from palette
 */
export const getColors = (count: number): string[] => {
  return Array.from({ length: count }, (_, index) => getColorByIndex(index));
};
