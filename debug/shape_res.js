import { PointMass } from "../js/pointMass.js";
import {
  dist2,
  getPointVelProj,
  pointLineDistPerfect,
  projectPointOnLine,
  refine,
  setUpCanvasSizing,
} from "../js/utils.js";
import Vec2 from "../js/vec2.js";

const canvas = document.querySelector("canvas");
setUpCanvasSizing(canvas);
const ctx = canvas.getContext("2d");
const mods = {
  lines: false,
  speed: 0.1,
  allowEscape: false,
};
let zs = 0;
let zoom = 1;
let panX = 0;
let panY = 0;
let dragging = false;
let mouseX = NaN;
let mouseY = NaN;

function centerShift(shape) {
  const minx = Math.min(...shape.map((p) => p[0]));
  const maxx = Math.max(...shape.map((p) => p[0]));
  const miny = Math.min(...shape.map((p) => p[1]));
  const maxy = Math.max(...shape.map((p) => p[1]));
  const minP = [minx, miny];
  const maxP = [maxx, maxy];
  const dist = Math.max(
    Vec2.zero().sub(Vec2.from(minP)).mag(),
    Vec2.zero().sub(Vec2.from(maxP)).mag()
  );
  const wcenter = [(minP[0] + maxP[0]) / 2, (minP[1] + maxP[1]) / 2];
  let center = shape.reduce((p1, p2) => [p1[0] + p2[0], p1[1] + p2[1]]);
  center = [center[0] / shape.length, center[1] / shape.length];
  return shape.map((p) =>
    Vec2.from([p[0] - wcenter[0], p[1] - wcenter[1]]).div(dist).toArray()
  );
}
function subdivide(shape) {
  let s = []
  for (let i = 0; i < shape.length; i++) {
    const p = shape[i]
    const p1 = shape[(i+1)%shape.length]
    s.push(p)
    s.push(Vec2.from(p).add(Vec2.from(p1)).mult(0.5).toArray())
  }
  return s
}
let r=140
let w=140
let b=140
let d=140
let  prs = (subdivide(centerShift([
  [r/2, -50],
  [100, 20],
  [170, 40],
  [170, 100],
  [130, 100],
  [70, 100],
  [-70, 100],
  [-130, 100],
  [-170, 100],
  [-170, 40],
  [-100, 20],
  [-r/2, -50],
])))
console.log(prs);
prs =  prs.map((p) =>
  Vec2.from(p).mult(400).toArray()
);
/**
 * @type {PointMass[]}
 */
const points = prs.map((p) => new PointMass(Vec2.from(p)));

// !(function () {
//   let n = 15;
//   for (let i = 0; i < n; i++) {
//     let r = 150 + Math.random() * 150;
//     let a = (i / n) * Math.PI * 2;
//     points.push(
//       new PointMass(
//         new Vec2(Math.cos(a) * r, Math.sin(a) * r)
//         // 1 + Math.random()
//       )
//     );
//   }
// })();
let ri = Math.floor(Math.random() * (points.length - 1));
const pt = new PointMass(
  points[ri].pos
    .clone()
    .add(points[ri + 1].pos.clone().sub(points[ri].pos).mult(0.5))
);
function wrap(v, c) {
  return c(v);
}
console.log(wrap(getClosestPointOnLine(pt, points).toFixed(100), (v) => v));
window.backup = points.map((p) => p.clone());
console.log(points);

function getClosestPoint() {
  let index = 0;
  let bestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i].pos;
    const p2 = points[(i + 1) % points.length].pos;
    const h = pointLineDistPerfect(pt.pos, p1, p2);
    if (mods.lines) {
      const pr = projectPointOnLine([p1, p2], pt.pos);
      ctx.save();
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "white";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pt.pos.x, pt.pos.y);
      ctx.lineTo(pr.x, pr.y);
      ctx.strokeStyle = "purple";
      ctx.stroke();
      ctx.fillText(i + ", "+ dist2(pt.pos.x,pt.pos.y,pr.x,pr.y).toFixed(1), (pt.pos.x + pr.x) / 2, (pt.pos.y + pr.y) / 2);
      ctx.restore();
    }

    if (h < bestDist) {
      bestDist = h;
      index = i;
    }
  }
  const point = points[index].pos;
  const point1 = points[(index + 1) % points.length].pos;

  return projectPointOnLine([point, point1], pt.pos);
}

function getClosestPointOnLine(pt, points) {
  let index = 0;
  let bestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i].pos;
    const p2 = points[(i + 1) % points.length].pos;
    const h = pointLineDistPerfect(pt.pos, p1, p2);

    if (h < bestDist) {
      bestDist = h;
      index = i;
    }
  }
  const point = points[index].pos;
  const point1 = points[(index + 1) % points.length].pos;

  return projectPointOnLine([point, point1], pt.pos).sub(pt.pos).mag();
}

