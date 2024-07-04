### Bitmap-Index Library

This TypeScript library provides a bitmap implementation (`Bitmap`) that allows efficient manipulation of a bitmap data structure, useful for various indexing and set operations.

#### Features

- **Set Operations:** Supports set, remove, contains, and clear operations on the bitmap.
- **Logical Operations:** Provides AND, AND-NOT, OR, and XOR operations between bitmaps.
- **Iteration and Filtering:** Includes range iteration and filtering based on user-defined conditions.
- **Counting and Extremes:** Methods to count set bits (`count`), find the minimum and maximum set bit (`min`, `max`), as well as the minimum and maximum unset bit (`minZero`, `maxZero`).
- **Cloning:** Supports cloning of the bitmap instance.

#### Installation

You can install the library via npm:

```bash
npm install bitmap-index
```

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

// Iterate over set bits within a range
bitmap.range((x) => {
  console.log(`Bit ${x} is set`);
  return true; // Continue iterating
});

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

// Further operations can be performed on clonedBitmap...
```

#### API Documentation

- **Bitmap Class**
  - **Constructor:** `new Bitmap(size: number = 32)`
  - **Set Operations:** `set(x: number)`, `remove(x: number)`, `contains(x: number)`, `clear()`
  - **Logical Operations:** `and(bitmap: Bitmap)`, `andNot(bitmap: Bitmap)`, `or(bitmap: Bitmap)`, `xor(bitmap: Bitmap)`
  - **Iteration and Filtering:** `range(fn: (x: number) => boolean)`, `filter(fn: (x: number) => boolean)`
  - **Count and Extremes:** `count()`, `min()`, `max()`, `minZero()`, `maxZero()`
  - **Cloning:** `clone(): Bitmap`

#### Note

This library is designed for bitmap indexing operations and is not related to image processing. For more information on bitmap indexing, please refer to [Bitmap Index Wiki](https://en.wikipedia.org/wiki/Bitmap_index).

---

Feel free to contribute, report issues, or suggest improvements on [GitHub](https://github.com/yazmeyaa/bitmap-index).
