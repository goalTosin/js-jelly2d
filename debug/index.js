import { SoftBody } from "../js/softBody.js";
import { PointMass } from "../js/pointMass.js";
import { setUpCanvasSizing } from "../js/utils.js";
import Vec2 from "../js/vec2.js";

const canvas = document.querySelector("canvas");
setUpCanvasSizing(canvas);
const ctx = canvas.getContext("2d");

const softBody = new SoftBody([
  new PointMass(new Vec2(-100 * 10, 0), 1),
  new PointMass(new Vec2(100 * 10, 0), 1),
  new PointMass(new Vec2(100, 100), 1),
  new PointMass(new Vec2(100, 400), 1),
]);
const point = new PointMass(new Vec2(-600, 40), 1);

function draw() {
  ctx.fillStyle = "#00000010";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(
    point.pos.x + canvas.width / 2,
    point.pos.y + canvas.height / 2,
    5,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = point.test ? "red" : "white";
  ctx.fill();

  softBody.points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(
      p.pos.x + canvas.width / 2,
      p.pos.y + canvas.height / 2,
      5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = p.test ? "red" : "white";
    ctx.fill();
  });
  ctx.beginPath();
  for (let i = 0; i < softBody.points.length + 1; i++) {
    const p = softBody.points[i % softBody.points.length];
    const ac = i === 0 ? "moveTo" : "lineTo";
    ctx[ac](p.pos.x + canvas.width / 2, p.pos.y + canvas.height / 2);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.stroke();
  // springs.forEach(s=>{
  //   s.drag()
  //   ctx.beginPath()
  //   ctx.moveTo(s.point1.pos.x + canvas.width / 2,s.point1.pos.y+ canvas.height / 2)
  //   ctx.lineTo(s.point2.pos.x + canvas.width / 2,s.point2.pos.y+ canvas.height / 2)
  //   ctx.strokeStyle = 'yellow'
  //   ctx.stroke()
  // })

  // pointMasses.forEach(point => {

  // })
  requestAnimationFrame(draw);
}

function update() {
  softBody.respondToPoint(point);
}

let moving = false;
addEventListener("mousedown", () => (moving = true));
addEventListener("mouseup", () => {
  moving = false;
  softBody.respondToPoint(point);
  draw();
});

addEventListener("mousemove", (ev) => {
  if (moving) {
    point.pos.x = ev.clientX;
    point.pos.y = ev.clientY;
    draw();
  }
});

draw();
setTimeout(() => {
  update();
}, 1000);
