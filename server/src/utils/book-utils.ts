import * as slug from "slug";

const MAX_SLUG_LENGTH = 150;

export function generateBookSlug(
  bookTitle: string,
  authorFirstName: string | null,
  authorLastName: string | null
): string {
  const authorParts = [authorFirstName, authorLastName].filter(part => !!part);
  const authorSlugPart = slug(authorParts.join("-"), { lower: true });
  let bookTitleSlugPart = slug(bookTitle, { lower: true });

  if (authorSlugPart.length + bookTitle.length > MAX_SLUG_LENGTH - 1) {
    bookTitleSlugPart = authorSlugPart.substr(0, MAX_SLUG_LENGTH - bookTitle.length - 1);
  }

  return slug(`${bookTitleSlugPart}-${authorSlugPart}`, { lower: true });
}

export function formatStringForBookFullTextContent(bookRelatedStr: string): string {
  return slug(bookRelatedStr, {
    lower: true,
    replacement: " ",
  });
}
