var o_currentColor = "black";
var o_lineWidth = 5;
var maincanvas, tempcanvas;
var maincontext, tempcontext;
var o_CurrentTool;
var p_mouseEvents;
var p_drawnShapes = [];
for (var i = 0; i < 10; i++) {
    p_drawnShapes[i] = [];
}

var prev = [];
var currentBoard = 0;

$("document").ready(function () {
    $("#text_formatter").hide();
    $("#texti").css("font-family",$('#fontselector').val() );
    o_CurrentTool = $("#currentShape").val();
    $('#currentShape').change(function () {

        o_CurrentTool = $("#currentShape").val();
        if(o_CurrentTool == "text") {
        $("#container canvas").css("cursor","text");
        }
        else {
            $("#container canvas").css("cursor","crosshair");
        }
        p_mouseEvents = new paintMouseEvents();
    });
    $('#fontselector').change(function () {
        $("#texti").css("font-family",$('#fontselector').val() );

    });
    $("#boldbtn").click( function() {
        if($("#texti").css("font-weight") !== "bold") {
        $("#texti").css("font-weight","bold");
        }
        else {
            $("#texti").css("font-weight","normal");
        }
    });
    $("#itbtn").click( function() {
        if($("#texti").css("font-style") !== "italic") {
            $("#texti").css("font-style","italic");
        }
        else {
            $("#texti").css("font-style","normal");
        }
    });
    $("#incsize").click( function() {
        var fontSize = parseInt($("#texti").css("font-size").replace("px",""));
        fontSize++;
        $("#texti").css("font-size",fontSize + "px");
    });
    $("#decsize").click( function() {
        var fontSize = parseInt($("#texti").css("font-size").replace("px",""));
        fontSize--;
        $("#texti").css("font-size",fontSize + "px");
    });
    //MAINCANVAS
    maincanvas = document.getElementById('imageView');
    maincontext = maincanvas.getContext('2d');
    //TEMP CANVAS+CONTEXT
    var container = maincanvas.parentNode;
    tempcanvas = document.createElement('canvas');
    tempcanvas.id = 'imageTemp';
    tempcanvas.width = maincanvas.width;
    tempcanvas.height = maincanvas.height;
    container.appendChild(tempcanvas);
    tempcontext = tempcanvas.getContext('2d');
    container.appendChild(tempcanvas);
    tempcanvas.addEventListener('mousedown', ev_canvas, false);
    tempcanvas.addEventListener('mousemove', ev_canvas, false);
    tempcanvas.addEventListener('mouseup', ev_canvas, false);
    p_mouseEvents = new paintMouseEvents();
    $('#colorp').ColorPicker({
        color: '#0000ff',
        onShow: function (colpkr) {
            $(colpkr).fadeIn(0);
            return false;
        },
        onHide: function (colpkr) {
            $(colpkr).fadeOut(0);
            return false;
        },
        onChange: function (hsb, hex, rgb) {
            $('#colorp div').css('backgroundColor', '#' + hex);
            o_currentColor = "#" + hex;
            $("#texti").css("color",o_currentColor);
        }
    });
    o_currentColor = $(".colorpicker_hex input").val();
    $('#colorp').ColorPickerSetColor(o_currentColor);
    $('#colorp div').css('backgroundColor', '#' + o_currentColor);
    $("#boards li a").click( function() {
        var num = parseInt($(this).attr("id").substring(1));
        changeBoard(num);
    });
});


function changeBoard(boardnum) {
    currentBoard = boardnum;
    redraw();
};

//UNDO
$(document).keydown(function (e) {
    if (e.keyCode == 90 && e.ctrlKey)
    {
        prev.push(p_drawnShapes[currentBoard].pop());
        redraw();
    }
});

//REDO
$(document).keydown(function (e) {
    if (e.keyCode == 89 && e.ctrlKey)
    {
        p_drawnShapes[currentBoard].push(prev.pop());
        redraw();
    }
});

