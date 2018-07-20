/**
 * Global scene
 * @author Jani Nykänen
 */

// Global object
global = {};


/**
 * Initialize
 */
global.init = function() {
    
    // Load assets
    assets.load({
        player: "player.png",
        animal: "animal.png",
        gas: "gas.png",
        bg: "background.jpg",
    }, "assets/bitmaps");
}


/**
 * Update
 * @param tm Time mul.
 */
global.update = function(tm) {

    // Update key config
    kconf.update();
}


/**
 * Draw
 */
global.draw = function() {

}


/**
 * On change
 */
global.on_change = function() {

}


// Add scene
core.add_scene(new Scene(global.init, global.update, global.draw, global.on_change ));
