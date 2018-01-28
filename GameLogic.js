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
        0:null,
        1:"#00f",
        2:"#f00",
        3:"#0f0",
        4:"#0ff",
        5:"#f0f",
        6:"#ff0"}
    var blocks = [];
    calculateDisplayDimensions();
    initializeBlocks();
    const controlModes = {
        keys: 0,
        touch: 1,
        mouse: 2
    }
    const keyDirections = {
        up:38,
        down:40,
        left:37,
        right:39
    }
    var cursor ={
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        rowPos: 5,
        colPos: 2,
        size:block_size,
        color:"#fff",
        mode:controlModes.keys,
        direction:null
    }
    window.addEventListener("resize",onResize, false);
    document.addEventListener("keydown",keyDownHandler,false);
    document.addEventListener("keyup", keyUpHandler, false);
        
        
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
        updateBlocksPositions();
    }

    function updateBlocksPositions(){
        for (var row = 0; row < max_rows; row++) {
            for (var col = 0; col < max_cols; col++) {
                var blockX = col * (block_size + block_border);
                var blockY = row * (block_size + block_border);
                blocks[row][col].x = blockX;
                blocks[row][col].y = blockY;
                if (!blocks[row][col].exists) continue;
                if (blocks[row][col].color) continue;
                var clr = Math.floor(Math.random() * max_cols + 1);
                blocks[row][col].color = clr;
            }
        }
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBlocks(); 
        drawCursor();
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

    function drawCursor() {
        if(cursor.mode !== controlModes.keys) return;
        cursor.x1 = blocks[cursor.rowPos][cursor.colPos].x;
        cursor.y1 = blocks[cursor.rowPos][cursor.colPos].y;
        cursor.x2 = blocks[cursor.rowPos][cursor.colPos+1].x;
        cursor.y2 = blocks[cursor.rowPos][cursor.colPos+1].y;
        cursor.size = block_size;
        context.strokeStyle = cursor.color;
        context.lineWidth = 3;
        context.beginPath();
            context.strokeRect(cursor.x1, cursor.y1, cursor.size, cursor.size);
        context.closePath();
        context.beginPath();
            context.strokeRect(cursor.x2, cursor.y2, cursor.size, cursor.size);
        context.closePath();
    }  

    function moveCursor(){

    }

    function moveCursorLeft(){

    }

    function moveCursorRight(){

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
        Log("block_border: " + block_border);
        Log("block_size: " + block_size);
    }

    function onResize() {
        Log("window width: "+window.innerWidth);
        Log("window height: " + window.innerHeight);
        Log("clientHeight: " + document.documentElement.clientHeight);
        calculateDisplayDimensions();
        updateBlocksPositions();
        draw();
    }

    function keyDownHandler(e){
        if(Object.values(keyDirections).indexOf(e.keyCode)>-1 && cursor.direction) return;
        cursor.direction = e.keyCode;
        Log("Moving cursor to: "+cursor.direction);
        moveCursor();
    }

    function keyUpHandler(e){
        if (Object.values(keyDirections).indexOf(e.keyCode) > -1)
            cursor.direction = null;
    }

    function Log(message, pri=priority.D){
        if(pri === priority.D && debugMode === false) return;
        window.console.log(message);
    }
});