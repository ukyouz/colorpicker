class RGB {
    constructor(r, g, b) {
        this.r = r; // float
        this.g = g; // float
        this.b = b; // float
    }
    toString() {
        let r = Math.round(255 * this.r), g = Math.round(255 * this.g), b = Math.round(255 * this.b);
        return '#'+r.toString(16).toUpperCase().padStart(2, '0')+
                   g.toString(16).toUpperCase().padStart(2, '0')+
                   b.toString(16).toUpperCase().padStart(2, '0');
    }
    toInt() {
        let r = Math.round(255 * this.r), g = Math.round(255 * this.g), b = Math.round(255 * this.b);
        return (r << 16) | (g << 8) | (b);
    }
    toRGB() {
        return this;
    }
    toCMYK() {
        let Rc = 1 - this.r, Gc = 1 - this.g, Bc = 1 - this.b;
        let k = Math.min(Rc, Gc, Bc);
        if (k == 1) {
            return new CMYK(0, 0, 0, 1);
        }
        return new CMYK((Rc-k)/(1-k), (Gc-k)/(1-k), (Bc-k)/(1-k), k);
    }
    toHSL() {
        let r = this.r, g = this.g, b = this.b;
        let min = Math.min(r, g, b), max = Math.max(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max == min)
            h = 0
        else if (max == r && g >= b)
            h = 60 * (g - b) / (max - min);
        else if (max == r && g < b)
            h = 60 * (g - b) / (max - min) + 360;
        else if (max == g)
            h = 60 * (b - r) / (max - min) + 120;
        else if (max == b)
            h = 60 * (r - g) / (max - min) + 240;
        if (l == 0 || max == min)
            s = 0;
        else if (0 < l && l <= 1/2)
            s = (max-min)/(max+min);
        else if (l > 1/2)
            s = (max-min)/(2-(max+min));
        return new HSL(h/360, s, l);
    }
    toHSV() {
        let r = this.r, g = this.g, b = this.b;
        let min = Math.min(r, g, b), max = Math.max(r, g, b);
        let h = 0, s = 0, v = max;
        if (max == min)
            h = 0
        else if (max == r && g >= b)
            h = 60 * (g - b) / (max - min);
        else if (max == r && g < b)
            h = 60 * (g - b) / (max - min) + 360;
        else if (max == g)
            h = 60 * (b - r) / (max - min) + 120;
        else if (max == b)
            h = 60 * (r - g) / (max - min) + 240;
        if (max > 0)
            s = 1 - min/max;
        return new HSV(h/360, s, v);
    }
}
class CMYK {
    constructor(c, m, y, k) {
        this.c = c; // float
        this.m = m; // float
        this.y = y; // float
        this.k = k; // float
    }
    toRGB() {
        let tc = this.c * (1-this.k) + this.k;
        let tm = this.m * (1-this.k) + this.k;
        let ty = this.y * (1-this.k) + this.k;
        return new RGB(1-tc, 1-tm, 1-ty);
    }
}
class HSL {
    constructor(h, s, l) {
        this.h = h; // degree, 0 = red
        this.s = s; // float
        this.l = l; // float
    }
    _tColorNormalize(tC) {
        if (tC < 0)
            return tC + 1;
        if (tC > 1)
            return tC - 1;
        return tC;
    }
    _tColor2RGBSpace(tC, p, q) {
        if (tC < 1/6)
            return p + ((q-p)*6*tC);
        if (tC < 1/2)
            return q;
        if (tC < 2/3)
            return p + ((q-p)*6*(2/3-tC));
        return p
    }
    toRGB() {
        if (this.s == 0) {
            return new RGB(this.l, this.l, this.l);
        }
        let q = (this.l<0.5)*(this.l*(1+this.s)) + (this.l>=0.5)*(this.l+this.s-(this.l*this.s));
        let p = 2 * this.l - q;
        let hk = this.h;
        let tR = this._tColorNormalize(hk + 1/3);
        let tG = this._tColorNormalize(hk);
        let tB = this._tColorNormalize(hk - 1/3);
        return new RGB(this._tColor2RGBSpace(tR,p,q),
                       this._tColor2RGBSpace(tG,p,q),
                       this._tColor2RGBSpace(tB,p,q));
    }
}
class HSV {
    constructor(h, s, v) {
        this.h = h; // degree, 0 = red
        this.s = s; // float
        this.v = v; // float
    }
    toRGB() {
        let hi = Math.floor(this.h * 360 / 60) % 6;
        let f = (this.h == 1) ? 0 : this.h * 360 / 60 - hi;
        let v = this.v;
        let p = v * (1 - this.s);
        let q = v * (1 - this.s * f);
        let t = v * (1 - this.s * (1 - f));
        switch(hi) {
            case 0: return new RGB(v, t, p);
            case 1: return new RGB(q, v, p);
            case 2: return new RGB(p, v, t);
            case 3: return new RGB(p, q, v);
            case 4: return new RGB(t, p, v);
            case 5: return new RGB(v, p, q);
        }
    }
}
function addEvent(target, event_type, callback) {
    let targets = [];
    if (typeof(target) == "string") {
        targets = document.querySelectorAll(target);
    }
    document.addEventListener(event_type, function(event) {
        for (let el of targets) {
            if (el == event.target) {
                // console.log(el, event.target);
                target = el
            }
        }
        // console.log('HIT', event_type, target, event.target);
        if (event.target == target || target == document) {
            callback(event);
            event.stopPropagation();
        }
    }, true);
}

