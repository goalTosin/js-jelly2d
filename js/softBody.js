import { PointMass } from "./pointMass.js";
import Vec2 from "./vec2.js";
import {
  pointLineProjectible,
  pointLineDist,
  projectPointOnLine,
  circ,
  projectPoint,
  resolvePointCollision,
  dist2,
  pointLineDistPerfect,
  getClosestPointOnLine,
  wrap,
  averageAngles,
} from "./utils.js";
import { Spring } from "./spring.js";
import { Circle } from "./shapes.js";

const STATIC = 0;
const NORMAL = 1;
const INFLATED = 2;
const KINETIC = 3;

class SoftBody {
  /**
   *
   * @param {PointMass[]} points
   * @param {Vec2[]} frame
   * @param {number} type
   * @param {string} name
   * @param {boolean} fixed
   * @param {string?} collisionFilter
   */
  constructor(
    points = [],
    frame = [],
    type = NORMAL,
    name,
    fixed = false,
    collisionFilter
  ) {
    /**
     * @type {PointMass[]}
     */
    this.points = points;
    // /**
    //  * @type {PointMass[]}
    //  */
    // this.staticPoints = points.map(
    //   (p) => new PointMass(p.pos.clone(), p.mass, p.vel.clone())
    // );
    this.type = type;
    this.name = name;
    /**
     * @type {Spring[]}
     */
    this.springs = [];
    this.fric = 1;
    this.gas = 0;
    this.fixed = fixed;
    this.collisionFilter = collisionFilter;
    this.collideEv = null;
    // console.log(this.fixed);
    /**
     * @type {Vec2[]}
     */
    this.frame = frame;
    if (!fixed && frame[0]) {
      const gc = this.frame
        .map((p) => p.clone())
        .reduce((p1, p2) => p1.add(p2))
        .div(this.points.length);

      const minx = this.frame.reduce((p, p1) => (p.x < p1.x ? p : p1)).x;
      const miny = this.frame.reduce((p, p1) => (p.y < p1.y ? p : p1)).y;
      const maxx = this.frame.reduce((p, p1) => (p.x > p1.x ? p : p1)).x;
      const maxy = this.frame.reduce((p, p1) => (p.y > p1.y ? p : p1)).y;
      const bc = new Vec2(minx, miny).add(maxx, maxy).div(2);
      this.frame = frame.map((f, i) => f.add(bc.clone().sub(gc)));
    }
  }
  /**
   *
   * @param {SoftBody} softBody
   * @returns {boolean}
   */
  collidesWith(softBody, _versa = true) {
    let sbb = softBody.getBoundingBox();
    let tbb = this.getBoundingBox();
    if (
      (sbb.minX > tbb.minX &&
        sbb.minX < tbb.maxX &&
        sbb.minY > tbb.minY &&
        sbb.minY < tbb.maxY) ||
      (sbb.maxX > tbb.minX &&
        sbb.maxX < tbb.maxX &&
        sbb.maxY > tbb.minY &&
        sbb.maxY < tbb.maxY) ||
      (tbb.minX > sbb.minX &&
        tbb.minX < sbb.maxX &&
        tbb.minY > sbb.minY &&
        tbb.minY < sbb.maxY) ||
      (tbb.maxX > sbb.minX &&
        tbb.maxX < sbb.maxX &&
        tbb.maxY > sbb.minY &&
        tbb.maxY < sbb.maxY) ||
      (sbb.minX > tbb.minX &&
        sbb.minX < tbb.maxX &&
        sbb.maxY > tbb.minY &&
        sbb.maxY < tbb.maxY) ||
      (tbb.minX > sbb.minX &&
        tbb.minX < sbb.maxX &&
        tbb.maxY > sbb.minY &&
        tbb.maxY < sbb.maxY)
    ) {
      if (
        softBody.points.some((point) => {
          const p = this.isPointIn(
            point.pos,
            this.name === "big" && point.pos.y === 10
          );
          return p;
        })
      ) {
        return true;
      }
      if (_versa) {
        return softBody.collidesWith(this, false);
      }
    }
    return false;
    // if the other body collides with this
  }