function isPointIn() {
  const testPoint = pt;
  /**
   * Helper method to check if a ray from testPoint intersects an edge
   * @param {Vec2} testPoint - The point emitting the ray
   * @param {Vec2} pointA - First point of the edge
   * @param {Vec2} pointB - Second point of the edge
   * @returns {boolean} - True if the ray intersects the edge
   */
  function edgeIntersectsRay(testPoint, pointA, pointB) {
    // Check if the edge crosses the horizontal ray extending from testPoint
    if (
      (pointA.y > testPoint.y && pointB.y < testPoint.y) ||
      (pointB.y > testPoint.y && pointA.y < testPoint.y)
    ) {
      // Calculate intersection X coordinate
      let intersectX =
        pointA.x +
        ((testPoint.y - pointA.y) * (pointB.x - pointA.x)) /
          (pointB.y - pointA.y);

      // Check if intersection is to the right of testPoint
      return intersectX > testPoint.x;
    }

    return false;
  }

  let intersections = 0;

  for (let i = 0; i < points.length; i++) {
    let pointA = points[i].pos;
    let pointB = points[(i + 1) % points.length].pos; // Wrap around for the last edge
    // if (
    //   (testPoint.pos.x === pointA.x && testPoint.pos.y === pointA.y) ||
    //   (testPoint.pos.x === pointB.x && testPoint.pos.y === pointB.y)
    // ) {
    //   return false
    // }
    intersections += edgeIntersectsRay(testPoint.pos, pointA, pointB);
  }
  // console.log(getClosestPointOnLine(testPoint, points));
  // If the number of intersections is odd, the point is inside
  return intersections % 2 === 1
    ? getClosestPointOnLine(testPoint, points) === 0
      ? false
      : true
    : false;
}
/**
 *
 * @param {PointMass} pt
 * @param {PointMass} p1
 * @param {PointMass} p2
 */
function resolvePointCollision(pt, p1, p2) {
  const projectedPoint = projectPointOnLine([p1.pos, p2.pos], pt.pos);
  const projectedLen = pt.pos.clone().sub(projectedPoint).mag() * 1.0001;
  const len = p1.pos.clone().sub(p2.pos).mag();

  const psAvgMass = (p1.mass + p2.mass) / 2;
  const massSum = psAvgMass + pt.mass;

  const _ptUnit = projectedPoint.clone().sub(pt.pos).unit();
  const ptUnit = () => _ptUnit.clone();

  // positional response
  !(function () {
    let ptPush = (psAvgMass / massSum) * projectedLen;
    let p1Push = (pt.mass / massSum) * projectedLen;
    let p2Push = (pt.mass / massSum) * projectedLen;

    const pMassSum = p1.mass + p2.mass;
    let p1Dist = projectedPoint.clone().sub(p1.pos).mag();
    let p2Dist = projectedPoint.clone().sub(p2.pos).mag();

    if (p1Dist !== 0 && p2Dist !== 0 && len !== 0) {
      if (p1.mass > p2.mass) {
        const p1PushNew = (p1Push * p2.mass) / pMassSum;
        let h = p1Push - p1PushNew;
        let w = p1Dist;
        p2Push += (p2Dist * h) / w;
        p1Push = p1PushNew;
      } else {
        const p2PushNew = (p2Push * p1.mass) / pMassSum;
        let h = p2Push - p2PushNew;
        let w = p2Dist;
        p1Push += (p1Dist * h) / w;
        p2Push = p2PushNew;
      }
      if (len !== 0) {
        if (p1Dist > p2Dist) {
          const p1PushNew = (p1Push * p2Dist) / len;
          let h = p1Push - p1PushNew;
          let w = p1Dist;
          p2Push += (p2Dist * h) / w;
          p1Push = p1PushNew;
        } else {
          const p2PushNew = (p2Push * p1Dist) / len;
          let h = p2Push - p2PushNew;
          let w = p2Dist;
          p1Push += (p1Dist * h) / w;
          p2Push = p2PushNew;
        }
      }
    }

    pt.pos.add(ptUnit().mult(ptPush));
    p1.pos.sub(ptUnit().mult(p1Push), null, true);
    p2.pos.sub(ptUnit().mult(p2Push), null, true);
    // console.log(pt.pos);
    // console.log(p1.pos);
    // console.log(p2.pos);
    pt.vel.add(ptUnit().mult(ptPush));
    p1.vel.sub(ptUnit().mult(p1Push));
    p2.vel.sub(ptUnit().mult(p2Push));

    // const ptProjectedVel = getPointVelProj(pt, p1, p2).x;
    // const psProjectedVel = getPointVelProj(p1, p1, p2)
    //   .add(getPointVelProj(p2, p1, p2))
    //   .mult(0.5).x;
    // pt.vel.sub(
    //   p2.pos
    //     .clone()
    //     .sub(p1.pos)
    //     .unit()
    //     .mult(ptProjectedVel * 1)
    // );
    // p1.vel.sub(
    //   p2.pos
    //     .clone()
    //     .sub(p1.pos)
    //     .unit()
    //     .mult(psProjectedVel * 1)
    // );
    // p2.vel.sub(
    //   p2.pos
    //     .clone()
    //     .sub(p1.pos)
    //     .unit()
    //     .mult(psProjectedVel * 1)
    // );
  })();
}

