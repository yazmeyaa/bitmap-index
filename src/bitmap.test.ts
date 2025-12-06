import { Bitmap } from "./bitmap";

describe("Bitmap", () => {
  test("Set", () => {
    const bitmap = new Bitmap(0);
    bitmap.set(0);
    bitmap.set(1);
    bitmap.set(2);
    expect(bitmap.contains(0)).toBe(true);
    expect(bitmap.contains(1)).toBe(true);
    expect(bitmap.contains(2)).toBe(true);
  });

  test("Remove", () => {
    const x = 2;
    const bitmap = new Bitmap(32);
    bitmap.set(x);
    expect(bitmap.contains(x)).toBe(true);
    bitmap.remove(x);
    expect(bitmap.contains(x)).toBe(false);
  });

  test("Min, Max, MinZero, MaxZero", () => {
    const bitmap = new Bitmap(32);

    expect(bitmap.min()).toBe(-1);
    expect(bitmap.max()).toBe(-1);
    expect(bitmap.minZero()).toBe(0);
    expect(bitmap.maxZero()).toBe(31);

    bitmap.set(1);
    expect(bitmap.min()).toBe(1);
    expect(bitmap.minZero()).toBe(0);
    expect(bitmap.maxZero()).toBe(31);

    bitmap.set(0);
    expect(bitmap.min()).toBe(0);
    expect(bitmap.max()).toBe(1);
    expect(bitmap.minZero()).toBe(2);
    expect(bitmap.maxZero()).toBe(31);

    bitmap.set(31);
    expect(bitmap.min()).toBe(0);
    expect(bitmap.max()).toBe(31);
    expect(bitmap.minZero()).toBe(2);
    expect(bitmap.maxZero()).toBe(30);
  });

  test("Count", () => {
    const bitmap = new Bitmap(32);
    expect(bitmap.count()).toBe(0);
    bitmap.set(1);
    bitmap.set(2);
    bitmap.set(16);

    expect(bitmap.count()).toBe(3);
  });

  test("Range over bitmap", () => {
    const bitmap = new Bitmap(16);

    bitmap.set(2);
    bitmap.set(4);
    bitmap.set(6);
    bitmap.set(8);

    const results: number[] = [];

    bitmap.range((x) => {
      results.push(x);
    });

    expect(results).toEqual([2, 4, 6, 8]);
  });

  test("AND operation", () => {
    const bitmap1 = new Bitmap(32);
    bitmap1.set(1);
    bitmap1.set(2);
    bitmap1.set(3);

    const bitmap2 = new Bitmap(32);
    bitmap2.set(2);
    bitmap2.set(3);
    bitmap2.set(4);

    const result = bitmap1.and(bitmap2);

    expect(result.contains(1)).toBe(false);
    expect(result.contains(2)).toBe(true);
    expect(result.contains(3)).toBe(true);
    expect(result.contains(4)).toBe(false);
  });

  test("AND NOT operation", () => {
    const bitmap1 = new Bitmap(32);
    bitmap1.set(1);
    bitmap1.set(2);
    bitmap1.set(3);

    const bitmap2 = new Bitmap(32);
    bitmap2.set(2);
    bitmap2.set(3);
    bitmap2.set(4);

    const result = bitmap1.andNot(bitmap2);

    expect(result.contains(1)).toBe(true);
    expect(result.contains(2)).toBe(false);
    expect(result.contains(3)).toBe(false);
    expect(result.contains(4)).toBe(false);
  });

  test("OR operation", () => {
    const bitmap1 = new Bitmap(32);
    bitmap1.set(1);
    bitmap1.set(2);
    bitmap1.set(3);

    const bitmap2 = new Bitmap(32);
    bitmap2.set(2);
    bitmap2.set(3);
    bitmap2.set(4);

    const result = bitmap1.or(bitmap2);

    expect(result.contains(1)).toBe(true);
    expect(result.contains(2)).toBe(true);
    expect(result.contains(3)).toBe(true);
    expect(result.contains(4)).toBe(true);
  });

  test("XOR operation", () => {
    const bitmap1 = new Bitmap(32);
    bitmap1.set(1);
    bitmap1.set(2);
    bitmap1.set(3);

    const bitmap2 = new Bitmap(32);
    bitmap2.set(2);
    bitmap2.set(3);
    bitmap2.set(4);

    const result = bitmap1.xor(bitmap2);

    expect(result.contains(1)).toBe(true);
    expect(result.contains(2)).toBe(false);
    expect(result.contains(3)).toBe(false);
    expect(result.contains(4)).toBe(true);
  });

  test("Filter to keep even numbers", () => {
    const bitmap = new Bitmap(32);
    bitmap.set(0);
    bitmap.set(1);
    bitmap.set(2);
    bitmap.set(3);
    bitmap.set(4);

    bitmap.filter((x) => x % 2 === 0);

    expect(bitmap.contains(0)).toBe(true);
    expect(bitmap.contains(1)).toBe(false);
    expect(bitmap.contains(2)).toBe(true);
    expect(bitmap.contains(3)).toBe(false);
    expect(bitmap.contains(4)).toBe(true);
  });

  test("Generator iterator yields correct bits", () => {
    const bitmap = new Bitmap(16);
    bitmap.set(2);
    bitmap.set(4);
    bitmap.set(6);

    const results: number[] = [];
    for (const bit of bitmap) {
      results.push(bit);
    }

    expect(results).toEqual([2, 4, 6]);
  });

  test("Spread operator works with Bitmap", () => {
    const bitmap = new Bitmap(16);
    bitmap.set(1);
    bitmap.set(3);
    bitmap.set(5);

    const arr = [...bitmap];
    expect(arr).toEqual([1, 3, 5]);
  });

  test("Empty bitmap yields no bits", () => {
    const bitmap = new Bitmap(8);
    const results = [...bitmap];
    expect(results).toEqual([]);
  });

  test("Bitmap with all bits set yields correct sequence", () => {
    const bitmap = new Bitmap(8);
    for (let i = 0; i < 8; i++) bitmap.set(i);

    const results = [...bitmap];
    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  test("To string converting", () => {
    const bitmap = new Bitmap(16);
    for (let i = 0; i < 16; i += 2) {
      bitmap.set(i);
    }

    const resultString = "0101010101010101";

    expect(bitmap.toString()).toEqual(resultString);
    expect(String(bitmap)).toEqual(resultString);
    expect(`bitmap debug: ${bitmap}`).toEqual("bitmap debug: 0101010101010101")

    const bitmap2 = Bitmap.fromString(bitmap.toString());
    expect(bitmap2.toString()).toEqual(bitmap.toString());
  })
});
