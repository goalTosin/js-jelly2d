// const encode = {
//   encodePoints(ps) {
//     let fp = [];
//     ps.forEach((p) => fp.push(parseFloat(p.x.toFixed(5)), p.y.toFixed(5)));
//     return fp;
//   },
//   encodeGhost(d) {
//     let g = [];
//     d.forEach((f) =>
//       g.push(
//         this.encodePoints(f.car),
//         this.encodePoints(f.t1),
//         this.encodePoints(f.t2)
//       )
//     );
//     return JSON.stringify(g);
//   },
// };

// const decode = {
//   decodePoints(ps) {
//     const points = [];
//     for (let i = 0; i < ps.length; i += 2) {
//       points.push({ x: ps[i], y: ps[i + 1] });
//     }
//     return points;
//   },
//   decodeGhost(d) {
//     d = JSON.parse(d);
//     const ghost = [];
//     for (let i = 0; i < d.length; i += 3) {
//       ghost.push({
//         car: this.decodePoints(d[i]),
//         t1: this.decodePoints(d[i + 1]),
//         t2: this.decodePoints(d[i + 2]),
//       });
//     }
//     return ghost;
//   },
// };
let percent = "";

const chars = "0123456789-+,|.";
const encode = {
  cantorPair(x, y) {
    return ((x + y) * (x + y + 1)) / 2 + y;
  },
  async cantorCompress(s) {
    console.log("compressing");
    let compressed = "";
    await asyncLoop(0, s.length, 2, (i) => {
      // const c = s[i];
      if (s[i + 1]) {
        compressed += eval(
          `"\\u{${this.cantorPair(chars.indexOf(s[i]), chars.indexOf(s[i + 1]))
            .toString(16)
            .padStart(4, "0")}}"`
        );
      } else {
        compressed += s[i];
      }
      percent = ((i / (s.length - 1)) * 100).toFixed(1);
    });
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
    // console.log('last');
    ps.forEach((p) => {
      // let p = ps[i];
      pushh(parseFloat(p.x).toFixed(3));
      pushh(parseFloat(p.y).toFixed(3));
    });
    return fp;
  },
  async encodeGhost(d) {
    let g = [];
    // console.log('working1');
    asyncLoop(0, d.length, 1, (i) => {
      let t = Date.now();
      const f = d[i];
      g.push(
        this.encodePoints(f.car),
        this.encodePoints(f.t1),
        this.encodePoints(f.t2)
      );
      let p = Date.now() - t;
      percent = p + " " + ((i / (d.length - 1)) * 100).toFixed(1);
      // console.log('working');
      // Math.random()<0.5&&(g=[])
    });
    return await this.cantorCompress(g.join("|"));
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
      d += chars[a]; //eval(`"\\u{${a.toString(16).padStart(4, "0")}}"`);
      d += chars[b]; //eval(`"\\u{${b.toString(16).padStart(4, "0")}}"`);
      // console.log(c.toString(16), a, b);
      // console.log(d);
    }
    if (s[0] === "1") {
      // console.log(s[s.length-1]);
      d += s[s.length - 1];
    }
    return d;
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

window.encode = encode;
window.decode = decode;

// import PointMass from "./pointMass.js";
// import {SoftBody, NORMAL, STATIC } from "./softBody.js";
// import { Spring, Weld } from "./spring.js";
import Vec2 from "./vec2.js";
import {
  asyncLoop,
  deepCopy,
  setUpCanvasSizing,
  timeit,
  wrap,
} from "./utils.js";
import { Circle, Rectangle } from "./shapes.js";
import { World } from "./world.js";
import { Anchor } from "./anchor.js";
import { KINETIC, NORMAL, SoftBody } from "./softBody.js";
import { PointMass } from "./pointMass.js";
// import { GUI } from "./lil-gui.js";

const canvas = document.querySelector("canvas");
setUpCanvasSizing(canvas);
const ctx = canvas.getContext("2d");
const keysdown = {};
window.ctx = ctx;
// const gui = new GUI()
let u = false;
const camera = {
  x: 0,
  y: -canvas.height / 2,
  rot: 0,
  s: 0.3,
  ss: 0,
};

// let fs = [
//   1000/60,
//   200,300,500,10000
// ]
// let f = fs[0]
let stopped = false;
const world = new World(new Vec2(0, 0.25));
const recorder = [];
const th = 900;
let restored = false;
let rec = false;

const ra = 300;
const shape = [
  [0.3549140885943757, -0.3802650949225454],
  [0.43096710757888473, -0.20280805062535753],
  [0.5070201265633938, -0.02535100632816969],
  [0.6844771708605817, 0.025351006328169688],
  [0.8619342151577696, 0.07605301898450907],
  [0.8619342151577696, 0.22815905695352723],
  [0.8619342151577696, 0.3802650949225454],
  [0.7605301898450908, 0.3802650949225454],
  [0.659126164532412, 0.3802650949225454],
  [0.5070201265633938, 0.3802650949225454],
  [0.3549140885943757, 0.3802650949225454],
  [0, 0.3802650949225454],
  [-0.3549140885943757, 0.3802650949225454],
  [-0.5070201265633938, 0.3802650949225454],
  [-0.659126164532412, 0.3802650949225454],
  [-0.7605301898450908, 0.3802650949225454],
  [-0.8619342151577696, 0.3802650949225454],
  [-0.8619342151577696, 0.22815905695352723],
  [-0.8619342151577696, 0.07605301898450907],
  [-0.6844771708605817, 0.025351006328169688],
  [-0.5070201265633938, -0.02535100632816969],
  [-0.43096710757888473, -0.20280805062535753],
  [-0.3549140885943757, -0.3802650949225454],
  [0, -0.3802650949225454],
].map((p) => [p[0] * ra, p[1] * ra]);
// world.addBody(
// )
let shift = 500;
const carHull = new SoftBody(
  shape.map((p) => new PointMass(Vec2.from(p).add(shift, -2000), 10)),
  shape.map((p) => Vec2.from(p)),
  null,
  "carhull",
  false,
  "car"
);
// new Rectangle({
//   width: 400,
//   height: 75,
//   name: "carhull",
//   pos: new Vec2(0, -2000),
//   collisionFilter: "car",
//   // fixed: true,
// });
let r = 60;
let g = 30000;
const tyre1 = new Circle({
  rad: r,
  nSegs: 13,
  gas: g, //*(Math.random()*2+1),
  tenacity: 1,

  name: "t1",
  pos: new Vec2(-150 + shift, -2000),
  collisionFilter: "car",
});

const tyre2 = new Circle({
  rad: r,
  nSegs: 13,
  gas: g, //*(Math.random()*2+1),
  tenacity: 1,

  name: "t2",
  pos: new Vec2(150 + shift, -2000),
  collisionFilter: "car",
});
const anchorP = new Vec2(-160, 0);
world.addBody(tyre1);
world.addBody(tyre2);
world.addBody(carHull);
// const t1m = [0, 1, 6, 7, 8, 9];
// const t2m = [1, 2, 3, 4, 5, 6];

const sw = 0.2;
const t1m = [6, 7, 8, 9, 10].map((i) => i * 2);
const t1w = [sw, sw, sw - 0.1, 1, 1];
const t2m = [1, 2, 3, 4, 5].map((i) => i * 2);
const t2w = [1, 1, sw - 0.1, sw, sw];
world.anchorPairs.push([
  new Anchor(tyre1.points),
  new Anchor(
    carHull.points.filter((_, i) => t1m.includes(i)),
    t1w
    // carHull.points
    //   .filter((_, i) => t1m.includes(i))
    //   .map((p, i) => {
    //     return 1; //carHull.frame[i].clone().sub(new Vec2(-160, 0)).mag();
    //   })
  ),
]);
world.anchorPairs.push([
  new Anchor(tyre2.points),
  new Anchor(
    carHull.points.filter((_, i) => t2m.includes(i)),
    t2w
  ),
]);

function pointIt(mx, my) {
  return {
    x: (mx - canvas.width / 2) / camera.s + camera.x,
    y: (my - canvas.height / 2) / camera.s + camera.y,
  };
}
window.camera = camera;

let timeStart = NaN;

const lsn = "jelly-car-hs";
const lsg = "jelly-car-ghost";
let highScore = localStorage.getItem(lsn);
let finished = false;
let hs = 0;
let oldhs = wrap((v) => (v ? parseInt(v) : v), highScore);
let sp = 0;
// let savedGhost = wrap(
//   (v) => (v ? decode.decodeGhost(v) : v),
//   localStorage.getItem(lsg)
// );
let ghost = [];
function traceGhost(gp) {
  ctx.save();
  ctx.beginPath();
  // console.log(gp);
  gp.forEach((p, i) => {
    const a = i === 0 ? "mov" : "lin";
    ctx[a + "eTo"](p.x, p.y);
  });
  ctx.closePath();
  ctx.strokeStyle = "#ffffffa0";
  ctx.setLineDash([4 / camera.s / 2, 4 / camera.s / 2]);
  ctx.lineWidth = 2 / camera.s;
  ctx.stroke();
  ctx.restore();
}
let i = 0;
function animate() {
  camera.s *= 1 + camera.ss;
  camera.ss *= 0.7;
  if (!isNaN(mouseX)) {
    camera.x += ((mouseX - canvas.width / 2) * camera.ss) / camera.s;
    camera.y += ((mouseY - canvas.height / 2) * camera.ss) / camera.s;
  }
  // const c = ss.computeCenter();
  // ss.points.forEach((p) => {
  //   // console.log(tyre1.frame[i]);
  //   let unit = p.pos.clone().sub(c).unit().swap().mult(-1, 1);
  //   p.vel.add(unit.mult(0.11));
  // });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(camera.rot);
  ctx.scale(camera.s, camera.s);
  ctx.translate(-camera.x, -camera.y);
  // if (i % 1 === 0) {
  //   ghost.push({
  //     car: deepCopy(carHull.points.map((p) => p.pos)),
  //     t1: deepCopy(tyre1.points.map((p) => p.pos)),
  //     t2: deepCopy(tyre2.points.map((p) => p.pos)),
  //   });
  // }
  // const ind = Math.floor(i / 1);
  // if (savedGhost && savedGhost[ind]) {
  //   const int = {
  //     car: savedGhost[ind - 1] ? savedGhost[ind - 1].car : savedGhost[0].car,
  //     t1: savedGhost[ind - 1] ? savedGhost[ind - 1].t1 : savedGhost[0].t1,
  //     t2: savedGhost[ind - 1] ? savedGhost[ind - 1].t2 : savedGhost[0].t2,
  //   };
  //   traceGhost(
  //     savedGhost[ind].car.map((p, i) =>
  //       Vec2.from(p).add(
  //         Vec2.from(int.car[i])
  //           .sub(Vec2.from(p))
  //           .mult(i % 1)
  //       )
  //     )
  //   );
  //   traceGhost(savedGhost[ind].t1);
  //   traceGhost(savedGhost[ind].t2);
  // }
  // if (i) {
  i++;

  // }
  // const s = innerHeight / th;
  // ctx.scale(s, s);
  if (keysdown.ArrowUp || keysdown.KeyW) {
    sp += 0.2;
  } else if (keysdown.ArrowDown || keysdown.KeyS) {
    sp -= 0.2;
  }
  sp *= 0.95;
  drive(sp);
  if (keysdown.ArrowRight || keysdown.KeyD) {
    // animate();
    turn(0.2);
  }
  if (keysdown.ArrowLeft || keysdown.KeyA) {
    // animate();
    turn(-0.2);
  }

  world.update(ctx);
  function draw(ps, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(ps[0].pos.x, ps[0].pos.y);
    for (let i = 1; i < ps.length; i++) {
      ctx.lineTo(ps[i].pos.x, ps[i].pos.y);
    }
    ctx.closePath();
    if (fill !== "none") {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke !== "none") {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 7 / camera.s;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }
  draw(carHull.points, "orange", "black");
  draw(tyre1.points, "white", "black");
  draw(tyre2.points, "white", "black");
  draw(road.points, "black", "none");
  sss.forEach(ss => draw(ss.points, "white", "none"))
  // draw(ss.points, "black", "none");
  // world.debug(ctx, camera.s);
  if (!finished) {
    const c = carHull.computeCenter();
    camera.x = c.x;
    camera.y = c.y;
  }
  // ctx.beginPath()
  // ctx.arc(anchorP.x,anchorP.y,5, 0, Math.PI*2)
  // ctx.fillStyle = 'black'
  // ctx.fill();
  ctx.restore();
  let texts = [];
  if (!isNaN(timeStart) && !hs) {
    texts.push(timeit(Date.now() - timeStart));
    // ctx.fillText(((Date.now() - timeStart) / 1000).toFixed(2), 15, 15);
  } else {
    texts.push(timeit(hs));
  }
  if (highScore) {
    texts.push(timeit(highScore));
  }
  let x = 15;
  texts.forEach((t) => {
    ctx.textAlign = "start";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";
    ctx.font = "500 15px monospace";
    ctx.fillText(t, x, 15);
    x += ctx.measureText(t).width + 10;
  });
  if (finished) {
    //   const w = 400
    // const h =200
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000a0";
    ctx.fill();

    // ctx.beginPath()
    // ctx.roundRect(canvas.width / 2-w/2, canvas.height / 2-h/2, w, h, 10)
    // ctx.fillStyle = '#ffffff'
    // ctx.fill()
    // console.log(hs, oldhs, hs - oldhs);
    let p = oldhs ? ", " + timeit(hs - oldhs, true) : "";
    ctx.font = "900 40px Ubuntu";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Well done, you did it in " +
        timeit(hs) +
        p +
        (percent ? ". Saving data: " + percent : ""),
      canvas.width / 2,
      canvas.height / 2
    );
  }

  // ctx.textAlign = "start";
  // ctx.textBaseline = "top";
  // ctx.fillStyle = "white";
  // ctx.fillText(sp.toFixed(2) + "", 15, 15);

  if (rec) {
    recorder.push(JSON.parse(JSON.stringify(world)));
  }
  restored = true;
  if (!stopped) {
    window.h = requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
window.n = 1;
window.recorder = recorder;

addEventListener("click", () => {
  // confirm("copy?") && navigator.clipboard.writeText(JSON.stringify(ghost));
});

// const fn = (x) => {
//   x *= 0.2;
//   return (
//     ((Math.sin(x * 50) - 2) * 500 +
//       (Math.sin(x * 5) - 2) * 200 +
//       (Math.sin(x * 500) - 2) * 100) *
//       (Math.sin(x * 150) + 2) *
//       0.2 +
//     (Math.sin(x * 70) - 2) * 500
//   );
// };
const fn = (x) => {
  x *= 0.8;
  let p =
    ((Math.sin(x * 50) - 2) * 100 +
      (Math.sin(x * 5) - 2) * 200 +
      (Math.sin(x * 100) - 2) * 100 +
      (Math.sin(x * 10) - 2) * 10 +
      (Math.sin(x * 420) - 2) * 100) *
      (Math.sin(x * 130) + 2) *
      0.2 +
    (Math.sin(x * 100) - 2) * 100 +
    (Math.sin(x * -100) - 2) * 50 +
    (Math.sin(x * 150) - 2) * 250;
  x *= 0.45;
  x += 0.25443;
  return (
    (((Math.sin(x * 50) - 2) * 100 +
      (Math.sin(x * 5) - 2) * 200 +
      (Math.sin(x * 100) - 2) * 100 +
      (Math.sin(x * 10) - 2) * 10 +
      (Math.sin(x * 420) - 2) * 100) *
      (Math.sin(x * 130) + 2) *
      0.2 +
      (Math.sin(x * 100) - 2) * 100 +
      (Math.sin(x * -100) - 2) * 50 +
      (Math.sin(x * 150) - 2) * 250 +
      p) *
    0.05
  )-100;
};
const roadWidth = 500;
const ps = Array.from({ length: roadWidth + 1 }, (_, i) => {
  i = i;
  const x = i * 100 - 10 * 50;

  const y = fn(i / 200);
  return new Vec2(x, y);
});
ps.unshift(new Vec2(-500, 0));
ps.push(new Vec2(roadWidth * 100 - 10 * 50, 0));
const road = new SoftBody(
  ps.map((p) => new PointMass(p.clone(), 150)),
  ps.map((p) => p.clone()),
  NORMAL,
  null,
  true
);
road.collideEv = (b) => {
  if (isNaN(timeStart) && (b.name === "t1" || b.name === "t2")) {
    timeStart = Date.now();
  }
};
// road.fixed = true
// console.log(road.points);
world.addBody(
  road
  // new Rectangle({
  //   width: 1000,
  //   height: 100,
  //   name: "small",
  //   pos: new Vec2(0, 0),
  //   mass: 500,
  //   fixed: true,
  // })
);
const finish = new Rectangle({
  width: 100,
  height: 10000,
  name: "small",
  pos: new Vec2((roadWidth + 1) * 100 - 500 - 50, fn(1) - 5000),
  mass: 5,
  fixed: true,
  type: KINETIC,
  collideEv: (b) => {
    if (b.name === "carhull") {
      if (!finished) {
        finished = true;
        hs = Date.now() - timeStart;
        console.log(ghost.slice(0, 10));
        if (parseInt(highScore) > Date.now() - timeStart || highScore == null) {
          highScore = hs;
          localStorage.setItem(lsn, hs.toString());
          // encode.encodeGhost(ghost).then((v) => {
          //   localStorage.setItem(lsg, v);
          // });
          alert("New high score!");
          // console.log(ghost);
        }
        // setTimeout(() => {
      }
      //   alert("Finished in " + timeit(Date.now() - timeStart)) + "minutes";
      // }, 500);
    }
  },
});
world.addBody(finish);

let tr = 100;
const sss =Array.from({length: 30}).map((_, i) => {
  return new Circle({
    rad: tr,
    nSegs: 10,
    gas: 100 ** 2 * 4, //*(Math.random()*2+1),
    tenacity: 1,
  
    name: "beeeg",
    pos: new Vec2(shift + i * 200, tr / 2 - 1000),
  })
});
console.log(sss);
// s.points.forEach(p=>p.vel.add(0, 20))
sss.forEach(ss => world.addBody(ss))

addEventListener("click", (ev) => {
  const p = pointIt(ev.clientX, ev.clientY);
  // console.log(p);
  // if (nextShape() === "rect") {
  if (Math.random() < 0) {
    const sb = new Rectangle({
      width: 450,
      height: 100,
      name: "small",
      pos: new Vec2(p.x, p.y),
      mass: 5,

      // fixed: true,
    });

    world.addBody(sb);
  } else {
    let r = 100;
    const ss = new Circle({
      rad: r,
      nSegs: 13 + Math.floor(Math.random() * 2),
      gas: r ** 2 * 3, //*(Math.random()*2+1),
      tenacity: 1,

      name: "small",
      pos: new Vec2(p.x, p.y),
    });
    // s.points.forEach(p=>p.vel.add(0, 20))
    world.addBody(ss);
    if (!u) {
      // gui.add(world.bodies[0], 'gas').min(100**2).step(300).name('Gas amount')
      u = true;
    }
  }
});
let shap = null;
let count = 0;

function nextShape() {
  count++;
  // return count === 1 ? "circle" : "rect";
  if (shap) {
    return shap;
  }
  return count < 3
    ? count === 1
      ? "circle"
      : "rect"
    : Math.random() < 0.5
    ? "rect"
    : null;
}
window.world = world;
function stop() {
  cancelAnimationFrame(window.h);
}
window.stop = stop;

function drive(av) {
  const doit = (tyre, r = 1) => {
    const c = tyre.computeCenter();
    for (let i = 0; i < tyre.points.length; i++) {
      const point = tyre.points[i];
      // console.log(tyre1.frame[i]);
      let unit = point.pos.clone().sub(c).unit().swap().mult(-1, 1);
      point.vel.add(unit.mult(av * r));
    }
  };

  doit(tyre1);
  doit(tyre2);
}
function brake(tyre, m) {
  for (let i = 0; i < tyre.points.length; i++) {
    const c = tyre.computeCenter();
    const point = tyre.points[i];
    // console.log(tyre1.frame[i]);
    let unit = point.pos.clone().sub(c);
    point.vel.sub(unit.mult(1 - m));
  }
}
function turn(av) {
  const c = carHull.computeCenter();
  for (let i = 0; i < carHull.points.length; i++) {
    const point = carHull.points[i];
    // console.log(tyre1.frame[i]);
    let unit = point.pos.clone().sub(c).unit().swap().mult(-1, 1);
    point.vel.add(unit.mult(av));
  }
}
function keyed(ev) {
  keysdown[ev.code] = ev.type === "keydown";
}

addEventListener("keydown", (ev) => {
  if (ev.key === " ") {
    // f = fs[(fs.indexOf(f)+1)%fs.length]
    stopped = !stopped;
    !stopped ? animate() : stop();
    // setTimeout(() => window.h = setTimeout(animate, f))
    // console.log(f);
  }
  keyed(ev);
  if (ev.code === "Enter") {
    animate();
  }
  // if (isNaN(timeStart)) {
  //   timeStart = Date.now();
  //   // alert('hey')
  // }
  if (ev.code === "KeyM") {
    window.rec === null && window.rec === undefined && (window.rec = false);
    window.rec = !window.rec;
  }
  if (ev.code === "KeyB") {
    // shap = "rect";
    // console.log("rect now");
    brake(tyre2, 0.1);
  }
  if (ev.code === "KeyC") {
    shap = "circle";
    console.log("circle now");
  }
  if (ev.code === "KeyR") {
    shap = null;
    console.log("rand now");
  }
  if (ev.code === "KeyS") {
    rec = !rec;
  }
  if (ev.code === "KeyE") {
    ss.gas += 1000;
  }
  if (ev.code === "KeyQ") {
    ss.gas -= 1000;
  }
});

addEventListener("keyup", (ev) => {
  keyed(ev);
});
addEventListener("wheel", (ev) => {
  camera.ss += -Math.sign(ev.deltaY) * 0.05;
});
addEventListener("contextmenu", (ev) => {
  ev.preventDefault();
});

let mouseX = NaN;
let mouseY = NaN;
let l = false;
// let pointerDown = false
let dragging = false;
addEventListener("pointerdown", (ev) => {
  if (ev.which === 3) {
    dragging = true;
  }
  mouseX = ev.clientX;
  mouseY = ev.clientY;
  canvas.requestPointerLock();
  l = true;
  //  else {
  // pointIt(ev.clientX, ev.clientY);
  // pointerDown = true;
  // }
});

addEventListener("mousemove", (ev) => {
  // if (pointerDown) {
  //   pointIt(ev.clientX, ev.clientY);
  // }
  if (l) {
    mouseX += ev.movementX;
    mouseY += ev.movementY;
  if (dragging) {
    camera.x -= ev.movementX / camera.s;
    camera.y -= ev.movementY/ camera.s;
  }
  } else {
  if (dragging) {
    camera.x -= (ev.clientX - mouseX) / camera.s;
    camera.y -= (ev.clientY - mouseY) / camera.s;
  }
    mouseX = ev.clientX;
    mouseY = ev.clientY;
  }
});
addEventListener("pointerup", (ev) => {
  if (ev.which === 3) {
    dragging = false;
  }
  l = false;
  document.exitPointerLock();
  // else {
  // pointerDown = false;
  // }
});

// window.f = f
