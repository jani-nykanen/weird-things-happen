// Key config
// (c) 2018 Jani Nykänen

// Key config object
kconf = {
    left: {key: KEY_LEFT_ARROW, state: state.UP },
    right: {key: KEY_RIGHT_ARROW,  state: state.UP },
    up: {key: KEY_UP_ARROW,  state: state.UP },
    down: {key: KEY_DOWN_ARROW,  state: state.UP },
    fire1: {key: KEY_Z, state: state.UP},
    fire2: {key: KEY_X, state: state.UP},
    start: {key: KEY_ENTER, state: state.UP},
};


// Update key configuration
kconf.update = function() {

    for(var k in kconf) {

        if(k == "undefined") continue;
        
        kconf[k].state = input.keyStates[kconf[k].key];
    }
}