var body = document.body;
var xyplot = document.getElementById("xy-plot"); xyplot.width = 256, xyplot.height = 256;
var ctx_xy = xyplot.getContext("2d");
var zplot = document.getElementById("z-plot"); zplot.width = 30, zplot.height = 256;
var ctx_z = zplot.getContext("2d");
var z_indicator = document.getElementById("z-plot-indicator");
var preview = document.getElementById("preview-box");
var curr_xy = [0.0, 0.0], curr_z = 0.0, curr_z_axis = 'H';
let STD_AXIS_255 = (val) => Math.sign(val) * (val > 0) * Math.round(val) - (val > 255)*(Math.round(val) - 255);
// Create gradient
function drawVertGradient(ctx, start_color, end_color) {
    for (let x = 0; x <= 255; x++) {
        var xi = x / 255;
        var grd = ctx.createLinearGradient(0, 0, 1, 256);
        grd.addColorStop(0, (start_color(xi)).toRGB().toString()); // y = 0,   visually top
        grd.addColorStop(1, (end_color(xi)).toRGB().toString());   // y = 255, visually bottom
        ctx.fillStyle = grd;
        ctx.fillRect(x-1, 0, x, 256);
        // console.log({'s':start_color, 'e':end_color});
    }
}
function drawZGradient(ctx, color_callback) {
    for (let y = 0; y <= 255; y++) {
        let color = color_callback((255-y)/255);
        ctx.fillStyle = color.toRGB().toString();
        ctx.fillRect(0, y, 30, y);
    }
}
function drawXYplot(ctx, z_axis, val) {
    //FIX: `val` scale
    if (z_axis == 'H') {
        drawVertGradient(ctx, (x)=>new HSV(val, x, 1), (x)=>new HSV(val, x, 0));
        drawZGradient(ctx_z,  (z)=>new HSV(z, 1, 1));
    } else if (z_axis == 'S') {
        drawVertGradient(ctx, (x)=>new HSV(x, val, 1), (x)=>new HSV(0, val, 0));
        drawZGradient(ctx_z,  (z)=>new HSV(curr_xy[0], z, curr_xy[1]));
    } else if (z_axis == 'V') {
        drawVertGradient(ctx, (x)=>new HSV(x, 1, val), (x)=>new HSV(0, 0, val));
        drawZGradient(ctx_z,  (z)=>new HSV(curr_xy[0], curr_xy[1], z));
    } else if (z_axis == 'R') {
        drawVertGradient(ctx, (x)=>new RGB(val, 1, x), (x)=>new RGB(val, 0, x));
        drawZGradient(ctx_z,  (z)=>new RGB(z, curr_xy[1], curr_xy[0]));
    } else if (z_axis == 'G') {
        drawVertGradient(ctx, (x)=>new RGB(1, val, x), (x)=>new RGB(0, val, x));
        drawZGradient(ctx_z,  (z)=>new RGB(curr_xy[1], z, curr_xy[0]));
    } else if (z_axis == 'B') {
        drawVertGradient(ctx, (x)=>new RGB(x, 1, val), (x)=>new RGB(x, 0, val));
        drawZGradient(ctx_z,  (z)=>new RGB(curr_xy[0], curr_xy[1], z));
    }
}
function drawCircle(ctx, x, y, r, color, width) {
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
}
function drawXYplotCursor(ctx, x, y, active) {
    if (active) {
        drawCircle(ctx, x, y, 8, "white", 2);
        drawCircle(ctx, x, y, 7, "black", 1);
    } else {
        drawCircle(ctx, x, y, 10, "white", 3);
        drawCircle(ctx, x, y, 10, "black", 1);
    }
}
function updateXYplot(x, y, update) {
    ctx_xy.clearRect(0, 0, ctx_xy.width, ctx_xy.height);
    preview.style.backgroundColor = "black";
    drawXYplot(ctx_xy, curr_z_axis, curr_z);
    drawXYplotCursor(ctx_xy, x, 255-y, update);
    if (update) {
        curr_xy = [x/255, y/255];
        console.log('xy changed', curr_xy);
    }
    drawCircle(ctx_xy, x, 255-y, 8, "white", 1.5);
}
function updateZindicator(evt, update) {
    if (update) {
        var rect = xyplot.getBoundingClientRect();
        var visual_z = STD_AXIS_255(evt.clientY - rect.top);
        var z = 1 - visual_z / 255;
        console.log('z changed', z);
        z_indicator.style.top = visual_z + "px";
        curr_z = z;
        updateXYplot(255*curr_xy[0], 255*curr_xy[1], true);
    }
}
updateXYplot(0, 0, true);

