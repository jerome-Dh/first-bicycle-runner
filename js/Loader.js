'use strict';

/**
 * Loader Class
 *
 * @author Jerome Dh <jdieuhou@gmail.com>
 */
class Loader {

    loaded = true;
    loadedCount = 0;
    totalCount = 0;
    soundFileExtn = '.ogg';
    labelProgressBar = document.querySelector('#fbr-loading .fbr-text-loading span');
    progressBar = document.querySelector('#fbr-loading progress');
    game = null;

    /**
     * Game instance
     * 
     * @param {Game} game 
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Initialize the loader
     */
    init() {
        let mp3Support = false, 
            oggSupport = false,
            audio = document.createElement('audio');

        if(audio.canPlayType) { // return '', 'maybe' or 'probably'
            mp3Support = '' !== audio.canPlayType('audio/mpeg');
            oggSupport = '' !== audio.canPlayType('audio/ogg; codecs="vorbis"');
        }

        this.soundFileExtn = oggSupport ? '.ogg' : mp3Support ? '.mp3' : undefined;

    }

    /**
     * @return boolean
     */
    canPlayOGG() {
        return this.soundFileExtn === '.ogg';   
    }

    /**
     * @return boolean
     */
    canPlayOGG() {
        return this.soundFileExtn === '.mp3';   
    }

    /**
     * Loading an image file
     * 
     * @param {string} url 
     */
    loadImage(url) {

        this.loaded = false;
        this.totalCount++;

        let image = new Image();
        image.addEventListener('load', (e) => this.itemLoaded(e), false);
        image.src = url;

        return image;
    }

    /**
     * Loading a sound file
     * 
     * @param {string} url 
     */
    loadSound(url) {

        this.loaded = false;
        this.totalCount++;

        let audio = new Audio();
        audio.addEventListener('canplaythrough', (e) => this.itemLoaded(e), false);
        audio.src = url;
        
        return audio;
    }

    /**
     * Loading item has finished
     * 
     * @param {object} e 
     */
    itemLoaded(e) {

        // Stop listening for event type (load or canplaythrough) for this item now that it has been loaded
        e.target.removeEventListener(e.type, this.itemLoaded, false);

        this.loadedCount++;

        const percentage = this.percentage();
        if(percentage) {
            // Update the view
            this.labelProgressBar.textContent = percentage + '%';
            this.progressBar.value = percentage;
        }
            
        // If loaded completely
        if(this.loadedCount === this.totalCount) {

            this.loaded = true;
            this.loadedCount = 0;
            this.totalCount = 0;

            //Display the game begin screen
            if(this.game) {
                setTimeout( () => {
                    this.game.loaderFinshed();
                }, 500);
            }
        }

    }

    /**
     * Get the percentage of the progession
     * 
     * @return int
     */
    percentage() {
        if(this.totalCount) {
            return parseInt((this.loadedCount * 100) / this.totalCount);
        }
    }

    /**
     * Load all images assets for game
     * 
     * @param {array} list 
     */
    images(list) {

        let images = {};
        for(let index in list) {
            images[index] = this.loadImage('images/' + list[index]);
        }

        return images;
    }

    /**
     * Load all sounds assets for game
     * 
     * @param {array} list 
     */
    sounds(list) {

        let audios = {};
        for(let index in list) {
            audios[index] = this.loadSound('images/' + list[index]);
        }

        return audios;
    }
}