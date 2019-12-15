import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = string[][];

const parse_input = (input: string): Input => {
  return input.split(/\r?\n/).map(x => x.split(","));
};

type BoardEntry = {
  id: number;
  step: number;
};

type Board = Map<string, BoardEntry[]>;

const part1 = (input: Input): any => {
  const board = draw(input);
  const ext = (x: string): [number, number] => {
    return x.split("x").map(z => parseInt(z)) as [number, number];
  };
  const r1 = Array.from(board.entries())
    .filter(x => x[1].length > 1)
    .map(x => ext(x[0]));
  const r2 = r1.map(x => Math.abs(x[0]) + Math.abs(x[1]));
  r2.sort((a, b) => a - b);
  return r2[0];
};

const draw = (input: Input): Board => {
  const board = new Map<string, BoardEntry[]>();
  let id = 0;
  for (const wire of input) {
    id += 1;
    let pp = [0, 0];
    let step = 0;
    for (const q of wire) {
      const d = (() => {
        switch (q[0]) {
          case "D":
            return [0, 1];
          case "U":
            return [0, -1];
          case "R":
            return [1, 0];
          case "L":
            return [-1, 0];
          default:
            throw new Error(q);
        }
      })();
      for (let i = 0; i < parseInt(q.slice(1)); i += 1) {
        step += 1;
        pp[0] += d[0];
        pp[1] += d[1];
        const key = pp.join("x");
        let r = board.get(key) || [];
        if (!r.find(w => w.id === id)) {
          r.push({
            id,
            step
          });
          board.set(key, r);
        }
      }
    }
  }
  return board;
};

const part2 = (input: Input): any => {
  const board = draw(input);
  const r1 = Array.from(board.entries())
    .filter(x => x[1].length > 1)
    .map(x => x[1].reduce((s, z) => s + z.step, 0));
  r1.sort((a, b) => a - b);
  return r1[0];
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/3.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input;
  input = `R75,D30,R83,U83,L12,D49,R71,U7,L72
U62,R66,U55,R34,D71,R55,D58,R83`; // = distance 159
  assertEquals(part1(parse_input(input)), 159);
  assertEquals(part2(parse_input(input)), 610);
  input = `R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
U98,R91,D20,R16,D67,R40,U7,R15,U6,R7`; // = distance 135
  assertEquals(part1(parse_input(input)), 135);
  assertEquals(part2(parse_input(input)), 410);
  input = `R8,U5,L5,D3
U7,R6,D4,L4`; // = distance 135
  assertEquals(part1(parse_input(input)), 6);
  assertEquals(part2(parse_input(input)), 30);
}
