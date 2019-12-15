import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Point = [number, number];
type Board = Map<string, number>;
type Memory = Map<number, number>;

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

const exec1 = (input: Memory): [number, Board] => {
  const machine = new Machine(input);
  machine.output = machine.run();
  const board = new Map<string, number>();
  while (true) {
    const x = machine.output.next();
    if (x.done) break;
    const y = machine.output.next();
    assert(!y.done);
    const tile = machine.output.next();
    assert(!tile.done);

    const spot = [x.value, y.value];
    board.set(spot.join("x"), tile.value);
  }
  const r = [...board.entries()].filter(x => x[1] == 2).length;
  return [r, board];
};

const part1 = (input0: Memory): any => {
  const [r, board] = exec1(input0);
  return r;
};

const exec2 = (input0: Memory): [number, Board] => {
  const machine = new Machine(input0);
  machine.mem.set(0, 2);
  machine.output = machine.run();

  let score;
  let ball: Point, pad: Point;

  machine.input = () => {
    const r = Math.sign(ball[0] - pad[0]);
    return r;
  };

  const board = new Map<string, number>();
  while (true) {
    const x = machine.output.next();
    if (x.done) break;
    const y = machine.output.next();
    assert(!y.done);
    const tile = machine.output.next();
    assert(!tile.done);

    const spot = [x.value, y.value] as Point;
    if (spot[0] == -1 && spot[1] == 0) {
      score = tile.value;
    } else {
      board.set(spot.join("x"), tile.value);
      switch (tile.value) {
        case 3:
          pad = spot;
          break;
        case 4:
          ball = spot;
          break;
      }
    }
  }
  return [score, board];
};

const part2 = (input0: Memory): any => {
  const [r, board] = exec2(input0);
  return r;
};

const print = (board: Board): any => {
  if (!board.size) return "";
  const dots = [...board.entries()]
    .filter(x => x[1] > 0)
    .map(x => [x[0].split("x").map(Number) as Point, x[1]] as [Point, number]);
  const x0 = Math.min(...dots.map(x => x[0][0]));
  const x1 = Math.max(...dots.map(x => x[0][0]));
  const y0 = Math.min(...dots.map(x => x[0][1]));
  const y1 = Math.max(...dots.map(x => x[0][1]));
  const canvas = Array(y1 - y0 + 1)
    .fill(null)
    .map(_ => Array(x1 - x0 + 1).fill(" "));
  const legend = { 1: "#", 2: "x", 3: "_", 4: "O" };
  for (const z of dots) {
    canvas[z[0][1] - y0][z[0][0] - x0] = legend[z[1]];
  }
  const r = canvas.map(x => x.join("")).join("\n");
  return `\n${r}`;
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/13.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}
