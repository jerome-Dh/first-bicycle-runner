'use strict';

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/**
 * Core player of game
 * 
 * <p>This class handle keys actions, scoring, update the scene</p>
 *
 * @author Jerome Dh <jdieuhou@gmail.com>
 */
class Play {

    gameInstance = null;
    context = null;
    imageList = null;
    canvas = null;
    initSpeed = 0;
    speedUp = 0;
    speedQuad = 16;
    score = 0;
    pressedTimingR = 0;
    bgPosition = 0;
    advancedBic = 30;
    speedMax = 18;

    // Status
    isRunning = false;
    isPaused = false;
    isAdvanced = false;

    // Timer
    timerBg = 0;
    timerBeginPlaying = 0;
    timerDisplayHelp = 0;
    timerHelpInterval = 0;
    timerHelpTimeout = 0;
    timerDrawBicycle  = 0;
    timerScore = 0;
    timerRuning = 0;
    timerWriteSpeedUp = 0;
    timerAvanceBic = 0;
    
    //DOM
    fbrScore = document.querySelector('.info-score');
    fbrScoreValue = document.querySelector('.info-score .value');
    fbrInfo = document.querySelector('.info-text');
    fbrInfoSpeed = document.querySelector('.info-speed');
    fbrInfoSpeedValue = document.querySelector('.info-speed .speed');
    fbrInfoSpeedUp = document.querySelector('.info-speed .speed-up');

    posBic = {
        x : 0,
        y : 0,
        w: BICYCLE_W,
        h: BICYCLE_H,
        n: 1,
    };

    posGround = {
        x: 0,
        y: 320,
        w: WINDOW_WIDTH,
        h: 200,
    };

    /**
     * Constructor
     * 
     * @param {Game} game 
     * @param {context} context
     * @param {CanvasRenderingContext2D} canvas
     * @param {Array} imageList 
     */
    constructor(game, context, canvas, imageList) {
        this.gameInstance = game;
        this.context = context;
        this.imageList = imageList;
        this.canvas = canvas;
    }

    /**
     * Set some basic stufs
     */
    basiSetting() {
        this.fbrInfoSpeedUp.innerHTML = '1';
        this.fbrInfoSpeedValue.innerHTML = '0';
        this.fbrScoreValue.innerHTML = '0';
    }

    // Begin playing
    play() {
        if( ! this.context) {
            throw new Error('The context is null, please fill it');
            return;
        }

        this.basiSetting();
        this.animateBackground();
        this.drawGround();
        this.timerBeginPlaying = setTimeout(() => {
            this.drawBicycle();
            
        }, 400);

    }

    /**
     * Draw the ground
     */
    drawGround() {
        this.context.drawImage(
            this.imageList['ground'], 
            this.posGround.x, 
            this.posGround.y, 
            this.posGround.w, 
            this.posGround.h
        );
    }

    // Draw the bicycle
    drawBicycle() {

        this.timerDrawBicycle = setInterval(() => {

            const endPos = 248;
  
            this.posBic.y = this.posBic.y < endPos ? this.posBic.y : endPos ;
            this.context.clearRect(this.posBic.x, this.posBic.y - 15, this.posBic.w, this.posBic.h);
            this.context.drawImage(
                this.imageList['bicycles'], 
                0,
                0,
                BICYCLE_W,
                BICYCLE_H,
                this.posBic.x,
                this.posBic.y += 5,
                BICYCLE_W,
                BICYCLE_H,
            );

            if(this.posBic.y >= endPos) {
                clearInterval(this.timerDrawBicycle);

                // Handle keys and display help
                this.listenKeyPressed();
                this.displayHelp();
                this.writeHelp('Use Arrow key to play', 5000);
            }

        }, 10);

    }

    /**
     * Display help direction
     */
    displayHelp() {

        let nb = 3;

        this.timerHelpInterval = setInterval(() => {

            this.context.clearRect(300, 200, 50, 50);

            this.timerHelpTimeout = setTimeout(() => {
                this.context.drawImage(this.imageList['arrow'], 300, 200);
            }, 400);

            if( ! nb--) {
                this.context.clearRect(300, 200, 50, 50);
                clearInterval(this.timerHelpInterval);
                clearTimeout(this.timerHelpTimeout);
            }

        }, 1000);
    }

    /**
     * Background animation
     */
    animateBackground() {
        this.timerBg = setInterval(() => {
            this.canvas.style.backgroundPosition = this.bgPosition % WINDOW_WIDTH + 'px';
            this.bgPosition--;
        }, 100);
    }

