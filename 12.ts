import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Point = [number, number, number];

type Input = Point[];

type Moon = {
  pos: Point;
  vel: Point;
};

type Moons = Moon[];

const parse_input = (input: string): Input => {
  const ret = [];
  for (const line of input.split(/\r?\n/)) {
    const m = line.match(/^<x=(-?\d+), y=(-?\d+), z=(-?\d+)>$/);
    if (!m) throw Error(line);
    ret.push(m.slice(1).map(Number));
  }
  return ret;
};

const range_pairs = function*(n: number): IterableIterator<number[]> {
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const num = [a, b];
      const nn = new Set(num);
      if (nn.size !== num.length) continue;
      yield num;
    }
  }
};

const exec1 = (moons: Moons): any => {
  const ret = [];
  for (const pair of range_pairs(moons.length)) {
    const [ai, bi] = pair;
    for (let i = 0; i < 3; i++) {
      if (moons[ai].pos[i] < moons[bi].pos[i]) {
        moons[ai].vel[i]++;
        moons[bi].vel[i]--;
      } else if (moons[ai].pos[i] > moons[bi].pos[i]) {
        moons[ai].vel[i]--;
        moons[bi].vel[i]++;
      }
    }
  }
  for (const moon of moons) {
    for (let i = 0; i < 3; i++) {
      moon.pos[i] += moon.vel[i];
    }
  }
};

const energy = (x: Moon): number => {
  const a = x.pos.map(Math.abs).reduce((s, x) => s + x, 0);
  const b = x.vel.map(Math.abs).reduce((s, x) => s + x, 0);
  return a * b;
};

const print = (moons: Moons) => {
  for (const r of moons) {
    const rr = `pos=<x=${r.pos[0]}, y=${r.pos[1]}, z=${r.pos[2]}>, vel=<x=${
      r.vel[0]
    }, y=${r.vel[1]}, z=${r.vel[2]}> energy:${energy(r)}`;
    p(rr);
  }
};

const part1 = (input0: Input, count: number): any => {
  const moons: Moons = input0.map(pos => ({
    pos: [...pos] as Point,
    vel: [0, 0, 0]
  }));
  for (let i = 0; i < count; i++) {
    exec1(moons);
  }
  return moons.map(energy).reduce((s, x) => s + x, 0);
};

const exec2 = (pos: number[], vel: number[]): any => {
  let index = 0;
  const key = () => `${pos.join("x")} ${vel.join("x")}`;
  const set = new Set<string>();
  set.add(key());

  while (true) {
    for (const pair of range_pairs(pos.length)) {
      const [ai, bi] = pair;
      if (pos[ai] < pos[bi]) {
        vel[ai]++;
        vel[bi]--;
      } else if (pos[ai] > pos[bi]) {
        vel[ai]--;
        vel[bi]++;
      }
    }
    for (let i = 0; i < pos.length; i++) {
      pos[i] += vel[i];
    }
    index++;
    const k = key();
    if (set.has(k)) {
      return index;
    }
    set.add(k);
  }
};

const gcd = (x: number, y: number): number => {
  return !y ? x : gcd(y, x % y);
};

const lcm = (x: number, y: number): number => {
  return (x * y) / gcd(x, y);
};

const lcm3 = (z: number[]): number => {
  return lcm(lcm(z[0], z[1]), z[2]);
};

const part2 = (input0: Input): any => {
  const r = [0, 1, 2].map(i =>
    exec2(
      input0.map(x => x[i]),
      input0.map(x => 0)
    )
  );
  return lcm3(r);
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("12.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input, 1000));
  p(`Part2:`, part2(input));
}

{
  let input = null;

  input = `<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`;
  assertEquals(part1(parse_input(input), 10), 179);
  assertEquals(part2(parse_input(input)), 2772);

  input = `<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>`;
  assertEquals(part1(parse_input(input), 100), 1940);
  assertEquals(part2(parse_input(input)), 4686774924);
}
