export class NotABookError extends Error {
  constructor(public gutenbergId: number) {
    super(`Gitenber item #${gutenbergId} is not a book`);
  }
}
