import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = number[];

const parse_input = (input: string): Input => {
  return input
    .split("\n")
    .filter(x => x)
    .map(x => parseInt(x));
};

const fuel = (input: Input): Input => {
  return input.map(x => Math.max(Math.floor(x / 3) - 2, 0));
};

const part1 = (input: Input): number => {
  return fuel(input).reduce((s, x) => s + x, 0);
};

const part2 = (input: Input): number => {
  let sum = 0;
  while (true) {
    input = fuel(input);
    const r = input.reduce((s, x) => s + x, 0);
    if (!r) return sum;
    sum += r;
  }
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("1.txt"));
  const input = parse_input(input0);
  // p('input', input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  assertEquals(part1(parse_input(`12`)), 2);
  assertEquals(part1(parse_input(`14`)), 2);
  assertEquals(part1(parse_input(`1969`)), 654);
  assertEquals(part1(parse_input(`100756`)), 33583);

  assertEquals(part2(parse_input(`100756`)), 50346);
}
