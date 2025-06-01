
// define custom particle class
class Particle extends te.GameObject {
    constructor(pos,type) {
        super(pos,new Vec2(),0,1);
        this.type = type;
    }
}
class MouseTrailParticle extends Particle {
    constructor(pos=new Vec2()) {
        super(pos,'mouseTrail');
        this.timeLived = 0;
        this.lifetime = randInt(50,100)/100;
        if (randInt(0,9)) {
            this.color = new Color(randInt(155,255),randInt(0,150),randInt(0,50));
        } else {
            this.color = new Color(100,100,100);
            this.lifetime += 0.5;
        }
        this.size = new Vec2(randInt(5,10));
        this.rotation = randInt(0,90);
        this.rotationSpeed = randInt(-10,10);
        this.pos.subtract(this.size.clone().divide(2));
        this.vel = new Vec2(randInt(-50,50),randInt(-150,-250));
    }
    tick() {
        this.timeLived += te.dt;
        this.pos.add(this.vel.clone().multiply(te.dt));
        this.size.add(new Vec2(te.dt*5));
        this.rotation += this.rotationSpeed;
        this.color.a = (1-this.timeLived/this.lifetime)*0.8;
        if (this.timeLived > this.lifetime) {
            this.destroy();
        }
    }
    draw() {
        let ctx = te.ctx;
        ctx.save();
        ctx.translate(this.pos.x+this.size.x/2,this.pos.y+this.size.y/2)
        ctx.rotate(this.rotation*Math.PI/180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size.x/2,-this.size.y/2,this.size.x,this.size.y);
        ctx.restore();
    }
}
// define custom ball game object
class Ball extends te.GameObject {
    constructor(pos,size) {
        super(pos,new Vec2(size,size));
    }
    draw() {
        let ctx = te.ctx;
        ctx.beginPath();
        let halfSize = this.size.x/2;
        ctx.arc(this.pos.x+halfSize,this.pos.y+halfSize,halfSize,0,2*Math.PI);
        ctx.fillStyle = "#0000ff";
        ctx.fill();
    }
}

te.keyPressed = function(key, relatedInputs) {
    // toggle hitboxes if any hitboxes keybind pressed
    if (relatedInputs.includes('toggleHitboxes')) {
        te.showHitboxes = !te.showHitboxes;
    }
    // toggle game paused
    if (relatedInputs.includes('pause')) {
        te.pauseTicking = !te.pauseTicking;
    }
}
te.mouseClicked = function(pos) {
    te.vars.dragStart = pos.clone();
}
te.mouseMoved = function(pos) {
    if (te.mouseDown) {
        let delta = pos.clone().subtract(te.vars.dragStart);
        te.vars.cam.subtract(delta);
        te.vars.dragStart = pos.clone();
    }
}
te.mouseScrolled = function(pos,delta) {
    zoom(delta.y*-0.01*te.zoom,te.mousePos);
}

// TODO fix zooming
function zoom(amount,pos) {
    const beforeZoom = te.zoom;
    let targetZoom = te.zoom + amount;
    targetZoom = Math.min(4, Math.max(0.1, targetZoom));
    const beforePos = pos;
    const beforePosScreen = te.getScreenPos(pos);
    te.zoom = targetZoom;
    const posDelta = te.getGamePos(te.mousePos).clone().subtract(beforePos);
    const zoomDelta = te.zoom - beforeZoom;
    const correctionX = (beforePosScreen.x / targetZoom - beforePosScreen.x / beforeZoom + beforePos.x * targetZoom) / targetZoom - te.scroll.x;
    const correctionY = (beforePosScreen.y / targetZoom - beforePosScreen.y / beforeZoom + beforePos.y * targetZoom) / targetZoom - te.scroll.y;
    te.scroll.x += correctionX;
    te.scroll.y += correctionY;
    te.vars.cam.x += correctionX;
    te.vars.cam.y += correctionY;

    //te.zoom = tween(te.zoom, te.vars.zoom, Math.min(1, 10 * te.dt));
    //te.scroll.add(scrollCorrection);
    //te.vars.cam.add(scrollCorrection);
}

