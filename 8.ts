import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Input = number[];

const parse_input = (input: string): Input => {
  const lines = input.split("");
  return lines.map(x => parseInt(x));
};

const part1 = (input0: Input, dim: [number, number]): any => {
  const [w, h] = dim;
  const num = input0.length / w / h;
  const layers = [];
  for (let i = 0; i < num; i++) {
    const r = input0.slice(i * w * h, i * w * h + w * h);
    layers.push(r);
  }
  const ls = layers.map(z => z.reduce((s, x) => s + (x === 0 ? 1 : 0), 0));
  const min = Math.min(...ls);
  const i = ls.findIndex(x => x === min);
  const a = layers[i].reduce((s, x) => s + (x === 1 ? 1 : 0), 0);
  const b = layers[i].reduce((s, x) => s + (x === 2 ? 1 : 0), 0);
  return a * b;
};

const part2 = (input0: Input, dim: [number, number]): any => {
  const [w, h] = dim;
  const num = input0.length / w / h;
  const range = [...Array(num).keys()];
  const image = [...Array(w * h).keys()];
  for (let i = 0; i < w * h; i++) {
    const ls = range.map(j => input0[j * w * h + i]);
    const r = ls.find(x => x !== 2);
    image[i] = r;
  }
  const ret = [""];
  for (let i = 0; i < h; i++) {
    const r = image
      .slice(i * w, i * w + w)
      .map(x => " #"[x])
      .join("");
    ret.push(r);
  }
  return ret.join("\n");
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/8.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input, [25, 6]));
  p(`Part2:`, part2(input, [25, 6]));
}
