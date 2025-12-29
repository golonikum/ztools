/**
 * Проверяет, не находится ли строка версии в стандартном формате "X.Y.Z" (семантическое версионирование).
 */
export const isPackageVersionNotObvious = (version: string) =>
  version && !version.match(/^\d+\.\d+\.\d+$/g);
