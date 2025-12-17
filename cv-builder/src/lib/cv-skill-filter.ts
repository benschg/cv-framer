/**
 * Filters skills based on selected indices
 * Returns all skills if selected_skill_indices is null, otherwise returns filtered subset
 */
export function filterSelectedSkills(
  skills: string[],
  selectedIndices: number[] | null
): string[] {
  if (selectedIndices === null) {
    return skills;
  }
  return skills.filter((_, i) => selectedIndices.includes(i));
}
