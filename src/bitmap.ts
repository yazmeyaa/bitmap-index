const computeBitsArrayLength = (x: number): number => Math.ceil(x / 8);
/**
 * Compute the number of bytes required to store `x` bits.
 * @private
 * @param {number} x - Number of bits to accommodate.
 * @returns {number} Number of bytes required.
 */

/**
 * Get the byte index that contains the bit for position `x`.
 * @private
 * @param {number} x - Bit index.
 * @returns {number} Byte index in the underlying Uint8Array.
 */
const getBitPositionIndex = (x: number): number => Math.floor(x / 8);

/**
 * Get the position of the bit inside its byte for bit index `x`.
 * @private
 * @param {number} x - Bit index.
 * @returns {number} Bit position within the byte (0-7).
 */
const getBitPosition = (x: number): number => x % 8;

/**
 * Create an 8-bit mask with a 1 at `bitIdx`.
 * @private
 * @param {number} bitIdx - Bit position inside a byte (0-7).
 * @returns {number} Mask with the bit at `bitIdx` set (e.g. 0b00001000).
 */
const getMask = (bitIdx: number): number => 0b00000001 << bitIdx;

export class Bitmap {
  private bits: Uint8Array;

  /**
   * Bitmap - a simple bitset backed by a Uint8Array.
   * Indices are zero-based.
   * @example
   * const b = new Bitmap(64); // capacity for 64 bits
   * b.set(10);
   * b.set(20);
   * console.log(b.contains(10)); // true
   *
   * @param {number} [x=32] - Initial capacity in bits (defaults to 32).
   */
  constructor(x: number = 32) {
    this.bits = new Uint8Array(computeBitsArrayLength(x));
  }

  /**
   * Iterate over all set bit indices in ascending order.
   * Yields the numeric index of each set bit.
   * @yields {number} The index of a set bit (0-based).
   */
  public *[Symbol.iterator](): Generator<number> {
    for (let i = 0; i < this.bits.length; i++) {
      const byte = this.bits[i];
      if (byte === 0) continue;
      for (let j = 0; j < 8; j++) {
        if ((byte & (1 << j)) !== 0) {
          yield i * 8 + j;
        }
      }
    }
  }

  /**
   * Serialize the bitmap into a compact binary-string representation.
   * Each byte of the underlying storage is converted to 8 characters ('0'/'1'),
   * preserving byte order and padding leading zeros to maintain alignment.
   *
   * @returns {string} Binary string representing the full contents of the bitmap.
  */
  public toString(): string {
    return Array.from(this.bits)
      .map(x => x.toString(2).padStart(8, '0'))
      .join(' ');
  }

  /**
   * Construct a Bitmap instance from its binary-string representation.
   * The input string must be byte-aligned: its length must be divisible by 8.
   * Each 8-character segment is parsed as a single byte (big-endian bit order).
   *
   * @param {string} s - Binary string produced by `toString()` or compatible formatter.
   * @returns {Bitmap} New Bitmap instance containing the parsed bits.
   * @throws {Error} If the input length is not divisible by 8.
  */
  static fromString(s: string): Bitmap {
    // allow "00000001 00000010", "0000000100000010", etc.
    const cleaned = s.replace(/\s+/g, '');

    if (cleaned.length % 8 !== 0) {
      throw new Error("Bitmap string must be aligned to bytes (len % 8 == 0)");
    }

    const bytes = new Uint8Array(cleaned.length / 8);

    for (let i = 0; i < bytes.length; i++) {
      const byteStr = cleaned.slice(i * 8, i * 8 + 8);
      bytes[i] = parseInt(byteStr, 2);
    }

    const b = new Bitmap(bytes.length * 8);
    b.bits = bytes;
    return b;
  }

  /**
   * Ensure the underlying array can hold at least up to bit index `x`.
   * This may reallocate the underlying Uint8Array, keeping existing bits.
   * @param {number} x - Bit index to accommodate.
   * @returns {void}
   */
  public grow(x: number): void {
    const arrLength = Math.max(1, computeBitsArrayLength(x + 1));
    if (arrLength <= this.bits.length) return;
    const prev = this.bits;
    this.bits = new Uint8Array(arrLength);
    this.bits.set(prev);
  }

