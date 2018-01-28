document.addEventListener("DOMContentLoaded",function(){
    /*** Initialize code helper variables ***/
    var debugMode = true;
    const priority = {
        D: 0,
        P: 1
    }

    /***Initialize the canvas***/
    var canvas = document.getElementById("gameCanvas");
    // Every element size should be based on these two variables
    var g_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var g_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    g_height = g_height*.90;
    var context = canvas.getContext("2d");
    canvas.width = g_height*.5;
    canvas.height = g_height;

    /*** Initialize game logic variables ***/
    const max_rows = 12;
    const max_cols = 6;
    const colors = {
        1:"#00f",
        2:"#f00",
        3:"#0f0",
        4:"#0ff",
        5:"#f0f",
        6:"#ff0"}
    var blocks = [];
    initializeBlocks();

    /*** Initialize visual elements ***/
    var block_border = canvas.height*.005;
    var block_offset_left = canvas.height * .005;
    var block_size = canvas.height/max_rows - block_border;
    Log("block_border: "+block_border,priority.D);
    Log("block_size: " +block_size,priority.D);
    
    /*** Game Execution ***/
    drawBlocks();
    draw();

    
    /*** Game's Logic Functions ***/
    function initializeBlocks() {
        // Load a block template that contains 2d array with exists predefined.
        for (var row = 0; row < max_rows; row++) {
            blocks[row] = [];
            for (var col = 0; col < max_cols; col++) {
                blocks[row][col] = { x: 0, y: 0, color: "", exists: true };
            }
        }
    }

    function draw() {
        Log("In Draw", priority.D);   
    }
    
    function drawBlocks() {
        for(var row = 0; row < max_rows; row++){
            for(var col = 0; col < max_cols; col++){
                if(!blocks[row][col]) continue;
                var blockX = col*(block_size + block_border);
                var blockY = row*(block_size + block_border);
                var clr = Math.floor(Math.random()*max_cols+1);
                blocks[row][col].x=blockX;
                blocks[row][col].y=blockY;
                blocks[row][col].color=clr;
                context.beginPath();
                context.rect(blockX, blockY, block_size, block_size);
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
    
    function Log(message, pri){
        if(pri === priority.D && debugMode === false) return;
        window.console.log(message);
    }
    // Create a draw function loop using animation frames.
    requestAnimationFrame(draw);
})
