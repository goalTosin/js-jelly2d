import PointMass from "./pointMass.js";
import SoftBody, { NORMAL, STATIC } from "./softBody.js";
import { Spring, Weld } from "./spring.js";
import Vec2 from "./vec2.js";
import { setUpCanvasSizing } from "./utils.js";
import Rectangle from "./shapes.js";
const canvas = document.querySelector("canvas");
setUpCanvasSizing(canvas);
const ctx = canvas.getContext("2d");

function subdivide(pl) {
  const npl = []
  // pl.forEach((p, i) => {
  //   const pp = pl[(i-1+pl.length)%p.length]
  //   const pn = pl[(i+1)%p.length]
  //   npl.push()
  // })
  return pl
}

/**
 * @type {SoftBody[]}
 */
const softBodys = [
  // ...Array.from({ length: 0 }, () => {
  //   return new Rectangle(70,70,
  //     NORMAL,
  //     "small"
  //   );
  // }),
  // new SoftBody(
  //   [
  //     new Vec2(-300, -10),
  //     // new Vec2(-150, -10),
  //     // new Vec2(0, -10),
  //     // new Vec2(150, -10),
  //     new Vec2(300, -10),
  //     new Vec2(300, 100),
  //     new Vec2(-300, 100),
  //   ].map((p) => new PointMass(p.add(0, 200), 200)),
  //   STATIC,
  //   "big"
  // ),
];
/**
 * @type {Spring[]}
 */
const springs = [];

softBodys.forEach((s) => {
  if (s.type!== STATIC) {
    // s.points.forEach((p1, i) => {
    //   const p2 = s.staticPoints[i];
    //   // p2.mass = 1000000
    //   // console.log(p1.pos, p2.pos);
    //   // console.log(p1.vel, p2.vel);
    //   // springs.push(new Weld(p2, p1));
    //   springs.push(new Spring(p2, p1, 0, 0.1));
    // });
  springs.push(...s.genSprings());
  }
});
const pointMasses = [new PointMass(0, 0, 1, new Vec2(0, 0))];
let grav = new Vec2(0, 0.1);
window.grav = grav;
window.p = 16;
let scale = 1
let panX = 0
let panY = 0
addEventListener('wheel', (ev) => {
  const d = -ev.deltaY <0? 10000/ev.deltaY:-ev.deltaY
  console.log(ev.deltaY, d);
  scale *= d*0.01
  // console.log(ev.deltaY);
})
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw();
  update();

  window.h = setTimeout(animate, window.p);
}
animate();
addEventListener('drag', (ev) => {
  panX+=ev.movementX
  panY+=ev.movementY
  console.log(ev);
})
addEventListener("click", (ev) => {
  const s =new Rectangle(70,70,
    NORMAL,
    "small",
    new Vec2((ev.clientX-canvas.width/2)/scale-panX, (ev.clientY-canvas.height/2)/scale-panY)
  )
  softBodys.push(s);
  springs.push(...s.genSprings());
});
function stop() {
  cancelAnimationFrame(window.h);
}
window.stop = stop;

function update() {
  softBodys.forEach((body) => {
    if (body.type === STATIC) {
      body.points = body.staticPoints.map(p => new PointMass(p.pos.clone(), p.mass, p.vel.clone()))
    }
    body.points.forEach((p) => {
      p.pos.add(p.vel);
      if (body.type !== STATIC) {
        p.vel.add(grav);
      }
    });
  });
  softBodys.forEach((body) => {
    softBodys.forEach((body1) => {
      if (body !== body1) {
        // console.log('hey!');
        if (body.collidesWith(body1, false)) {
          body1.points.forEach((p) => {
            if (body.isPointIn(p.pos)) {
              // console.log(p.x, p.y);
              body.respondToPoint(p, ctx);
            }
          });
        }
      }
    });
  });
}


function draw() {
  softBodys.forEach((body) => {
    body.points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(
        (p.pos.x+panX)*scale + canvas.width / 2,
        (p.pos.y+panY)*scale + canvas.height / 2,
        5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = p.test ? "red" : "white";
      ctx.fill();
    });
    ctx.beginPath();
    for (let i = 0; i < body.points.length; i++) {
      const p = body.points[i];
      const ac = i === 0 ? "moveTo" : "lineTo";
      ctx[ac]((p.pos.x+panX)*scale + canvas.width / 2, (p.pos.y+panY)*scale + canvas.height / 2);
    }
    ctx.closePath()
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.stroke();
  });
  springs.forEach((s) => {
    // console.log(s.point1.pos,s.point2.pos);
    s.drag();
    // console.log(s.point1.pos,s.point2.pos);
    // ctx.beginPath();
    // ctx.moveTo(
    //   s.point1.pos.x + canvas.width / 2,
    //   s.point1.pos.y + canvas.height / 2
    // );
    // ctx.lineTo(
    //   s.point2.pos.x + canvas.width / 2,
    //   s.point2.pos.y + canvas.height / 2
    // );
    // ctx.strokeStyle = "yellow";
    // ctx.stroke();
  });

  // pointMasses.forEach(point => {

  // })
}