  /**
   * Set the bit at index `x` to 1.
   * Automatically grows the internal buffer if necessary.
   * @param {number} x - Bit index to set (0-based).
   * @returns {void}
   */
  public set(x: number): void {
    const idx = getBitPositionIndex(x);
    if (idx >= this.bits.length) this.grow(x);
    this.bits[idx] |= getMask(getBitPosition(x));
  }

  /**
   * Clear the bit at index `x` (set to 0).
   * If `x` is beyond current capacity, the call is a no-op.
   * @param {number} x - Bit index to clear (0-based).
   * @returns {void}
   */
  public remove(x: number): void {
    const idx = getBitPositionIndex(x);
    if (idx >= this.bits.length) return;
    const mask = getMask(getBitPosition(x));
    this.bits[idx] &= ~mask;
  }

  /**
   * Check whether the bit at index `x` is set.
   * @param {number} x - Bit index to test (0-based).
   * @returns {boolean} True if the bit is 1, false otherwise.
   */
  public contains(x: number): boolean {
    const idx = getBitPositionIndex(x);
    if (idx >= this.bits.length) return false;
    const mask = getMask(getBitPosition(x));
    return (this.bits[idx] & mask) === mask;
  }

  /**
   * Count number of set bits in the bitmap (Hamming weight).
   * @returns {number} Number of bits set to 1.
   */
  public count(): number {
    let count = 0;
    for (const byte of this.bits) {
      let tmp = byte;
      while (tmp) {
        tmp &= tmp - 1;
        count++;
      }
    }
    return count;
  }

  /**
   * Bitwise AND with another bitmap. Returns a new Bitmap containing the intersection.
   * The result's capacity is equal to the left-hand bitmap's capacity (cloned from `this`).
   * @param {Bitmap} bitmap - Other bitmap to AND with.
   * @returns {Bitmap} New Bitmap representing this & bitmap.
   */
  public and(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    const result = this.clone() as Bitmap;
    const minlen = Math.min(this.bits.length, otherBits.length);

    for (let i = 0; i < minlen; i++) {
      result.bits[i] &= otherBits[i];
    }

    for (let i = minlen; i < result.bits.length; i++) {
      result.bits[i] = 0;
    }

    return result;
  }

  /**
   * Bitwise AND NOT (this & ~bitmap). Returns a new Bitmap.
   * @param {Bitmap} bitmap - Other bitmap to subtract from this.
   * @returns {Bitmap} New Bitmap representing this & ~bitmap.
   */
  public andNot(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    const result = this.clone() as Bitmap;
    const minlen = Math.min(this.bits.length, otherBits.length);

    for (let i = 0; i < minlen; i++) {
      result.bits[i] &= ~otherBits[i];
    }

    return result;
  }

  /**
   * Bitwise OR (union) with another bitmap. Returns a new Bitmap.
   * The resulting bitmap will be large enough to contain bits from both operands.
   * @param {Bitmap} bitmap - Other bitmap to OR with.
   * @returns {Bitmap} New Bitmap representing this | bitmap.
   */
  public or(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    let result = this.clone() as Bitmap;

    if (otherBits.length > result.bits.length) {
      const extended = new Uint8Array(otherBits.length);
      extended.set(result.bits);
      result.bits = extended;
    }

    const maxlen = Math.max(result.bits.length, otherBits.length);
    for (let i = 0; i < maxlen; i++) {
      const a = result.bits[i] ?? 0;
      const b = otherBits[i] ?? 0;
      result.bits[i] = a | b;
    }

    return result;
  }

  /**
   * Bitwise XOR (symmetric difference) with another bitmap. Returns a new Bitmap.
   * The resulting bitmap will be large enough to contain bits from both operands.
   * @param {Bitmap} bitmap - Other bitmap to XOR with.
   * @returns {Bitmap} New Bitmap representing this ^ bitmap.
   */
  public xor(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    let result = this.clone() as Bitmap;

    if (otherBits.length > result.bits.length) {
      const extended = new Uint8Array(otherBits.length);
      extended.set(result.bits);
      result.bits = extended;
    }

    const maxlen = Math.max(result.bits.length, otherBits.length);
    for (let i = 0; i < maxlen; i++) {
      const a = result.bits[i] ?? 0;
      const b = otherBits[i] ?? 0;
      result.bits[i] = a ^ b;
    }

    return result;
  }

