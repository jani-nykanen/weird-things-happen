/**
 * Application core
 * @author Jani Nykänen
 */

// Constants
const FRAME_RATE = 30;


// Core class
core = {};

// Old time stamp
core.oldTs = 0.0;

// Scenes
core.scenes = new Array();
// Current scene
core.currentScene = null;
// Global scene
core.globalScene = null;

// Time count
core.timeCount = 0.0;


/**
 * Key down event listener
 * @param e Event
 */
core.key_down_listener = function(e) {

    var key = e.keyCode ? e.keyCode : e.which;
    input.key_down(key);
}


/**
 * Key up event listener
 * @param e Event
 */
core.key_up_listener = function(e) {

    var key = e.keyCode ? e.keyCode : e.which;
    input.key_up(key);
}


/**
 * Mouse button down event listener
 */
core.mouse_down_listener = function(e) {

    var b = e.button;
    input.mouse_down(b);
}


/**
 * Mouse button up event listener
 */
core.mouse_up_listener = function(e) {

    var b = e.button;
    input.mouse_up(b);
}


/**
 * Mouse move event listener
 */
core.mouse_move_listener = function(e) {

    var rect = graph.canvas.getBoundingClientRect();

    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top

    input.mouse_move(x, y);
}


/**
 * Resize event listener
 */
core.resize_listener = function(e) {

    graph.resize(window.innerWidth, window.innerHeight);
}


/**
 * Main loop
 * @param ts Time stamp
 */
core.loop = function(ts) {

    const TM_LIMIT = 5.0;

    var redraw = false;

    // Calculate time multiplier
    var delta = ts - core.oldTs;
    /*
    var tm = (delta / 1000) / (1.0 / 60.0);
    if(tm > TM_LIMIT)
        tm = TM_LIMIT;
    */
    core.oldTs = ts;

    core.timeCount += delta / 1000.0;

    if(assets.has_loaded()) {

        // Check if enough time has passed
        while(core.timeCount >= 1.0 / FRAME_RATE) {

            // Update frame 
            core.update(60.0 / FRAME_RATE);

            core.timeCount -= 1.0 / FRAME_RATE;
            redraw = true;
        }
        
        if(redraw) {
            // Draw frame
            core.draw();
        }
    }
    else {

        // TODO: Loading screen
        graph.clear(0, 0, 0);
    }

    // Next frame
    window.requestAnimationFrame(core.loop);
}


/**
 * Update application
 * @param tm Time multiplier
 */
core.update = function(tm) {

    // Update the global scene
    if(core.globalScene != null) {

        core.globalScene.on_update(tm);
    }

    // Update the current scene
    if(core.currentScene != null) {

        core.currentScene.on_update(tm);
    }

    // Update input
    input.update();
}


/**
 * Draw application
 */
core.draw = function() {

    graph.clear(0.667, 0.667, 0.667);

    // Draw the global scene
    if(core.globalScene != null) {

        core.globalScene.on_draw();
    }

    // Draw the current scene
    if(core.currentScene != null) {

        core.currentScene.on_draw();
    }
}


/**
 * Initialize application core
 */
core.init = function() {

    // Initialize components
    tr.init();
    graph.init();
    input.init();

    // Add listeners
    window.addEventListener("keydown", core.key_down_listener);
    window.addEventListener("keyup", core.key_up_listener);
    window.addEventListener("mousedown", core.mouse_down_listener);
    window.addEventListener("mouseup", core.mouse_up_listener);
    window.addEventListener("mousemove", core.mouse_move_listener);
    window.addEventListener("resize", core.resize_listener);
    window.addEventListener("contextmenu", function(e){e.preventDefault(); });

    // Initialize scenes
    for(s of core.scenes) {

        if(s.on_init != null)
            s.on_init();
    }

    // Set default values
    core.oldTs = 0.0;

    // Start application loop
    window.requestAnimationFrame(core.loop);
}


/**
 * Add a scene
 * @param s Scene to be added
 */
core.add_scene = function(s) {

    core.scenes.push(s);
    if(core.globalScene == null)
        core.globalScene = s;
    else if(core.currentScene == null)
        core.currentScene = s;
}
