// Missile
// (c) 2018 Jani Nykänen

// Constants
const MISSILE_DEATH_MAX = 30.0;
const MISSILE_WEIGHT = 1.5;
const MISSILE_ACC = 0.10;
const MISSILE_TARGET = 6.0;


// Missile constructor
var Missile = function() {

    CollisionObject.call(this);

    this.radius = 1;
    this.offscreen = false;

    this.isMissile = true;
}
Missile.prototype = Object.create(CollisionObject.prototype);


// Create the Missile
Missile.prototype.create_self = function(x, y, sx, sy, scale) {

    this.pos.x = x;
    this.pos.y = y;
    
    this.speed.x = sx;
    this.speed.y = sy;

    this.target = {x: 0, y: 0};

    this.scale = scale;
    this.radius = 112 * this.scale;
    this.checkRadius = 128 * this.scale;
    this.mass = MISSILE_WEIGHT;

    this.exist = true;
    this.dying = false;
    this.deathTimer = 0.0;
    this.angle = Math.atan2(y, x);

    this.perimeter = Math.PI * this.radius * 2;
    this.eindex = -1;
    
    this.arrowID = 3;
}


// Move Missile
Missile.prototype.move = function(tm) {

    // Check if outside the screen
    if( (this.speed.x > 0 && this.pos.x-this.checkRadius > AREA_WIDTH/2)
     || (this.speed.x < 0 && this.pos.x+this.checkRadius < -AREA_WIDTH/2)
     || (this.speed.y > 0 && this.pos.y-this.checkRadius > AREA_HEIGHT/2)
     || (this.speed.y < 0 && this.pos.y+this.checkRadius < -AREA_HEIGHT/2)) {

        this.dying = false;
        this.exist = false;
    }

    // Set angle
    this.angle = Math.PI + Math.atan2(this.speed.y, this.speed.x);

    // Set target
    this.target.x = Math.cos(this.angle - Math.PI) * MISSILE_TARGET;
    this.target.y = Math.sin(this.angle - Math.PI) * MISSILE_TARGET;

    // Update speed
    if(this.speed.x < this.target.x) {

        this.speed.x += MISSILE_ACC * tm;
        if(this.speed.x > this.target.x)
            this.speed.x = this.target.x;
    }
    else if(this.speed.x > this.target.x) {

        this.speed.x -= MISSILE_ACC * tm;
        if(this.speed.x < this.target.x)
            this.speed.x = this.target.x;
    }

    if(this.speed.y < this.target.y) {

        this.speed.y += MISSILE_ACC * tm;
        if(this.speed.y > this.target.y)
            this.speed.y = this.target.y;
    }
    else if(this.speed.y > this.target.y) {

        this.speed.y -= MISSILE_ACC * tm;
        if(this.speed.y < this.target.y)
            this.speed.y = this.target.y;
    }

    // Move
    this.pos.x += this.speed.x * tm;
    this.pos.y += this.speed.y * tm;
}


// Update Missile
Missile.prototype.update = function(tm) {

    if(!this.exist) {

        // If dying, die until not dying any longer (ehheh)
        if(this.dying) {

            this.deathTimer -= 1.0 * tm;
            if(this.deathTimer <= 0.0)
                this.dying = false;
        }
        return;
    }

    // Check if in the screen
    let r = 128 * this.scale;
    let x = this.pos.x;
    let y = this.pos.y;
    this.offscreen = (x+r < cam.left || x-r > cam.left + cam.w 
        || y+r < cam.top || y-r > cam.top + cam.h);

    // Move
    this.move(tm);

    // Calculate total speed
    this.calculate_total_speed();
}


// Draw Missile
Missile.prototype.draw = function() {

    let s = this.scale;
    let bitmap = assets.bitmaps.missile;
    
    if(!this.exist) {

        if(this.dying) {

            let t = this.deathTimer / MISSILE_DEATH_MAX;
            graph.set_color(1,1,1, t);
            s += (1-t) * 0.5;
        }
        else {

            return;
        }
    }
    else if(this.offscreen) {

        return;
    }

    tr.push();
    tr.translate(this.pos.x, this.pos.y);
    tr.rotate(this.angle);
    tr.scale(s, s);
    tr.use_transform();

    graph.draw_bitmap_region(bitmap,
        0,0,256,256,-128, -128, 0);

    tr.pop();

    if(this.dying) {

        graph.set_color(1,1,1,1);
    }
}


// Death comes
Missile.prototype.die = function() {
/*
    this.exist = false;
    this.dying = true;
    this.deathTimer = MISSILE_DEATH_MAX;
*/
    // Create an explosion
    // TODO
}


// Missile-explosion collision
Missile.prototype.exp_collision = function(e) {

    if(!e.exist || !this.exist || e.eindex == this.eindex) return;

    let dist = Math.hypot(e.pos.x - this.pos.x, e.pos.y - this.pos.y);

    if(dist < e.radius + this.radius) {

        // Die
        this.die();
    }
}


// Handle Missile-heart collision
Missile.prototype.heart_collision = function(o) {

    this.die();
}

