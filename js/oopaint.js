var o_currentColor = "black";
var o_lineWidth = 5;
var maincanvas, tempcanvas;
var maincontext, tempcontext;
var o_CurrentTool;
var p_mouseEvents;
var my_templates = [];
var p_drawnShapes = [];
for (var i = 0; i < 10; i++) {
    p_drawnShapes[i] = [];
}
var ctrl_down = false;
var prev = [];
var currentBoard = 0;

$("document").ready(function () {
    $("button").each(function() {
        $(this).attr("class","btn");
    });
    $(document).bind('keydown', 'Ctrl', function() {ctrl_down = true;});
    $(document).bind('keyup', 'Ctrl', function() {ctrl_down = false;});

    $("#text_formatter").hide();
    $("#texti").css("font-family",$('#fontselector').val() );
    o_CurrentTool = $("#shapechooser button").first().val();
    $("#shapechooser button").first().addClass('active');
    $("#boards button").first().addClass('active');
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
    $("#add_template").click(function() {
       drawTemplate();
    });
    $("#export").click(function() {
        var overlay = jQuery('<div id="overlay"> </div>');
        overlay.appendTo(document.body);
        var area = $("<textarea></textarea>");
        var exbutton = $("<button class='btn'>Export</button>");
        exbutton.click( function() {
            area.html(JSON.stringify(p_drawnShapes));
        });
        var imbutton = $("<button class='btn'>Import</button>");
        imbutton.click( function() {
            var paint_import_data = $("#overlay textarea").val();
            paint_importJSON(paint_import_data);
        });
        var clbutton = $("<button class='btn'>Close</button>");
        clbutton.click( function() {
            $("#overlay").remove();
        });
        overlay.append(area);
        overlay.append(exbutton);
        overlay.append(imbutton);
        overlay.append(clbutton);
    });
    $("#shapechooser button").click(function() {
        $("#shapechooser button").removeClass('active');
        $(this).addClass('active');
        o_CurrentTool = $(this).val();

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
    $("#boards li button").click( function() {
        $("#boards li button").removeClass('active');
        $(this).addClass('active');
        var num = $(this).html();
        changeBoard(num-1);
    });


});

function paint_importJSON(jsondata) {
    if(!jsondata) { return;}
    var obj = $.parseJSON(jsondata);
    var Jboard1 = obj[0];
    p_drawnShapes = [];
    for (var i = 0; i < 10; i++) {
        p_drawnShapes[i] = [];
    }
    for(var i in obj) {
        for(var s in obj[i]) {
            if(obj[i][s].type === "Line") {
                //(x, y, x2, y2, color, lineWidth)
                var line = new Line(obj[i][s].x,obj[i][s].y,obj[i][s].xEnd,obj[i][s].yEnd,obj[i][s].color,obj[i][s].lineWidth);
                p_drawnShapes[i].push(line);
            }
            else if(obj[i][s].type === "Circle") {
                //(x, y, x2, y2, color, lineWidth)
                var circle = new Circle(obj[i][s].x,obj[i][s].y,obj[i][s].xEnd,obj[i][s].yEnd,obj[i][s].color,obj[i][s].lineWidth);
                p_drawnShapes[i].push(circle);
            }
            else if(obj[i][s].type === "Rectangle") {
                //(x, y, x2, y2, color, lineWidth)
                var rect = new Rectangle(obj[i][s].x,obj[i][s].y,obj[i][s].xEnd,obj[i][s].yEnd,obj[i][s].color,obj[i][s].lineWidth);
                p_drawnShapes[i].push(rect);
            }
            else if(obj[i][s].type === "Text") {
                //(x, y, x2, y2, color, lineWidth)
                var txt = new Text(obj[i][s].x,obj[i][s].y,obj[i][s].inputText,
                    obj[i][s].fontSize,obj[i][s].fontType,obj[i][s].fontStyle,
                    obj[i][s].fontWeight,obj[i][s].color,obj[i][s].lineWidth);
                p_drawnShapes[i].push(txt);
            }
            else if(obj[i][s].type === "Pencil") {
                //(x, y, x2, y2, color, lineWidth)
                var penc = new Pencil(obj[i][s].color,obj[i][s].lineWidth);
                penc.points = obj[i][s].points;
                p_drawnShapes[i].push(penc);
            }
        }
    }
    redraw();
}
function changeBoard(boardnum) {
    currentBoard = boardnum;
    tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
    redraw();
};

//UNDO
$(document).keydown(function (e) {
    if (e.keyCode == 90 && e.ctrlKey)
    {
        var value = p_drawnShapes[currentBoard].pop();
        if(value) {
        prev.push(value);
        }
        tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
        redraw();
    }
});

//REDO
$(document).keydown(function (e) {
    if (e.keyCode == 89 && e.ctrlKey)
    {
        var value = prev.pop();
        if(value) {
            p_drawnShapes[currentBoard].push(value);
        }
        tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
        redraw();
    }
});

//SHAPES
var ShapeBase = Base.extend({
    constructor: function (x, y, color, lineWidth) {
        o_currentColor = color;
        this.lineWidth = lineWidth;
        this.color = "#" + color.replace("#","");
        this.x = x;
        this.y = y;
        this.xEnd = x;
        this.yEnd = y;
        this.type = "Shape";
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
        this.type = "Rectangle";
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
        this.type = "Line";
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
        this.type = "Circle";
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
        this.xEnd = this.x + (this.inputText.length*fs)/1.5;
        this.yEnd = this.y+fs;
        this.type = "Text";
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
        textelement.css("color","#" + this.color.replace("#",""));
        textelement.css("width",this.calcbounds().width + "px");
        container.append(textelement);
        $("#text_formatter").show();
        $('#colorp').ColorPickerSetColor("#" + this.color);
        $('#colorp').find('div').css('backgroundColor', '#' + this.color);
        o_currentColor =  this.color;
        return;
    },
        isPointInShape: function (x, y) {
        var fs = parseInt(this.fontSize.replace("px",""));
        var maxx = this.x + (this.inputText.length*fs)/1.5;
        var maxy = this.y+fs;
        var minx = this.x;
        var miny = this.y;
        if (x > minx-10 && x < maxx+10) {
            if (y > miny-10 && y < maxy+10) {
                return true;
            }
        }
        return false;
    }
})

var Pencil = ShapeBase.extend({
    constructor: function (color, lineWidth) {
        this.base(-Infinity, -Infinity, color, lineWidth);
        this.type = "Pencil";
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


function Template(name,shapes) {
    this.name = name;
    this.shapes = shapes;
    console.log(this);
}

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
function createTemplate(shapes){
    var name=prompt("Please select a name for your template","Untitled");
    var template = new Template(name,shapes);
    var option = $("<option></option>");
    option.attr("value",my_templates.length);
    my_templates.push(template);
    option.html(name);
    $("#templates").append(option);
}
function drawTemplate() {
    var selected = parseInt($("#templates :selected").val());
    var currentTemplate = my_templates[selected];
    var shapes = currentTemplate.shapes;
    for(var i in shapes) {
        p_drawnShapes[currentBoard].push(shapes[i]);
        shapes[i].draw(maincontext);
    }
}
function paintMouseEvents() {
    var tool = this;
    this.started = false;
    tool.points = [];
    this.drawnshape;
    tool.selected = [];
    tool.selectedIDs = [];
    tool.selectedText;
    tool.prevX;
    tool.prevY;
    $(document).keydown(function (e) {
        if (e.keyCode == 46)  {
            for(var i in p_drawnShapes[currentBoard]) {
                for(var j in tool.selectedIDs) {
                    if(i === tool.selectedIDs[j]) {
                        var element = p_drawnShapes[currentBoard][i];
                        prev.push(element);
                        delete p_drawnShapes[currentBoard][i];
                        delete tool.selectedIDs[j];
                        tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
                        redraw();
                    }
                }
            }
            var len = p_drawnShapes[currentBoard].length;
            for(var i=0;i<len;i++) {
                if(p_drawnShapes[currentBoard][i] == null) {
                    p_drawnShapes[currentBoard].splice(i,1);
                }
            }
        }
    });

    $("#create_template").click( function() {
        createTemplate(tool.selected);
    });
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
            textobject.color = "#" + o_currentColor.replace("#","");
            p_drawnShapes[currentBoard].push(textobject);
            textobject.draw(maincontext);
            }
            else {
                tool.selectedText.inputText = $("#texti").val();
                tool.selectedText.fontType = $("#texti").css("font-family");
                tool.selectedText.fontSize = $("#texti").css("font-size");
                tool.selectedText.fontWeight = $("#texti").css("font-weight");
                tool.selectedText.fontStyle = $("#texti").css("font-style");
                tool.selectedText.color = "#" + o_currentColor.replace("#","");
                var fs = parseInt(tool.selectedText.fontSize.replace("px",""));
                tool.selectedText.xEnd = tool.selectedText.x + (tool.selectedText.inputText.length*fs)/1.5;
                tool.selectedText.yEnd = tool.selectedText.y+fs;
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
            if(!ctrl_down) {
                tool.selectedIDs = [];
                tool.selected = [];
                tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
                redraw();
            }
            var stopping_select = true;
            //tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
            for (var s in p_drawnShapes[currentBoard]) {
                if (p_drawnShapes[currentBoard][s].isPointInShape(ev._x, ev._y)) {
                    if(p_drawnShapes[currentBoard][s].inputText) {
                        p_drawnShapes[currentBoard][s].Edit();
                        tool.selected = p_drawnShapes[currentBoard][s];
                        tool.selectedText = p_drawnShapes[currentBoard][s];
                        return;
                    }
                    if(!(tool.selectedIDs.indexOf(s) > -1)) {
                        tool.selected.push(p_drawnShapes[currentBoard][s]);
                        tool.selectedIDs.push(s);
                    }
                    stopping_select = false;
                    var bounds = p_drawnShapes[currentBoard][s].calcbounds();
                    tempcontext.strokeStyle = "#F4D71D";
                    tempcontext.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6);
                    tool.started = true;
                    if(!ctrl_down) {
                        return;
                    }
                }
            }
            if(stopping_select) {
                tool.selectedIDs = [];
                tool.selected = [];
                tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
                redraw();
            }
            console.log(stopping_select);
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
            tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
            console.log(ev._x,ev._y);

            var xDiff = ev._x - tool.prevX;
            var yDiff = ev._y - tool.prevY;
                for(var els in tool.selected) {
                    var bounds = tool.selected[els].calcbounds();
                    tool.selected[els].shift(xDiff, yDiff);
                    console.log(xDiff, yDiff);
                    redraw();
                    tempcontext.strokeStyle = "#F4D71D";
                    bounds = tool.selected[els].calcbounds();
                    tempcontext.strokeRect(bounds.x - 3, bounds.y - 3, bounds.width + 6, bounds.height + 6);
                }
            console.log(tool.prevX,ev._x);
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
        if (o_CurrentTool === "select" ) {
            //tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
            tool.started = false;
            return;
        }
        if (tool.started) {
            if(tool.drawnshape) {
                p_drawnShapes[currentBoard].push(tool.drawnshape);
            }
            tool.mousemove(ev);
            tool.started = false;
            tempcontext.clearRect(0, 0, tempcanvas.width, tempcanvas.height);
            redraw();
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