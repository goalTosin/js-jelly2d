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
} from "./utils.js";
import { Spring } from "./spring.js";
import { Circle } from "./shapes.js";

const STATIC = 0;
const NORMAL = 1;
const INFLATED = 2;

class SoftBody {
  /**
   *
   * @param {PointMass[]} points
   * @param {*} type
   * @param {*} name
   */
  constructor(points = [], type = NORMAL, name) {
    /**
     * @type {PointMass[]}
     */
    this.points = points;
    /**
     * @type {PointMass[]}
     */
    this.staticPoints = points.map(
      (p) => new PointMass(p.pos.clone(), p.mass, p.vel.clone())
    );
    this.type = type;
    this.name = name;
    /**
     * @type {Spring[]}
     */
    this.springs = [];
    this.fric = 1;
    this.gas = 0;
  }
  /**
   *
   * @param {SoftBody} softBody
   * @returns {boolean}
   */
  collidesWith(softBody, _versa = true) {
    // if the other body collides with this
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
      let pointB = this.points[(i + 1) % this.points.length].pos; // Wrap around for the last edge
      // if (
      //   (testPoint.x === pointA.x && testPoint.y === pointA.y) ||
      //   (testPoint.x === pointB.x && testPoint.y === pointB.y)
      // ) {
      //   console.log("Hey!!!!");
      //   // return false
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

    // testPoint.pos.add(testReturn);

    // point.pos.add(pointReturn);
    // point1.pos.add(point1Return);

    // // const add = testPoint.vel.clone().add(point.vel.clone().add(point1.vel).div(2,2))
    // point.vel.sub(testReturn);
    // point1.vel.sub(testReturn);

    // testPoint.vel.add(testReturn);
    // testPoint.vel.mult(1-this.fric,1-this.fric);

    // if (this.name === "small") {
    //   setTimeout(() => (window.p = 1000), 0);
    // }

    // point.vel.sub(pointReturn)
    // point1.vel.sub(point1Return)

    // console.log(testTarget);

    // const dir =
    //   Math.atan2(
    //     testTarget.y - testPoint.pos.y,
    //     testTarget.x - testPoint.pos.x
    //   ) //+ Math.PI;

    // const testTargetDist = Math.hypot(
    //   testTarget.x - testPoint.pos.x,
    //   testTarget.y - testPoint.pos.y
    // );

    // const pointTarget = new Vec2(
    //   Math.cos(dir) * testTargetDist,
    //   Math.sin(dir) * testTargetDist
    // );

    // const point1Target = new Vec2(
    //   Math.cos(dir) * testTargetDist,
    //   Math.sin(dir) * testTargetDist
    // );
    // // testPoint.test = true
    // // point.test = true
    // // point1.test = true
    // // console.log(testTargetDist);
    // // setTimeout(() => {
    // //   testPoint.test = false
    // //   point.test = false
    // //   point1.test = false
    // //   }, 1000)
    // // circ(ctx,testTarget.x, testTarget.y)

    // const a = 0.5;
    // testPoint.pos.lerp(testTarget, a);
    // testPoint.vel.add(distVec);

    // console.log(testPoint.pos);
    // console.log(testTarget);
    // point.pos.add(Math., a);
    // point1.pos.lerp(point1Target, a);
    // setTimeout(() => (window.p = 1000), 0);
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

      for (let i = 0; i < l; i++) {
        // this.springs.forEach(s=>{
        //   s.applyConstraint()
        // // })
        //   const segmentLength =
        //     (Math.sqrt(this.gas / Math.PI) * 2 * Math.PI) /
        //     (Math.PI * this.points.length);
        const circumfrence = this.rad ** 2 * Math.PI; // Math.PI;

        // this.springs[i].applyConstraint()
        const a = this.points[i];
        const b = this.points[(i + 1) % l];
        const v = (cv - this.gas) / n;
        const dir = b.pos
          .clone()
          .sub(a.pos)
          .swap()
          .mult(-1, 1)
          .unit()
          // .mult(v );
          // .mult(v * (a.pos.clone().sub(b.pos).mag()/segmentLength)*0.2);
          .mult(v * (a.pos.clone().sub(b.pos).mag() / circumfrence));
        a.pos.add(dir);
        b.pos.add(dir);
        a.vel.add(dir);
        b.vel.add(dir);

        this.springs[i].applyConstraint();
        // a.pos.add(a.vel);
        // b.pos.add(b.vel);
        // /**
        //  * @type {CanvasRenderingContext2D}
        //  */
        if (z === n - 1) {
          const a_pos = a.pos.clone(); //.add(dir)
          const b_pos = b.pos.clone(); //.add(dir)
          ctx.beginPath();
          let m = a_pos.clone().add(b_pos.clone().sub(a_pos).mult(0.5));

          ctx.moveTo(m.x, m.y);
          let f = 0;
          ctx.lineTo(m.x + dir.x * 400, m.y + dir.y * 400);
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // if (Math.random() < 0.005) {
        //   console.log(m);
        // }
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
  clone() {
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

export { SoftBody, STATIC, NORMAL, INFLATED };

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
