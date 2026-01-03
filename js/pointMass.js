import Vec2 from "./vec2.js"

class PointMass {
  constructor(pos =new Vec2(0,0), mass = 1, vel = new Vec2(0,0)) {
    this.pos = pos
    this.mass = mass
    this.vel = vel
  }
  clone( ) {
    return new PointMass(this.pos.clone(), this.mass, this.vel)
  }
}

export {PointMass}