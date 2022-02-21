import { degreesToRadians } from "./math.js";
export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    rotated(degrees) {
        const rads = degreesToRadians(degrees);
        const s = Math.sin(rads);
        const c = Math.cos(rads);
        return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
}
