// Minimap
// (c) 2018 Jani Nykänen

// Constants
const MINIMAP_WIDTH = 256;
const MINIMAP_HEIGHT = 256;

// Minimap global object
miniMap = {};


// Get object position (and radius) projected to minimap coordinates
miniMap.get_obj_pos = function(o) {

    let x = o.pos.x;
    let y = o.pos.y;

    x += AREA_WIDTH / 2.0;
    y += AREA_HEIGHT / 2.0;

    x /= AREA_WIDTH;
    y /= AREA_HEIGHT;

    x *= MINIMAP_WIDTH;
    y *= MINIMAP_HEIGHT;

    let rad = Math.ceil( o.radius / AREA_WIDTH * MINIMAP_WIDTH );

    return {x: x, y: y, rad: rad};
}


// Draw an object icon
miniMap.draw_object_icon = function(o, sx, sy, sw, sh, angle) {

    let p = miniMap.get_obj_pos(o);

    if(angle != null) {

        tr.push();
        tr.translate(p.x, p.y);
        tr.rotate(o.angle * angle);
        tr.use_transform();

        graph.draw_scaled_bitmap_region(assets.bitmaps.mapIcons,
            sx, sy, sw, sh, -p.rad, -p.rad, p.rad*2, p.rad*2, 0);

        tr.pop();
    }
    else {

        p.x -= p.rad;
        p.y -= p.rad;

        graph.draw_scaled_bitmap_region(assets.bitmaps.mapIcons,
            sx, sy, sw, sh, p.x, p.y, p.rad*2, p.rad*2, 0);
    }
}


// Initialize minimap
miniMap.init = function() {

    miniMap.target = new Bitmap(null, true, MINIMAP_WIDTH, MINIMAP_HEIGHT);
}


// Update minimap (may not be needed)
miniMap.update = function(tm) {

    // Draw content to the texture
    // (We do it here to avoid transformation problems)
    miniMap.target.draw_to(function() {

        miniMap.draw_content();
    })

    graph.set_color(1,1,1,1);
}


// Draw content
miniMap.draw_content = function() {

    const GRID_LOOP = 6;
    const GRID_WIDTH = 2;

    tr.identity();
    tr.set_view(MINIMAP_WIDTH, MINIMAP_HEIGHT);
    tr.use_transform();

    graph.clear(0, 0, 0);

    // Draw grid
    let jumpx = MINIMAP_WIDTH / GRID_LOOP;
    let jumpy = MINIMAP_HEIGHT / GRID_LOOP;
    graph.set_color(0,0.5,0,1);
    for(var i = 1; i < GRID_LOOP; ++ i) {

        graph.fill_rectangle(0, i * jumpy, MINIMAP_WIDTH, GRID_WIDTH);
        graph.fill_rectangle(i * jumpx, 0, GRID_WIDTH, MINIMAP_HEIGHT);
    }
    graph.set_color(1,1,1,1);

    // Draw heart
    miniMap.draw_object_icon(objman.heart, 32,0,32,32);

    // Draw player
    miniMap.draw_object_icon(objman.player, 0,0,32,32, -1);

    // Draw animals
    for(var i = 0; i < ANIMAL_COUNT; ++ i) {

        if(objman.animals[i].exist)
            miniMap.draw_object_icon(objman.animals[i], 64,0,32,32, 1);
    }
}


// Draw minimap
miniMap.draw = function(x, y, sx, sy) {

    const ALPHA = 0.5;

    // Draw map to the screen
    graph.set_color(1,1,1, ALPHA);
    graph.draw_scaled_bitmap(this.target,x,y,sx,sy, FLIP_V);
    graph.set_color(1,1,1,1);
}
