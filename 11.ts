import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Point = [number, number];
type Board = Map<string, number>;
type Memory = Map<number, number>;

const parse_input = (input: string): Memory => {
  const ret = new Map<number, number>();
  const ns = input.split(",").map(x => parseInt(x));
  for (const i in ns) {
    ret.set(Number(i), ns[i]);
  }
  return ret;
};

type Machine = {
  mem: Memory;
  input: number[];
  output?: Iterator<number>;
  last_output?: number;
  done: boolean;
  base: number;
};

const run_machine = function*(state: Machine): IterableIterator<number> {
  let ip = 0;
  const load = x => {
    assert(x >= 0);
    return state.mem.get(x) || 0;
  };
  const store = (x, v) => state.mem.set(x, v);
  while (true) {
    const op = load(ip) % 100;
    const ins = `0000${load(ip)}`.split("").reverse();
    const addr = x => {
      switch (ins[x + 1]) {
        case "0":
          return load(ip + x);
        case "1":
          return ip + x;
        case "2":
          return state.base + load(ip + x);
        default:
          throw new Error(`Invalid mode ${ins[x + 1]}`);
      }
    };
    const get = x => load(addr(x));
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
        assert(state.input.length > 0);
        store(addr(1), state.input.shift());
        ip += 2;
        break;
      case 4:
        state.last_output = get(1);
        yield state.last_output;
        ip += 2;
        break;
      case 5:
        if (get(1) !== 0) {
          ip = get(2);
        } else {
          ip += 3;
        }
        break;
      case 6:
        if (get(1) === 0) {
          ip = get(2);
        } else {
          ip += 3;
        }
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
        state.base += get(1);
        ip += 2;
        break;
      case 99:
        state.done = true;
        return;
      default:
        throw new Error(`Invalid op:${op} ip:${ip}`);
    }
  }
};

const exec1 = (input: Memory, start: number): [number, Board] => {
  const m: Machine = {
    mem: new Map(input),
    input: [],
    done: false,
    base: 0
  };
  const output = run_machine(m);

  let pos: Point = [0, 0];
  const painted = new Set<string>();
  const board = new Map<string, number>();
  board.set(pos.join("x"), start);
  const dirs = "<^>v";
  let look = 1;
  while (true) {
    const r1 = board.get(pos.join("x")) || 0;
    m.input.push(r1);

    const color = output.next();
    if (color.done) {
      assert(m.done);
      break;
    }
    const dir = output.next();
    assert(!dir.done);
    switch (dir.value) {
      case 0:
        look--;
        break;
      case 1:
        look++;
        break;
      default:
        throw new Error(`Invalid dir:${dir.value}`);
    }
    look = (look + dirs.length) % dirs.length;

    board.set(pos.join("x"), color.value);
    painted.add(pos.join("x"));

    switch (dirs[look]) {
      case "<":
        pos[0]--;
        break;
      case ">":
        pos[0]++;
        break;
      case "^":
        pos[1]--;
        break;
      case "v":
        pos[1]++;
        break;
      default:
        throw new Error(`Invalid look:${look}`);
    }
  }

  return [painted.size, board];
};

const part1 = (input0: Memory): any => {
  const [painted, _] = exec1(input0, 0);
  return painted;
};

const part2 = (input0: Memory): any => {
  const [_, board] = exec1(input0, 1);
  const dots = [...board.entries()]
    .filter(x => x[1] === 1)
    .map(x => x[0].split("x").map(Number) as Point);
  const x0 = Math.min(...dots.map(x => x[0]));
  const x1 = Math.max(...dots.map(x => x[0]));
  const y0 = Math.min(...dots.map(x => x[1]));
  const y1 = Math.max(...dots.map(x => x[1]));
  const canvas = Array(y1 - y0 + 1)
    .fill(null)
    .map(_ => Array(x1 - x0 + 1).fill(" "));
  for (const z of dots) {
    canvas[z[1] - y0][z[0] - x0] = "#";
  }
  const r = canvas.map(x => x.join("")).join("\n");
  return `\n${r}`;
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/11.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}
