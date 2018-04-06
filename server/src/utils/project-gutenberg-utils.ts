/**
 * Returns "3/4/5/345" for bookd id 345.
 */
export function getPathFromBookId(projectGutenbergBookId: number): string {
  const pathPrefixParts = projectGutenbergBookId.toString().split("");
  pathPrefixParts.pop();

  return `${pathPrefixParts.join("/")}/${projectGutenbergBookId}`;
}
