// import PointMass from "./pointMass.js";
// import {SoftBody, NORMAL, STATIC } from "./softBody.js";
// import { Spring, Weld } from "./spring.js";
import Vec2 from "./vec2.js";
import { setUpCanvasSizing } from "./utils.js";
import { Circle, Rectangle } from "./shapes.js";
import { World } from "./world.js";
import { Anchor } from "./anchor.js";
import { NORMAL, SoftBody } from "./softBody.js";
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
  y: 0,
  rot: 0,
  s: 1,
  ss: 0,
};

// let fs = [
//   1000/60,
//   200,300,500,10000
// ]
// let f = fs[0]
let stopped = false;
const world = new World(new Vec2(0, 0.125));
const recorder = [];
const th = 900;
let restored = false;
let rec = false;

const ra = 300;
const shape = [
  [0.3549140885943757, -0.3802650949225454],
  [0.5070201265633938, -0.02535100632816969],
  [0.8619342151577696, 0.07605301898450907],
  [0.8619342151577696, 0.3802650949225454],
  [0.3549140885943757, 0.3802650949225454],
  [0.659126164532412, 0.3802650949225454],
  [-0.659126164532412, 0.3802650949225454],
  [-0.3549140885943757, 0.3802650949225454],
  [-0.8619342151577696, 0.3802650949225454],
  [-0.8619342151577696, 0.07605301898450907],
  [-0.5070201265633938, -0.02535100632816969],
  [-0.3549140885943757, -0.3802650949225454],
].map((p) => [p[0] * ra, p[1] * ra]);
const carHull =
//  new SoftBody(
//   shape.map((p) => new PointMass(Vec2.from(p).add(0, -2000), 0.1)),
//   shape.map((p) => Vec2.from(p)),
//   null,
//   "",
//   false,
//   "car"
// );
 new Rectangle({
  width: 450,
  height: 75,
  name: "hull",
  pos: new Vec2(0, -2000),
  collisionFilter: "car",
  // fixed: true,
});
let r = 130;
const tyre1 = new Circle({
  rad: r,
  nSegs: 17,
  gas: r ** 2 * 5, //*(Math.random()*2+1),
  tenacity: 1,

  name: "t1",
  pos: new Vec2(-150, -2000),
  collisionFilter: "car",
});

const tyre2 = new Circle({
  rad: r,
  nSegs: 17,
  gas: r ** 2 * 5, //*(Math.random()*2+1),
  tenacity: 1,

  name: "t2",
  pos: new Vec2(150, -2000),
  collisionFilter: "car",
});
const anchorP = new Vec2(-160, 0);
world.addBody(tyre1);
world.addBody(tyre2);
world.addBody(carHull);
const t1m = [6, 7, 8, 9, 10];
const t2m = [1, 2, 3, 4, 5];
world.anchorPairs.push([
  new Anchor(tyre1.points),
  new Anchor(
    carHull.points.filter((_, i) => t1m.includes(i)),
    carHull.points
      .filter((_, i) => t1m.includes(i))
      .map((p, i) => {
        return 1; //carHull.frame[i].clone().sub(new Vec2(-160, 0)).mag();
      }),100
  ),
]);
world.anchorPairs.push([
  new Anchor(tyre2.points),
  new Anchor(carHull.points.filter((_, i) => t2m.includes(i)), null, 100),
]);

function pointIt(mx, my) {
  return {
    x: (mx - canvas.wicollisionFilterdth / 2) / camera.s + camera.x,
    y: (my - canvas.height / 2) / camera.s + camera.y,
  };
}
window.camera = camera;

