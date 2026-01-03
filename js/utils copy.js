import PointMass from "./pointMass.js";
import Vec2 from "./vec2.js";

function dist2(x0, y0, x1, y1) {
  const distx = x1 - x0;
  const disty = y1 - y0;
  return Math.sqrt(distx * distx + disty * disty);
}

function projectPoint(
  line = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ],
  point = { x: 2, y: 1 }
) {
  const a = dist2(point.x, point.y, line[0].x, line[0].y);
  const b = dist2(point.x, point.y, line[1].x, line[1].y);
  const c = dist2(line[0].x, line[0].y, line[1].x, line[1].y);
  const p = Math.pow;
  return (p(a, 2) - p(b, 2) + p(c, 2)) / (2 * c);
}

/**
 *
 * @param {Vec2} point
 * @param {Vec2} linePoint1
 * @param {Vec2} linePoint2
 * @returns {number}
 */
function pointLineDist(point, linePoint1, linePoint2) {
  function projectPointHeight(
    line = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
    point = { x: 2, y: 1 }
  ) {
    function projectPoint(
      line = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      point = { x: 2, y: 1 }
    ) {
      const a = dist2(point.x, point.y, line[0].x, line[0].y);
      const b = dist2(point.x, point.y, line[1].x, line[1].y);
      const c = dist2(line[0].x, line[0].y, line[1].x, line[1].y);
      const pow = Math.pow;
      return (pow(a, 2) - pow(b, 2) + pow(c, 2)) / (2 * c);
    }

    const h = projectPoint(line, point);
    const a = dist2(point.x, point.y, line[0].x, line[0].y);
    const p = Math.pow;
    return Math.sqrt(p(a, 2) - p(h, 2));
  }
  return projectPointHeight([linePoint1, linePoint2], point);
}

function pointLineProjectible(point, linePoint1, linePoint2) {
  function projectible(line, point) {
    const l = projectPoint(line, point);
    return (
      l >= 0 && l <= Math.hypot(line[0].x - line[1].x, line[0].y - line[1].y)
    );
  }
  return projectible([linePoint1, linePoint2], point);
}

function projectPointOnLine(line, point) {
  function getBearing(x0, y0, x1, y1) {
    return Math.atan2(x1 - x0, y1 - y0);
  }

  function clamp(v, mi, ma) {
    return Math.max(mi, Math.min(ma, v));
  }
  function dist2(x0, y0, x1, y1) {
    const distx = x1 - x0;
    const disty = y1 - y0;
    const dist = Math.sqrt(distx * distx + disty * disty);
    return dist;
  }

  const d = clamp(
    projectPoint(line, point),
    0,
    dist2(line[0].x, line[0].y, line[1].x, line[1].y)
  );

  // console.log(h);
  const angle = getBearing(line[0].x, line[0].y, line[1].x, line[1].y);
  const x = Math.sin(angle) * d + line[0].x;
  const y = Math.cos(angle) * d + line[0].y;
  // console.log(dist - e);
  return new Vec2(x, y);
}

/**
 *
 * @param {PointMass} pt
 * @param {PointMass} p1
 * @param {PointMass} p2
 */

