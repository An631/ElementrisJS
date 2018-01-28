/*
    ELEMENTRIS
    Author: Angel Duran
*/
document.addEventListener("DOMContentLoaded",function(){    
    /*** Initialize code helper variables ***/
    var debugMode = true;
    const priority = {
        D: 0,
        P: 1
    }

/***Initialize Game***/
    var canvas = document.getElementById("game_canvas");
    var context = canvas.getContext("2d");
    var g_height;
    var block_border;
    var block_size;
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
    calculateDisplayDimensions();
    initializeBlocks();
    window.addEventListener("resize",onResize);

        
/*** Game Execution ***/
    draw();
    // Create a draw function loop using animation frames.
    requestAnimationFrame(draw);
    
/*** Game's Logic Functions ***/
    function initializeBlocks() {
        // Load a block template that contains 2d array with exists predefined.
        var randomTemplate = Math.floor(Math.random()*2);
        Log("Chose template #: "+randomTemplate);
        blocks = templates[randomTemplate];
        for (var row = 0; row < max_rows; row++) {
            for (var col = 0; col < max_cols; col++) {
                if (!blocks[row][col].exists) continue;
                var blockX = col * (block_size + block_border);
                var blockY = row * (block_size + block_border);
                var clr = Math.floor(Math.random() * max_cols + 1);
                blocks[row][col].x = blockX;
                blocks[row][col].y = blockY;
                blocks[row][col].color = clr;
            }
        }
    }

    function updateBlocksPositions(){
        for (var row = 0; row < max_rows; row++) {
            for (var col = 0; col < max_cols; col++) {
                if (!blocks[row][col].exists) continue;
                var blockX = col * (block_size + block_border);
                var blockY = row * (block_size + block_border);
                blocks[row][col].x = blockX;
                blocks[row][col].y = blockY;
            }
        }
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBlocks();  
    }
    
    function drawBlocks() {
        for(var row = 0; row < max_rows; row++){
            for(var col = 0; col < max_cols; col++){
                if(!blocks[row][col].exists) continue;
                var blockX = blocks[row][col].x;
                var blockY = blocks[row][col].y;
                var clr = blocks[row][col].color;

                context.beginPath();
                context.rect(blockX, blockY, block_size, block_size);
                context.fillStyle = colors[clr];
                context.fill();
                context.closePath();
            }
        }
    }  

/*** Utility Functions ***/
    function calculateDisplayDimensions() {
        // Every element size should be based on these two variables
        g_height = Math.min(document.documentElement.clientHeight, window.innerHeight || 0);
        g_height = g_height * .90;
        canvas.height = g_height;
        canvas.width = g_height * .5;
        block_border = canvas.height * .005;
        block_size = canvas.height / max_rows - block_border;
        Log("block_border: " + block_border, priority.D);
        Log("block_size: " + block_size, priority.D);
    }

    function onResize() {
        Log("window width: "+window.innerWidth);
        Log("window height: " + window.innerHeight);
        Log("clientHeight: " + document.documentElement.clientHeight);
        calculateDisplayDimensions();
        updateBlocksPositions();
        draw();
    }

    function Log(message, pri=priority.D){
        if(pri === priority.D && debugMode === false) return;
        window.console.log(message);
    }
})