//SHAPES
var ShapeBase = Base.extend({
    constructor: function (x, y, color, lineWidth) {
        o_currentColor = color;
        this.lineWidth = lineWidth;
        this.color = color;
        this.x = x;
        this.y = y;
        this.xEnd = x;
        this.yEnd = y;
    },
    calcbounds: function () {
        var xEnd = Math.min(this.x, this.xEnd);
        var yEnd = Math.min(this.y, this.yEnd);
        var w = Math.abs(this.x - this.xEnd);
        var h = Math.abs(this.y - this.yEnd);
        return {
            x: xEnd,
            y: yEnd,
            width: w,
            height: h
        }
    },
    setEnd: function (x, y) {
        this.xEnd = x;
        this.yEnd = y;
    },
    draw: function () {},
    isPointInShape: function (x, y) {
        var minx = Math.min(this.x,this.xEnd);
        var maxx = Math.max(this.x,this.xEnd);
        var miny = Math.min(this.y,this.yEnd);
        var maxy = Math.max(this.y,this.yEnd);
        if (x > minx-10 && x < maxx+10) {
            if (y > miny-10 && y < maxy+10) {
                return true;
            }
        }
        return false;
    },
    shift: function (x, y) {
        this.x += x;
        this.y += y;
        this.yEnd += y;
        this.xEnd += x;
    }
});

var Rectangle = ShapeBase.extend({
    constructor: function (x, y, x2, y2, color, lineWidth) {
        this.base(x, y, color, lineWidth);
        this.xEnd = x2;
        this.yEnd = y2;
    },
    draw: function (ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        var bounds = this.calcbounds();
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

});
var Line = ShapeBase.extend({
    constructor: function (x, y, x2, y2, color, lineWidth) {
        this.base(x, y, color, lineWidth);
        this.xEnd = x2;
        this.yEnd = y2;
    },
    draw: function (ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        var bounds = this.calcbounds();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.xEnd, this.yEnd);
        ctx.stroke();
        ctx.closePath();
    }
});

var Circle = ShapeBase.extend({
    constructor: function (x, y, x2, y2, color, lineWidth) {
        this.base(x, y, color, lineWidth);
        this.xEnd = x2;
        this.yEnd = y2;
    },
    draw: function (ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        var startPoint = (Math.PI/180)*0;
        var endPoint = (Math.PI/180)*360;
        var bounds = this.calcbounds();
        var radius = bounds.width/Math.PI;
        ctx.arc(bounds.x+bounds.width/2,bounds.y+bounds.height/2,bounds.width/2,startPoint,endPoint,true);
        ctx.stroke();
        ctx.closePath();
    },
    calcbounds: function () {
        var xEnd = Math.min(this.x, this.xEnd);
        var yEnd = Math.min(this.y, this.yEnd);
        var w = Math.abs(this.x - this.xEnd);
        var h = Math.abs(this.y - this.yEnd);
        if(h<w) { w=h;}
        else if(w<h) {h=w};
        return {
            x: xEnd,
            y: yEnd,
            width: w,
            height: h
        }
    }
});

var Text = ShapeBase.extend({
    constructor: function(x, y,inputText,fontSize,fontType,fontStyle,fontWeight, color, lineWidth) {
        this.base(x, y, color, lineWidth);
        this.inputText = inputText;
        this.fontSize = fontSize;
        this.fontType = fontType;
        this.color = color.replace("#","");
        this.fontStyle = fontStyle;
        this.fontWeight = fontWeight;
        var fs = parseInt(this.fontSize.replace("px",""));
        this.xEnd = this.x + (inputText.length*fs)/1.5;
        console.log(this.xEnd);
        this.yEnd = this.y+fs;
    },
    draw: function(ctx) {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.font = this.fontStyle + " " + this.fontWeight + " " + this.fontSize + " " + this.fontType;
        console.log(ctx.font);
        var bounds = this.calcbounds();
        ctx.textBaseline = "top";
        ctx.fillText(this.inputText,bounds.x,bounds.y);
    },
    Edit: function() {

        var container = $("#container");
        var textelement = $('<input type="text" editing="true" id="texti"/>');
        textelement.attr("value",this.inputText);
        textelement.css("top",this.y + "px");
        textelement.css("left",this.x + "px");
        textelement.css("font-family",this.fontType);
        textelement.css("font-size",this.fontSize);
        textelement.css("font-style",this.fontStyle);
        textelement.css("font-weight",this.fontWeight);
        textelement.css("color","#" + this.color);
        container.append(textelement);
        $("#text_formatter").show();
        $('#colorp').ColorPickerSetColor("#" + this.color);
        $('#colorp').find('div').css('backgroundColor', '#' + this.color);
        o_currentColor =  this.color;
        return;
    }
})