function resolvePointCollision(pt, p1, p2) {
  const length = dist2(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
  const projectionDist = pointLineDist(pt.pos, p1.pos, p2.pos);
  const projectionPoint = projectPointOnLine([p1.pos, p2.pos], pt.pos);

  // const ptKick = pt.pos.clone().sub(projectionPoint)
  //   .unit()
  //   .mult(projectionDist * (pt.mass / ((p1.mass + p2.mass) / 2 + pt.mass)));
  // pt.pos.add(ptKick);

  const lDist = dist2(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
  const pLineDist = pointLineDist(pt.pos, p1.pos, p2.pos);
  const pLinePos = projectPointOnLine([p1.pos, p2.pos], pt.pos);
  const ptd = ((p1.mass + p2.mass) / 2 / (p1.mass + p2.mass)) * pLineDist;
  const p1w =
    (dist2(p1.pos.x, p1.pos.y, pLinePos.x, pLinePos.y) / lDist) * p1.mass;
  const p2w =
    (dist2(p2.pos.x, p2.pos.y, pLinePos.x, pLinePos.y) / lDist) * p2.mass;
  let p1d = ((pt.mass / (p1.mass + p2.mass)) * pLineDist) / (p1.mass+p2.mass);
  let p2d = ((pt.mass / (p1.mass + p2.mass)) * pLineDist) / (p1.mass+p2.mass);
  if (p1w > p2w) {
    let p1dn = (p1d * p2w) / (p1w + p2w);
    p2d +=
      ((p1d - p1dn) / dist2(p1.pos.x, p1.pos.y, pLinePos.x, pLinePos.y)) *
      dist2(p2.pos.x, p2.pos.y, pLinePos.x, pLinePos.y);
    p1d = p1dn;
  } else {
    let p2dn = (p2d * p1w) / (p1w + p2w);
    p1d +=
      ((p2d - p2dn) / dist2(p2.pos.x, p2.pos.y, pLinePos.x, pLinePos.y)) *
      dist2(p1.pos.x, p1.pos.y, pLinePos.x, pLinePos.y);
    p2d = p2dn;
  }
  // let ph = p1w>p2w?p1w:p2w
  // let pl = p1w>p2w?p2w:p1w

  // p1d-=(p2w/(p2w+p1w))*p2d
  // p2d+=(p1w/(p2w+p1w))*p1d
  // p1d *= p2.mass/p1.mass
  // p2d+=(1-(p2.mass/p1.mass))*pLineDist
  const f = 0.008;
  let a = Math.atan2(pt.pos.y - pLinePos.y, pt.pos.x - pLinePos.x);
  // console.log(p1d, p2d, ptd, a);
  p1.pos.add(Math.cos(a) * p1d, Math.sin(a) * p1d);
  p2.pos.add(Math.cos(a) * p2d, Math.sin(a) * p2d);
  p1.vel.add(Math.cos(a) * p1d, Math.sin(a) * p1d);
  p2.vel.add(Math.cos(a) * p2d, Math.sin(a) * p2d);

  // p1.vel.add(pt.vel.clone().mult(f));
  // p2.vel.add(pt.vel.clone().mult(f));

  // p1.vel.sub(p2.pos.clone().sub(p1.pos).unit().swap().mult(1));
  // p2.vel.sub(p2.pos.clone().sub(p1.pos).unit().swap().mult(1));
  const v = Math.sin(-Math.atan2(pt.vel.y, pt.vel.x)) * pt.vel.mag();

  a += Math.PI;
  pt.pos.add(Math.cos(a) * ptd, Math.sin(a) * ptd);
  pt.vel.add(Math.cos(a) * ptd, Math.sin(a) * ptd);
  pt.vel.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
  pt.pos.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
  if (Math.random() < 0.05) {
    console.log(Math.atan2(pt.vel.y, pt.vel.x));
    console.log(Math.atan2(-pt.vel.y, -pt.vel.x));
  }

  let pts = pt.vel.mag() - (p1.vel.mag() + p2.vel.mag()) / 2;
  let ptdir = Math.atan2(-pt.vel.y, -pt.vel.x) + Math.PI;
  // console.log(pts,ptdir);

  // pt.vel.set(Math.cos(ptdir)*pts, Math.sin(ptdir)*pts);
  p1.vel.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
  ptdir += Math.PI;
  // p1.vel.add(Math.cos(ptdir)*pts, Math.sin(ptdir)*pts);
  // p2.vel.add(Math.cos(ptdir)*pts, Math.sin(ptdir)*pts);
  // p1.vel.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
  // p1.pos.sub(pt.pos.clone().sub(pLinePos).unit().mult(v));
  // p2.pos.sub(pt.pos.clone().sub(pLinePos).unit().mult(v));
  // pt.pos.add(pt.pos.clone().sub(pLinePos).unit().mult(v));

  // return [ptd,p1d,p2d]
}

function circ(ctx, x, y, color = "red") {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function setUpCanvasSizing(canvas) {
  function sizeCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  sizeCanvas();
  addEventListener("resize", sizeCanvas);
}

export {
  dist2,
  pointLineDist,
  pointLineProjectible,
  projectPoint,
  projectPointOnLine,
  circ,
  setUpCanvasSizing,
  resolvePointCollision,
};
