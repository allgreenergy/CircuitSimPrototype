let testTxt = document.createElement("p");
testTxt.innerHTML = "how do";
let body = document.getElementsByTagName("body")[0].appendChild(testTxt);


class Terminal {

    private localPosition: {x: number, y: number};
}


abstract class CircuitComponent {
    constructor(position: {x: number, y: number}) {
        this.position = position;
        this.connections = [];
    }

    abstract draw(canvas: HTMLCanvasElement): void;
    
    public static connect(a: CircuitComponent, b: CircuitComponent) {
        a.connections.push(b);
        b.connections.push(a);
    }

    public getPosition(): {x: number, y: number} {
        return this.position;
    }

    // public getTerminals(): Terminal[] {

    // }
    
    private position: {x: number, y: number};
    protected connections: CircuitComponent[];
    
}

function connect(a: CircuitComponent, b: CircuitComponent) {
    CircuitComponent.connect(a, b);
}



class PotentialSource extends CircuitComponent {
    constructor(position: {x: number, y: number}, potential: number) {
        super(position);
    }

    draw(canvas: HTMLCanvasElement): void {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.getPosition().x, 
            this.getPosition().y,
            PotentialSource.drawSize, 
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
    }


    draw(canvas: HTMLCanvasElement): void {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        let b = Resistor.drawSize / 2;
        ctx.rect(this.getPosition().x - b/2, 
                 this.getPosition().y - b/2,
                 this.getPosition().x + b/2, 
                 this.getPosition().y + b/2
        );
        ctx.stroke();
    }

    private resistance: number;
    private static drawSize: number;
}

/**
 * A wire connecting a number of components
 */
class Wire extends CircuitComponent {
    public draw(canvas: HTMLCanvasElement): void {
        var ctx = canvas.getContext("2d");
        for(let i = 0; i < this.connections.length; ++i) {
            let con = this.connections[i];
            ctx.beginPath();
            ctx.moveTo(this.getPosition().x, this.getPosition().y);
            ctx.lineTo(con.getPosition().x,  con.getPosition().y);
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
let pos = new PotentialSource({x: 10, y: 10}, 9);
let neg = new PotentialSource({x: 10, y: 50}, 0);
let res = new Resistor({x: 50, y: 30}, 10);
let wire1 = new Wire({x: 50, y: 10});
let wire2 = new Wire({x: 50, y: 50});
connect(pos, wire1);
connect(wire1, res);
connect(res, wire2);
connect(wire2, neg);

w.add(pos);
w.add(neg);
w.add(res);
w.add(wire1);
w.add(wire2);

body.appendChild(w.html());

w.draw();