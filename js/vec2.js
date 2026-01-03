class Vec2 {
  constructor(x = 0, y = 0) {
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    } else if (y == null && y !== 0) {
      y = x;
    }

    this.x = x;
    this.y = y;
  }

  lerp(x, y, a) {
    if (
      x instanceof Vec2 ||
      (typeof x.x === "number" && typeof x.y === "number")
    ) {
      [x, y, a] = [x.x, x.y, y];
    }
    this.x += (x - this.x) * a;
    this.y += (y - this.y) * a;
    return this;
  }

  add(x, y) {
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    } else if (y == null && y !== 0) {
      y = x;
    }

    this.x += x;
    this.y += y;
    return this;
  }

  sub(x, y,t) {
    t&&console.log(x,y);
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    } else if (y == null && y !== 0) {
      y = x;
    }
    t&&console.log(x,y);
    this.x -= x;
    this.y -= y;
    return this;
  }

  mult(x, y) {
  //  l&& console.log('before:',this);
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    } else if (y == null && y !== 0) {
      y = x;
    }
    // l&& console.log('after:',x,y);
    this.x *= x;
    this.y *= y;
    // l&& console.log('after2:',this.x,this.y);
    return this;
  }

  div(x, y) {
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    } else if (y == null && y !== 0) {
      y = x;
    }
    this.x /= x;
    this.y /= y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  swap() {
    [this.x, this.y] = [this.y, this.x];
    return this;
  }

  set(x, y) {
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    } else if (y == null && y !== 0) {
      y = x;
    }
    this.x = x;
    this.y = y;
    return this;
  }

  copy(x, y) {
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    }
    this.x = x;
    this.y = y;
    return this;
  }
  unit() {
    const m = this.mag();
    if (m === 0) {
      return new Vec2()
    }
    return new Vec2(this.x / m, this.y / m);
  }
  mag() {
    return Math.hypot(this.x, this.y);
  }
  dirTo(x, y) {
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
    }
    return Math.atan2(this.y - y, this.x - x);
  }
  rotate(ox, oy, a) {
    if (ox instanceof Vec2) {
      a = oy;
      oy = ox.y;
      ox = ox.x;
    }
    let d = Math.hypot(ox - this.x, oy - this.y);
    let a2 = Math.atan2(oy - this.y, ox - this.x) + a;
    this.set(Math.cos(a2) * d + ox, Math.sin(a2) * d + oy);
    return this
  }
  toArray() {
    return [this.x, this.y]
  }
  static from(x, y) {
    if (x instanceof Vec2) {
      [x, y] = [x.x, x.y];
      return new Vec2(x, y);
    }
    const v = new Vec2();
    if (x.x) {
      v.x = x.x;
    }
    if (x.y) {
      v.y = x.y;
      return v;
    }
    if (typeof x === "number") {
      v.x = x;
    }
    if (typeof y === "number") {
      v.y = y;
      return v;
    }
    if (Array.isArray(x)) {
      v.x = x[0];
      v.y = x[1];
      // console.log(v,x);
      return v;
    }
    throw new Error("too bad");
  }
  static zero() {
    return new Vec2(0, 0)
  }
}

export default Vec2;
