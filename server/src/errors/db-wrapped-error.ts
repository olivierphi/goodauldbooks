export class DbWrappedError extends Error {
  constructor(public msg: string, public parentErr: any) {
    super(`DB error: "${msg}" - original error : ${parentErr}`);
  }
}