  /**
   * Iterate over set bits and call `fn` for each set bit index in ascending order.
   * If `fn` returns `false`, iteration stops early.
   * @param {(x: number) => boolean | void} fn - Callback invoked with each set bit index. Returning `false` stops iteration.
   * @returns {void}
   */
  public range(fn: (x: number) => boolean | void): void {
    let needContinueIterating = true;
    for (let i = 0; i < this.bits.length; i++) {
      let byte = this.bits[i];
      for (let j = 0; j < 8; j++) {
        const bit = (byte >> j) & 1;
        if (bit === 0) continue;
        needContinueIterating = fn(i * 8 + j) ?? true;
        if (!needContinueIterating) break;
      }
      if (!needContinueIterating) break;
    }
  }

  /**
   * Remove bits for which `fn(bitIndex)` returns false. Mutates this bitmap.
   * @param {(x: number) => boolean} fn - Predicate called for each set bit index; if it returns false the bit is cleared.
   * @returns {void}
   */
  public filter(fn: (x: number) => boolean): void {
    for (let i = 0; i < this.bits.length; i++) {
      for (let j = 0; j < 8; j++) {
        const bitIndex = i * 8 + j;
        if (this.contains(bitIndex) && !fn(bitIndex)) {
          this.remove(bitIndex);
        }
      }
    }
  }

  /**
   * Clear all bits (set all to zero).
   * @returns {void}
   */
  public clear(): void {
    for (let i = 0; i < this.bits.length; i++) {
      this.bits[i] = 0;
    }
  }

  /**
   * Create a deep copy of this bitmap.
   * The clone's capacity is equal to the number of bits represented by the current byte-length.
   * @returns {Bitmap} A new Bitmap instance with the same bits set.
   */
  public clone(): Bitmap {
    const clonedBitmap = new Bitmap(this.bits.length * 8);
    clonedBitmap.bits.set(this.bits);
    return clonedBitmap;
  }

  /**
   * Return the smallest set bit index or -1 if none are set.
   * @returns {number} Minimum set bit index, or -1 if empty.
   */
  public min(): number {
    for (let i = 0; i < this.bits.length; i++) {
      const byte = this.bits[i];
      if (byte === 0) continue;
      for (let j = 0; j < 8; j++) {
        if ((byte & (1 << j)) !== 0) {
          return i * 8 + j;
        }
      }
    }
    return -1;
  }

  /**
   * Return the largest set bit index or -1 if none are set.
   * @returns {number} Maximum set bit index, or -1 if empty.
   */
  public max(): number {
    let x = -1;
    for (let i = this.bits.length - 1; i >= 0; i--) {
      const byte = this.bits[i];
      if (byte === 0) continue;
      x = i * 8 + Math.floor(Math.log2(byte));
      break;
    }
    return x;
  }

  /**
   * Return the first zero bit index (smallest index not set). If all bits are set, returns capacity (bits.length * 8).
   * @returns {number} Index of the first zero bit, or capacity if none found.
   */
  public minZero(): number {
    for (let i = 0; i < this.bits.length; i++) {
      const byte = this.bits[i];
      if (byte === 0xff) continue;
      for (let j = 0; j < 8; j++) {
        if ((byte & (1 << j)) === 0) {
          return i * 8 + j;
        }
      }
    }
    return this.bits.length * 8;
  }

  /**
   * Return the last zero bit index (largest index not set) or -1 if all bits are set.
   * @returns {number} Index of the last zero bit, or -1 if none found.
   */
  public maxZero(): number {
    for (let i = this.bits.length - 1; i >= 0; i--) {
      const byte = this.bits[i];
      if (byte === 0xff) continue;
      for (let j = 7; j >= 0; j--) {
        if ((byte & (1 << j)) === 0) {
          return i * 8 + j;
        }
      }
    }
    return -1;
  }
}
