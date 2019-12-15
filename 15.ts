import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

enum Dir {
  N = 1,
  S = 2,
  W = 3,
  E = 4
}

type Point = [number, number];
type Board = Map<string, number>;
type Memory = Map<number, number>;

const STEPS = {
  [Dir.N]: [0, -1] as Point,
  [Dir.S]: [0, 1] as Point,
  [Dir.W]: [-1, 0] as Point,
  [Dir.E]: [1, 0] as Point
};

const eq_points = (a: Point, b: Point): boolean =>
  a[0] === b[0] && a[1] === b[1];
const add_points = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];
const sub_points = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1]];

const parse_input = (input: string): Memory => {
  const r = input.split(",").map((x, i) => [i, Number(x)] as [number, number]);
  const ret = new Map<number, number>(r);
  return ret;
};

class Machine {
  mem: Memory;
  input?: () => number;
  output?: IterableIterator<number>;
  done: boolean;
  base: number;

  constructor(mem: Memory) {
    this.mem = new Map(mem);
    this.done = false;
    this.base = 0;
  }

  *run(): IterableIterator<number> {
    let ip = 0;
    const load = (x: number) => {
      assert(x >= 0);
      return this.mem.get(x) || 0;
    };
    const store = (x: number, v: number) => {
      assert(x >= 0);
      this.mem.set(x, v);
    };
    while (true) {
      const op = load(ip) % 100;
      const ins = `0000${load(ip)}`.split("").reverse();
      const addr = (x: number) => {
        switch (ins[x + 1]) {
          case "0":
            return load(ip + x);
          case "1":
            return ip + x;
          case "2":
            return this.base + load(ip + x);
          default:
            throw new Error(`Invalid mode ${ins[x + 1]}`);
        }
      };
      const get = (x: number) => load(addr(x));
      switch (op) {
        case 1:
          store(addr(3), get(1) + get(2));
          ip += 4;
          break;
        case 2:
          store(addr(3), get(1) * get(2));
          ip += 4;
          break;
        case 3:
          store(addr(1), this.input());
          ip += 2;
          break;
        case 4:
          yield get(1);
          ip += 2;
          break;
        case 5:
          ip = get(1) ? get(2) : ip + 3;
          break;
        case 6:
          ip = !get(1) ? get(2) : ip + 3;
          break;
        case 7:
          store(addr(3), get(1) < get(2) ? 1 : 0);
          ip += 4;
          break;
        case 8:
          store(addr(3), get(1) === get(2) ? 1 : 0);
          ip += 4;
          break;
        case 9:
          this.base += get(1);
          ip += 2;
          break;
        case 99:
          this.done = true;
          return;
        default:
          throw new Error(`Invalid op:${op} ip:${ip}`);
      }
    }
  }
}

const print = (board: Board, pos: Point): any => {
  if (!board.size) return "";
  const dots = [...board.entries()].map(
    x => [x[0].split("x").map(Number) as Point, x[1]] as [Point, number]
  );
  dots.push([pos, 3]);
  const x0 = Math.min(...dots.map(x => x[0][0]));
  const x1 = Math.max(...dots.map(x => x[0][0]));
  const y0 = Math.min(...dots.map(x => x[0][1]));
  const y1 = Math.max(...dots.map(x => x[0][1]));
  const canvas = Array(y1 - y0 + 1)
    .fill(null)
    .map(_ => Array(x1 - x0 + 1).fill(" "));
  const legend = { 0: "#", 1: ".", 2: "%", 3: "*" };
  for (const z of dots) {
    canvas[z[0][1] - y0][z[0][0] - x0] = legend[z[1]];
  }
  const r = canvas.map(x => x.join("")).join("\n");
  return `\n${r}`;
};

const draw = (
  machine: Machine,
  board: Map<string, number>,
  path: Point[]
): any => {
  const move = (step): number => {
    const dir = Object.entries(STEPS).find(x =>
      eq_points(x[1] as Point, step)
    )[0][0];
    machine.input = () => Number(dir);
    const tile = machine.output.next();
    assert(!tile.done);
    return tile.value;
  };

  const pos0 = path[path.length - 1];
  const adj = Object.values(STEPS)
    .map(x => add_points(pos0, x))
    .filter(x => !board.has(x.join("x")));
  for (const pos1 of adj) {
    const tile = move(sub_points(pos1, pos0));
    board.set(pos1.join("x"), tile);
    if (tile > 0) {
      draw(machine, board, [...path, pos1]);
      const tile = move(sub_points(pos0, pos1));
      assertEquals(tile, board.get(pos0.join("x")));
    }
  }
};

const run = (input0: Memory): any => {
  const machine = new Machine(input0);
  machine.output = machine.run();
  const start = [0, 0] as Point;
  const board = new Map<string, number>();
  board.set(start.join("x"), 1);
  draw(machine, board, [start]);
  const goal = [...board.entries()]
    .find(x => x[1] === 2)[0]
    .split("x")
    .map(Number) as Point;
  return [board, start, goal];
};

const shortest = (board: Board, start: Point, goal: Point): Point[] => {
  const queue = [start];
  const visited = new Map();
  const prev = new Map();
  while (queue.length > 0) {
    const node = queue.shift();
    visited.set(node.join("x"), true);
    const adj = Object.values(STEPS)
      .map(x => add_points(node, x))
      .filter(
        x =>
          board.get(x.join("x")) > 0 &&
          !visited.has(x.join("x")) &&
          queue.every(y => !eq_points(x, y))
      );
    for (const x of adj) {
      queue.push(x);
      prev.set(x.join("x"), node);
    }
  }
  const path = [];
  let at = goal;
  while (at) {
    path.push(at);
    at = prev.get(at.join("x"));
  }
  path.reverse();
  return path[0] == start ? path : [];
};

const part1 = (input0: Memory): any => {
  const [board, start, goal] = run(input0);
  // p(print(board, start));
  const path = shortest(board, start, goal);
  return path.length - 1;
};

const fill = (board: Board, start: Point): any => {
  const queue: [Point, number][] = [[start, 0]];
  const visited = new Map();
  let ret = 0;
  while (queue.length > 0) {
    const [node, count] = queue.shift();
    visited.set(node.join("x"), true);
    ret = Math.max(ret, count);
    const adj = Object.values(STEPS)
      .map(x => add_points(node, x))
      .filter(
        x =>
          board.get(x.join("x")) > 0 &&
          !visited.has(x.join("x")) &&
          queue.every(y => !eq_points(x, y[0]))
      );
    for (const x of adj) {
      queue.push([x, count + 1]);
    }
  }
  return ret;
};

const part2 = (input0: Memory): any => {
  const [board, _, goal] = run(input0);
  const r = fill(board, goal);
  return r;
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/15.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}
