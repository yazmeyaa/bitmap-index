const computeBitsArrayLength = (x: number): number => Math.ceil(x / 8);
const getBitPositionIndex = (x: number): number => Math.floor(x / 8);
const getBitPosition = (x: number): number => x % 8;
const getMask = (bitIdx: number): number => 0b00000001 << bitIdx;

export class Bitmap {
  private bits: Uint8Array;

  constructor(x = 32) {
    this.bits = new Uint8Array(computeBitsArrayLength(x));
  }

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

  public grow(x: number): void {
    const arrLength = Math.max(1, computeBitsArrayLength(x));
    if (arrLength <= this.bits.length) return;
    const prev = this.bits;
    this.bits = new Uint8Array(arrLength);
    this.bits.set(prev);
  }

  public set(x: number): void {
    const idx = getBitPositionIndex(x);
    if (idx >= this.bits.length) this.grow(x);
    this.bits[idx] |= getMask(getBitPosition(x));
  }

  public remove(x: number): void {
    const idx = getBitPositionIndex(x);
    if (!this.bits[idx]) return;
    const mask = getMask(getBitPosition(x));
    this.bits[idx] &= ~mask;
  }

  public contains(x: number): boolean {
    const [idx, pos] = [getBitPositionIndex(x), getBitPosition(x)];
    if (!this.bits[idx]) return false;
    const mask = getMask(pos);
    return (this.bits[idx] & mask) === mask;
  }

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

  public and(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    const result = this.clone() as Bitmap;
    const minlen = Math.min(this.bits.length, otherBits.length);

    for (let i = 0; i < minlen; i++) {
      result.bits[i] &= otherBits[i];
    }

    return result;
  }

  public andNot(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    const result = this.clone() as Bitmap;
    const minlen = Math.min(this.bits.length, otherBits.length);

    for (let i = 0; i < minlen; i++) {
      result.bits[i] &= ~otherBits[i];
    }

    return result;
  }

  public or(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    const result = this.clone() as Bitmap;
    const minlen = Math.min(this.bits.length, otherBits.length);

    for (let i = 0; i < minlen; i++) {
      result.bits[i] |= otherBits[i];
    }

    return result;
  }

  public xor(bitmap: Bitmap): Bitmap {
    const otherBits = (bitmap as Bitmap).bits;
    const result = this.clone() as Bitmap;
    const minlen = Math.min(this.bits.length, otherBits.length);

    for (let i = 0; i < minlen; i++) {
      result.bits[i] ^= otherBits[i];
    }

    return result;
  }

  public range(fn: (x: number) => boolean | void): void {
    let needContinueIterating = true;
    for (let i = 0; i < this.bits.length; i++) {
      let x = this.bits[i];
      for (let j = 0; j < 8; j++) {
        const bit = (x >> j) & 1;
        if (bit === 0) continue;
        needContinueIterating = fn(i * 8 + j) ?? true;
        if (!needContinueIterating) break;
      }
      if (!needContinueIterating) break;
    }
  }

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

  public clear(): void {
    for (let i = 0; i < this.bits.length; i++) {
      this.bits[i] = 0;
    }
  }

  public clone(): Bitmap {
    const clonedBitmap = new Bitmap(this.bits.length * 8);
    clonedBitmap.bits.set(this.bits);
    return clonedBitmap;
  }

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
