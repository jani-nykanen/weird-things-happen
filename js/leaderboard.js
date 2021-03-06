// Leaderboard
// (c) 2018 Jani Nykänen

// Constants
const URL = "https://wth-leaderboard.000webhostapp.com";
const MAX_SCORES = 15;

const LB_BOX_WIDTH = 640;
const LB_BOX_HEIGHT = 640;
const LB_TIMER_MAX = 30;
const LB_IN = 0;
const LB_OUT = 1;

// Leaderboard object
lb = {};

// Is active
lb.active = false;
// Callback for continue button
lb.continueCb = null;
// Appearance timer
lb.timer = 0.0;
// Appearance mode
lb.mode = LB_IN;
// Is fetching
lb.fetching = false;
// Is skipping (in other words, is game over scene...)
lb.skip = false;

// Data
lb.data = {
    names: new Array(MAX_SCORES),
    scores: new Array(MAX_SCORES)
};

// Continue button
lb.buttonContinue = null;


// Initialize
lb.init = function() {

    // Initialize submit box
    submit.init();

    // Set default names & scores
    for(var i = 0; i < MAX_SCORES; ++ i) {

        lb.data.names[i] = "Default";
        lb.data.scores[i] = 0;
    }

    // Create buttons
    lb.buttonContinue = 
        new Button("Continue",-999,-999,1024,0.75, true,
        function() { 
            lb.timer = LB_TIMER_MAX;
            lb.mode = LB_OUT;

            if(lb.skip) {

                // Reset music volume back to normal
                audio.reset_music_volume(1000);

                // Move back to the game
                global.fade(FADE_IN, 2.0, null, function() {

                    core.change_scene("game");
                });
            }
        }, false);
}


// Update leaderboard
lb.update = function(tm) {

    // Update timer
    if(lb.timer > 0.0) {

        lb.timer -= 1.0 * tm;
        if(lb.timer <= 0.0) {

            if(lb.mode == LB_OUT) {

                lb.active = false;
            }
        }
    }
    else {

        // Update buttons & their positions
        tr.fit_view_height(CAMERA_HEIGHT);
        lb.buttonContinue.update_pos(
            tr.viewport.w/2,tr.viewport.h/2+LB_BOX_HEIGHT/2 - 40);
        
        lb.buttonContinue.update(tm);

    }
}


// Draw leaderboard
lb.draw = function() {

    const ALPHA = 0.5;
    const SCORE_YOFF = 33;
    const SCORE_Y_START = 64;
    const TIME_X = 96;

    let t = lb.timer / LB_TIMER_MAX;
    if(lb.mode == LB_IN) {

        t = 1.0 - t;
    }

    // Fill
    tr.push();
    tr.identity();
    tr.use_transform();

    graph.set_color(0,0,0, ALPHA * t);
    graph.fill_rectangle(0,0,tr.viewport.w, tr.viewport.h);
    graph.set_color(1,1,1, 1);

    tr.pop();

    tr.push();
    tr.translate(tr.viewport.w/2, tr.viewport.h/2);
    tr.scale(t, t);
    tr.use_transform();

    // Draw box
    util.draw_box(LB_BOX_WIDTH, LB_BOX_HEIGHT);

    if(lb.timer <= 0.0) {

        // Leaderboard text
        graph.draw_text(assets.bitmaps.font, "LEADERBOARD",
            0, -LB_BOX_HEIGHT/2 + 16, -24,0, true, 0.625  
        );

        if(lb.fetching) {

            // Draw "Fetching..." text
            graph.draw_text(assets.bitmaps.font, 
                "Fetching...",
                0,-24, -24,0, true, 0.75);
        }
        else {

            // Draw scores
            let y = -LB_BOX_HEIGHT/2 + SCORE_Y_START;
            for(var i = 0; i < MAX_SCORES; ++ i) {

                // Draw names
                graph.draw_text(assets.bitmaps.font, 
                    (i < 9 ? "0" : "") + String(i+1) + "." + lb.data.names[i],
                    -LB_BOX_WIDTH/2 + 16, y + i*SCORE_YOFF, -24,0, false, 0.625);

                // Draw scores
                graph.draw_text(assets.bitmaps.font, 
                    util.get_time_string(lb.data.scores[i]),
                    TIME_X, y + i*SCORE_YOFF, -24,0, false, 0.625);
            }

        }
    }

    tr.pop();
    
    if(lb.timer <= 0.0) {

        tr.identity();
        tr.use_transform();
        // Draw continue button
        lb.buttonContinue.draw(assets.bitmaps.font, 1.0);
    }

    
}


// Activate
lb.activate = function(skip) {

    lb.active = true;
    lb.skip = skip;
    lb.timer = skip ? 0 : LB_TIMER_MAX;
    lb.mode = LB_IN;

    // Reset buttons
    lb.buttonContinue.overlay = false;
    lb.buttonContinue.scalePlus = 1.0;

    if(!skip) {

        // Get scores
        lb.fetch_scores();
    }
}


// Get scores from an array
lb.get_scores = function(arr) {

    for(var i = 0; i < arr.length; i += 2) {

        lb.data.names[i/2] = arr[i];
        lb.data.scores[i/2] = parseInt(arr[i+1]);
    }
}


// Send request
lb.send_request = function(params, cb) {

    let url = URL + "?" + params;

    lb.fetching = true;

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 

        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

            // Parse response
            let s = xmlHttp.responseText.split('|');
            let success = s[0] == "true";

            cb(success, s.slice(1, s.length));

            lb.fetching = false;
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}


// Fetch scores
lb.fetch_scores = function() {

    lb.send_request("mode=get", function(success, data) {

        if(!success) {

            console.log("ERROR: " + data[0]);
        }
        else {

            lb.get_scores(data);
        }
    });
}


// Add score
lb.add_score = function(name, score) {

    let check = md5(GLOBAL_KEY + String(score));
    
    lb.send_request("mode=set&name=" + name + "&score=" + String(score) + "&check=" + check, 
        function(success, data) {

        if(!success) {

            console.log("ERROR: " + data[0]);
        }
        else {

            lb.get_scores(data);
        }
    });
}
