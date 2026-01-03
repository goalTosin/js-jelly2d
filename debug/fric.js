import { setUpCanvasSizing } from "../js/utils.js";
import Vec2 from "../js/vec2.js";

const canvas = document.querySelector("canvas");
setUpCanvasSizing(canvas);
const ctx = canvas.getContext("2d");

const line = [new Vec2(-90, 10), new Vec2(150, -150)];
const p = line[0].clone().add(
  line[1].clone().sub(line[0]).mult(logg(Math.random() * 0.8) + 0.1)
);
const pv = new Vec2(5, 12)

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.beginPath()
  ctx.moveTo(line[0].x, line[0].y)
  ctx.lineTo(line[1].x,line[1].y)
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'white'
  ctx.stroke()
  for (let i = 0; i < line.length; i++) {
    ctx.beginPath();
    ctx.arc(line[i].x, line[i].y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }
  ctx.save()
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY
  ctx.shadowBlur = 10
  ctx.shadowColor = 'black'
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function update() {}

function animate() {
  requestAnimationFrame(animate);
  draw();
  update();
}
animate();

function logg(v) {
  console.log(v);
  return v;
}
