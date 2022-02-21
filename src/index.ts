import {assert} from "./assert.js";
import {Vec2} from "./Vec2.js";

let testTxt = document.createElement("p");
testTxt.innerHTML = "how do";
let body = document.getElementsByTagName("body")[0].appendChild(testTxt);

// interface Vec2 {
//     x: number,
//     y: number,
// };


class Terminal {
    constructor(parent: CircuitComponent, localPosition: Vec2, potential: number = 0) {
        this.parent = parent;
        this.localPosition = localPosition;
        this.potential = potential;
        this.connections = [];
    }

    public connect(otherTerminal: Terminal) {
        this.connections.push(otherTerminal);
        otherTerminal.connections.push(this);
    }

    public getParent(): CircuitComponent {
        return this.parent
    }

    // Global position
    public getPosition(): Vec2 {
        return this.getLocalPosition()
        .rotated(this.parent.getRotationDegrees())
        .add(this.parent.getPosition());
    }
 
    public getLocalPosition(): Vec2 {
        return this.localPosition;
    }

    public getPotential(): number {
        return this.potential;
    }

    // Returns the i-th terminal connected to this
    public getConnection(index: number): Terminal {
        return this.connections[index];
    }

    public numConnections(): number {
        return this.connections.length;
    }

    private parent: CircuitComponent;
    private localPosition: Vec2;
    private potential: number;
    private connections: Terminal[];
}


abstract class CircuitComponent {
    constructor(position: {x: number, y: number}) {
        this.position = new Vec2(position.x, position.y);
        this.rotationDegrees = 0;
        this.terminals = [];
    }

    public abstract draw(canvas: HTMLCanvasElement): void;

    public getTerminals(): Terminal[] {
        return this.terminals;
    }

    public getTerminal(index: number): Terminal {
        assert(index < this.terminals.length);
        return this.terminals[index];
    }

    public getPosition(): Vec2 {
        return this.position;
    }

    public getRotationDegrees() {
        return this.rotationDegrees;
    }

    private position: Vec2;
    private rotationDegrees: number;
    protected terminals: Terminal[];
}



class VoltageSource extends CircuitComponent {
    constructor(position: {x: number, y: number}, pd: number) {
        super(position);
        this.terminals = [
            new Terminal(this, new Vec2(0, 10), 0),
            new Terminal(this, new Vec2(0,-10), pd)
        ];
    }

    draw(canvas: HTMLCanvasElement): void {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.getPosition().x, 
            this.getPosition().y,
            VoltageSource.drawSize, 
            0, 2 * Math.PI
        );
        ctx.stroke();
    }
    
    private potential: number;
    private static drawSize: number = 10;
}


class Resistor extends CircuitComponent {
    constructor(position: {x: number, y: number}, resistance: number) {
        super(position);
        this.resistance = resistance;
        this.terminals = [
            new Terminal(this, new Vec2( 0, -this.drawSize.y/2), 0),
            new Terminal(this, new Vec2( 0, this.drawSize.y/2), 0)
        ];
    }

    draw(canvas: HTMLCanvasElement): void {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        const dx = this.drawSize.x/2;
        const dy = this.drawSize.y/2;
        ctx.rect(this.getPosition().x - dx, 
                 this.getPosition().y - dy,
                 this.drawSize.x,
                 this.drawSize.y
        );
        ctx.stroke();
    }

    private resistance: number;
    private drawSize: {x: number, y: number} = {x: 20, y: 40};
}


/**
 * A wire connecting a number of components
 */
class Wire extends CircuitComponent {
    constructor(position: {x: number, y: number}) {
        super(position);
        this.terminals = [
            new Terminal(this, new Vec2(-20, 0), 0),
            new Terminal(this, new Vec2( 20, 0), 0) 
        ];
    }
    
    public draw(canvas: HTMLCanvasElement): void {
        var ctx = canvas.getContext("2d");
        for(let i = 0; i < this.terminals.length; ++i) {
            let endPos: Vec2;
            let term: Terminal = this.terminals[i];
            if(term.numConnections() > 0) {
                assert(term.numConnections() == 1);
                // TODO: Give this some more thought.
                // What happens when multiple components connected to one terminal of a wire?
                // Perhaps that should just be disallowed
                endPos = term.getConnection(0).getPosition();
            } else {
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
        this.canvas = document.createElement("canvas");
        this.canvas.width = 800;
        this.canvas.height = 800;
    }

    public add(component: CircuitComponent) {
        this.components.push(component);
    }

    public draw() {
        let that = this;
        let ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.components.forEach( (c) => {
            c.draw(that.canvas);
            console.log("draw");
        });
    }

    public html(): HTMLElement {
        return this.canvas;
    }

    private components: CircuitComponent[] = [];
    private canvas: HTMLCanvasElement;
}


let w = new World();
let bat = new VoltageSource({x: 30, y: 50}, 9);
let res = new Resistor({x: 100, y: 50}, 10);
let wire1 = new Wire({x: 50, y: 10});
let wire2 = new Wire({x: 50, y: 100});
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

