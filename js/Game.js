'use strict';

/**
 * Game Class
 *
 * This class manage, draw background and load all assets to begin playing
 *
 * @author Jerome Dh <jdieuhou@gmail.com>
 */

var instance = null;
function gameInstance() {

    if( ! instance) {
        instance = new Game();
    }

    return instance;
}

class Game {

    /////////////////////////////////////////
    //
    // Properties
    //
    ///////////////
    canvas = document.querySelector('#canvas');
    context = null;

    fbrLeved = document.querySelector('#fbr-leved');
    fbrPlay = document.querySelector('#fbr-play');
    fbRImgPlay = document.querySelector('#fbr-name .play img');
    fbrSettings = document.querySelector('#fbr-settings');
    fbrLoading = document.querySelector('#fbr-loading');
    soundImg = document.querySelector('#fbr-name .sound img');
    fbrExtraInfo = document.querySelector('#fbr-extra-info');
    fbRStopBtn = document.querySelector('#fbr-name .stop');

    imageList = null;
    audioList = null;

    soundBack = null;
    soundBtns = document.querySelectorAll('.sound');
    playBtns = document.querySelectorAll('.play');
    stopBtns = document.querySelectorAll('.stop');

    gamePlaying = false;
    timeOutLoadingSound = 0;
    player = null;

    /**
     * Game Initialization
     */
    init() {

        this.context = this.canvas.getContext('2d');

        this.showFirstStep();
        this.listenPlayButtom();
        this.listenSoundButtom();

        // Set initial config
        const pref = new Preferences();
        this.setSoundState(pref.soundState());

    }

    /**
     * Listen for a click to any "play" buttom
     */
    listenPlayButtom() {
     
        let playImageSrc = 'images/' + IMAGES_LIST['play'];
        this.fbRImgPlay.src = playImageSrc;

        this.playBtns.forEach(element => {
            element.addEventListener('click', this.handlePlayButton, false);
        });
        
    }

    /**
     * Remove all listener on "play" buttons
     */
    removeListenPlayButton() {

        this.playBtns.forEach(element => {
            element.removeEventListener('click', this.handlePlayButton, false);
        });

    }

    /**
     * Listen all "pause" buttons
     */
    listenPauseButton() {

        this.fbRImgPlay.src = 'images/' + IMAGES_LIST['pause'];

        this.playBtns.forEach(element => {
            element.addEventListener('click', this.handlePauseButton, false);
        });
    }

    /**
     * Remove all listener on "pause" buttons
     */
    removeListenPauseButton() {

        this.playBtns.forEach(element => {
            element.removeEventListener('click', this.handlePauseButton, false);
        });

    }

    /**
     * Listen all "stop" buttons
     */
    listenStopButton() {

        //Show stop button
        this.fbRStopBtn.style.display = 'inline';

        this.stopBtns.forEach(element => {
            element.addEventListener('click', this.handleStopButton, false);
        });
    }
 
    /**
     * Remove all listener on "stop" buttons
     */
    removeListenStopButton() {

        // Hide stop button
        this.fbRStopBtn.style.display = 'none';

        this.playBtns.forEach(element => {
            element.removeEventListener('click', this.handleStopButton, false);
        });

    }

    /**
     * Listen all click on sound icon
     */
    listenSoundButtom() {
        this.soundBtns.forEach(element => {
            element.addEventListener('click', this.handleSoundButton, false);
        });
    }

    /**
     * Handle a click on "play" button
     * 
     * @param {object} e 
     */
    handlePlayButton(e) {

        let game = gameInstance();
        game.hideElements([game.fbrLeved, game.fbrPlay, game.fbrSettings]);
        game.displayElements([game.fbrLoading]);

        //Loading assets
        let loader = new Loader(game);
        loader.init();
        game.imageList = loader.images(IMAGES_LIST);
        game.audioList = loader.sounds(SOUNDS_LIST);
    }