let timeStart = NaN;
let sp = 0;
function animate() {
  camera.s *= 1 + camera.ss;
  camera.ss *= 0.7;
  if (!isNaN(mouseX)) {
    camera.x += ((mouseX - canvas.width / 2) * camera.ss) / camera.s;
    camera.y += ((mouseY - canvas.height / 2) * camera.ss) / camera.s;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(camera.rot);
  ctx.scale(camera.s, camera.s);
  ctx.translate(-camera.x, -camera.y);
  // const s = innerHeight / th;
  // ctx.scale(s, s);
  if (keysdown.ArrowUp) {
    sp += 0.5;
  } else if (keysdown.ArrowDown) {
    sp -= 0.5;
  }
  sp *= 0.8;
  drive(sp);
  if (keysdown.ArrowRight) {
    // animate();
    turn(0.1);
  }
  if (keysdown.ArrowLeft) {
    // animate();
    turn(-0.1);
  }

  world.update(ctx);
  world.debug(ctx, camera.s);
  const c = carHull.computeCenter();
  camera.x = c.x;
  camera.y = c.y;
  // ctx.beginPath()
  // ctx.arc(anchorP.x,anchorP.y,5, 0, Math.PI*2)
  // ctx.fillStyle = 'black'
  // ctx.fill();
  ctx.restore();
  if (!isNaN(timeStart)) {
    ctx.textAlign = "start";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";
    ctx.fillText(((Date.now() - timeStart) / 1000).toFixed(2), 15, 15);
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

const fn = (x) => {
  x *= 0.2;
  return (
    ((Math.sin(x * 50) - 2) * 500 +
      (Math.sin(x * 5) - 2) * 200 +
      (Math.sin(x * 500) - 2) * 100) *
      (Math.sin(x * 150) + 2) *
      0.2 +
    (Math.sin(x * 70) - 2) * 500
  );
};
const ps = Array.from({ length: 505 }, (_, i) => {
  i = i;
  const x = i * 100 - 10 * 50;

  const y = fn(i / 100);
  return new Vec2(x, y);
});
ps.unshift(new Vec2(-500, 0));
ps.push(new Vec2(504 * 100 - 10 * 50, 0));
const road = new SoftBody(
  ps.map((p) => new PointMass(p.clone(), 150)),
  ps.map((p) => p.clone()),
  NORMAL,
  null,
  true
);
// road.fixed = true
console.log(road.points);
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
canvas.addEventListener("click", (ev) => {
  const p = pointIt(ev.clientX, ev.clientY);
  if (nextShape() === "rect") {
    const b = new Rectangle({
      width: 450,
      height: 100,
      name: "small",
      pos: new Vec2(p.x, p.y),
      mass: 5,
      fixed: true,
    });

    world.addBody(b);
  } else {
    let r = 80;
    const s = new Circle({
      rad: r,
      nSegs: 12 + Math.floor(Math.random() ** 2 * 5),
      gas: r ** 2 * 4, //*(Math.random()*2+1),
      tenacity: 1,

      name: "small",
      pos: new Vec2(p.x, p.y),
    });
    // s.points.forEach(p=>p.vel.add(0, 20))
    world.addBody(s);
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
  doit(tyre2, 0.2);
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
  if (isNaN(timeStart)) {
    timeStart = Date.now();
    // alert('hey')
  }
  if (ev.code === "KeyM") {
    window.rec === null && window.rec === undefined && (window.rec = false);
    window.rec = !window.rec;
  }
  if (ev.code === "KeyB") {
    shap = "rect";
    console.log("rect now");
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

// let pointerDown = false
let dragging = false;
addEventListener("pointerdown", (ev) => {
  if (ev.which === 3) {
    dragging = true;
  }
  //  else {
  // pointIt(ev.clientX, ev.clientY);
  // pointerDown = true;
  // }
});

addEventListener("mousemove", (ev) => {
  // if (pointerDown) {
  //   pointIt(ev.clientX, ev.clientY);
  // }
  if (dragging) {
    camera.x -= (ev.clientX - mouseX) / camera.s;
    camera.y -= (ev.clientY - mouseY) / camera.s;
  }
  mouseX = ev.clientX;
  mouseY = ev.clientY;
});
addEventListener("pointerup", (ev) => {
  if (ev.which === 3) {
    dragging = false;
  }
  // else {
  // pointerDown = false;
  // }
});

// window.f = f
