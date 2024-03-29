import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

const p = (...x) => console.log(...x);

type Entry = {
  amount: number;
  name: string;
};
type Reaction = {
  id: number;
  lhs: Entry[];
  rhs: Entry;
};
type Input = Reaction[];

const parse_input = (input: string): Input => {
  const ret = [];
  let id = 0;
  for (const line of input.split(/\r?\n/)) {
    const m = line.match(/^([\s\S]+) => ([\s\S]+)$/);
    if (!m) throw Error(line);
    const f = x => {
      const m = x.match(/^(\d+) ([A-Z]+)$/);
      if (!m) throw Error(x);
      return { amount: Number(m[1]), name: m[2] };
    };
    const lhs = m[1].split(", ").map(f);
    const rhs = f(m[2]);
    const r = {
      id: ++id,
      lhs,
      rhs
    };
    ret.push(r);
  }
  return ret;
};

const resolve = (input: Input, inv: Map<string, number>, what: Entry): any => {
  const react = input.find(x => x.rhs.name === what.name);
  const k =
    Math.floor(what.amount / react.rhs.amount) +
    (what.amount % react.rhs.amount ? 1 : 0);
  for (const that of react.lhs) {
    const amount = that.amount * k;
    const left = (inv.get(that.name) || 0) - amount;
    inv.set(that.name, left);
    if (left < 0 && that.name !== "ORE") {
      resolve(input, inv, { ...that, amount: -left });
    }
  }
  const n = (inv.get(what.name) || 0) + react.rhs.amount * k;
  inv.set(what.name, n);
};

const run = (input: Input, amount: number): any => {
  const inv = new Map();
  resolve(input, inv, { amount, name: "FUEL" });
  return -inv.get("ORE");
};

const part1 = (input: Input): any => {
  return run(input, 1);
};

const part2 = (input: Input): any => {
  const target = 1000000000000;
  let fuel = 1;
  while (true) {
    const ore0 = run(input, fuel);
    const ore1 = run(input, fuel + 1);
    if (ore0 <= target && ore1 > target) {
      return fuel;
    }
    const diff = ore1 - ore0;
    const r = Math.floor((target - ore0) / diff);
    const rr = r ? r : Math.sign(target - ore0);
    fuel += rr;
  }
};

{
  const utf8_decoder = new TextDecoder();
  const input0 = utf8_decoder.decode(Deno.readFileSync("input/14.txt"));
  const input = parse_input(input0);
  // p("input", input);
  p(`Part1:`, part1(input));
  p(`Part2:`, part2(input));
}

{
  let input = null;

  input = `17 ORE => 1 FUEL`;
  assertEquals(part1(parse_input(input)), 17);

  input = `17 ORE => 7 A
5 A => 1 FUEL`;
  assertEquals(part1(parse_input(input)), 17);

  input = `17 ORE => 3 A
5 A => 1 FUEL`;
  assertEquals(part1(parse_input(input)), 34);

  input = `10 ORE => 10 A
1 ORE => 1 B
7 A, 1 B => 1 C
7 A, 1 C => 1 D
7 A, 1 D => 1 E
7 A, 1 E => 1 FUEL`;
  assertEquals(part1(parse_input(input)), 31);

  input = `9 ORE => 2 A
8 ORE => 3 B
7 ORE => 5 C
3 A, 4 B => 1 AB
5 B, 7 C => 1 BC
4 C, 1 A => 1 CA
2 AB, 3 BC, 4 CA => 1 FUEL`;
  assertEquals(part1(parse_input(input)), 165);

  input = `157 ORE => 5 NZVS
165 ORE => 6 DCFZ
44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
179 ORE => 7 PSHF
177 ORE => 5 HKGWZ
7 DCFZ, 7 PSHF => 2 XJWVT
165 ORE => 2 GPVTF
3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`;
  assertEquals(part1(parse_input(input)), 13312);
  assertEquals(part2(parse_input(input)), 82892753);

  input = `2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
17 NVRVD, 3 JNWZP => 8 VPVL
53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
22 VJHF, 37 MNCFX => 5 FWMGM
139 ORE => 4 NVRVD
144 ORE => 7 JNWZP
5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
145 ORE => 6 MNCFX
1 NVRVD => 8 CXFTF
1 VJHF, 6 MNCFX => 4 RFSQX
176 ORE => 6 VJHF`;
  assertEquals(part1(parse_input(input)), 180697);
  assertEquals(part2(parse_input(input)), 5586022);

  input = `171 ORE => 8 CNZTR
7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
114 ORE => 4 BHXH
14 VRPVC => 6 BMBT
6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
5 BMBT => 4 WPTQ
189 ORE => 9 KTJDG
1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
12 VRPVC, 27 CNZTR => 2 XDBXC
15 KTJDG, 12 BHXH => 5 XCVML
3 BHXH, 2 VRPVC => 7 MZWV
121 ORE => 7 VRPVC
7 XCVML => 6 RJRHP
5 BHXH, 4 VRPVC => 5 LTCX`;
  assertEquals(part1(parse_input(input)), 2210736);
  assertEquals(part2(parse_input(input)), 460664);
}
