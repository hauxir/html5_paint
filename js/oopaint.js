var o_currentColor = "blue";
var o_lineWidth = 10;
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
        console.log("hallo",xEnd, yEnd,w,h);
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
        console.log("seinna",bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
});

canvas = document.getElementById('imageView');
context = canvas.getContext('2d');
var kassi = new Rectangle(200,200,50,50,"black",10);
var punktur = new ShapeBase(700,600,"black",10);
kassi.draw(context);
punktur.draw(context);

function createRect(x, y) {
    return new Rectangle(x,y, o_currentColor, o_lineWidth);
}

var s = new ShapeBase();


