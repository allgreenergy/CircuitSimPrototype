import { assert } from "./assert.js";
import { Vec2 } from "./Vec2.js";
let testTxt = document.createElement("p");
testTxt.innerHTML = "how do";
let body = document.getElementsByTagName("body")[0].appendChild(testTxt);
class Terminal {
    constructor(parent, localPosition, potential = 0) {
        this.parent = parent;
        this.localPosition = localPosition;
        this.potential = potential;
        this.connections = [];
    }
    connect(otherTerminal) {
        this.connections.push(otherTerminal);
        otherTerminal.connections.push(this);
    }
    getParent() {
        return this.parent;
    }
    getPosition() {
        return this.getLocalPosition()
            .rotated(this.parent.getRotationDegrees())
            .add(this.parent.getPosition());
    }
    getLocalPosition() {
        return this.localPosition;
    }
    getPotential() {
        return this.potential;
    }
    getConnection(index) {
        return this.connections[index];
    }
    numConnections() {
        return this.connections.length;
    }
}
class CircuitComponent {
    constructor(position) {
        this.position = new Vec2(position.x, position.y);
        this.rotationDegrees = 0;
        this.terminals = [];
    }
    getTerminals() {
        return this.terminals;
    }
    getTerminal(index) {
        assert(index < this.terminals.length);
        return this.terminals[index];
    }
    getPosition() {
        return this.position;
    }
    getRotationDegrees() {
        return this.rotationDegrees;
    }
}
class VoltageSource extends CircuitComponent {
    constructor(position, pd) {
        super(position);
        this.terminals = [
            new Terminal(this, new Vec2(0, 10), 0),
            new Terminal(this, new Vec2(0, -10), pd)
        ];
    }
    draw(canvas) {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.getPosition().x, this.getPosition().y, VoltageSource.drawSize, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
VoltageSource.drawSize = 10;
class Resistor extends CircuitComponent {
    constructor(position, resistance) {
        super(position);
        this.drawSize = { x: 20, y: 40 };
        this.resistance = resistance;
        this.terminals = [
            new Terminal(this, new Vec2(0, -this.drawSize.y / 2), 0),
            new Terminal(this, new Vec2(0, this.drawSize.y / 2), 0)
        ];
    }
    draw(canvas) {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        const dx = this.drawSize.x / 2;
        const dy = this.drawSize.y / 2;
        ctx.rect(this.getPosition().x - dx, this.getPosition().y - dy, this.drawSize.x, this.drawSize.y);
        ctx.stroke();
    }
}
class Wire extends CircuitComponent {
    constructor(position) {
        super(position);
        this.terminals = [
            new Terminal(this, new Vec2(-20, 0), 0),
            new Terminal(this, new Vec2(20, 0), 0)
        ];
    }
    draw(canvas) {
        var ctx = canvas.getContext("2d");
        for (let i = 0; i < this.terminals.length; ++i) {
            let endPos;
            let term = this.terminals[i];
            if (term.numConnections() > 0) {
                assert(term.numConnections() == 1);
                endPos = term.getConnection(0).getPosition();
            }
            else {
                endPos = term.getPosition();
            }
            ctx.beginPath();
            ctx.moveTo(this.getPosition().x, this.getPosition().y);
            ctx.lineTo(endPos.x, endPos.y);
            ctx.stroke();
        }
    }
}
class World {
    constructor() {
        this.components = [];
        this.canvas = document.createElement("canvas");
        this.canvas.width = 800;
        this.canvas.height = 800;
    }
    add(component) {
        this.components.push(component);
    }
    draw() {
        let that = this;
        let ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.components.forEach((c) => {
            c.draw(that.canvas);
            console.log("draw");
        });
    }
    html() {
        return this.canvas;
    }
}
let w = new World();
let bat = new VoltageSource({ x: 30, y: 50 }, 9);
let res = new Resistor({ x: 100, y: 50 }, 10);
let wire1 = new Wire({ x: 50, y: 10 });
let wire2 = new Wire({ x: 50, y: 100 });
bat.getTerminal(1).connect(wire1.getTerminal(0));
wire1.getTerminal(1).connect(res.getTerminal(0));
res.getTerminal(1).connect(wire2.getTerminal(0));
wire2.getTerminal(1).connect(bat.getTerminal(0));
w.add(bat);
w.add(res);
w.add(wire1);
w.add(wire2);
body.appendChild(w.html());
function loop(t) {
    w.draw();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
