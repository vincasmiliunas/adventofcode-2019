import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = Map<number, number>;

const parse_input = (input: string): Input => {
  const ret = new Map<number, number>();
  const ns = input.split(",").map(x => parseInt(x));
  for (const i in ns) {
    ret.set(Number(i), ns[i]);
  }
  return ret;
};

type Machine = {
  mem: Input;
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

const exec1 = (input0: Input, inp: number): number[] => {
  const m: Machine = {
    mem: new Map(input0),
    input: [inp],
    done: false,
    base: 0
  };
  const r = Array.from(run_machine(m));
  return r;
};

const part1 = (input0: Input): any => {
  return exec1(input0, 1);
};

const part2 = (input0: Input): any => {
  return exec1(input0, 2);
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("9.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input, output;
  input = `109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99`;
  output = input.split(",").map(Number);
  assertEquals(exec1(parse_input(input), 1), output);

  input = `1102,34915192,34915192,7,4,7,99,0`;
  assertEquals(exec1(parse_input(input), 1), [1219070632396864]);

  input = `104,1125899906842624,99`;
  assertEquals(exec1(parse_input(input), 1), [1125899906842624]);
}
