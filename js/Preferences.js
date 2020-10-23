'use strict';

/**
 * Preferences Class
 *
 * @author Jerome Dh <jdieuhou@gmail.com>
 */
class Preferences {

    SOUND_NAME = 'sound_state';

    /**
     * Get the sound status
     * 
     * @return boolean
     */
    soundState() {

        let storageSound = localStorage.getItem(this.SOUND_NAME);
        return storageSound ? storageSound === 'true' : true;

    }

    /**
     * Set the sound status
     * 
     * @param {boolean} state 
     */
    setSoundState(state) {

        if(state === true || state === false) {
            localStorage.setItem(this.SOUND_NAME, state.toString());
        }

    }

}