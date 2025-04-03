export interface IBitmap {
  grow(x: number): void;

  set(x: number): void;

  remove(x: number): void;

  contains(x: number): boolean;

  count(): number;

  and(bitmap: IBitmap): IBitmap;

  andNot(bitmap: IBitmap): IBitmap;

  or(bitmap: IBitmap): IBitmap;

  xor(bitmap: IBitmap): IBitmap;

  range(fn: (x: number) => boolean | void): void;

  filter(fn: (x: number) => boolean): void;

  clear(): void;

  clone(): IBitmap;

  min(): number;

  max(): number;

  minZero(): number;

  maxZero(): number;
}