    /**
     * Reset the background
     */
    resetBackground() {
        this.canvas.style.backgroundPosition = 'center';
    }
   
    // Pausing the game
    pause() {

        // console.log('Pause the game');
        this.isPaused = true;

        // Remove listener
        this.removeListenKeyPressed();

        // Pause all timer
        clearInterval(this.timerBg);
        clearInterval(this.timerScore);
        cancelAnimationFrame(this.timerRuning);
        clearInterval(this.timerDrawBicycle);
        clearInterval(this.avanceBic);
    }

    // Resuming the game
    resume() {
        // console.log('Resume the game');
        this.isPaused = false;

        // Launch listeners
        this.listenKeyPressed();

        // Restart all timers
        this.animateBackground();
        this.launchScoreRecorder();
        this.launchTimeRunRecorder();
        this.drawBicycleRunner();
    }

    // Stopping playing
    stop() {

        this.removeListenKeyPressed();
        this.resetBackground();
        this.context.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

        // Stop all timer
        clearInterval(this.timerBg);
        clearTimeout(this.timerBeginPlaying);
        clearTimeout(this.timerDisplayHelp);
        clearTimeout(this.timerHelpTimeout);
        clearInterval(this.timerDrawBicycle);
        clearInterval(this.timerHelpInterval);
        clearInterval(this.timerScore);
        cancelAnimationFrame(this.timerRuning);
        clearTimeout(this.timerWriteSpeedUp);
        clearInterval(this.timerAvanceBic);
    }

    /**
     * Listen key pressed for game played
     */
    listenKeyPressed() {

        window.addEventListener('keydown', this.handleKeyDown, false);
        window.addEventListener('keyup', this.handleKeyUp, false);

    }

    /**
     * Remove listener on the key pressed button
     */
    removeListenKeyPressed() {

        window.removeEventListener('keydown', this.handleKeyDown, false);
        window.removeEventListener('keyup', this.handleKeyUp, false);

    }

    /**
     * Writing help in screen
     *
     * @param {string} text
     * @param timeOut
     */
    writeHelp(text, timeOut) {

        this.fbrInfo.innerHTML = text;

        this.timerDisplayHelp = setTimeout(() => {
            this.fbrInfo.innerHTML = '';
        }, timeOut);

    }

    //////////// GAME ////////////////////////

    /**
     * When pressed a key
     * @param {object} e 
     */
    handleKeyDown(e) {
        
        e.preventDefault();

        let game = gameInstance(),
            player = game.player;

        switch(e.keyCode) {

            case KEY_LEFT:
                player.moveLeft();
                break;

            case KEY_UP:
                // console.log('Jump');
                break;

            case KEY_RIGTH:
                player.moveRigth();
                break

            case KEY_DOWN:
                // console.log('Down');
                break;

        }
        player.writeSpeedUp();
    }

    /**
     * When release the key
     * @param {object} e 
     */
    handleKeyUp(e) {

        e.preventDefault();

        let game = gameInstance(),
            player = game.player;

        switch(e.keyCode) {

            case KEY_LEFT:
                player.leftKeyRelease();
                break;

            case KEY_UP:
                // console.log('Jump');
                break;

            case KEY_RIGTH:
                player.rightKeyRelease();
                break

            case KEY_DOWN:
                // console.log('Down');
                break;

        }
        
    }

    /**
     * Move Bicycle to the right
     */
    moveRigth() {

        // When stay pressed, grown the speed
        this.pressedTimingR++;
        if( ! (this.pressedTimingR % 5) && this.speedUp < this.speedMax) {
            this.speedUp++;

            // Change the rotation speed of wheels
            this.drawBicycleRunner();

            // Advance the bicycle on it's position
            if( ! this.isAdvanced) {
               this.advanceBicycle();
            }
        }

        // Write the message if the max speed is reached
        if(this.speedUp === this.speedMax) {
            this.writeHelp('Your speed is up !', 3000);
        }
        
        // On first key pressed, launch the animation of the background and others
        if( ! this.isRunning) {
            this.speedUp = 1;
            this.isRunning = true;
            this.launchScoreRecorder();
            this.launchTimeRunRecorder();
            this.advanceBicycle();

            // Change the rotation speed of wheels
            this.drawBicycleRunner();
        }

    }

    /**
     * Move left going to stop running
     */
    moveLeft() {

        if(this.isRunning && this.speedUp > 1) {
            
            // When stay pressed, downgrade the speed
            this.pressedTimingR++;
            if( ! (this.pressedTimingR % 2)) {
                this.speedUp--;

                // Change the rotation speed of wheels
                this.drawBicycleRunner();
            }
        }

    }