    /**
     * Pause the game
     * 
     * @param {object} e 
     */
    handlePauseButton(e) {

        let game = gameInstance(),
            player = game.player;

        // Is the game is playing, we pause or resume
        if(player) {

            let imgSrc;
            const pref = new Preferences(),
                soundPlaying = pref.soundState();

            if( ! player.isPaused) { // Is playing

                // Pausing the player
                game.player.pause();

                // Pausing the Sound if playing
                if(game.soundBack && soundPlaying) {
                    game.soundBack.pause();
                }

                imgSrc = 'images/' + IMAGES_LIST['play'];
            }
            else { // Is pausing, 

                // Resuming the player
                game.player.resume();

                // Resuming the Sound if pausing
                if(game.soundBack && soundPlaying) {
                    game.soundBack.play();
                }

                imgSrc = 'images/' + IMAGES_LIST['pause'];

            }

            game.fbRImgPlay.src = imgSrc;

        }
    }

    /**
     * Stopping the game
     * 
     * @param {object} e 
     */
    handleStopButton(e) {

        //Change background
        let game = gameInstance(),
            bg = game.imageList['bg'];
        game.canvas.style.backgroundImage = 'url(' + bg.src + ')';

        // Hide some informations
        game.hideElements([game.fbrExtraInfo]);

        game.removeListenStopButton();
        game.removeListenPauseButton();
        game.listenPlayButtom();
        game.showFirstStep();
        game.gamePlaying = false;
        clearTimeout(game.timeOutLoadingSound);

        if(game.player) {
            game.player.stop();
        }

        // Sound stop
        if(game.soundBack) {
            game.soundBack.currentTime = 0;
            game.soundBack.pause();
        }
    }

    /**
     * Handle sound button
     * 
     * @param {object} e 
     */
    handleSoundButton(e) {

        // Check sound status
        let game = gameInstance(),
            player = game.player,
            played = false;

        if(game.soundBack && game.player && ( ! player.isPaused)) {        

            if(game.soundBack.paused) {
                game.soundBack.play();
                played = true;
            }
            else {
                game.soundBack.pause();
                played = false;
            }
        }
        else {
            const pref = new Preferences();
            played = ! pref.soundState();
            
        }

        game.setSoundState(played);

    }

    /**
     * Set sound properties on preferences
     * 
     * @param {boolean} state 
     */
    setSoundState(state) {

        const pref = new Preferences(),
            soundUp = 'images/' + IMAGES_LIST['volume_up'],
            soundDown = 'images/' + IMAGES_LIST['volume_down'];
   
        pref.setSoundState(state);
        if(state) {
            this.soundImg.src = soundUp;
        }
        else {
            this.soundImg.src = soundDown;
        }
    }

    /**
     * Callback: Loader is finished
     */
    loaderFinshed() {

        this.removeListenPlayButton();
        this.listenPauseButton();
        this.listenStopButton();

        this.hideElements([this.fbrLoading]);
        this.displayGameBegin();
    }

    /**
     * Display Game begin
     */
    displayGameBegin() {

        // Playing the sound
        this.timeOutLoadingSound = setTimeout(() => {

            // Create a sound for background
            if( ! this.soundBack) {
                
                const loader = new Loader(this);
                loader.init();
                this.soundBack = loader.canPlayOGG() ? this.audioList['musique2'] : this.audioList['musique3'];
                this.soundBack.loop = true;
            }

            const pref = new Preferences();
            if(pref.soundState()) {
                this.soundBack.play();
            }

        }, 3000);

        //Change background
        let bgPlay = this.imageList['bg_play'];
        this.canvas.style.backgroundImage = 'url(' + bgPlay.src + ')';
        this.gamePlaying = true;

        // Info zone
        this.fbrExtraInfo.style.display = 'flex';

        // Launch player
        try {
            this.player = new Play(this, this.context, this.canvas, this.imageList);
            this.player.play();
        }
        catch(e) {
            console.log(e);
        }

        
    }

    /**
     * Showing the first screen
     */
    showFirstStep() {
        this.displayElements([this.fbrLeved, this.fbrPlay, this.fbrSettings]);
    }

    /**
     * Display elements in DOM
     * 
     * @param {array} elements 
     */
    displayElements(elements) {
        for(let index in elements) {
            elements[index].style.display = 'block';
        }
    }

    /**
     * Hide elements in the DOM
     * 
     * @param {array} elements 
     */
    hideElements(elements) {
        for(let index in elements) {
            elements[index].style.display = 'none';
        }
    }
}