import {PointMass} from "../js/pointMass.js";
import {
  pointLineProjectible,
  projectPointOnLine,
  resolvePointCollision,
  setUpCanvasSizing,
} from "../js/utils.js";
import Vec2 from "../js/vec2.js";

const canvas = document.querySelector("canvas");
setUpCanvasSizing(canvas);
const ctx = canvas.getContext("2d");

let moving = false;
let mx = 0;
let my = 0;

const pt = new PointMass(new Vec2(-100, -40), 1);
const p1 = new PointMass(new Vec2(600, 40), 1);
const p2 = new PointMass(new Vec2(-600, 40), 1);

function draw() {
  update();
  ctx.fillStyle = "#000000";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (moving) {
    ctx.beginPath();
    let n = 20;
      ctx.moveTo(
        (pt.pos.x - mx + canvas.width / 2) * 2 + pt.pos.x,
        (pt.pos.y - my + canvas.height / 2) * 2+pt.pos.y 
      );
    ctx.lineTo(pt.pos.x, pt.pos.y);
    for (let i = 0; i < n; i++) {
      const f = (i+1) / n;
      const d = Math.hypot(-pt.pos.x + mx - canvas.width / 2, -pt.pos.y + my - canvas.height / 2)
      const dx = (-pt.pos.x + mx - canvas.width / 2)/d
      const dy = (-pt.pos.y + my - canvas.height / 2)/d
      const vx = (i % 2 === 0 ? -5:5)*dy
      const vy =( i % 2 === 0 ? 5:-5)*dx
      ctx.lineTo(
        (-pt.pos.x + mx - canvas.width / 2) * f + pt.pos.x + vx,
        (-pt.pos.y + my - canvas.height / 2) * f+pt.pos.y +vy
      );
    }
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    pt.vel.add(0, 0.1)
    pt.pos.add(pt.vel.clone());

  }

  ctx.beginPath();
  ctx.moveTo(p1.pos.x, p1.pos.y);
  ctx.lineTo(p2.pos.x, p2.pos.y);
  ctx.strokeStyle = "purple";
  ctx.lineWidth = 2;
  ctx.stroke();

  [pt, p1, p2].forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.pos.x, point.pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = point.test ? "red" : "white";
    ctx.fill();
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

function update() {
  [p1, p2].forEach((point) => {
    point.pos.add(point.vel.clone());
  });
  if (
    pointLineProjectible(pt.pos, p1.pos, p2.pos) &&
    projectPointOnLine([p1.pos, p2.pos], pt.pos).y < pt.pos.y
  ) {
    resolvePointCollision(pt, p1, p2);
  }
}
draw();

let d = false;
addEventListener("mousedown", () => {
  moving = true;
});
addEventListener("mouseup", (ev) => {
  moving = false;
  // draw();
  if (d) {
    let fs = -0.05;
    pt.vel.set(
      (ev.clientX - (pt.pos.x + canvas.width / 2)) * fs,
      (ev.clientY - (pt.pos.y + canvas.height / 2)) * fs
    );
  }
  d = false;
});

addEventListener("mousemove", (ev) => {
  if (moving) {
    // point.pos.x = ev.clientX;
    // point.pos.y = ev.clientY;
    // draw()
    mx = ev.clientX;
    my = ev.clientY;
    d = true;
  }
});
