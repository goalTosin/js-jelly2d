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
const pp = 200
let items = []
window.logLong = function (...t) {
  items.push(...t)
  if (items.length >= pp) {
    console.log(...items);
    items = []
  }
}

const canvas = document.querySelector("canvas");
setUpCanvasSizing(canvas);
const ctx = canvas.getContext("2d");
const keysdown = {};
window.ctx = ctx;
// const gui = new GUI()
const world = new World(new Vec2(0, 0.25));
const camera = {
  x: 0,
  y: 0,
  s: 1,
  ss: 0
}
let stopped = false
function animate() {
  camera.s *= 1 + camera.ss;
  camera.ss *= 0.7;
  if (!isNaN(mouseX)) {
    camera.x += ((mouseX - canvas.width / 2) * camera.ss) / camera.s;
    camera.y += ((mouseY - canvas.height / 2) * camera.ss) / camera.s;
  }
  // // const c = ss.computeCenter();
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

  // }
  // const s = innerHeight / th;
  // ctx.scale(s, s);

  world.update(ctx);
  world.debug(ctx, camera.s);

  ctx.restore();

  if (!stopped) {
    window.h = requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
window.n = 1;

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
    0.4
  );
};
const roadWidth = 100;
const ps = Array.from({ length: roadWidth + 1 }, (_, i) => {
  i = i;
  const x = i * 100 - 10 * 50;

  const y = fn(i / 200);
  return new Vec2(x, y);
});
ps.unshift(new Vec2(-500, 0));
ps.push(new Vec2(roadWidth * 100 - 10 * 50, 0));

const floor = new Rectangle({
  width: 1000,
  height: 100,
  name: "beeeeg",
  pos: new Vec2(0, -5),
  mass: 5,
  fixed: true,
});
world.addBody(floor);

let tr = 100;
const sse = new Circle({
  rad: tr,
  nSegs: 13,
  gas: tr ** 2*4, //*(Math.random()*2+1),
  tenacity: 1,

  name: "bg",
  pos: new Vec2(0, tr / 2 - 1000),
});
// s.points.forEach(p=>p.vel.add(0, 20))
world.addBody(sse);

window.world = world;
function stop() {
  cancelAnimationFrame(window.h);
}
window.stop = stop;

function keyed(ev) {
  keysdown[ev.code] = ev.type === "keydown";
}

addEventListener("keydown", (ev) => {
  keyed(ev);
  if (ev.code === "Enter") {
    animate();
    stopped =false
  }
  if (ev.key === " ") {
    if (stopped) {
      // stopped = false
     animate() 
    } else {
      stop();
      stopped = true

    }
  }

  
  if (ev.code === "KeyE") {
    sse.gas += 1000;
  }
  if (ev.code === "KeyQ") {
    sse.gas -= 1000;
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