// if x < 0: x = 0
// if x > 255: x = 255

let xy_drag = false;
function updateXYplotByXYaxis(mouseX, mouseY) {
    var rect = xyplot.getBoundingClientRect();
    var x = STD_AXIS_255(mouseX - rect.left);
    var y = (255 - STD_AXIS_255(mouseY - rect.top));
    updateXYplot(x, y, xy_drag);
}
addEvent(document, 'mouseup', function (evt) {
    if (xy_drag) {
        xy_drag = false;
        body.classList.remove('dragging');
        updateXYplotByXYaxis(evt.clientX, evt.clientY);
    }
});
addEvent(xyplot, 'mousedown', function (evt) {
    xy_drag = true;
    body.classList.add('dragging');
    updateXYplotByXYaxis(evt.clientX, evt.clientY);
});
addEvent(xyplot, 'mousemove', function (evt) {
    updateXYplotByXYaxis(evt.clientX, evt.clientY);
});

let z_drag = false;
addEvent(document, 'mouseup', (e) => {
    z_drag = false;
    body.classList.remove('dragging')
});
addEvent(zplot, 'mousedown', function (evt) {
    z_drag = true;
    body.classList.add('dragging');
    updateZindicator(evt, z_drag);
});
addEvent(zplot, 'mousemove', function (evt) {
    updateZindicator(evt, z_drag);
});
addEvent('input[type=radio]', 'change', function(evt) {
    // console.log('z changed', dataform.coloraxis.value, evt.target.value);
    curr_z_axis = evt.target.value;
    curr_z = dataform['coloraxis_'+curr_z_axis].value;
    updateXYplot(255*curr_xy[0], 255*curr_xy[1], true);
    // drawXYplot(ctx_xy, curr_z_axis, curr_z);
    // drawZGradient(ctx_z, (y) => new RGB(202, 100, y));
});
addEvent('input[type=text]', 'change', function(evt) {
    console.log('curr_z=', dataform.coloraxis.value, 'val changed:', evt.target.name, evt.target.value);
});
addEvent('input[type=number]', 'change', function(evt) {
    console.log('curr_z=', dataform.coloraxis.value, 'val changed:', evt.target.name, evt.target.value);
});