function respond() {
  let index = 0;
  let bestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const point = points[i].pos;
    const point1 = points[(i + 1) % points.length].pos;
    const dist = pointLineDistPerfect(pt.pos, point, point1);
    if (dist < bestDist) {
      index = i;
      bestDist = dist;
    }
  }
  const point = points[index];
  const point1 = points[(index + 1) % points.length];

  resolvePointCollision(pt, point, point1, ctx);
}

function draw() {
  zs *= 0.7;
  zoom *= 1 + zs;
  if (!isNaN(mouseX)) {
    panX += ((mouseX - canvas.width / 2) * zs) / zoom;
    panY += ((mouseY - canvas.height / 2) * zs) / zoom;
  }

  // console.log(points);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-panX, -panY);
  ctx.beginPath();
  ctx.moveTo(points[0].pos.x, points[0].pos.y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].pos.x, points[i].pos.y);
    // console.log(points[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "red";
  ctx.lineWidth = Math.min(2 / zoom, 2 / 10);
  ctx.stroke();
  for (let i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(
      points[i].pos.x,
      points[i].pos.y,
      (15 * points[i].mass - 10) / zoom,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "red";
    ctx.fill();
    // console.log(points[i].y);
  }

  ctx.beginPath();
  ctx.arc(pt.pos.x, pt.pos.y, 10 / zoom, 0, Math.PI * 2);
  if (isPointIn()) {
    ctx.fillStyle = "cyan";
    ctx.fill();
  } else {
    ctx.setLineDash([4 / zoom, 4 / zoom]);
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
  }

  if (isPointIn() || mods.allowEscape) {
    const p = getClosestPoint();
    ctx.beginPath();
    ctx.moveTo(pt.pos.x, pt.pos.y);
    ctx.strokeStyle = "blue";
    ctx.lineTo(p.x, p.y);
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
    let dir = Math.hypot(pt.pos.x - p.x, pt.pos.y - p.y);
    ctx.moveTo(p.x, p.y);
    let d = Math.max(100 / zoom, dir * 2);
    ctx.lineTo(
      ((pt.pos.x - p.x) / dir) * d + p.x,
      ((pt.pos.y - p.y) / dir) * d + p.y
    );
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
  }
  ctx.restore();
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

function pointIt(mx, my) {
  pt.pos.x = (mx - canvas.width / 2) / zoom + panX;
  pt.pos.y = (my - canvas.height / 2) / zoom + panY;
}

let pointerDown = false;
addEventListener("pointerdown", (ev) => {
  if (ev.which === 3) {
    dragging = true;
  } else {
    pointIt(ev.clientX, ev.clientY);
    pointerDown = true;
  }
});

addEventListener("mousemove", (ev) => {
  mouseX = ev.clientX;
  mouseY = ev.clientY;
  if (pointerDown) {
    pointIt(ev.clientX, ev.clientY);
  }
  if (dragging) {
    panX -= ev.movementX / zoom;
    panY -= ev.movementY / zoom;
  }
});
addEventListener("pointerup", (ev) => {
  if (ev.which === 3) {
    dragging = false;
  } else {
    pointerDown = false;
  }
});

addEventListener("keydown", (ev) => {
  if (ev.code === "KeyR") {
    if (isPointIn()) {
      respond();
    }
  } else if (ev.code === "KeyL") {
    mods.lines = !mods.lines;
  } else if (ev.code === "KeyE") {
    mods.allowEscape = !mods.allowEscape;
  } else if (ev.code === "Space") {
    refine(
      () => {
        const ri = Math.floor(Math.random() * (points.length - 1));
        pt.pos = points[ri].pos
          .clone()
          .add(
            points[ri + 1].pos.clone().sub(points[ri].pos).mult(Math.random())
          );
      },
      () => {
        return isPointIn();
      }
    );
  }
  // console.log(ev.code);
});
addEventListener("wheel", (ev) => {
  zs += -Math.sign(ev.deltaY) * 0.05;
});
addEventListener("contextmenu", (ev) => {
  ev.preventDefault();
});

// addEventListener('click', ()=>{
//   respond()
// })

window.pt = pt;
