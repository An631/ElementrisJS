/*
    ELEMENTRIS
    Author: Angel Duran
*/
document.addEventListener("DOMContentLoaded",function(){    
    /*** Initialize code helper variables ***/
    const debugModes = {
        production: 0,
        debug: 1,
        verbose: 2
    }
    const priority = {
        P: 0,
        D: 1,
        V: 2
    }
    var debugMode = debugModes.verbose;

/***Initialize Game***/
    var canvas = document.getElementById("game_canvas");
    var context = canvas.getContext("2d");
    var g_height;
    var block_border;
    var block_size;
    const max_rows = 12;
    const max_cols = 6;
    const blocks_to_match = 3;
    const fall_delay = 15;
    const delete_delay=30;
    const colors = {
        0:null,
        1:"#00f",
        2:"#f00",
        3:"#0f0",
        4:"#0ff",
        5:"#f0f",
        6:"#ff0",
        7:"#fff"
    }
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
    var chainCount = 0;
    
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
    function run() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        applyGravity();
        drawBlocks();
        drawCursor();
        // Create a game loop using animation frames.
        requestAnimationFrame(run);
    }

    function initializeBlocks() {
        // Load a block template that contains 2d array with exists predefined.
        var randomTemplate = Math.floor(Math.random()*2);
        Log("Chose template #: "+randomTemplate);
        blocks = templates[randomTemplate];
        updateBlocks();
    }

    function updateBlocks(){
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
    
    function drawBlocks(rowStart=0, rowEnd=max_rows, colStart=0, colEnd=max_cols) {
        for(var row = rowStart; row < rowEnd; row++){
            for(var col = colStart; col < colEnd; col++){
                var block = blocks[row][col];
                
                // First check for locked property because non-existent blocks can also be
                // swap-locked and we need to decrease their counters too.
                if (isLocked(row,col)){
                    block.properties.locked--;
                }
                
                if (block.properties.delete > 0) {
                    block.properties.delete--;
                    if(block.properties.delete <= 0) 
                        block.properties.exists = false;
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
                if( ! isFloating(row,col) || isLocked(row,col)) continue;
                var successFallSwap = swap(row, col, row+1, col);
                // If after the swap the block is no longer floating, it has hit bottom.
                if(successFallSwap && !isFloating(row+1, col)){
                    var matchingBlocks = isBlockColorMatching(row+1, col);
                    if (matchingBlocks.length >= blocks_to_match){
                        chainCount++;
                        Log("CHAIN: "+chainCount,priority.P);
                        queueBlocksForDeletion(matchingBlocks);
                    } else {
                        if(!areBlocksFloating()){
                            Log("Reset chain.",priority.P);
                            chainCount = 0;
                        }
                    }
                }
            }
        }
    }

    function isLocked(row, col){
        var blockProperties = blocks[row][col].properties;
        if (blockProperties.locked > 0) return true;
        return false;
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
        return isFloating(row-1,col);
    }

    // Verifies if a block should fall because is floating. Sets the locked timer to "fall_delay" if true.
    function shouldBlockFall(row, col) {
        var block = blocks[row][col];
        if(isLocked(row,col)) return;
        if (isFloating(row, col)) {
            block.properties.locked = fall_delay;
            blocks[row + 1][col].properties.locked = fall_delay;
        }
        if (isAboveFloating(row, col)) {
            blocks[row - 1][col].properties.locked = fall_delay;
            block.properties.locked = fall_delay;
        }
    }

    // Looks for any block that is floating. 
    // Returns true if at least one of all the exisiting blocks is floating.
    // Returns false if all blocks are not floating.
    function areBlocksFloating(){
        for (var row = max_rows - 2; row >= 0; row--) {
            for (var col = 0; col < max_cols; col++) {
               if(isFloating(row,col)) return true;
            }
        }
        return false;
    }

    function queueBlocksForDeletion(blocksList){
        var lockedTimer = delete_delay * blocksList.length;

        // Sort the list so that the blocks dissapear from top left to bottom right.
        blocksList.sort(
            function (a,b){
                return a[0]-b[0] || a[1]-b[1];
            }
        )
        for(var i = 0; i < blocksList.length; i++){
            var block = blocksList[i];
            var row = block[0];
            var col = block[1];
            var deleteTimer = delete_delay*(i+1);
            Log("Adding to deletion"+block[0]+" "+block[1]+" deleteTimer: "+deleteTimer);
            blocks[row][col].properties.locked = lockedTimer;
            blocks[row][col].properties.delete = deleteTimer;
            blocks[row][col].properties.color = 7;
        }
    }
    
    function getVerticalBlockMatches(row, col,){
        var block = blocks[row][col];
        // Make sure this block is valid for matching it
        if (!block.properties.exists) return [];
        if (isFloating(row, col)) return [];
        var current;
        blocksList = [];
        
        // Investigate South of the block
        var tRow = row + 1;
        while (tRow < max_rows) {
            current = blocks[tRow][col];
            if (!current.properties.exists) break;
            if (isLocked(tRow, col)) break;
            if (current.properties.color !== block.properties.color) break;
            blocksList.push([tRow,col]);
            tRow++;
        }

        // Investigate North of the block
        tRow = row - 1;
        while (tRow >= 0) {
            current = blocks[tRow][col];
            if (!current.properties.exists) break;
            if (isLocked(tRow, col)) break;
            if (current.properties.color !== block.properties.color) break;
            blocksList.push([tRow, col]);
            tRow--;
        }
        
        if (blocksList.length + 1 >= blocks_to_match)
             return blocksList;
        else
            return [];

    }

    function getHorizontalBlockMatches(row, col){
        var block = blocks[row][col];
        // Make sure this block is valid for matching it
        if (!block.properties.exists) return [];
        if (isFloating(row, col)) return [];
        var current;
        blocksList = [];

        // Investigate East of the block
        var tCol = col + 1;
        while (tCol < max_cols) {
            current = blocks[row][tCol];
            if (!current.properties.exists) break;
            if (isLocked(row, tCol)) break;
            if (current.properties.color !== block.properties.color) break;
            blocksList.push([row,tCol]);
            tCol++;
        }

        // Investigate West of the block
        tCol = col - 1;
        while (tCol >= 0) {
            current = blocks[row][tCol];
            if (!current.properties.exists) break;
            if (isLocked(row, tCol)) break;
            if (current.properties.color !== block.properties.color) break;
            blocksList.push([row,tCol]);
            tCol--;
        }

        if(blocksList.length + 1 >= blocks_to_match)
            return blocksList;
        else   
            return [];
    }

    // Checks a block to see if it has matching colors with adjacent blocks
    // Returns the list of indexes for matching color blocks only if there are at least 
    // "blocks_to_match" number of matching blocks.
    function isBlockColorMatching(row, col) {
        var block = blocks[row][col];
        if(!block.properties.exists) return [];
        if(isFloating(row,col)) return [];
        var blocksList = [];

        blocksList = blocksList.concat(getHorizontalBlockMatches(row, col),
            getVerticalBlockMatches(row, col));

        Log("Checking blocklist.length:"+blocksList.length);
        // Remove one from blocks_to_match because we haven't added the central block to the list.
        if (blocksList.length >= blocks_to_match-1){
            // Add the central block so that is only added once.
            var blockToAdd = [row,col];
            blocksList.push(blockToAdd);
            return blocksList;
        } 
        
        return [];
    }

/*** Movement Functions ***/
    function moveCursor(){
        if(!cursor.direction){
            Log("cursor direction not set: " + cursor.direction, priority.P, priority.V); 
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
        Log("Moving cursor to: " + cursor.direction, priority.V);
        if(cursor.colPos>0)
            cursor.colPos--;
    }

    function moveCursorRight(){
        Log("Moving cursor to: " + cursor.direction, priority.V);
        if (cursor.colPos < max_cols-2)
            cursor.colPos++;
    }

    function moveCursorUp(){
        Log("Moving cursor to: " + cursor.direction, priority.V);
        if(cursor.rowPos > 0)
            cursor.rowPos--;
    }

    function moveCursorDown(){
        Log("Moving cursor to: " + cursor.direction, priority.V);
        if(cursor.rowPos < max_rows-1)
            cursor.rowPos++;
    }

    // Swaps the properties value of two blocks. The inherent x and y coordinates of the blocks stay the same.
    // Returns true if the blocks were successfully swapped, false otherwise
    function swap(blockRow, blockCol, swapWithRow=blockRow, swapWithCol=blockCol+1){
        var block = blocks[blockRow][blockCol];
        var blockSwapWith = blocks[swapWithRow][swapWithCol];
        if(!block.properties.exists && !blockSwapWith.properties.exists) return false;
        if(isLocked(blockRow,blockCol) || isLocked(swapWithRow,swapWithCol)) return false;

        // Swap blocks properties, position remains the same
        var tProperties = block.properties;
        block.properties = blockSwapWith.properties;
        blockSwapWith.properties = tProperties;
        return true;
    }
    
    function cursorSwap() {
        var successSwap = swap(cursor.rowPos, cursor.colPos);
        if(!successSwap) {
            Log("swap succeeded? " + successSwap, priority.V);
            return;
        }

        Log("swap was successful", priority.V);
        shouldBlockFall(cursor.rowPos, cursor.colPos);
        shouldBlockFall(cursor.rowPos, cursor.colPos + 1);
       
        var blocksList = [];
        blocksList = blocksList.concat(isBlockColorMatching(cursor.rowPos, cursor.colPos),
                                       isBlockColorMatching(cursor.rowPos, cursor.colPos+1));
        
        if (blocksList.length >= blocks_to_match){
            queueBlocksForDeletion(blocksList);
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
        updateBlocks();
    }

    function keyDownHandler(e){
        Log("pressed: " + e.keyCode, priority.V);
        if(Object.values(keyDirections).indexOf(e.keyCode) > -1 && cursor.direction) return;
        else if (Object.values(keyDirections).indexOf(e.keyCode) > -1){
            cursor.direction = e.keyCode;
            moveCursor();
        }
        else if(!cursor.swapping && e.keyCode === keyActions.swap){
            cursor.swapping = true;
            cursorSwap();            
        }
    }

    function keyUpHandler(e){
        if (Object.values(keyDirections).indexOf(e.keyCode) > -1)
            cursor.direction = null;
        else if (cursor.swapping && e.keyCode === keyActions.swap)
            cursor.swapping = false;
    }

    function Log(message, pri=priority.D){
        if (debugMode === debugModes.production && pri > priority.P)
            return;
        else if (debugMode === debugModes.debug && pri > priority.D)
            return;
        window.console.log(message);
    }
});