  getBoundingBox() {
    let minX = NaN;
    let maxX = NaN;
    let minY = NaN;
    let maxY = NaN;
    this.points.forEach((point) => {
      if (point.pos.x < minX || isNaN(minX)) {
        minX = point.pos.x;
      }
      if (point.pos.x > maxX || isNaN(maxX)) {
        maxX = point.pos.x;
      }
      if (point.pos.y < minY || isNaN(minY)) {
        minY = point.pos.y;
      }
      if (point.pos.y > maxY || isNaN(maxY)) {
        maxY = point.pos.y;
      }
    });
    return {
      minX,
      maxX,
      minY,
      maxY,
    };
  }
  /**
   * Checks if a point is inside the Softbody
   * @param {Vec2} testPoint - The point to check
   * @returns {boolean} - True if the point is inside, false otherwise
   */
  isPointIn(testPoint) {
    let intersections = 0;

    for (let i = 0; i < this.points.length; i++) {
      let pointA = this.points[i].pos;
      let pointB = this.points[(i + 1) % this.points.length].pos;
      // if (
      //   (testPoint.x === pointA.x && testPoint.y === pointA.y) ||
      //   (testPoint.x === pointB.x && testPoint.y === pointB.y)
      // ) {
      //   console.log("Hey!!!!");
      //   // throw new Error('hey')
      //   // eval('sdf(')
      //   // return false;
      // }

      if (this.edgeIntersectsRay(testPoint, pointA, pointB)) {
        intersections += 1;
      }
    }

    // If the number of intersections is odd, the point is inside
    return intersections % 2 === 1
      ? getClosestPointOnLine(testPoint, this.points) === 0
        ? false
        : true
      : false;
  }

