import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = number[];

const parse_input = (input: string): Input => {
  const lines = input.split(",");
  return lines.map(x => parseInt(x));
};

const exec1 = (input: Input): Input => {
  for (let i = 0; i < input.length; ) {
    switch (input[i]) {
      case 1:
        input[input[i + 3]] = input[input[i + 1]] + input[input[i + 2]];
        i += 4;
        break;
      case 2:
        input[input[i + 3]] = input[input[i + 1]] * input[input[i + 2]];
        i += 4;
        break;
      case 99:
        return input;
      default:
        return null;
    }
  }
};

const part1 = (input0: Input): number => {
  const input = [...input0];
  input[1] = 12;
  input[2] = 2;
  const r = exec1(input);
  return r !== null ? r[0] : null;
};

const target = 19690720;

const exec2 = (input0: Input, noun: number, verb: number): number => {
  const input = [...input0];
  input[1] = noun;
  input[2] = verb;
  const r = exec1(input);
  return r[0] === target ? 100 * noun + verb : null;
};

const part2 = (input0: Input): number => {
  for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
      const r = exec2(input0, noun, verb);
      if (r !== null) {
        return r;
      }
    }
  }
  return null;
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/2.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let output = null;
  assertEquals(exec1(parse_input(`1,0,0,0,99`)), [2, 0, 0, 0, 99]);
  assertEquals(exec1(parse_input(`2,3,0,3,99`)), [2, 3, 0, 6, 99]);
  assertEquals(exec1(parse_input(`2,4,4,5,99,0`)), [2, 4, 4, 5, 99, 9801]);
  output = [30, 1, 1, 4, 2, 5, 6, 0, 99];
  assertEquals(exec1(parse_input(`1,1,1,4,99,5,6,0,99`)), output);
}
