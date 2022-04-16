export const returnByCondition =
  (condition: boolean) =>
  <T>(returnValue: T) =>
    condition ? returnValue : undefined;