  /**
   * Helper method to check if a ray from testPoint intersects an edge
   * @param {Vec2} testPoint - The point emitting the ray
   * @param {Vec2} pointA - First point of the edge
   * @param {Vec2} pointB - Second point of the edge
   * @returns {boolean} - True if the ray intersects the edge
   */
  edgeIntersectsRay(testPoint, pointA, pointB) {
    // Check if the edge crosses the horizontal ray extending from testPoint
    if (
      (pointA.y >= testPoint.y && pointB.y < testPoint.y) ||
      (pointB.y >= testPoint.y && pointA.y < testPoint.y)
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
  /**
   *
   * @param {PointMass} testPoint
   * @param {CanvasRenderingContext2D} ctx
   */
  respondToPoint(testPoint, ctx, check) {
    // check();
    let index = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i].pos;
      const point1 = this.points[(i + 1) % this.points.length].pos;
      const dist = pointLineDistPerfect(testPoint.pos, point, point1);
      if (dist < bestDist) {
        index = i;
        bestDist = dist;
      }
    }
    // console.log(bestDist,index);
    const point = this.points[index];
    const point1 = this.points[(index + 1) % this.points.length];
    // check();
    // ctx.beginPath()
    // ctx.moveTo(testPoint.pos.x,testPoint.pos.y)
    // const pr = projectPointOnLine([point.pos,point1.pos], testPoint.pos)
    // ctx.lineTo(pr.x,pr.y)
    // ctx.strokeStyle = 'white'
    // ctx.lineWidth = 1
    // ctx.stroke()

    resolvePointCollision(testPoint, point, point1, ctx, check);
    // console.log('here');
    return this;
  }
  genSprings(c) {
    const k = [];
    // this.points.forEach((p1) => {
    //   // if (c) {
    //   // this.staticPoints.forEach((p2) => {
    //   //   if (p1 !== p2) {
    //   //     k.push(new Spring(p1, p2, 0.1, 0.1));
    //   //   }
    //   // });
    //   // } else {
    //   //   this.points.forEach((p2) => {
    //   //     if (p1 !== p2) {
    //   //       k.push(new Spring(p1, p2));
    //   //     }
    //   //   });
    //   //   }
    // });
    this.points.forEach((p, i) => {
      //       this.staticPoints.forEach((p2) => {
      //   if (p1 !== p2) {
      //     k.push(new Spring(p1, p2));
      //   }
      // });
      const s = 0.5;
      k.push(new Spring(p, this.points[(i + 1) % this.points.length], s, s));
      k.push(new Spring(p, this.points[(i + 2) % this.points.length], s, s));
      k.push(new Spring(p, this.points[(i + 3) % this.points.length], s, s));
      // k.push(new Spring(p, this.points[(i+4)%this.points.length], s,s))
    });
    return k;
  }
  calcVolume() {
    let v = 0;
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i].pos;
      const p1 = this.points[(i + 1) % this.points.length].pos;
      v += (p.x - p1.x) * ((p1.y + p.y) / 2);
    }
    return v;
  }
  inflate(dt, ctx) {
    if (!(this instanceof Circle)) {
      return;
    }
    const l = this.points.length;
    const n = 4;

    for (let z = 0; z < n; z++) {
      const cv = this.calcVolume();
      let pt = [];
      for (let i = 0; i < l; i++) {
        const a = this.points[i];
        const b = this.points[(i + 1) % l];
        if (!pt[i]) {
          pt[i] = { pos: new Vec2(), vel: new Vec2() };
          // logLong(i)
        }

        if (!pt[(i + 1) % l]) {
          pt[(i + 1) % l] = { pos: new Vec2(), vel: new Vec2() };
        }

        // this.springs[i].applyConstraint();
        const pullTogether = () => {
          // this.springs[i].applyConstraint();

          // return
          const seg =
            Math.sin((2 * Math.PI) / this.points.length / 2) * this.rad * 2;
          const dist = a.pos.clone().sub(b.pos).mag();
          const target = (dist - seg) * 0.5;
          // z === n - 1 && i === 0 && console.log(dist, seg, target);
          if (target === 0) {
            return;
          }
          const p1Shift = { vel: new Vec2(), pos: new Vec2() };
          const p2Shift = { vel: new Vec2(), pos: new Vec2() };
          const p1 = b.pos.clone().sub(a.pos).unit().mult(target);
          const p2 = a.pos.clone().sub(b.pos).unit().mult(target);
          let p1v = p1.clone(); //.mult(0.5)
          let p2v = p2.clone(); //.mult(0.5)
          // if (i===0) {
          p1Shift.pos.add(p1);
          p1Shift.vel.add(p1v);
          // p1Shift.vel.mult(0.4);
          p2Shift.pos.add(p2);
          p2Shift.vel.add(p2v);
          // p2Shift.vel.mult(0.4);

          // }
          // p1Shift.pos.add(p1);
          // p1Shift.vel.add(p1);
          // p2Shift.pos.add(p2);
          // p2Shift.vel.add(p2);
          // console.log(p1Shift, p2Shift);
          pt[i].pos.add(p1Shift.pos);
          pt[i].vel.add(p1Shift.vel);
          pt[(i + 1) % l].pos.add(p2Shift.pos);
          pt[(i + 1) % l].vel.add(p2Shift.vel);
        };
        pullTogether();
      }
      for (let i = 0; i < this.points.length; i++) {
        const a = this.points[i];

        a.pos.add(pt[i].pos);
        a.vel.add(pt[i].vel);
      }
      pt = [];
      for (let i = 0; i < l; i++) {
        // this.springs.forEach(s=>{
        // this.springs[i].applyConstraint()
        // // })
        //   const segmentLength =
        //     (Math.sqrt(this.gas / Math.PI) * 2 * Math.PI) /
        //     (Math.PI * this.points.length);
        // const circumfrence = this.rad * 2 * Math.PI;
        const circumfrence =
          Math.sin((2 * Math.PI) / this.points.length / 2) *
          this.rad *
          2 *
          this.points.length;
        // const circumfrence = this.rad **2

        const a = this.points[i];
        const b = this.points[(i + 1) % l];

        // this.springs[i].applyConstraint()
        const v = ((this.gas - cv) * 0.016) / n //- (this.ov?this.ov/2:0);
        // this.ov = v
        // v > 1000 && 
        // logLong(v);
        const dir = a.pos
          .clone()
          .sub(b.pos)
          .swap()
          .mult(-1, 1)
          .unit()
          // .mult(v );
          // .mult(v * (a.pos.clone().sub(b.pos).mag()/segmentLength)*0.2);
          .mult((v * a.pos.clone().sub(b.pos).mag()) / circumfrence);
        if (!pt[i]) {
          pt[i] = { pos: new Vec2(), vel: new Vec2() };
        }
        if (!pt[(i + 1) % l]) {
          pt[(i + 1) % l] = { pos: new Vec2(), vel: new Vec2() };
        }

        pt[i].pos.add(dir);
        pt[i].vel.add(dir);
        pt[(i + 1) % l].pos.add(dir);
        pt[(i + 1) % l].vel.add(dir);
        // a.pos.add(dir);
        // b.pos.add(dir);
        // a.vel.add(dir);
        // b.vel.add(dir);
        // this.springs[i].applyConstraint((i===l-1)?1:1, (i===l-1)?1:1);
        // a.pos.add(a.vel);
        // b.pos.add(b.vel);
        // /**
        //  * @type {CanvasRenderingContext2D}
        //  */
        if (z === n - 1) {
          const a_pos = a.pos.clone(); //.add(dir)
          const b_pos = b.pos.clone(); //.add(dir)
          // ctx.beginPath();
          let m = a_pos.clone().add(b_pos.clone().sub(a_pos).mult(0.5));

          // ctx.moveTo(m.x, m.y);
          // let f = 0;
          // ctx.lineTo(m.x + dir.x * 200, m.y + dir.y * 200);
          // ctx.strokeStyle = "blue";
          // ctx.lineWidth = 1;
          // ctx.stroke();

          // ctx.fillText(a_pos.clone().sub(b_pos).mag(), m.x + 5, m.y + 5);
        }

        // if (Math.random() < 0.005) {
        //   console.log(m);
        // }
      }
      if (z === n - 1) {
        for (let i = 0; i < this.points.length; i++) {
          const a = this.points[i];
          const b = this.points[(i + 1) % l];

          a.pos.add(pt[i].pos);
          a.vel.add(pt[i].vel);

          // // if (z === n - 1) {
          // const a_pos = a.pos.clone(); //.add(dir)
          // const b_pos = b.pos.clone(); //.add(dir)
          // // ctx.beginPath();
          // let m = a_pos.clone().add(b_pos.clone().sub(a_pos).mult(0.5));
          this.pts =pt
          // ctx.fillText(a_pos.clone().sub(b_pos).mag(), m.x + 5, m.y + 5);
          // }
        }
      }
      //       for (let i = 0; i < l; i++) {
      //         const a = this.points[(i - 1 + l) % l];
      //         // console.log((i - 1 + l) % l,i,(i + 1) % l,l);
      //         // console.log(a);
      //         const b = this.points[i];
      //         const c = this.points[(i + 1) % l];
      //  const segmentLength  = (Math.sqrt(this.gas / Math.PI) * 2 * Math.PI) /
      //  (Math.PI * this.points.length)
      //         const contract = (a, b, m = 1) => {
      //           const overShoot =
      //             segmentLength -
      //             dist2(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
      //           const n = b.pos.clone().sub(a.pos).unit();
      //           const f = -0.5;
      //           const corr = new Vec2(
      //             (n.x * overShoot * f) / 2,
      //             (n.y * overShoot * f) / 2
      //           );
      //           a.vel.add(corr);
      //           b.vel.sub(corr);
      //           a.pos.add(corr);
      //           b.pos.sub(corr)
      //         };
      //         contract(a, b,2);
      //         contract(b, c,2);
      //         // contract(a, c, 2);

      //         // const adiffb = b.pos.clone().sub(a.pos);
      //         // const bdiffc = c.pos.clone().sub(b.pos);
      //         // // console.log(b.pos.clone(),a.pos);
      //         // const perpen=adiffb.unit().swap().mult(-1, 1).add(bdiffc.unit().swap().mult(-1, 1)).mult(1/2);
      //         const adiffc = c.pos.clone().sub(a.pos);
      //         // console.log(b.pos.clone(),a.pos);
      //         const perpen = adiffc.unit().swap().mult(-1, 1);
      //         // const diff = b.pos.sub(a)
      //         // const perpendic ular = new Vec2(-diff.y,diff.x)
      //         // debugger
      //         b.vel.add(
      //           perpen
      //             .clone()
      //             .mult(
      //               (
      //                 (
      //                 this.gas - this.calcVolume()) *
      //                 -0.00001
      //                 //  *
      //                 // dist2(a.pos.x, a.pos.y, c.pos.x, c.pos.y)/
      //                 // segmentLength*this.points.length
      //               )

      //             )
      //         );
      //         if (Math.random() < 0.0005) {
      //           // console.log(
      //           //   perpen.clone().mult((this.gas - this.calcVolume()) * -0.00005)
      //           // );
      //           // console.log(
      //           //   (Math.sqrt(this.gas / Math.PI) * 2 * Math.PI) / this.points.length,
      //           //   dist2(b.pos.x, b.pos.y, c.pos.x, c.pos.y)
      //           // );
      //           // console.log(this.calcVolume(),perpen,this.gas,perpen);
      //           // b.vel.add(Math.random())
      //         }
      //       }
    }
  }
  computeCenter() {
    return this.points
      .map((p) => p.pos.clone().div(this.points.length))
      .reduce((p1, p2) => p1.add(p2));
  }
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  shapeMatch(ctx) {
    const center = this.points
      .map((p) => p.pos.clone())
      .reduce((p1, p2) => p1.add(p2))
      .div(this.points.length);
    // ctx.beginPath()
    // ctx.arc(center.x, center.y, 10, 0, Math.PI*2)
    // ctx.fillStyle = 'white'
    // ctx.fill()
    // const minx = this.points.reduce((p, p1)=>p.pos.x<p1.pos.x?p:p1).pos.x
    // const miny = this.points.reduce((p, p1)=>p.pos.y<p1.pos.y?p:p1).pos.y
    // const maxx = this.points.reduce((p, p1)=>p.pos.x>p1.pos.x?p:p1).pos.x
    // const maxy = this.points.reduce((p, p1)=>p.pos.y>p1.pos.y?p:p1).pos.y
    // const center = new Vec2(minx,miny).add(maxx,maxy).div(2)

    const angle = (v) => {
      console.log(
        (v / Math.PI) * 180,
        ((v < 0 ? v + Math.PI * 2 : v) / Math.PI) * 180
      );
      return v < 0 ? v + Math.PI * 2 : v;
    };
    const normalizeAngle = (a) => {
      // Normalize the difference to be within [-PI, PI]
      while (a > Math.PI) {
        a -= 2 * Math.PI;
      }
      while (a < -Math.PI) {
        a += 2 * Math.PI;
      }
      return a;
    };
    const positiveAngle = (a) => {
      while (a < 0) {
        a += 2 * Math.PI;
      }
      return a;
    };

    let as = [];
    const rotation =
      averageAngles(
        this.points.map((p, i) => {
          let a = center.dirTo(p.pos) - Vec2.zero().dirTo(this.frame[i]);
          as.push(a);
          return a;
        })
      ) + Math.PI;

    // if (window.r && Math.abs(window.r - rotation) > Math.PI/4) {
    //   console.log(
    //     ((rotation * this.points.length) / Math.PI) * 180,
    //     (rotation / Math.PI) * 180,
    //     as.map((r) => (r / Math.PI) * 180)
    //   );
    //   window.r = rotation;
    // } else if (!window.r) {
    //   window.r = rotation;
    // }
    // console.log((rotation / Math.PI) * 180);

    // ctx.beginPath();
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const target = this.frame[i].clone();
      // console.log(!this.fixed);
      if (!this.fixed) {
        target.rotate(0, 0, rotation).add(center);
      }
      // let m = i === 0 ? "mov" : "lin";
      // ctx[m + "eTo"](target.x, target.y);

      const tenacity = 0.5;

      point.pos.add(target.clone().sub(point.pos).mult(tenacity));
      point.vel.add(target.clone().sub(point.pos).mult(tenacity));
    }
    // ctx.strokeStyle = "black";
    // ctx.lineWidth = 3;
    // ctx.stroke();

    // for (let i = 0; i < this.points.length; i++) {

    //   const p = this.points[i].pos;
    //   const p1 = this.frame[i].clone().rotate(0, 0, rotation).add(center);
    //   const tx = p1.x - p.x;
    //   const ty = p1.y - p.y;
    //   ctx.beginPath();
    //   ctx.moveTo(p.x, p.y);
    //   const n = 25;
    //   for (let j = 0; j <= n; j++) {
    //     const m = 2
    //     const d = Math.hypot(ty, tx);
    //     const dx = tx / d;
    //     const dy = ty / d;
    //     const jx = (j % 2 === 0 ? -m : m) * dy;
    //     const jy = (j % 2 === 0 ? m : -m) * dx;

    //     ctx.lineTo(p.x + (tx * j) / n - jx, p.y + (ty * j) / n - jy);
    //   }
    //   ctx.lineTo(p1.x, p1.y);
    //   ctx.strokeStyle = "yellow";
    //   ctx.lineWidth = 2;
    //   ctx.lineJoin = 'round'
    //   ctx.stroke();
    //   // console.log(p.pos.x);
    // }
  }
  clone() {
    throw new Error("Out dated");
    let sft = new SoftBody(
      this.points.map((p) => p.clone()),
      this.type,
      this.name
    );
    sft.fric = this.fric;
    sft.gas = this.gas;
    sft.name = this.name;
    sft.springs = this.springs.map((s) => s.clone());
    return sft;
  }
}

