document.addEventListener("DOMContentLoaded",function(){
    /***Initialize the canvas***/
    var canvas = document.getElementById("gameCanvas");
    // Every element size should be based on these two variables
    var g_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var g_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var context = canvas.getContext("2d");
    canvas.width = g_height*.5;
    canvas.height = g_height;

    /*** Initialize game logic variables ***/
    var bricks = [];
    const max_rows = 12;
    const max_cols = 6;
    const colors = {1:"#00f",2:"#f00",3:"#0f0",4:"#0ff",5:"#f0f",6:"#ff0"}

    /*** Initialize visual elements ***/
    var brick_border = canvas.height*.005;
    var brick_offset_left = canvas.height * .005;
    var brick_size = canvas.height/max_rows - brick_border;
    Log("brick_border: "+brick_border);
    Log("brick_size: " +brick_size);
    
    var i = -1;

    drawBricks();
    //drawTitle();
    draw();

    function draw() {
        i++;

        Log(i);
        
    }
    
    function drawBricks() {
        for(var row = 0; row < max_rows; row++){
            for(var col = 0; col < max_cols; col++){
                var brickX = col*(brick_size + brick_border);
                var brickY = row*(brick_size + brick_border);
                context.beginPath();
                context.rect(brickX, brickY, brick_size, brick_size);
                var clr = Math.floor(Math.random()*max_cols+1);
                context.fillStyle = colors[clr];
                context.fill();
                context.closePath();
            }
        }
    }

    function drawTitle(){
        context.fillStyle = "blue";
        context.font = "bold 16px arial";
        context.fillText("ELEMENTRIS", canvas.width/2 - 50, 16);
    }
    
    function Log(message){
        window.console.log(message);
    }
    // Create a draw function loop using animation frames.
    requestAnimationFrame(draw);
})
