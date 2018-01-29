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
    const fall_delay = 15;
    const colors = {
        0:null,
        1:"#00f",
        2:"#f00",
        3:"#0f0",
        4:"#0ff",
        5:"#f0f",
        6:"#ff0"}
    var blocks = [];
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
    const keyActions ={
        swap:83,// key S
        rise:32 // spacebar
    }
    var cursor ={
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        rowPos: 6,
        colPos: 2,
        size:block_size,
        color:"#fff",
        mode:controlModes.keys,
        swapping: false,
        direction:null
    }
    
/*** Game Execution ***/
    calculateDisplayDimensions();
    initializeBlocks();
    window.addEventListener("resize",onResize, false);
    if(cursor.mode === controlModes.keys){
        document.addEventListener("keydown",keyDownHandler,false);
        document.addEventListener("keyup", keyUpHandler, false);
    }
    run();
    
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
                if (!blocks[row][col].properties.exists) continue;
                if (blocks[row][col].properties.color) continue;
                var clr = Math.floor(Math.random() * max_cols + 1);
                blocks[row][col].properties.color = clr;
            }
        }
    }

    function run() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        applyGravity();
        drawBlocks();
        drawCursor();
        // Create a draw function loop using animation frames.
        requestAnimationFrame(run);
    }
    
    function drawBlocks(rowStart=0, rowEnd=max_rows, colStart=0, colEnd=max_cols) {
        for(var row = rowStart; row < rowEnd; row++){
            for(var col = colStart; col < colEnd; col++){
                var block = blocks[row][col];
                // First check for locked property because non-existant blocks can also be
                // swap-locked and we need to decrease their counters too.
                if (block.properties.locked > 0){
                    Log("Locked: " + block.properties.locked);
                    block.properties.locked--;
                }
                if (!block.properties.exists) continue;

                var blockX = block.x;
                var blockY = block.y;
                var clr = block.properties.color;
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
        // Set new position of cursor
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

    function applyGravity(){
        for(var row = max_rows-2; row >= 0; row--){
            for(var col = 0; col < max_cols; col++){
                var blockProperties = blocks[row][col].properties;
                if(!isFloating(row,col) || blockProperties.locked>0) continue;
                swap(row,col,row+1,col);
            }
        }
    }

    function isFloating(row, col){
        if(row >= max_rows-1){ return false;}
        var block = blocks[row][col];
        var blockBelow = blocks[row+1][col];
        if(blockBelow.properties.exists) return false;
        if(!block.properties.exists) return false;
        return true;
    }

    function isAboveFloating(row,col){
        if(row <= 0) return false;
        Log("Checking floating: "+row+" "+col);
        return isFloating(row-1,col);
    }

/*** Movement Functions ***/
    function moveCursor(){
        if(!cursor.direction){
            Log("cursor direction not set: "+ cursor.direction,priority.P); 
            return;
        }
        switch(cursor.direction){
            case keyDirections.left:
                moveCursorLeft();
            break;
            case keyDirections.right:
                moveCursorRight();
            break;
            case keyDirections.up:
                moveCursorUp();
            break;
            case keyDirections.down:
                moveCursorDown();
            break;
        }
        cursor.direction = null;
    }

    function moveCursorLeft(){
        Log("Moving cursor to: " + cursor.direction);
        if(cursor.colPos>0)
            cursor.colPos--;
    }

    function moveCursorRight(){
        Log("Moving cursor to: " + cursor.direction);
        if (cursor.colPos < max_cols-2)
            cursor.colPos++;
    }

    function moveCursorUp(){
        Log("Moving cursor to: " + cursor.direction);
        if(cursor.rowPos > 0)
            cursor.rowPos--;
    }

    function moveCursorDown(){
        Log("Moving cursor to: " + cursor.direction);
        if(cursor.rowPos < max_rows-1)
            cursor.rowPos++;
    }

    function swap(blockRow, blockCol, swapWithRow=blockRow, swapWithCol=blockCol+1){
        var block = blocks[blockRow][blockCol];
        var blockSwapWith = blocks[swapWithRow][swapWithCol];
        if(!block.properties.exists && !blockSwapWith.properties.exists) return;
        if(block.properties.locked > 0 || blockSwapWith.properties.locked > 0) return;
        Log("Swapping: row:" + blockRow + " col:" + blockCol + " with row:" + swapWithRow + " col: " + swapWithCol);
        Log("color block to swap: " + block.properties.color);
        Log("color block to swap with: " + blockSwapWith.properties.color);
        Log("exists block to swap: " + block.properties.exists);
        Log("exists block to swap with: " + blockSwapWith.properties.exists);
        
        // Swap blocks properties, postion remains the same
        var tProperties = block.properties;
        block.properties = blockSwapWith.properties;
        blockSwapWith.properties = tProperties;
    }

    function verifySwap(row, col, secRow = row, secCol = col + 1){
        var block = blocks[row][col];
        var secBlock = blocks[secRow][secCol];
        if (isFloating(row, col)
            && block.properties.locked <= 0){
                block.properties.locked = fall_delay;
                blocks[row+1][col].properties.locked = fall_delay;
        }
        else if (isFloating(secRow, secCol)
            && secBlock.properties.locked <= 0){
                secBlock.properties.locked = fall_delay;
                blocks[secRow + 1][secCol].properties.locked = fall_delay;
        }
        if (isAboveFloating(row, col)) {
            blocks[row - 1][col].properties.locked = fall_delay;
        }
        else if (isAboveFloating(secRow, secCol)) {
            blocks[secRow - 1][secCol].properties.locked = fall_delay;
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
        Log("block_border: " + block_border);
        Log("block_size: " + block_size);
    }

    function onResize() {
        Log("window width: "+window.innerWidth);
        Log("window height: " + window.innerHeight);
        Log("clientHeight: " + document.documentElement.clientHeight);
        calculateDisplayDimensions();
        updateBlocksPositions();
    }

    function keyDownHandler(e){
        Log("pressed: "+e.keyCode);
        if(Object.values(keyDirections).indexOf(e.keyCode) > -1 && cursor.direction) return;
        else if (Object.values(keyDirections).indexOf(e.keyCode) > -1){
            cursor.direction = e.keyCode;
            moveCursor();
        }
        else if(!cursor.swapping && e.keyCode === keyActions.swap){
            cursor.swapping = true;
            // Verify if block will be floating after swap
            // Set a timer if the box ended in a floating position
            swap(cursor.rowPos,cursor.colPos);
            verifySwap(cursor.rowPos, cursor.colPos);
        }
    }

    function keyUpHandler(e){
        if (Object.values(keyDirections).indexOf(e.keyCode) > -1)
            cursor.direction = null;
        else if (cursor.swapping && e.keyCode === keyActions.swap)
            cursor.swapping = false;
    }

    function Log(message, pri=priority.D){
        if(pri === priority.D && debugMode === false) return;
        window.console.log(message);
    }
});