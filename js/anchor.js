import { PointMass } from "./pointMass.js";
import Vec2 from "./vec2.js";

class Anchor {
  /**
   *
   * @param {PointMass[]} points
   * @param {number[]} weights
   * @param {number} mass
   */
  constructor(points, weights, mass = 1) {
    this.points = points;
    this.mass = mass;
    this.weights = weights ? weights : points.map((_) => 1);
    this.computeWeightSum();
    this.computePos();
  }
  computeWeightSum() {
    this.weightSum = this.weights.reduce((a, b) => a + b);
  }
  computePos() {
    const pos = this.points
      .map((p) => {
        return p.pos.clone();
      })
      .reduce((p1, p2) => p1.add(p2))
      .div(this.points.length);
    const shift = Vec2.zero();
    this.points.forEach((p, i) => {
      shift.add(
        pos
          .clone()
          .sub(p.pos)
          .mult(this.weights[i] / this.weightSum)
      );
    });
    // const  p = this.points
    // .map((p, i) =>{
    //   return p.pos
    //     .clone()
    //     .mult(
    //       this.weights.length
    //         ? (this.weights[i] / this.weightSum)
    //         : (1 / this.points.length)
    //     )}
    // )
    // .reduce((p1, p2) => p1.add(p2));
    // console.log(p);

    this.pos = pos.add(shift);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  debug(ctx) {
    const pos = this.points
      .map((p) => {
        return p.pos.clone();
      })
      .reduce((p1, p2) => p1.add(p2))
      .div(this.points.length);

    const cl = this.points
      .map((p) => p.pos.clone().sub(pos).mag() / this.points.length)
      .reduce((p1, p2) => p1 + p2);
    // const shift = Vec2.zero();
    // this.points.forEach((p, i) => {
    //   ctx.beginPath();
    //   const unit = pos.clone().sub(p.pos).unit();
    //   const w = this.weights[i] / this.weightSum;
    //   const m = (cl * pos.clone().sub(p.pos).mag()) / 5;
    //   ctx.moveTo(pos.x, pos.y);
    //   ctx.lineTo(pos.x + unit.x * w * m, pos.y + unit.y * w * m);
    //   ctx.lineWidth = 1;
    //   ctx.strokeStyle = "red";
    //   ctx.stroke();
    //   // shift.add(pos.clone().sub(p.pos).mult(w));
    // });
  }
  moveTowards(anchor) {
    this.computePos();
    anchor.computePos()
    let l =false// Math.random() < 0.1;
    const dir = anchor.pos.sub(this.pos); //.sub(-15, -15);
    // console.log(dir);
    const ps = [];
    for (let i = this.points.length - 1; i > -1; i--) {
      // console.log(i,this.points.length);
      ps[i] = { pos: Vec2.zero(), vel: new Vec2() };
      const p = this.points[(i) % this.points.length];

      l && console.log(dir);

      p.pos.add(dir.clone().mult(0.5));
      p.vel.add(dir.clone().mult(0.5));
    }
    l && console.log("_____");
    return ps;
  }
}

export { Anchor };
