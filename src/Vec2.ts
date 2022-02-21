import { degreesToRadians } from "./math.js";

export class Vec2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public rotated(degrees: number): Vec2 {
        const rads = degreesToRadians(degrees);
        const s = Math.sin(rads);
        const c = Math.cos(rads);
        return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
    }

    public add(v: Vec2) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
}