    /**
     * When the released the left arrow, set PressedTiming to 0
     */
    rightKeyRelease() {
        this.pressedTimingR = 0;
    }

    /**
     * When the released the left arrow, set PressedTiming to 0
     */
    leftKeyRelease() {
        this.pressedTimingR = 0;
    }

    /**
     * Advance Bicycle to some positions at rigth
     */
    advanceBicycle() {

        if( ! this.isAdvanced) {
            
            clearInterval(this.timerAvanceBic);

            this.timerAvanceBic = setInterval(() => {

                // Advance Step 
                const step = this.advancedBic >= 30 ? 0 : 
                    (this.advancedBic >= 20 ? 1 :
                        (this.advancedBic >= 10 ? 2 : 3));

                this.context.clearRect(this.posBic.x, this.posBic.y - 15, step, this.posBic.h);

                this.posBic.x += step;

                if( ! --this.advancedBic) {
                    clearInterval(this.timerAvanceBic);
                    this.isAdvanced = true;
                }

            }, 100);
        }

    }

    /**
     * Move back the bicycle if the speed is very slow
     */
    moveBackBicycle() {

    }

    /**
     * Change the rotation speed of wheels when bicycle is running
     */
    drawBicycleRunner() {

        // Clear all current drawing of bicycle
        clearInterval(this.timerDrawBicycle);

        // The timing to change images depend of actual speed of bicycle
        const timing = this.advancedBic ? 100 :
            (this.speedUp >= this.speedMax ? 10 :
                (this.speedUp >= (7/8) * this.speedMax ? 25 :
                    (this.speedUp > (6/8) * this.speedMax ? 40 :
                        (this.speedUp > (5/8) * this.speedMax ? 55 :
                            (this.speedUp > (4/8) * this.speedMax ? 70 :
                                (this.speedUp > (3/8) * this.speedMax ? 80 :
                                    (this.speedUp > (2/8) * this.speedMax ? 90 : 100)
                                )
                            )
                        )
                    )
                )
            );
        
        // Draw all positions by tour
        this.timerDrawBicycle = setInterval(() => {

            // Calculate the source x of the image
            const source_x = 91 * (this.posBic.n + 1);

            this.context.clearRect(this.posBic.x, this.posBic.y - 15, this.posBic.w, this.posBic.h);
            this.context.drawImage(
                this.imageList['bicycles'], 
                source_x,
                0,
                BICYCLE_W,
                BICYCLE_H,
                this.posBic.x,
                this.posBic.y,
                BICYCLE_W,
                BICYCLE_H,
            );

            this.posBic.n++;
            this.posBic.n %= 4;

        }, timing);
    }

    /**
     * Timer when pressed without release de right arrow key
     */
    launchTimeRunRecorder() {

        if(this.isRunning) {
            this.timerRuning = requestAnimationFrame(this.f1);
        }
    }

    f1(time) {
        let game = gameInstance(),
            player = game.player;
            player.f2(time);
    }

    f2(time) {

        //Clear ground area
        this.context.clearRect(
            this.posGround.x,
            this.posGround.y, 
            this.posGround.w, 
            this.posGround.h
        );

        // Animated the ground at right to left
        this.posGround.x -= this.speedUp;
        this.posGround.x = this.posGround.x % this.posGround.w; 

        this.context.drawImage(
            this.imageList['ground'], 
            this.posGround.x,
            this.posGround.y,
            this.posGround.w,
            this.posGround.h
        );

        // Complete the end of ground
        let x = (this.posGround.w - Math.abs(this.posGround.x)) % this.posGround.w;
        this.context.drawImage(
            this.imageList['ground'], 
            x,
            this.posGround.y,
            this.posGround.w,
            this.posGround.h
        );

        this.timerRuning = requestAnimationFrame(this.f1);
    }

    /**
     * Score recording
     */
    launchScoreRecorder() {
    
        if(this.isRunning) {
            this.timerScore = setInterval(() => {
                this.score++;
                this.fbrScoreValue.innerHTML = this.score;
            }, 1000);
        }
    }

    /**
     * Write the speed up in the dashboard
     */
    writeSpeedUp() {

        for(let i = 0; i < 5; ++i) {
            this.timerWriteSpeedUp = setTimeout(() => {
                this.fbrInfoSpeedValue.innerHTML =  this.speedUp * i;
            }, 50);
        }
        
        this.fbrInfoSpeedUp.innerHTML =  Math.ceil((this.speedUp * 4) / this.speedQuad);

    }

}

