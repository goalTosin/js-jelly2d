import { Anchor } from "./anchor.js";
import { SoftBody, INFLATED, NORMAL, KINETIC } from "./softBody.js";
import { circ } from "./utils.js";
import Vec2 from "./vec2.js";

class World {
  constructor(gravity = new Vec2(0, 0.125)) {
    /**
     * @type {SoftBody[]}
     */
    this.bodies = [];
    this.constraints = [];
    this.gravity = gravity;
    this.iterations = 1;
    this.stepRate = 1 / 16;
    this.firstUpdate = true;
    /**
     * @type {Anchor[][]}
     */

    this.anchorPairs = [];
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  debug(ctx, z) {
    this.bodies.forEach((body) => {
      ctx.beginPath();
      ctx.moveTo(body.points[0].pos.x, body.points[0].pos.y);
      for (let i = 1; i < body.points.length; i++) {
        const p = body.points[i];
        ctx.lineTo(p.pos.x, p.pos.y);
        // console.log(p.pos.x);
      }
      ctx.closePath();
      if (body.type === KINETIC) {
        ctx.lineWidth = 4 / z;
        ctx.lineJoin = "round";
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "white";
        ctx.stroke();
      } else {
        ctx.lineWidth = 4 / z;
        ctx.lineJoin = "round";
        ctx.setLineDash([0, 0]);
        ctx.strokeStyle = "white";
        ctx.stroke();

      }
      // const bb = body.getBoundingBox()
      // ctx.beginPath()
      // ctx.rect(bb.minX, bb.minY, bb.maxX-bb.minX, bb.maxY-bb.minY)
      // ctx.fillStyle = '#ff000080'
      // ctx.fill()
      if (body.pts &&body.pts.length&& body.gas > 0) {
        let l = body.points.length;
        // const cv = body.calcVolume();
        // const circumfrence = this.rad * 2 * Math.PI;
        for (let i = 0; i < l; i++) {
          const a = body.points[i];
          ctx.beginPath();
          ctx.moveTo(a.pos.x, a.pos.y);
          ctx.lineTo(a.pos.x + body.pts[i].vel.x*30, a.pos.y +  body.pts[i].vel.y*30);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "red";
          ctx.stroke();
          // const b = body.points[(i + 1) % l];

          // // a.pos.add(pt[i].pos);
          // // a.vel.add(pt[i].vel);
          // const v = ((this.rad ** 2 * Math.PI - cv) * 0.016) / n;

          // const a_pos = a.pos.clone(); //.add(dir)
          // const b_pos = b.pos.clone(); //.add(dir)
          // const dir = a_pos
          //   .clone()
          //   .sub(b_pos)
          //   .swap()
          //   .mult(-1, 1)
          //   .unit()
          //   // .mult(v );
          //   // .mult(v * (a.pos.clone().sub(b.pos).mag()/segmentLength)*0.2);
          //   .mult(v * (a.pos.clone().sub(b.pos).mag() / circumfrence));

          // // ctx.beginPath();
          // let m = a_pos.clone().add(b_pos.clone().sub(a_pos).mult(0.5));

          // ctx.moveTo(m.x, m.y);
          // let f = 0;
          // ctx.lineTo(m.x + dir.x * 200, m.y + dir.y * 200);
          // ctx.strokeStyle = "blue";
          // ctx.lineWidth = 1;
          // ctx.stroke();
        }
      }

      // for (let i = 0; i < body.springs.length; i++) {

      //   const p = body.springs[i].point1.pos;
      //   const p1 = body.springs[i].point2.pos;
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

      // body.points.forEach((p, i) => {
      //   // circ(ctx, p.pos.x, p.pos.y);
      //   ctx.font = "26px --system-ui";
      //   ctx.fillStyle = "purple";
      //   ctx.fillText(i + "", p.pos.x - 5, p.pos.y);
      //   // ctx.beginPath();
      //   // ctx.moveTo(p.pos.x, p.pos.y);
      //   // ctx.lineTo(p.pos.x + p.vel.x*3, p.pos.y + p.vel.y*3);
      //   // ctx.strokeStyle = "blue";
      //   // ctx.lineWidth = 1        [-w / 2, h / 2 - breakDist],
      //   // ctx.stroke();
      // });
    });
    // console.log(this.anchorPairs);
    this.anchorPairs.forEach((pair, i) => {
      pair.forEach((a) => {
        a.computePos()
        a.debug(ctx);
        pair.forEach((b) => {
          if (a !== b) {
            ctx.beginPath();
            let p = a.pos;
            ctx.arc(p.x, p.y, 5 / z, 0, Math.PI * 2);
            ctx.fillStyle = ["white", "red", "blue", "purple"][i];
            ctx.fill();
          }
        });
      });
    });
  }
  update(ctx) {
    if (this.firstUpdate) {
      this.lastTimeStamp = Date.now();
      this.firstUpdate = false;
    }
    const dt =
      ((Date.now() - this.lastTimeStamp) * this.stepRate) / this.iterations;
    const check = () => {
      let s = this.bodies.filter((b) =>
        b.points.some((p) => isNaN(p.pos.x) || isNaN(p.pos.y))
      );
      console.log(s.map((b, i) => i).join(",") + " Spoilt");
    };
    // console.log(dt);
    for (let i = 0; i < this.iterations; i++) {
      this.bodies.forEach((body, i) => {
        body.points.forEach((p) => {
          p.vel.add(this.gravity.clone().mult(1));
          // console.log(this.gravity.clone().mult(dt,dt));
          p.pos.add(p.vel.clone().mult(1));

          // console.log(p.pos.x,p.pos.y);
          // if (p.pos.y >= 300) {
          //   p.pos.y = 300;
          //   p.vel.y *= -0.4;
          //   p.vel.x *= 0;
          // }
          // const k = 700;
          // if (p.pos.x >= k) {
          //   p.pos.x = k;
          //   p.vel.x *= -0.4;
          //   p.vel.y *= 0;
          // }
          // if (p.pos.x <= -k) {
          //   p.pos.x = -k;
          //   p.vel.x *= -0.4;
          //   p.vel.y *= 0;
          // }
        });
      });
      // check()
      this.bodies.forEach((body, i) => {
        // check();
        if (body.gas > 0) {
          body.inflate(dt, ctx);
          // console.log("inflated");
        } else {
          body.springs.forEach((s) => {
            s.applyConstraint();
          });
        }
        if (body.frame[0]) {
          body.shapeMatch(ctx);
        }
        // check();
        // console.log("___"+i+'____');

        // if (Math.random()<0.01) {

        //   console.log(body.calcVolume());
        //   }

        // body.springs.forEach(s=>s.applyConstraint())
      });
      // this.anchorPairs.forEach((pair) => {
      //   pair[0].computePos();
      //   pair[1].computePos();
      // });
      this.anchorPairs.forEach((pair) => {
        pair.forEach((a) => {
          let pss = Array.from({ length: a.points.length }, (_) => ({
            pos: Vec2.zero(),
            vel: Vec2.zero(),
          }));
          pair.forEach((b) => {
            if (a !== b) {
              const adds = a.moveTowards(b);
              // adds.forEach((p,i) => {
              //   pss[i].pos.add(p.pos)
              //   pss[i].vel.add(p.vel)
              // })
            }
          });
          // if (Math.random()<0.1) {

          // console.log(pss);
          // }
          // a.points.forEach((p, i) => {
          //   p.pos.add(pss[i].pos)
          //   p.vel.add(pss[i].vel)
          // })
        });
      });
      // check();
      // console.log(pairs);
      this.bodies.forEach((body, i) => {
        // console.log(body.collisionFilter);
        this.bodies.forEach((body1, j) => {
          // console.log(body.fixed, body1.fixed,!(body.fixed === true && body1.fixed === true));
          if (
            body !== body1 &&
            !(body.fixed === true && body1.fixed === true) &&
            !(
              body.collisionFilter === body1.collisionFilter &&
              !(
                (body.collisionFilter === null &&
                  body1.collisionFilter === null) ||
                (body.collisionFilter === undefined &&
                  body1.collisionFilter === undefined)
              )
            )
          ) {
            // pairs.push(pair);
            // console.log(
            //   pairs.some((p) => p[0] === pair[0] && p[1] === pair[1])
            // );
            if (body.collidesWith(body1)) {
              // console.log(body.type,body1.type);
              // console.log(body.points.some(p=>isNaN(p.pos.x)||isNaN(p.pos.y) ||isNaN(p.vel.x)||isNaN(p.vel.y)));
              if (!(body.type === KINETIC || body1.type === KINETIC)) {
                body.points.forEach((p) => {
                  if (body1.isPointIn(p.pos)) {
                    // console.log(p.x, p.y);
                    // check()
                    body1.respondToPoint(p, ctx, check);
                  }
                });
              }
              if (body.collideEv) {
                body.collideEv(body1);
              }
            }
          }
        });
      });
      // check();
      // check()
      // console.log('');
      // console.log("_______");
    }
    this.lastTimeStamp = Date.now();
  }
  addBody(softBody) {
    this.bodies.push(softBody);
  }
}
export { World };
