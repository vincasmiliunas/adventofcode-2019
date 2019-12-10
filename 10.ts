import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Point = [number, number];

type Input = string[][];

const parse_input = (input: string): Input => {
  return input
    .split(/\r?\n/)
    .map(x => x.trim().split(""))
    .filter(x => x.length > 0);
};

const asteroids = function*(input: Input): IterableIterator<Point> {
  const w = Math.max(...input.map(x => x.length));
  const h = input.length;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (input[y][x] !== "#") continue;
      const r = [x, y] as Point;
      yield r;
    }
  }
};

const gcd = (z: Point): number => {
  const [x, y] = z.map(Math.abs);
  return !y ? x : gcd([y, x % y]);
};

const gen_path = function*(
  spot0: Point,
  target: Point
): IterableIterator<Point> {
  if (eq_points(spot0, target)) return;
  const spot = [...spot0] as Point;
  let step = [target[0] - spot[0], target[1] - spot[1]] as Point;
  const k = gcd(step);
  step = step.map(z => Math.floor(z / k)) as Point;
  while (!eq_points(spot, target)) {
    spot[0] += step[0];
    spot[1] += step[1];
    yield [...spot] as Point;
  }
};

const eq_points = (a: Point, b: Point): boolean =>
  a[0] === b[0] && a[1] === b[1];

const visible = (input: Input, spot: Point): Array<Point> => {
  const ret = new Set<string>();
  for (const target of asteroids(input)) {
    if (eq_points(spot, target)) continue;
    for (const z of gen_path(spot, target)) {
      if (input[z[1]][z[0]] === "#") {
        ret.add(z.join("x"));
        break;
      }
    }
  }
  const r = [...ret].map(x => x.split("x").map(Number) as Point);
  return r;
};

const exec1 = (input: Input): any => {
  let best = [[0, 0], 0];
  for (const target of asteroids(input)) {
    const r = visible(input, target);
    if (r.length > best[1]) {
      best = [target, r.length];
    }
  }
  return best;
};

const part1 = (input0: Input): any => {
  const r = exec1([...input0]);
  return r[1];
};

const exec2 = (input0: Input, spot: Point, nth: number): Point => {
  const input = input0.map(x => [...x]);
  const angle = (x: Point): number => {
    const r1 = Math.atan2(x[1] - spot[1], x[0] - spot[0]);
    const r2 = r1 < 0 ? r1 + 2 * Math.PI : r1;
    const r3 = (r2 + Math.PI / 2) % (2 * Math.PI);
    return r3;
  };
  let last: Point;
  let count = 0;
  loop: while (true) {
    const vis = visible(input, spot);
    if (!vis.length) break;
    const angles = vis.map(x => [x, angle(x)] as [Point, number]);
    angles.sort((a, b) => a[1] - b[1]);
    for (const [t, _] of angles) {
      last = t;
      input[t[1]][t[0]] = ".";
      count += 1;
      if (count >= nth) {
        break loop;
      }
    }
  }
  return last;
};

const part2 = (input0: Input): any => {
  const [spot, _] = exec1(input0);
  const r = exec2(input0, spot, 200);
  return r[0] * 100 + r[1];
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("10.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input = null;

  input = `.#..#
.....
#####
....#
...##`;
  assertEquals(visible(parse_input(input), [3, 4]).length, 8);

  input = `......#.#.
#..#.#....
..#######.
.#.#.###..
.#..#.....
..#....#.#
#..#....#.
.##.#..###
##...#..#.
.#....####`;
  assertEquals(visible(parse_input(input), [5, 8]).length, 33);
  assertEquals(exec1(parse_input(input)), [[5, 8], 33]);

  input = `.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`;
  assertEquals(visible(parse_input(input), [11, 13]).length, 210);
  assertEquals(exec1(parse_input(input)), [[11, 13], 210]);

  input = `.#....#####...#..
##...##.#####..##
##...#...#.#####.
..#.....X...###..
..#.#.....#....##`;
  const spot0 = [8, 3] as Point;
  assertEquals(exec2(parse_input(input), spot0, 1), [8, 1]);
  assertEquals(exec2(parse_input(input), spot0, 2), [9, 0]);
  assertEquals(exec2(parse_input(input), spot0, 3), [9, 1]);
  assertEquals(exec2(parse_input(input), spot0, 5), [9, 2]);
  assertEquals(exec2(parse_input(input), spot0, 9), [15, 1]);
  assertEquals(exec2(parse_input(input), spot0, 9+9), [4, 4]);
  assertEquals(exec2(parse_input(input), spot0, 9+9+6), [1, 1]);
}
