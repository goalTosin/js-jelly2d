import {PointMass} from "./pointMass.js";

class Spring {
  /**
   * @param {PointMass} point1
   * @param {PointMass} point2
   */
  constructor(point1, point2, stiffness = 0.2,targetDist) {
    this.point1 = point1;
    this.point2 = point2;
    this.stiffness = stiffness; 
    // this.p1strength = p1strength; 
    this.targetDist = targetDist?targetDist: Math.hypot(
      this.point1.pos.x - this.point2.pos.x,
      this.point1.pos.y - this.point2.pos.y
    );
  }

  /**
   * Adjusts the two points to maintain the target distance.
   */
  applyConstraint(a= 1,b=1) {
    // Calculate the current distance
    const dx = this.point2.pos.x - this.point1.pos.x;
    const dy = this.point2.pos.y - this.point1.pos.y;
    const dist = Math.hypot(dx, dy);

    // Calculate the overshoot (positive if stretched, negative if compressed)
    const overShoot = dist - this.targetDist;
    if (overShoot === 0) {
      return
    }

    // Normalize the direction vector between the two points
    const nx = dx / dist;
    const ny = dy / dist;

    // Calculate the adjustment distance for each point
    // const adjust = overShoot * this.strength;
    // const p1strength = this.p1strength//(this.p1strength+this.p2strength)
    // const p2strength = this.p2strength//(this.p1strength+this.p2strength)
const stiffness= this.stiffness
    // Apply adjustments to both points proportionally based on their masses
    const totalMass = this.point1.mass + this.point2.mass;
    const ratio1 = this.point2.mass / totalMass *a;
    const ratio2 = this.point1.mass / totalMass*b;

    this.point1.vel.x += nx * overShoot * ratio1 * stiffness ;
    this.point1.vel.y += ny * overShoot * ratio1 * stiffness ;

    this.point2.vel.x -= nx * overShoot * ratio2 * stiffness;
    this.point2.vel.y -= ny * overShoot * ratio2 * stiffness;

    this.point1.pos.x += nx * overShoot * ratio1 * stiffness ;
    this.point1.pos.y += ny * overShoot * ratio1 * stiffness ;

    this.point2.pos.x -= nx * overShoot * ratio2 * stiffness;
    this.point2.pos.y -= ny * overShoot * ratio2 * stiffness;
  }
  clone() {
    return new Spring(this.point1, this.point2, this.stiffness, this.targetDist)
  }
}

class Weld {
  /**
   * @param {PointMass} point1
   * @param {PointMass} point2
   */
  constructor(point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
  }

  /**
   * Adjusts the two points to maintain the target distance.
   */
  drag() {
    this.point2.pos.x = this.point1.pos.x;
    this.point2.pos.y = this.point1.pos.y;
  }
}

export { Spring, Weld };