function start() {
    // setup background
    te.bgColor = "#151520";

    // define keybinds
    te.keybinds.KeyW = 'up';
    te.keybinds.KeyA = 'left';
    te.keybinds.KeyS = 'down';
    te.keybinds.KeyD = 'right';
    te.keybinds.ArrowUp = 'up';
    te.keybinds.ArrowLeft = 'left';
    te.keybinds.ArrowDown = 'down';
    te.keybinds.ArrowRight = 'right';
    te.keybinds.ShiftLeft = 'modifier';
    te.keybinds.ShiftRight = 'modifier';
    te.keybinds.Equal = 'zoomin';
    te.keybinds.Minus = 'zoomout';
    te.keybinds.KeyH = 'toggleHitboxes';
    te.keybinds.Escape = 'pause';
    te.keybinds.KeyP = 'pause';

    // setup custom vars
    te.vars.cam = new Vec2();
    te.vars.zoom = 1;
    te.vars.mouseTrailTimer = 0;
    te.vars.mouseTrailCost = 1/60;
    
    // start game using canvas with id 'gameCanvas' in the html
    te.start('gameCanvas');

    // spawn some game objects
    te.objects.push(new Ball(new Vec2(0,0),25));
    te.objects.push(new Ball(new Vec2(50,50),50));
    te.objects.push(new Ball(new Vec2(500,50),50));
    te.objects.push(new Ball(new Vec2(5000,50),200));
}

te.update = function(dt) {
    te.debugText = [];
    te.debugText.push(`dt: ${dt.toFixed(5)}`);
    te.debugText.push(`fps: ${te.fps.toFixed(3)}`);
    te.debugText.push(`keys: ${JSON.stringify(te.keys)}`);
    te.debugText.push(`inputs: ${JSON.stringify(te.inputs)}`);
    te.debugText.push(`scroll: x${te.scroll.x.toFixed()} y${te.scroll.y.toFixed()}  zoom: ${(te.zoom*100).toFixed(2)}%`);
    if (te.mouseHere) {
        const mouseGamePos = te.getGamePos(te.mousePos);
        te.debugText.push(`mouse: ${(te.mouseDown)?'down':'up'} at x${mouseGamePos.x.toFixed()} y${mouseGamePos.y.toFixed()}`);
    } else {
        te.debugText.push(`mouse: ?,?`);
    }
    te.debugText.push(`objects: ${te.objects.length}`);

    // zooming
    let zoomAmount = 1.5 * te.zoom * te.dt;
    if (te.inputs.modifier) zoomAmount *= 2;
    if (te.inputs.zoomin) zoom(zoomAmount,te.mousePos);
    if (te.inputs.zoomout) zoom(-zoomAmount,te.mousePos);

    // scrolling
    let scrollDelta = 750 * te.zoom * te.dt;
    if (te.inputs.modifier) { scrollDelta *= 2.5; }
    scrollDelta *= 1/(0.5+Math.log2(1+te.zoom));
    if (te.inputs.left) { te.vars.cam.x -= scrollDelta; }
    if (te.inputs.right) { te.vars.cam.x += scrollDelta; }
    if (te.inputs.up) { te.vars.cam.y -= scrollDelta; }
    if (te.inputs.down) { te.vars.cam.y += scrollDelta; }
    te.scroll.x = tween(te.scroll.x, te.vars.cam.x, Math.min(1,10*te.dt));
    te.scroll.y = tween(te.scroll.y, te.vars.cam.y, Math.min(1,10*te.dt));

    // update mouse trail
    if (te.mouseHere) {
        te.vars.mouseTrailTimer += te.dt;
        for (let i = 0; i < Math.floor(te.vars.mouseTrailTimer/te.vars.mouseTrailCost); i++) {
            te.objects.push(new MouseTrailParticle(te.getGamePos(te.mousePos)));
            te.vars.mouseTrailTimer -= te.vars.mouseTrailCost;
        }
    }

    // drawing

    // draw background grid
    this.ctx.fillStyle = "#202030";
    drawGrid(te.getGamePos(new Vec2(0)).multiply(-te.dpr*te.zoom), 50*te.zoom*te.dpr, 3*te.zoom*te.dpr);
}

function drawGrid(offset, gridSize, gridThickness) {
    let canvas = te.canvas;
    let ctx = te.ctx;
    offset.x = ((offset.x % gridSize) + gridSize) % gridSize;
    offset.y = ((offset.y % gridSize) + gridSize) % gridSize;
    for (let x = offset.x; x < canvas.width; x += gridSize) {
        ctx.fillRect(x-gridThickness/2, 0, gridThickness, canvas.height);
    }
    for (let y = offset.y; y < canvas.height; y += gridSize) {
        ctx.fillRect(0, y-gridThickness/2, canvas.width, gridThickness);
    }
}
