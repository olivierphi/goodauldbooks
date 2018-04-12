import * as slug from "slug";

export function generateBookSlug(
  bookTitle: string,
  authorFirstName: string,
  authorLastName: string
): string {
  return slug([bookTitle, authorFirstName, authorLastName].join("-"), { lower: true });
}
