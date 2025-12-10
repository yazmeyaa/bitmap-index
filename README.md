### Bitmap-Index Library
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]

This TypeScript library provides a bitmap implementation (`Bitmap`) that allows efficient manipulation of a bitmap data structure, useful for various indexing and set operations.

#### Features

- **Set Operations:** `set`, `remove`, `contains`, and `clear` operations on the bitmap.
- **Logical Operations:** `and`, `andNot`, `or`, and `xor` operations between bitmaps.
- **Iteration and Filtering:** `range` iteration, generator-based iteration via `[Symbol.iterator]`, and `filter` based on user-defined conditions.
- **Count and Extremes:** Methods to count set bits (`count`), find the minimum and maximum set bit (`min`, `max`), as well as the minimum and maximum unset bit (`minZero`, `maxZero`).
- **Cloning:** Supports cloning of the bitmap instance.
- **Iterable Support:** Can be used directly in `for...of` loops and spread syntax (`[...bitmap]`) for convenient iteration over set bits.

#### Installation

You can install the library via npm:

```bash
npm install bitmap-index
````

#### Usage Example

```typescript
import { Bitmap } from 'bitmap-index';

// Create a new Bitmap with a size of 32 bits
const bitmap = new Bitmap(32);

// Set bits
bitmap.set(2);
bitmap.set(5);
bitmap.set(10);

// Check if a bit is set
console.log(bitmap.contains(5)); // true
console.log(bitmap.contains(3)); // false

// Perform logical operations with another bitmap
const otherBitmap = new Bitmap(32);
otherBitmap.set(5);
otherBitmap.set(10);

const andResult = bitmap.and(otherBitmap); // Bitmap with bits [5, 10]
const orResult = bitmap.or(otherBitmap);   // Bitmap with bits [2, 5, 10]
const xorResult = bitmap.xor(otherBitmap); // Bitmap with bits [2]

// Iterate over set bits using range
bitmap.range((x) => {
  console.log(`Bit ${x} is set`);
  return true; // Continue iterating
});

// Iterate using for...of (generator)
for (const bit of bitmap) {
  console.log(`Iterated bit: ${bit}`);
}

// Spread operator
const bitsArray = [...bitmap]; // [2, 5, 10]

// Filter based on a condition
bitmap.filter((x) => x % 2 === 0); // Remove odd-numbered bits

// Count the number of set bits
console.log(bitmap.count()); // 1

// Find the minimum and maximum set bits
console.log(bitmap.min()); // 2
console.log(bitmap.max()); // 10

// Clear all bits
bitmap.clear();

// Clone the bitmap
const clonedBitmap = bitmap.clone();
```

#### API Documentation

* **Bitmap Class**

  * **Constructor:** `new Bitmap(size: number = 32)`
  * **Set Operations:** `set(x: number)`, `remove(x: number)`, `contains(x: number)`, `clear()`
  * **Logical Operations:** `and(bitmap: Bitmap)`, `andNot(bitmap: Bitmap)`, `or(bitmap: Bitmap)`, `xor(bitmap: Bitmap)`
  * **Iteration and Filtering:** `range(fn: (x: number) => boolean)`, `filter(fn: (x: number) => boolean)`, `[Symbol.iterator](): Iterator<number>`
  * **Count and Extremes:** `count()`, `min()`, `max()`, `minZero()`, `maxZero()`
  * **Cloning:** `clone(): Bitmap`

#### Performance
# Benchmark Results (10k bits)

| #   | Task                                 | Avg Latency (ns)   | Med Latency (ns)     | Avg Throughput (ops/s) | Med Throughput (ops/s) | Samples |
| --- | ------------------------------------ | ------------------ | -------------------- | ---------------------- | ---------------------- | ------- |
| 0   | set() – random bits                  | 31,371 ± 1.16%     | 29,200 ± 900         | 33,212 ± 0.17%         | 34,247 ± 1089          | 15,939  |
| 1   | set() – sequential bits              | 32,537 ± 0.96%     | 30,100 ± 700         | 32,169 ± 0.20%         | 33,223 ± 755           | 15,368  |
| 2   | contains() – hit                     | 28,800 ± 0.86%     | 27,200 ± 1000        | 36,235 ± 0.18%         | 36,765 ± 1403          | 17,361  |
| 3   | contains() – miss                    | 29,773 ± 0.89%     | 27,500 ± 600         | 35,239 ± 0.19%         | 36,364 ± 811           | 16,794  |
| 4   | and() – 10k vs 10k                   | 92,188 ± 0.97%     | 79,600 ± 4900        | 11,443 ± 0.50%         | 12,563 ± 824           | 5,424   |
| 5   | or() – 10k vs 10k                    | 92,291 ± 0.91%     | 79,600 ± 5800        | 11,430 ± 0.51%         | 12,563 ± 969           | 5,418   |
| 6   | xor() – 10k vs 10k                   | 89,627 ± 0.98%     | 78,400 ± 3500        | 11,741 ± 0.46%         | 12,755 ± 578           | 5,579   |
| 7   | andNot() – 10k vs 10k                | 89,869 ± 0.92%     | 79,500 ± 1800        | 11,642 ± 0.43%         | 12,579 ± 278           | 5,564   |
| 8   | for…of iteration                     | 145,013 ± 0.48%    | 139,100 ± 1700       | 6,990 ± 0.32%          | 7,189 ± 87             | 3,448   |
| 9   | [...bmp] spread                      | 245,514 ± 0.69%    | 237,200 ± 3200       | 4,130 ± 0.40%          | 4,216 ± 56             | 2,037   |
| 10  | filter(x => x % 2 === 0)             | 360,279 ± 0.66%    | 352,300 ± 1100       | 2,797 ± 0.33%          | 2,838 ± 9              | 1,388   |
| 11  | BigInt alternative – set random bits | 27,976,819 ± 1.43% | 27,535,900 ± 690,250 | 36 ± 1.26%             | 36 ± 1                 | 64      |
| 12  | Set<number> – add sequential         | 246,334 ± 4.63%    | 219,700 ± 7700       | 4,454 ± 0.47%          | 4,552 ± 163            | 2,030   |
| 13  | Set<number> – has() hits             | 256,280 ± 5.11%    | 224,350 ± 12,050     | 4,346 ± 0.55%          | 4,457 ± 245            | 1,952   |


#### Note

This library is designed for bitmap indexing operations and is not related to image processing. For more information on bitmap indexing, please refer to [Bitmap Index Wiki](https://en.wikipedia.org/wiki/Bitmap_index).

---

Feel free to contribute, report issues, or suggest improvements on [GitHub](https://github.com/yazmeyaa/bitmap-index).

[npm-image]: https://img.shields.io/npm/v/bitmap-index.svg?style=flat-square
[npm-url]: https://npmjs.org/package/bitmap-index
[downloads-image]: https://img.shields.io/npm/dm/bitmap-index.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/bitmap-index