var Pencil = ShapeBase.extend({
    constructor: function (color, lineWidth) {
        this.base(-Infinity, -Infinity, color, lineWidth);
    },
    draw: function (ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        var points = this.points;
        var currentPoint;
        for (var p in points) {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            if (p == 0) {
                currentPoint = points[p];
            }
            ctx.moveTo(currentPoint.x, currentPoint.y);
            ctx.lineTo(points[p].x, points[p].y);
            ctx.stroke();
            ctx.closePath();
            currentPoint = points[p];
        }
    },
    setPoints: function (points) {
        this.points = points;
        var min_x = Infinity;
        var max_x = -Infinity;
        var min_y = Infinity;
        var max_y = -Infinity;
        for (var p in points) {
            if (points[p].x > max_x) {
                max_x = points[p].x;
            }
            if (points[p].x < min_x) {
                min_x = points[p].x;
            }
            if (points[p].y > max_y) {
                max_y = points[p].y;
            }
            if (points[p].y < min_y) {
                min_y = points[p].y;
            }
        }
        this.x = min_x;
        this.y = min_y;
        this.xEnd = max_x;
        this.yEnd = max_y;
    },
    shift: function (x, y) {
        this.x += x;
        this.y += y;
        this.yEnd += y;
        this.xEnd += x;
        points = this.points;
        for (var p in points) {
            points[p].x += x;
            points[p].y += y;
        }
    }
});




function ev_canvas(ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
        ev._x = ev.layerX;
        ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
        ev._x = ev.offsetX;
        ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.


    var func = p_mouseEvents[ev.type];
    if (func) {
        func(ev);
    }
};