export { SoftBody, STATIC, NORMAL, INFLATED, KINETIC };

// /**
//  *
//  * @param {Vec2} testPoint
//  * @returns {boolean}
//  */
// pointIn(testPoint, s) {
//   let inIt = false;

//   const bb = this.getBoundingBox();
//   // console.log(bb);
//   const outPointX = bb.maxX + 1;
//   for (let i = 0; i < this.points.length - 1; i++) {
//     const point = this.points[i].pos;
//     const point1 = this.points[i + 1].pos;
//     if (point1.y === point.y) {
//       if (
//         testPoint.x > Math.min(point.x, point1.x) &&
//         testPoint.x < Math.max(point.x, point1.x)
//       ) {
//         inIt=!inIt
//         continue
//       }
//     }
//     const y = testPoint.y;
//     const ratio = (y - point.y) / (point1.y - point.y);
//     const intersectionX = ratio * (point1.x - point.x);
//     // if (s) {
//     // debugger;
//     // }
//     if (
//       Math.min(testPoint.x, outPointX) < intersectionX &&
//       Math.max(testPoint.x, outPointX) > intersectionX
//     ) {
//       // console.log("in");
//       inIt = !inIt;
//     }
//   }
//   return inIt;
//   // throw new Error('Not impl.')
// }

