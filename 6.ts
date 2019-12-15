import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Board = Map<string, string[]>;

type Input = string[][];

const parse_input = (input: string): Input => {
  const ret = [];
  for (const line of input.split(/\r?\n/)) {
    const m = line.match(/^(\S+)\)(\S+)$/);
    if (!m) throw Error(line);
    const r = [m[1], m[2]];
    ret.push(r);
  }
  return ret;
};

const exec1 = (input: Board, path: string[]): any => {
  let sum = 0;
  const adj = input.get(path[path.length - 1]) || [];
  for (const x of adj) {
    sum += path.length;
    sum += exec1(input, [...path, x]);
  }
  return sum;
};

const part1 = (input0: Input): any => {
  const map = new Map<string, string[]>();
  for (const x of input0) {
    const n: string[] = map.get(x[0]) || [];
    n.push(x[1]);
    map.set(x[0], n);
  }
  return exec1(map, ["COM"]);
};

const exec2 = (input: Board, target: string, path: string[]): any => {
  const adj = input.get(path[path.length - 1]) || [];
  for (const x of adj) {
    if (path.indexOf(x) !== -1) continue;
    if (x === target) {
      return [...path, x];
    } else {
      const r = exec2(input, target, [...path, x]);
      if (r) {
        return r;
      }
    }
  }
  return null;
};

const part2 = (input0: Input): any => {
  const map = new Map<string, string[]>();
  for (const x of input0) {
    const f = x => {
      const n: string[] = map.get(x[0]) || [];
      if (n.indexOf(x[1]) === -1) {
        n.push(x[1]);
      }
      map.set(x[0], n);
    };
    f(x);
    f(x.reverse());
  }
  const r = exec2(map, "SAN", ["YOU"]);
  return r ? r.length - 3 : null;
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/6.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input = null;
  input = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`;
  assertEquals(part1(parse_input(input)), 42);

  input = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
K)YOU
I)SAN`;
  assertEquals(part2(parse_input(input)), 4);
}
