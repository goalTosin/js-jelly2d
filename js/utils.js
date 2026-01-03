import { PointMass } from "./pointMass.js";
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

/**
 *
 * @param {Vec2} point
 * @param {Vec2} linePoint1
 * @param {Vec2} linePoint2
 * @returns {number}
 */
function pointLineDistPerfect(point, linePoint1, linePoint2) {
  const p = projectPointOnLine([linePoint1, linePoint2], point);
  return p.sub(point).mag();
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

function clamp(v, mi, ma) {
  return Math.max(mi, Math.min(ma, v));
}

function projectPointOnLine(line, point) {
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
  const dist = Math.hypot(line[0].x - line[1].x, line[0].y - line[1].y);
  const x = line[0].x + ((line[1].x - line[0].x) / dist) * d;
  const y = line[0].y + ((line[1].y - line[0].y) / dist) * d;
  // console.log(dist - e);
  return new Vec2(x, y);
}

function projectPointOnLineBroad(line, point) {
  function getBearing(x0, y0, x1, y1) {
    return Math.atan2(y1 - y0, x1 - x0);
  }

  const d = projectPoint(line, point);

  // console.log(h);
  const angle = getBearing(line[0].x, line[0].y, line[1].x, line[1].y);
  const x = Math.cos(angle) * d + line[0].x;
  const y = Math.sin(angle) * d + line[0].y;
  // console.log(dist - e);
  return new Vec2(x, y);
}

// /**
//  *
//  * @param {PointMass} pt
//  * @param {PointMass} p1
//  * @param {PointMass} p2
//  */

// function resolvePointCollision(pt, p1, p2) {
//   const lDist = dist2(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
//   const pLineDist = pointLineDist(pt.pos, p1.pos, p2.pos);
//   const pLinePos = projectPointOnLine([p1.pos, p2.pos], pt.pos);
//   const ptd = ((p1.mass + p2.mass) / 2 / (p1.mass + p2.mass)) * pLineDist;
//   const p1w =
//     (dist2(p1.pos.x, p1.pos.y, pLinePos.x, pLinePos.y) / lDist) * p1.mass;
//   const p2w =
//     (dist2(p2.pos.x, p2.pos.y, pLinePos.x, pLinePos.y) / lDist) * p2.mass;
//   let p1d =( ((pt.mass / (p1.mass + p2.mass)) * pLineDist * p2.mass) / p1.mass);
//   let p2d = ((pt.mass / (p1.mass + p2.mass)) * pLineDist * p1.mass) / p2.mass;
//   if (p1w > p2w) {
//     let p1dn = (p1d * p2w) / (p1w + p2w);
//     p2d +=
//       ((p1d - p1dn) / dist2(p1.pos.x, p1.pos.y, pLinePos.x, pLinePos.y)) *
//       dist2(p2.pos.x, p2.pos.y, pLinePos.x, pLinePos.y);
//     p1d = p1dn;
//   } else {
//     let p2dn = (p2d * p1w) / (p1w + p2w);
//     p1d +=
//       ((p2d - p2dn) / dist2(p2.pos.x, p2.pos.y, pLinePos.x, pLinePos.y)) *
//       dist2(p1.pos.x, p1.pos.y, pLinePos.x, pLinePos.y);
//     p2d = p2dn;
//   }
//   // let ph = p1w>p2w?p1w:p2w
//   // let pl = p1w>p2w?p2w:p1w

//   // p1d-=(p2w/(p2w+p1w))*p2d
//   // p2d+=(p1w/(p2w+p1w))*p1d
//   // p1d *= p2.mass/p1.mass
//   // p2d+=(1-(p2.mass/p1.mass))*pLineDist
//   const f = 0.008;
//   let a = Math.atan2(pt.pos.y - pLinePos.y, pt.pos.x - pLinePos.x);
//   // console.log(p1d, p2d, ptd, a);
//   p1.pos.add(Math.cos(a) * p1d, Math.sin(a) * p1d);
//   p2.pos.add(Math.cos(a) * p2d, Math.sin(a) * p2d);
//   p1.vel.add(Math.cos(a) * p1d, Math.sin(a) * p1d);
//   p2.vel.add(Math.cos(a) * p2d, Math.sin(a) * p2d);

//   // p1.vel.add(pt.vel.clone().mult(f));
//   // p2.vel.add(pt.vel.clone().mult(f));

//   // p1.vel.sub(p2.pos.clone().sub(p1.pos).unit().swap().mult(1));
//   // p2.vel.sub(p2.pos.clone().sub(p1.pos).unit().swap().mult(1));
//   const v =
//     Math.sin(-Math.atan2(pt.vel.y, pt.vel.x)) *
//     pt.vel.mag();

//   // a += Math.PI;
//   pt.pos.add(Math.cos(a) * ptd*2, Math.sin(a) * ptd*2);
//   // pt.vel.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
//   // pt.pos.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
//   pt.vel.add(Math.cos(a) * ptd*2, Math.sin(a) * ptd*2);
//   if (Math.random()<0.05) {
//     console.log(Math.atan2(pt.vel.y, pt.vel.x));
//     console.log(Math.atan2(-pt.vel.y, -pt.vel.x));
//   }

//   let pts = pt.vel.mag()-(p1.vel.mag()+p2.vel.mag())/2
//   let ptdir = Math.atan2(-pt.vel.y,-pt.vel.x)+Math.PI
//   // console.log(pts,ptdir);

//   // pt.vel.set(Math.cos(ptdir)*pts, Math.sin(ptdir)*pts);
//   pt.vel.sub(pt.pos.clone().sub(pLinePos).unit().mult(v));
//   ptdir += Math.PI
//   // p1.vel.add(Math.cos(ptdir)*pts, Math.sin(ptdir)*pts);
//   // p2.vel.add(Math.cos(ptdir)*pts, Math.sin(ptdir)*pts);
//   // p1.vel.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
//   // p2.vel.add(pt.pos.clone().sub(pLinePos).unit().mult(v));
//   // pt.pos.add(pt.pos.clone().sub(pLinePos).unit().mult(v));

//   // return [ptd,p1d,p2d]
// }

/**
 *
 * @param {PointMass} pt
 * @param {PointMass} p1
 * @param {PointMass} p2
 * @param {CanvasRenderingContext2D} ctx
 */

function resolvePointCollision(pt, p1, p2, ctx, c) {
  // console.log(pt, p1, p2);
  // c()
  const projectedPoint = projectPointOnLine([p1.pos, p2.pos], pt.pos);
  const projectedLen = pt.pos.clone().sub(projectedPoint).mag();
  const len = p1.pos.clone().sub(p2.pos).mag();

    const pMassSum = p1.mass + p2.mass;
  const psAvgMass = (p1.mass + p2.mass) / 2;
  const massSum = psAvgMass + pt.mass;

  // console.log(projectedPoint, pt.pos);
  const _ptUnit = projectedPoint.clone().sub(pt.pos).unit();
  const ptUnit = () => _ptUnit.clone();

  // positional response
  !(function () {
    let ptPush = (psAvgMass / massSum) * projectedLen;
    let p1Push = (pt.mass / massSum) * projectedLen;
    let p2Push = (pt.mass / massSum) * projectedLen;

    // console.log(ptPush,p1Push,p2Push, pt, p1, p2);
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
    // console.log(ptUnit());
    // console.log(ptUnit(),ptUnit().mult(ptPush, null, true));
    // console.log(ptPush,p1Push,p2Push);
    pt.pos.add(ptUnit().mult(ptPush));
    p1.pos.sub(ptUnit().mult(p1Push));
    p2.pos.sub(ptUnit().mult(p2Push));
    pt.vel.add(ptUnit().mult(ptPush));
    p1.vel.sub(ptUnit().mult(p1Push));
    p2.vel.sub(ptUnit().mult(p2Push));

    //friction
    const fric = 1;
    const ptProjectedVel = getPointVelProj(pt, p1, p2).x;
    const psProjectedVel = getPointVelProj(p1, p1, p2)
      .add(getPointVelProj(p2, p1, p2))
      .mult(0.5).x;
    pt.vel.sub(
      p2.pos
        .clone()
        .sub(p1.pos)
        .unit()
        .mult((ptProjectedVel - psProjectedVel) * fric * psAvgMass/massSum)
    );
    p1.vel.sub(
      p2.pos
        .clone()
        .sub(p1.pos)
        .unit()
        .mult((psProjectedVel - ptProjectedVel) * fric* pt.mass/massSum)
    );
    p2.vel.sub(
      p2.pos
        .clone()
        .sub(p1.pos)
        .unit()
        .mult((psProjectedVel - ptProjectedVel) * fric* pt.mass/massSum)
    );
  })();

  // update velocities
  // !(function () {
  //   const normal = p2.pos.clone().sub(p1.pos).unit().swap().mult(1, -1);
  //   const impact =
  //     pt.vel.mag() * Math.sin(Math.atan2(p1.pos.y - p2.pos.y, p1.pos.x - p2.pos.x)-Math.atan2(pt.vel.y,pt.vel.x))
  //   const impactn = impact*100
  //   // ctx.beginPath();
  //   // ctx.moveTo(pt.pos.x, pt.pos.y);
  //   // ctx.lineTo(pt.pos.x + normal.x * impactn, pt.pos.y + normal.y * impactn);
  //   // ctx.strokeStyle = "yellow";
  //   // ctx.lineWidth = 4;
  //   // ctx.stroke();
  //   // ctx.beginPath();
  //   // ctx.arc(
  //   //   pt.pos.x + normal.x * impactn,
  //   //   pt.pos.y + normal.y * impactn,
  //   //   5,
  //   //   0,
  //   //   Math.PI * 2
  //   // );
  //   // ctx.stroke();
  //   // pt.vel.add(normal.clone().mult(impact))
  //   // p1.vel.add(normal.clone().mult(impact))
  //   // p2.vel.add(normal.clone().mult(impact))
  // })();
}

async function asyncLoop(start, end, incr, callback, slice = 10000) {
  let i = start;
  for (; i < Math.min(start + slice, end); i+=incr) {
    callback(i);
  }
  await new Promise((res) => setTimeout(res, 1));
  if (i < end) {
    return await asyncLoop(i, end, incr, callback, slice);
  }
}

function timeit(ms, s = false) {
  const mi = Math.floor(Math.abs(ms)) % 1000;
  const secs = Math.floor(Math.abs(ms) / 1000) % 60;
  const minutes = Math.floor(Math.abs(ms) / 60 / 1000) % 60;
  const padd = (s, b = 2) => s.toString().padStart(b, "0");
  return `${ms < 0 ? "-" : s ? "+" : ""}${padd(minutes)}:${padd(secs)}.${padd(
    mi,
    3
  )}`;
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
/**
 *
 * @param {PointMass} pt
 * @param {PointMass} p1
 * @param {PointMass} p2
 * @returns
 */
function getPointVelProj(pt, p1, p2) {
  const rotvelp = pt.pos.clone().rotate(p1.pos, -p1.pos.dirTo(p2.pos));
  const rotvelv = pt.vel
    .clone()
    .add(pt.pos)
    .rotate(p1.pos, -p1.pos.dirTo(p2.pos));
  return rotvelv.sub(rotvelp);
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

/**
 * @type {<T>(callback:() => T,predicate:(value:T)=>boolean)=>T}
 **/
function refine(callback, predicate) {
  let v = null;
  while (!predicate((v = callback()))) {}
  return v;
}
/**
 * @type {<T,A>(c:(val:T) => A,v:T)=>A}
 **/
function wrap(c, v) {
  return c(v);
}

/**
 * Calculates the average of an array of angles in degrees.
 * Handles the cyclical nature of angles.
 *
 * @param {number[]} angles An array of angles in degrees.
 * @returns {number} The average angle in degrees, normalized to be between 0 and 360.
 */
function averageAngles(angles) {
  if (angles.length === 0) {
    return 0; // Or throw an error, depending on desired behavior for empty input
  }

  let sinSum = 0;
  let cosSum = 0;

  for (const angle of angles) {
    sinSum += Math.sin(angle);
    cosSum += Math.cos(angle);
  }

  const avgSin = sinSum / angles.length;
  const avgCos = cosSum / angles.length;

  return Math.atan2(avgSin, avgCos);
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
  pointLineDistPerfect,
  projectPointOnLineBroad,
  getPointVelProj,
  getClosestPointOnLine,
  refine,
  wrap,
  averageAngles,
  timeit,
  deepCopy,
  asyncLoop
};
