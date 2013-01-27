
/* © Knútur Óli
 * http://www.knutur.is
 */

var tool;
var tool_default = 'pencil';

if(window.addEventListener) {
    window.addEventListener('load', function () {
        var canvas, context;

        function init () {
            canvas = document.getElementById('imageView');
            if(!canvas) {
                alert('Canvas element was not found');
                return;
            }
            if(!canvas.getContext) {
                alert('getContext element of canvas not found');
                return;

            }

// Get the 2D canvas context.
            context = canvas.getContext('2d');
            if (!context) {
                alert('Error: failed to getContext(2d)!');
                return;
            }
            canvas.addEventListener('mousedown', ev_canvas, false);
            canvas.addEventListener('mousemove', ev_canvas, false);
            canvas.addEventListener('mouseup',   ev_canvas, false);
        }
        function ev_canvas (ev) {
            if (ev.layerX || ev.layerX == 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            // Call the event handler of the tool.
            var func = tool[ev.type];
            if (func) {
                func(ev);
            }
        }
        var tools = {};
        // The drawing pencil.
        tools.pencil = function () {
                var tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.bgColor = "black";
                    context.strokeStyle = "Blue";
                    context.stroke();
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };
        function img_update () {
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (tools[tool_default]) {
            tool = new tools[tool_default]();
        }
        init();
    }, false); }