function get_type(thing){
    if(thing===null)return "[object Null]"; // special case
    return Object.prototype.toString.call(thing);
}
function paintMouseEvents() {
    var tool = this;
    this.started = false;
    tool.points = [];
    this.drawnshape;
    tool.selected;
    tool.prevX;
    tool.prevY;

    this.mousedown = function (ev) {
        if( $("#texti").val() ) {
            var text = $("#texti").val();
            console.log(text);
            var fontSize = $("#texti").css("font-size");
            var fontType= $("#texti").css("font-family");
            var fontWeight= $("#texti").css("font-weight");
            var fontStyle= $("#texti").css("font-style");
            //(x, y,inputText,fontSize,fontType,fontStyle, color, lineWidth)
            if(!$("#texti").attr("editing")) {
            var textobject = new Text(tool.prevX,tool.prevY,text,fontSize,fontType,fontStyle,fontWeight, o_currentColor, o_lineWidth);
            p_drawnShapes[currentBoard].push(textobject);
            textobject.draw(maincontext);
            }
            else {
                tool.selected.inputText = $("#texti").val();
                tool.selected.fontType = $("#texti").css("font-family");
                tool.selected.fontSize = $("#texti").css("font-size");
                tool.selected.fontWeight = $("#texti").css("font-weight");
                tool.selected.fontStyle = $("#texti").css("font-style");
                tool.selected.color = o_currentColor.replace("#","");
                redraw();
            }
            $("#text_formatter").hide();
            $("#texti").remove();
            return;
        }
        $("#texti").remove();
        $(this).css('cursor', 'crosshair');
        tool.prevX = ev._x;
        tool.prevY = ev._y;
        if (o_CurrentTool === "select") {
            for (var s in p_drawnShapes[currentBoard]) {
                if (p_drawnShapes[currentBoard][s].isPointInShape(ev._x, ev._y)) {
                    if(p_drawnShapes[currentBoard][s].inputText) {
                        p_drawnShapes[currentBoard][s].Edit();
                        tool.selected = p_drawnShapes[currentBoard][s];
                        return;
                    }
                    tool.selected = p_drawnShapes[currentBoard][s];
                    var bounds = p_drawnShapes[currentBoard][s].calcbounds();
                    tempcontext.strokeStyle = "#F4D71D";
                    tempcontext.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6);
                    tool.started = true;
                    return;
                }
            }
            return;
        }
        else if (o_CurrentTool === "text") {

            var container = $("#container");
            var textelement = $('<input type="text" id="texti"/>');
            textelement.css("top",ev._y + "px");
            textelement.css("left",ev._x + "px");
            textelement.css("color","#" + o_currentColor.replace("#",""));
            container.append(textelement);
            $("#text_formatter").show();
            return;
        }
        $("#text_formatter").hide();
        tool.started = true;
        tool.x0 = ev._x;
        tool.y0 = ev._y;
    };


    this.mousemove = function (ev) {
        //$("#draghandle").remove();
        if (!tool.started) {
            if (o_CurrentTool === "select") {
                for (var s in p_drawnShapes[currentBoard]) {
                    if (p_drawnShapes[currentBoard][s].isPointInShape(ev._x, ev._y)) {
                        if(p_drawnShapes[currentBoard][s].inputText) {
                            //ADDA DRAGHANDLE
                        }
                    }
                }
            }
            return;
        }
        var currentTool;
        if (o_CurrentTool === "rectangle") {
            currentTool = new Rectangle(tool.x0, tool.y0, ev._x, ev._y, o_currentColor, o_lineWidth);
        } else if (o_CurrentTool === "line") {
            currentTool = new Line(tool.x0, tool.y0, ev._x, ev._y, o_currentColor, o_lineWidth);
        } else if (o_CurrentTool === "circle") {
            currentTool = new Circle(tool.prevX,tool.prevY,ev._x,ev._y,o_currentColor,o_lineWidth);
        } else if (o_CurrentTool === "text") {
            return;
        }
        else if (o_CurrentTool === "pencil") {
            tool.points.push({
                x: ev._x,
                y: ev._y
            });
            currentTool = new Pencil(o_currentColor, o_lineWidth);
            currentTool.setPoints(tool.points);
        } else if (o_CurrentTool === "select") {
            var bounds = tool.selected.calcbounds();
            var xDiff = ev._x - tool.prevX;
            var yDiff = ev._y - tool.prevY;
            tool.selected.shift(xDiff, yDiff);
            redraw();
            tempcontext.strokeStyle = "#F4D71D";
            bounds = tool.selected.calcbounds();
            tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
            tempcontext.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6);
            tool.prevX = ev._x;
            tool.prevY = ev._y;
            return;
        } else {
            alert("ERROR TOOL NOT FOUND");
            return;
        }
        tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
        currentTool.draw(tempcontext);
        tool.drawnshape = currentTool;
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
        $("#texti").focus();
        if (o_CurrentTool === "select") {
            tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
            tool.started = false;
            return;
        }
        if (tool.started) {
            if(tool.drawnshape) {
                p_drawnShapes[currentBoard].push(tool.drawnshape);
            }
            tool.mousemove(ev);
            tool.started = false;
            updateSurface();
            tool.points = [];
        }
    };
};

function updateSurface() {
    maincontext.drawImage(tempcanvas, 0, 0);
    tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
};

function redraw() {
    maincontext.clearRect(0, 0, maincanvas.width, maincanvas.height);
    for (var s in p_drawnShapes[currentBoard]) {
        p_drawnShapes[currentBoard][s].draw(maincontext);
    }
};