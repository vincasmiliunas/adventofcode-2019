import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = number[];

const parse_input = (input: string): Input => {
  const lines = input.split(",");
  return lines.map(x => parseInt(x));
};

const run = (input: Input, inp: number): [Input, number] => {
  let out = null;
  for (let i = 0; i < input.length; ) {
    const op = input[i] % 100;
    const ins = `0000${input[i]}`.split("").reverse();
    const get = x => (ins[x + 1] === "0" ? input[input[i + x]] : input[i + x]);
    switch (op) {
      case 1:
        input[input[i + 3]] = get(1) + get(2);
        i += 4;
        break;
      case 2:
        input[input[i + 3]] = get(1) * get(2);
        i += 4;
        break;
      case 3:
        input[input[i + 1]] = inp;
        i += 2;
        break;
      case 4:
        out = get(1);
        i += 2;
        break;
      case 5:
        if (get(1) !== 0) {
          i = get(2);
        } else {
          i += 3;
        }
        break;
      case 6:
        if (get(1) === 0) {
          i = get(2);
        } else {
          i += 3;
        }
        break;
      case 7:
        input[input[i + 3]] = get(1) < get(2) ? 1 : 0;
        i += 4;
        break;
      case 8:
        input[input[i + 3]] = get(1) === get(2) ? 1 : 0;
        i += 4;
        break;
      case 99:
        return [input, out];
      default:
        throw new Error(`Invalid op:${op} ${input.slice(i)}`);
    }
  }
};

const part1 = (input0: Input): any => {
  const r = run([...input0], 1);
  return r ? r[1] : null;
};

const part2 = (input0: Input): any => {
  const r = run([...input0], 5);
  return r ? r[1] : null;
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("5.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input = null;

  input = `1002,4,3,4,33`;
  assertEquals(run(parse_input(input), 1)[0], [1002, 4, 3, 4, 99]);
  input = `3,0,4,0,99`;
  assertEquals(run(parse_input(input), 17)[1], 17);
  input = `3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99`;
  assertEquals(run(parse_input(input), 7)[1], 999);
  assertEquals(run(parse_input(input), 8)[1], 1000);
  assertEquals(run(parse_input(input), 9)[1], 1001);
}
