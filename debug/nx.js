const { readFileSync, writeFileSync } = require("fs");

// writeFileSync(
//   "data.json",
//   "" //+ JSON.stringify(JSON.parse(readFileSync("data.json").toString()))
// );

// const btoa = (str) => Buffer.from(str, 'base64')


const toHex = (x) => parseInt(x.toString().replace(".", "")).toString(16);
// const toDen = (x) =>

const chars = "0123456789-+,|.";
const encode = {
  cantorPair(x, y) {
    return ((x + y) * (x + y + 1)) / 2 + y;
  },
  cantorCompress(s) {
    console.log("compressing");
    let compressed = "";
    for (let i = 0; i < s.length; i += 2) {
      // const c = s[i];
      if (s[i + 1]) {
        compressed += eval(
          `"\\u{${this.cantorPair(chars.indexOf(s[i]), chars.indexOf(s[i + 1]))
            .toString(16)
            .padStart(4, "0")}}"`
        );
      } else {
        compressed += s[i]
      }
    }
    return (s.length % 2 === 0 ? "0" : "1") + compressed;
  },
  encodePoints(ps) {
    let fp = [];
    let fxsign = ps.map((p, i) => ({ i: i, ...p })).find((p) => p.x !== 0);
    let fysign = ps.map((p, i) => ({ i: i, ...p })).find((p) => p.y !== 0);
    let fsign = fysign.i < fxsign.i ? fysign.y : fxsign.x;
    let sign = null;
    // console.log(sign);
    // sign = sign<0?'-':'+';
    const pushh = (n) => {
      const sameSign = (sign === "+" && n > 0) || (sign === "-" && n < 0);
      let nn = n;
      // n = n.toString(16)
      // console.log(sameSign);
      if (sameSign) {
        fp.push(
          n.toString().startsWith("-")
            ? n.toString().replace("-", "")
            : n.toString()
        );
      } else if (n === 0) {
        // console.log(fsign);
        sign = fsign < 0 ? "-" : "+";
        fp.push(sign + n);
      } else {
        sign = nn < 0 ? "-" : "+";
        fp.push((nn < 0 ? "" : "+") + n);
      }
    };
    ps.forEach((p) => {
      pushh(parseFloat(p.x.toFixed(3)));
      pushh(parseFloat(p.y.toFixed(3)));
    });
    return fp;
  },
  encodeGhost(d) {
    let g = [];
    d.forEach((f) =>
      g.push(
        this.encodePoints(f.car),
        this.encodePoints(f.t1),
        this.encodePoints(f.t2)
      )
    );
    return this.cantorCompress(g.join("|"));
  },
};

const decode = {
  cantorDepair(z) {
    const w = Math.floor((-1 + Math.sqrt(1 + 8 * z)) / 2);
    const y = z - (w * (w + 1)) / 2;
    return { x: w - y, y };
  },
  cantorDecompress(s) {
    let d = "";
    for (let i = 1; i < s.length - (s[0] === "1" ? 1 : 0); i++) {
      const c = s[i].charCodeAt(0);
      const { x: a, y: b } = this.cantorDepair(c);
      d += chars[a]//eval(`"\\u{${a.toString(16).padStart(4, "0")}}"`);
      d += chars[b] //eval(`"\\u{${b.toString(16).padStart(4, "0")}}"`);
      // console.log(c.toString(16), a, b);
      // console.log(d);
    }
    if (s[0] === "1") {
      // console.log(s[s.length-1]);
      d+=s[s.length-1]
    }
    return d 
  },
  decodePoints(ps) {
    const points = [];
    let sign = ps[0][0];
    // console.log(sign);
    const signn = (x) => {
      const s = sign === "-" ? -1 : 1;
      if (!(x.startsWith("+") || x.startsWith("-"))) {
        return parseFloat(x) * s;
      }
      sign = x[0];
      return parseFloat(x);
    };
    for (let i = 0; i < ps.length; i += 2) {
      points.push({ x: signn(ps[i]), y: signn(ps[i + 1]) });
    }
    return points;
  },
  decodeGhost(d) {
    // console.log( this.cantorDecompress(d));
    d = this.cantorDecompress(d)
      .split("|")
      .map((p) => p.split(","));
    const ghost = [];
    for (let i = 0; i < d.length; i += 3) {
      ghost.push({
        car: this.decodePoints(d[i]),
        t1: this.decodePoints(d[i + 1]),
        t2: this.decodePoints(d[i + 2]),
      });
    }
    return ghost;
  },
};

const data = JSON.parse(readFileSync("data.json").toString());

writeFileSync("nd.txt", encode.encodeGhost(data));
console.log(
  JSON.stringify(data) ===
    JSON.stringify(decode.decodeGhost(encode.encodeGhost(data)))
);
console.log(
  JSON.stringify(data).length,
  encode.encodeGhost(data).length,
  encode.encodeGhost(data).length - JSON.stringify(data).length
);

writeFileSync(
  "ndw.json",
  JSON.stringify(decode.decodeGhost(encode.encodeGhost(data)), null, 4)
);

// console.log(((2345345).toString(16)));
// 17834948 3638734 -14196214