// /**
//  * Respond to a PointMass interacting with the Softbody.
//  * @param {PointMass} testPoint - The point mass interacting with the softbody.
//  */
// respondToPoint(testPoint) {
//   let closestEdge = null;
//   let closestPointOnEdge = null;
//   let minDistance = Infinity;

//   // Step 1: Find the closest edge
//   for (let i = 0; i < this.points.length; i++) {
//     let pointA = this.points[i].pos;
//     let pointB = this.points[(i + 1) % this.points.length].pos;

//     let edgePoint = this.#getClosestPointOnEdge(
//       testPoint.pos,
//       pointA,
//       pointB
//     );
//     let distance = this.#distanceBetween(testPoint.pos, edgePoint);

//     if (distance < minDistance) {
//       minDistance = distance;
//       closestEdge = {
//         pointA: this.points[i],
//         pointB: this.points[(i + 1) % this.points.length],
//       };
//       closestPointOnEdge = edgePoint;
//     }
//   }

//   // Step 2: Calculate distance-based weights
//   let distanceA = this.#distanceBetween(
//     testPoint.pos,
//     closestEdge.pointA.pos
//   );
//   let distanceB = this.#distanceBetween(
//     testPoint.pos,
//     closestEdge.pointB.pos
//   );
//   let totalDistance = distanceA + distanceB;

