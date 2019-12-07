import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = number[];

const parse_input = (input: string): Input => {
  const lines = input.split(",");
  return lines.map(x => parseInt(x));
};

type Machine = {
  mem: number[];
  input: number[];
  output?: Iterator<number>;
  last_output?: number;
  done: boolean;
};

const run_machine = function*(state: Machine): IterableIterator<number> {
  const { mem } = state;
  let ip = 0;
  while (true) {
    const op = mem[ip] % 100;
    const ins = `0000${mem[ip]}`.split("").reverse();
    const get = x => (ins[x + 1] === "0" ? mem[mem[ip + x]] : mem[ip + x]);
    switch (op) {
      case 1:
        mem[mem[ip + 3]] = get(1) + get(2);
        ip += 4;
        break;
      case 2:
        mem[mem[ip + 3]] = get(1) * get(2);
        ip += 4;
        break;
      case 3:
        assert(state.input.length > 0);
        mem[mem[ip + 1]] = state.input.shift();
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
        mem[mem[ip + 3]] = get(1) < get(2) ? 1 : 0;
        ip += 4;
        break;
      case 8:
        mem[mem[ip + 3]] = get(1) === get(2) ? 1 : 0;
        ip += 4;
        break;
      case 99:
        state.done = true;
        return;
      default:
        throw new Error(`Invalid op:${op} ${mem.slice(ip)}`);
    }
  }
};

const run_phases = (input0: Input, phases: number[]): number => {
  const machines = phases.map(phase => {
    const m: Machine = {
      mem: [...input0],
      input: [phase],
      done: false
    };
    m.output = run_machine(m);
    return m;
  });
  machines[0].input.push(0);
  while (true) {
    if (machines.every(x => x.done)) {
      const machine = machines[machines.length - 1];
      return machine.last_output;
    }
    for (let i = 0; i < machines.length; i += 1) {
      const machine = machines[i];
      if (!machine.done) {
        machine.output.next();
      }
      const j = (i + 1) % machines.length;
      machines[j].input.push(machine.last_output);
    }
  }
};

const range = function*(): IterableIterator<number[]> {
  for (let a = 0; a < 5; a++) {
    for (let b = 0; b < 5; b++) {
      for (let c = 0; c < 5; c++) {
        for (let d = 0; d < 5; d++) {
          for (let e = 0; e < 5; e++) {
            const num = [a, b, c, d, e];
            const nn = new Set(num);
            if (nn.size !== 5) continue;
            yield num;
          }
        }
      }
    }
  }
};

const exec1 = (input0: Input): [number[], number] => {
  let ret: [number[], number] = [[], 0];
  for (const phases of range()) {
    const r = run_phases(input0, phases);
    if (r > ret[1]) {
      ret = [phases, r];
    }
  }
  return ret;
};

const part1 = (input0: Input): any => {
  const r = exec1(input0);
  return r[1];
};

const exec2 = (input0: Input): [number[], number] => {
  let ret: [number[], number] = [[], 0];
  for (let phases of range()) {
    phases = phases.map(x => x + 5);
    const r = run_phases(input0, phases);
    if (r > ret[1]) {
      ret = [phases, r];
    }
  }
  return ret;
};

const part2 = (input0: Input): any => {
  const r = exec2(input0);
  return r[1];
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("7.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input = null;
  input = `3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0`;
  assertEquals(run_phases(parse_input(input), [4, 3, 2, 1, 0]), 43210);
  assertEquals(exec1(parse_input(input)), [[4, 3, 2, 1, 0], 43210]);

  input = `3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0`;
  assertEquals(run_phases(parse_input(input), [0, 1, 2, 3, 4]), 54321);
  assertEquals(exec1(parse_input(input)), [[0, 1, 2, 3, 4], 54321]);

  input = `3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0`;
  assertEquals(run_phases(parse_input(input), [1, 0, 4, 3, 2]), 65210);
  assertEquals(exec1(parse_input(input)), [[1, 0, 4, 3, 2], 65210]);

  input = `3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5`;
  assertEquals(exec2(parse_input(input)), [[9, 8, 7, 6, 5], 139629729]);
  assertEquals(run_phases(parse_input(input), [9, 8, 7, 6, 5]), 139629729);
  input = `3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10`;
  assertEquals(run_phases(parse_input(input), [9, 7, 8, 5, 6]), 18216);
  assertEquals(exec2(parse_input(input)), [[9, 7, 8, 5, 6], 18216]);
}
