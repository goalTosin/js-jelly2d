import { PointMass } from "./pointMass.js";
import { SoftBody, INFLATED, NORMAL } from "./softBody.js";
import { Spring } from "./spring.js";
import { wrap } from "./utils.js";
import Vec2 from "./vec2.js";

class Circle extends SoftBody {
  /**
   *
   * @param {Object} options
   * @param {number?} options.rad
   * @param {number?} options.gas
   * @param {number?} options.tenacity
   * @param {number?} options.nSegs
   * @param {number?} options.type INFLATED, STATIC or DYNAMIC
   * @param {Vec2?} options.pos
   * @param {string?} options.name
   * @param {number?} options.mass
   */
  constructor(options) {
    options = {
      rad: 10,
      nSegs: 10,
      type: INFLATED,
      tenacity: 1,
      pos: new Vec2(0, 0),
      name: "Circle",
      mass: 1,
      ...options,
    };
    options.gas = options.gas ? options.gas : options.rad ** 2 * 3.14
    // options.rad = options.rad
    const points = [];
    for (let i = 0; i < options.nSegs; i++) {
      const a = ((Math.PI * 2) / options.nSegs) * i - Math.PI / 4;
      points.push([Math.cos(a) * options.rad, Math.sin(a) * options.rad]);
    }
    super(
      points.map(
        (p) =>
          new PointMass(new Vec2(p[0], p[1]).add(options.pos), options.mass)
      ),
      [],
      options.type,
      options.name, false, options.collisionFilter
    );
    this.gas = options.gas;
    this.rad = options.rad;
    this.springs = [];
    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      const p2 = this.points[(i + 1) % this.points.length];
      this.springs.push(new Spring(p1, p2, options.tenacity));
    }
  }
}
class Rectangle extends SoftBody {
  /**
   *
   * @param {Object} options
   * @param {number?} options.width
   * @param {number?} options.height
   * @param {number?} options.type INFLATED, STATIC or DYNAMIC
   * @param {Vec2?} options.pos
   * @param {string?} options.name
   * @param {number?} options.mass
   */
  constructor(options) {
    options = {
      width: 100,
      height: 100,
      type: NORMAL,
      pos: new Vec2(0, 0),
      name: "Rectangle",
      mass: 1,
      fixed: false,
      collideEv:null,
      ...options,
    };
    const w = options.width;
    const h = options.height;
    const breakDist = Math.min(w, h) / 8;
    const pr = -Math.PI; //*Math.random()*2-Math.PI
    const vr = Math.PI / 2; //*Math.random()*2-Math.PI
    const shape = [
      [-w / 2 + breakDist, -h / 2],
      [0, -h / 2],
      
      [w / 2 - breakDist, -h / 2],
      [w / 2, -h / 2 + breakDist],
      [w / 2, h / 2 - breakDist],
      [w / 2 - breakDist, h / 2],
      [0, h / 2],
      [-w / 2 + breakDist, h / 2],
      [-w / 2, h / 2 - breakDist],
      [-w / 2, -h / 2 + breakDist],
    ];
    super(
      shape.map(
        (p) =>
          new PointMass(
            wrap(
              (v) =>v,// (options.fixed ? v : v.add(options.pos)),
              new Vec2(p[0], p[1]).rotate(0, 0, pr).add(options.pos)
            ),
            options.mass
          )
      ),
      shape.map((p) =>
        wrap(
          (v) => (options.fixed ? v.add(options.pos) : v),
          new Vec2(p[0], p[1])
        )
      ),
      options.type,
      options.name,
      options.fixed,
      options.collisionFilter
    );
    this.collideEv = options.collideEv

    // const av = 50
    // for (let i = 0; i < this.points.length; i++) {
    //   const point = this.points[i];
    //   let unit = Vec2.from(shape[i]).unit().swap().mult(1,-1)
    //   point.vel.add(unit.mult(av))
    // }
    this.springs = [];
    //     const used = []
    //     this.points.forEach((p,i) => {
    //       this.points.forEach((p1,i2) => {
    // if (p1!==p && !(used.includes(i) ||used.includes(i2))) {

    //       this.springs.push(new Spring(p,p1,1))
    //       // used.push(i,i2)
    // }
    //       })
    //     })
    const structure = [
      // // direct-connection
      // 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 0,
      // cross connection
      0, 3, 7, 4, 1, 6, 2, 5,
      // adjacent connection
      1, 4, 0, 5, 7, 2, 6, 3,
      // adjacent cross connection
      4, 6, 5, 3, 2, 4, 1, 3, 2, 0, 1, 7, 0, 6, 7, 5,
    ].map(p => p>0?p+1:p).map(p => p>5?p+1:p);
    for (let i = 0; i < structure.length; i += 2) {
      this.springs.push(
        new Spring(this.points[structure[i]], this.points[structure[i + 1]])
      );
    }
    // const flips = [
    //   2, 3,
    //   1, 4
    // ]
    // for (let i = 0; i < flips.length; i+=2) {
    //   [this.points[flips[i]].pos, this.points[flips[i+1]].pos] = [this.points[flips[i+1]].pos, this.points[flips[i]].pos]
    // }
  }
}
class CarShape extends SoftBody {
  constructor(w, h, type, name, pos = new Vec2(0, 0)) {
    const breakDist = Math.min(w, h) / 8;
    super(
      [
        [-w / 2 + breakDist, -h / 2],
        [w / 2 - breakDist, -h / 2],
        [w / 2, -h / 2 + breakDist],
        [w / 2, h / 2 - breakDist],
        [w / 2 - breakDist, h / 2],
        [-w / 2 + breakDist, h / 2],
        [-w / 2, h / 2 - breakDist],
        [-w / 2, -h / 2 + breakDist],
      ].map((p) => new PointMass(new Vec2(p[0], p[1]).add(pos))),
      type,
      name
    );
  }
}

export { Rectangle, Circle };