//   let weightA = distanceB / totalDistance;
//   let weightB = distanceA / totalDistance;

//   // Step 3: Calculate movement deltas with mass adjustment
//   let totalDelta = {
//     x: (testPoint.pos.x - closestPointOnEdge.x) * 0.5,
//     y: (testPoint.pos.y - closestPointOnEdge.y) * 0.5,
//   };

//   let testDelta = {
//     x: totalDelta.x / testPoint.mass,
//     y: totalDelta.y / testPoint.mass,
//   };

//   let deltaA = {
//     x: (totalDelta.x * weightA) / closestEdge.pointA.mass,
//     y: (totalDelta.y * weightA) / closestEdge.pointA.mass,
//   };

//   let deltaB = {
//     x: (totalDelta.x * weightB) / closestEdge.pointB.mass,
//     y: (totalDelta.y * weightB) / closestEdge.pointB.mass,
//   };

//   // Step 4: Apply movements
//   testPoint.pos.x += testDelta.x;
//   testPoint.pos.y += testDelta.y;

//   closestEdge.pointA.pos.x -= deltaA.x;
//   closestEdge.pointA.pos.y -= deltaA.y;

//   closestEdge.pointB.pos.x -= deltaB.x;
//   closestEdge.pointB.pos.y -= deltaB.y;
// }

// /**
//  * Get the closest point on an edge to a given point.
//  * @param {Vec2} point - The point to check.
//  * @param {Vec2} pointA - Start point of the edge.
//  * @param {Vec2} pointB - End point of the edge.
//  * @returns {Vec2} - The closest point on the edge.
//  */
// #getClosestPointOnEdge(point, pointA, pointB) {
//   let edgeVector = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
//   let pointVector = { x: point.x - pointA.x, y: point.y - pointA.y };

//   let edgeLengthSquared =
//     edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y;

//   let t = Math.max(
//     0,
//     Math.min(
//       1,
//       (pointVector.x * edgeVector.x + pointVector.y * edgeVector.y) /
//         edgeLengthSquared
//     )
//   );

//   return {
//     x: pointA.x + edgeVector.x * t,
//     y: pointA.y + edgeVector.y * t,
//   };
// }

// /**
//  * Calculate the distance between two points.
//  * @param {Vec2} point1 - First point.
//  * @param {Vec2} point2 - Second point.
//  * @returns {number} - The distance between the points.
//  */
// #distanceBetween(point1, point2) {
//   return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
// }
