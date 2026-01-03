import PointMass from "./pointMass.js";
import Vec2 from "./vec2.js";
import {
  pointLineProjectible,
  pointLineDist,
  projectPointOnLine,
  circ,
  projectPoint,
} from "./utils.js";
import { Spring } from "./spring.js";

const STATIC = 0;
const NORMAL = 1;

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
    this.springs = [];
    this.fric = 0.1
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

      if (this.edgeIntersectsRay(testPoint, pointA, pointB)) {
        intersections += 1;
      }
    }

    // If the number of intersections is odd, the point is inside
    return intersections % 2 === 1;
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
      (pointA.y > testPoint.y && pointB.y <= testPoint.y) ||
      (pointB.y > testPoint.y && pointA.y <= testPoint.y)
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
  respondToPoint(testPoint) {
    let closestPointLineI = NaN;
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i].pos;
      const point1 = this.points[(i + 1) % this.points.length].pos;
      if (
        isNaN(closestPointLineI) ||
        (pointLineProjectible(
          testPoint.pos,
          this.points[closestPointLineI].pos,
          this.points[closestPointLineI + 1].pos
        ) &&
          pointLineDist(
            testPoint.pos,
            this.points[closestPointLineI].pos,
            this.points[closestPointLineI + 1].pos
          ) > pointLineDist(testPoint.pos, point, point1))
      ) {
        closestPointLineI = i;
      }
      // console.log(point, point1);
      // console.log(
      //   pointLineProjectible(
      //     testPoint.pos,
      //     this.points[closestPointLineI].pos,
      //     this.points[closestPointLineI + 1].pos
      //   ),
      //   pointLineDist(
      //     testPoint.pos,
      //     this.points[closestPointLineI].pos,
      //     this.points[closestPointLineI + 1].pos
      //   ),
      //   pointLineDist(testPoint.pos, point, point1)
      // );
      // console.log('---------------------------------------------');
    }
    const point = this.points[closestPointLineI];
    const point1 = this.points[(closestPointLineI + 1) % this.points.length];

    const testTarget = projectPointOnLine(
      [point.pos, point1.pos],
      testPoint.pos
    );

    const distVec = testTarget.sub(testPoint.pos);
    // console.log(distVec);
    const pointP = projectPoint([point.pos, point1.pos], testPoint.pos);
    const point1P = projectPoint([point1.pos, point.pos], testPoint.pos);
    const pointsP = point1P + pointP;
    const pointW = (point.mass * pointP) / pointsP;
    const point1W = (point1.mass * point1P) / pointsP;

    const massTestAvgSum = testPoint.mass + (point.mass + point1.mass) / 2;

    const testPointRatio = (point.mass + point1.mass) / 2;
    const testReturn = distVec.clone().mult(testPointRatio, testPointRatio);
    testPoint.pos.add(testReturn);

    const pointsRatio = testPoint.mass / massTestAvgSum;
    const pointsReturn = distVec
      .clone()
      .mult(-2, -2)
      .mult(pointsRatio, pointsRatio);

    const pointsMassSum = point.mass + point1.mass;
    const pointRatio = point1W / pointsMassSum;
    const pointReturn = pointsReturn.clone().mult(pointRatio, pointRatio);

    const point1Ratio = pointW / pointsMassSum;
    const point1Return = pointsReturn.clone().mult(point1Ratio, point1Ratio);

    point.pos.add(pointReturn);
    point1.pos.add(point1Return);

    // const add = testPoint.vel.clone().add(point.vel.clone().add(point1.vel).div(2,2))
    point.vel.sub(testReturn);
    point1.vel.sub(testReturn);

    testPoint.vel.add(testReturn);
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
    this.points.forEach((p1) => {
      // if (c) {
        // this.staticPoints.forEach((p2) => {
        //   if (p1 !== p2) {
        //     k.push(new Spring(p1, p2, 0.1, 0.1));
        //   }
        // });
      // } else {
      //   this.points.forEach((p2) => {
      //     if (p1 !== p2) {
      //       k.push(new Spring(p1, p2));
      //     }
      //   });
      //   }
    });
    this.points.forEach((p,i) => {
        //       this.staticPoints.forEach((p2) => {
        //   if (p1 !== p2) {
        //     k.push(new Spring(p1, p2));
        //   }
        // });
        const s = 0.5
        k.push(new Spring(p, this.points[(i+1)%this.points.length], s,s))
        k.push(new Spring(p, this.points[(i+2)%this.points.length],s,s))
        k.push(new Spring(p, this.points[(i+3)%this.points.length], s,s))
        // k.push(new Spring(p, this.points[(i+4)%this.points.length], s,s))
      })
    return k;
  }
}

export default SoftBody;
export { STATIC, NORMAL };

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
