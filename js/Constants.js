'use strict';
///////////////////////////////////////////////////////////////////////////
//
//      Constants
//
//  @author Jerome Dh <jdieuhou@gmail.com>
///////////////////////////////////////////////////////////////////////////

const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 480;
const BICYCLE_W = 90;
const BICYCLE_H = 87;

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGTH = 39;
const KEY_DOWN = 40;

const IMAGES_LIST = {
    connection: '0028-connection.png',
    bg: '35.jpg', // The background content
    param: '0149-cog.png',
    play: '0285-play3.png',
    pause: '0286-pause2.png',
    stop: '0287-stop2.png',
    volume_up: '0295-volume-high.png',
    volume_down: '0299-volume-mute2.png',
    bg_play: 'bg_play.png',
    ground: 'ground.png',
    bicycles: 'b-all.png', // Bicycles
    arrow: 'arrow.png',
};

const SOUNDS_LIST = {
    fire: 'elite_fire.wav',
    ris: 'ris.mp3',
    musique1: 'musique3.ogg',
    musique2: 'musique2.ogg',
    musique3: 'musique2.mp3',
};