import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = number[];

const parse_input = (input: string): Input => {
  const lines = input.split("-");
  return lines.map(x => parseInt(x));
};

const range = function*(input: Input): IterableIterator<[number, number[]]> {
  for (let a = 1; a < 10; a++) {
    for (let b = a; b < 10; b++) {
      for (let c = b; c < 10; c++) {
        for (let d = c; d < 10; d++) {
          for (let e = d; e < 10; e++) {
            for (let f = e; f < 10; f++) {
              const num = [a, b, c, d, e, f];
              const n = parseInt(num.join(""));
              if (n > input[1]) {
                return;
              } else if (n >= input[0]) {
                yield [n, num];
              }
            }
          }
        }
      }
    }
  }
};

const part1 = (input: Input): any => {
  let count = 0;
  for (const [n, [a, b, c, d, e, f]] of range(input)) {
    const r = a == b || b == c || c == d || d == e || e == f;
    if (r) {
      count += 1;
    }
  }
  return count;
};

const part2 = (input: Input): any => {
  let count = 0;
  for (const [n, num] of range(input)) {
    const [a, b, c, d, e, f] = num;
    const r = a == b || b == c || c == d || d == e || e == f;
    const res = num.map(x => new RegExp(`(^|[^${x}])${x}${x}([^${x}]|$)`));
    const s = n.toString();
    const r2 = res.map(x => s.match(x)).some(x => !!x);
    if (r && r2) {
      count += 1;
    }
  }
  return count;
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("4.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input;
  input = ``;
  //   assertEquals(part1(parse_input(input)), null);

  input = ``;
  //   assertEquals(part2(parse_input(input)), null);
}
