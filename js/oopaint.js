var o_currentColor = "blue";
var o_lineWidth = 10;
var maincanvas,tempcanvas;
var maincontext,tempcontext;

var ShapeBase = Base.extend({
    constructor:function(x,y, color, lineWidth) {
        o_currentColor = color;
        this.lineWidth = lineWidth;
        this.color=color;
        this.x=x;
        this.y=y;
        this.xEnd=x;
        this.yEnd=y;
    },
    calcbounds:function() {
        var xEnd = Math.min(this.x,this.xEnd);
        var yEnd = Math.min(this.y,this.yEnd);
        var w = Math.abs(this.x-this.xEnd);
        var h = Math.abs(this.y-this.yEnd);
        return {x:xEnd,y:yEnd,width:w,height:h}
    },
    setEnd: function(x,y) {
        this.xEnd = x;
        this.yEnd = y;
    }
});

var Rectangle = ShapeBase.extend({
    constructor: function(x,y,x2,y2, color, lineWidth) {
            this.base(x,y, color, lineWidth);
            this.xEnd = x2;
            this.yEnd = y2;
        },
    draw: function(ctx) {
        ctx.strokestyle = this.color;
        ctx.lineWidth = this.lineWidth;
        var bounds = this.calcbounds();
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

});


function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
        ev._x = ev.layerX;
        ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
        ev._x = ev.offsetX;
        ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var kassinn = new tools.rectangle();

    var func = kassinn[ev.type];
    if (func) {
        func(ev);
    }
};

var tools = {};
tools.rectangle = function () {
    var tool = this;
    this.started = false;
    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        tool.started = true;
        tool.x0 = ev._x;
        tool.y0 = ev._y;
        console.log("mousedown");
    };

    // This function is called every time you move the mouse. Obviously, it only
    // draws if the tool.started state is set to true (when you are holding down
    // the mouse button).
    this.mousemove = function (ev) {
        if (!tool.started) {
            return;
        }
       var rectangle = new Rectangle(tool.x0,tool.y0,o_currentColor,o_lineWidth);
       tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
       rectangle.draw(tempcontext);
        console.log("mousemove");
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {

        console.log("mouseup");
        if (tool.started) {
            tool.mousemove(ev);
            tool.started = false;
            updateSurface();
        }
    };
};

function updateSurface () {
    maincontext.drawImage(tempcanvas, 0, 0);
    tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
};

//MAINCANVAS
maincanvas = document.getElementById('imageView');
maincontext = maincanvas.getContext('2d');



//TEMP CANVAS+CONTEXT
var container = maincanvas.parentNode;
tempcanvas = document.createElement('canvas');
tempcanvas.id     = 'imageTemp';
tempcanvas.width  = maincanvas.width;
tempcanvas.height = maincanvas.height;
container.appendChild(tempcanvas);
tempcontext = tempcanvas.getContext('2d');
container.appendChild(tempcanvas);
tempcanvas.addEventListener('mousedown', ev_canvas, false);
tempcanvas.addEventListener('mousemove', ev_canvas, false);
tempcanvas.addEventListener('mouseup',   ev_canvas, false);


var kassi = new Rectangle(200,200,50,50,"black",10);
kassi.draw(maincontext);

function createRect(x, y) {
    return new Rectangle(x,y, o_currentColor, o_lineWidth);
}

var s = new ShapeBase();


