import { Bitmap } from '../dist/index.js';
import { Bench } from 'tinybench';

const bench = new Bench({ time: 500 });

const SIZE = 100_000;
const RAND_MAX = 200_000;

const randIndices = Array.from({ length: SIZE }, () =>
    Math.floor(Math.random() * RAND_MAX),
);

const seqIndices = Array.from({ length: SIZE }, (_, i) => i);

const evenIndices = seqIndices.filter(x => x % 2 === 0);
const oddIndices = seqIndices.filter(x => x % 2 === 1);


const aBits = Array.from({ length: SIZE }, (_, i) => i * 3);
const bBits = Array.from({ length: SIZE }, (_, i) => i * 5);

const randBitPositions = Array.from({ length: SIZE }, () =>
    Math.floor(Math.random() * RAND_MAX),
);



bench.add('set() – random bits (100k)', () => {
    const bmp = new Bitmap(RAND_MAX);
    for (let i = 0; i < SIZE; i++) {
        bmp.set(randIndices[i]);
    }
});

bench.add('set() – sequential bits (100k)', () => {
    const bmp = new Bitmap(RAND_MAX);
    for (let i = 0; i < SIZE; i++) {
        bmp.set(seqIndices[i]);
    }
});

bench.add('contains() – hit (even from 100k)', () => {
    const bmp = new Bitmap(RAND_MAX);
    for (let i = 0; i < evenIndices.length; i++) bmp.set(evenIndices[i]);

    for (let i = 0; i < evenIndices.length; i++) {
        bmp.contains(evenIndices[i]);
    }
});

bench.add('contains() – miss (odd from 100k)', () => {
    const bmp = new Bitmap(RAND_MAX);
    for (let i = 0; i < evenIndices.length; i++) bmp.set(evenIndices[i]);

    for (let i = 0; i < oddIndices.length; i++) {
        bmp.contains(oddIndices[i]);
    }
});

// bitwise
bench.add('and() – 100k vs 100k', () => {
    const a = new Bitmap(RAND_MAX);
    const b = new Bitmap(RAND_MAX);
    for (let x of aBits) a.set(x);
    for (let x of bBits) b.set(x);
    a.and(b);
});

bench.add('or() – 100k vs 100k', () => {
    const a = new Bitmap(RAND_MAX);
    const b = new Bitmap(RAND_MAX);
    for (let x of aBits) a.set(x);
    for (let x of bBits) b.set(x);
    a.or(b);
});

bench.add('xor() – 100k vs 100k', () => {
    const a = new Bitmap(RAND_MAX);
    const b = new Bitmap(RAND_MAX);
    for (let x of aBits) a.set(x);
    for (let x of bBits) b.set(x);
    a.xor(b);
});

bench.add('andNot() – 100k vs 100k', () => {
    const a = new Bitmap(RAND_MAX);
    const b = new Bitmap(RAND_MAX);
    for (let x of aBits) a.set(x);
    for (let x of bBits) b.set(x);
    a.andNot(b);
});

// iteration tests
bench.add('for…of iteration (100k bits)', () => {
    const bmp = new Bitmap(RAND_MAX);
    for (let i = 0; i < SIZE; i++) bmp.set(i);

    let sum = 0;
    for (const bit of bmp) sum += bit;
    return sum;
});

bench.add('[...bmp] spread (100k bits)', () => {
    const bmp = new Bitmap(RAND_MAX);
    for (let i = 0; i < SIZE; i++) bmp.set(i);

    const arr = [...bmp];
    return arr.length;
});

bench.add('filter(x => x % 2 === 0) – 100k bits', () => {
    const bmp = new Bitmap(RAND_MAX);
    for (let i = 0; i < SIZE; i++) bmp.set(i);

    bmp.filter(x => x % 2 === 0);
});

bench.add('BigInt alternative – set 100k random bits', () => {
    let mask = 0n;
    for (let i = 0; i < SIZE; i++) {
        mask |= (1n << BigInt(randBitPositions[i]));
    }
});

bench.add('Set<number> – add 100k sequential', () => {
    const set = new Set();
    for (let i = 0; i < SIZE; i++) set.add(i);
});

bench.add('Set<number> – has() 100k hits', () => {
    const set = new Set();
    for (let i = 0; i < SIZE; i++) set.add(i);
    for (let i = 0; i < SIZE; i++) set.has(i);
});


(async () => {
    await bench.run();
    console.table(bench.table());
})();
