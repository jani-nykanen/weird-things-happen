// Monster
// (c) 2018 Jani Nykänen

// Constants
const MONSTER_DEATH_MAX = 30.0;
const MONSTER_ACC = 0.125;
const MONSTER_WAVE_SPEED = 0.05;
const MONSTER_AMPLITUDE = 0.25;
const MONSTER_WEIGHT = 0.90;
const MONSTER_ANGLE_PLUS = Math.PI / 9.0;
const MONSTER_ANGLE_PLUS_SPEED = 0.10;
const MONSTER_BASE_SCALE = 1.5;
const MONSTER_LEECH = 0.05;


// Monster constructor
var Monster = function() {

    CollisionObject.call(this);

    this.radius = 1;
    this.rotSpeed = 0;
    this.offscreen = false;

    this.isMonster = true;
}
Monster.prototype = Object.create(CollisionObject.prototype);


// Create the Monster
Monster.prototype.create_self = function(x, y, sx, sy, scale) {

    this.pos.x = x;
    this.pos.y = y;
    
    this.speed.x = sx;
    this.speed.y = sy;

    this.target = {x: 0, y: 0};
    this.speedTarget = Math.hypot(sx, sy);
    this.wave = 0.0;

    this.scale = scale;
    this.radius = 112 * this.scale;
    this.checkRadius = 128 * this.scale;
    this.mass = MONSTER_WEIGHT;

    this.exist = true;
    this.dying = false;
    this.deathTimer = 0.0;

    this.perimeter = Math.PI * this.radius * 2;
    this.eindex = -1;
    
    this.arrowID = 1;
    this.isLeeching = false;
    this.angleMod = 0.0;
    this.leechTimer = 0.0;
}


// Move monster
Monster.prototype.move = function(tm) {

    this.pos.x += this.speed.x * tm;
    this.pos.y += this.speed.y * tm;

    // Check if outside the screen
    if( (this.speed.x > 0 && this.pos.x-this.checkRadius > AREA_WIDTH/2)
     || (this.speed.x < 0 && this.pos.x+this.checkRadius < -AREA_WIDTH/2)
     || (this.speed.y > 0 && this.pos.y-this.checkRadius > AREA_HEIGHT/2)
     || (this.speed.y < 0 && this.pos.y+this.checkRadius < -AREA_HEIGHT/2)) {

        this.dying = false;
        this.exist = false;
    }

    // Get target
    this.angle = Math.atan2(this.pos.y, this.pos.x);
    let min = MONSTER_BASE_SCALE - MONSTER_AMPLITUDE;
    this.target.x = -Math.cos(this.angle) * this.speedTarget * (this.scale-min)*2;
    this.target.y = -Math.sin(this.angle) * this.speedTarget * (this.scale-min)*2;

    // Update speed
    if(this.speed.x < this.target.x) {

        this.speed.x += MONSTER_ACC * tm;
        if(this.speed.x > this.target.x)
            this.speed.x = this.target.x;
    }
    else if(this.speed.x > this.target.x) {

        this.speed.x -= MONSTER_ACC * tm;
        if(this.speed.x < this.target.x)
            this.speed.x = this.target.x;
    }

    if(this.speed.y < this.target.y) {

        this.speed.y += MONSTER_ACC * tm;
        if(this.speed.y > this.target.y)
            this.speed.y = this.target.y;
    }
    else if(this.speed.y > this.target.y) {

        this.speed.y -= MONSTER_ACC * tm;
        if(this.speed.y < this.target.y)
            this.speed.y = this.target.y;
    }
}


// Update monster
Monster.prototype.update = function(tm) {

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


    // Leech!
    if(this.isLeeching) {

        // Set speed to zero
        this.target.x = 0.0;
        this.target.y = 0.0;

        // Additional rotation
        this.angleMod += MONSTER_ANGLE_PLUS_SPEED * tm;

        this.leechTimer -= 1.0 * tm;

        // Hurt heart
        if(this.leechTimer <= 0) {

            _status.reduce_health(MONSTER_LEECH);
            objman.heart.hurt(true);
            this.leechTimer += HEART_HURT_MAX;
        }

    }
    else {

        // Update wave
        this.wave += MONSTER_WAVE_SPEED * tm;
        this.scale = MONSTER_BASE_SCALE + Math.sin(this.wave) * MONSTER_AMPLITUDE;
        this.radius = 112 * this.scale;
        this.mass = MONSTER_WEIGHT * (this.scale / MONSTER_BASE_SCALE);

        // Update angle mod
        if(this.angleMod > 0.0) {

            this.angleMod -= MONSTER_ANGLE_PLUS_SPEED * tm;
            if(this.angleMod < 0.0)
                this.angleMod = 0.0;
        }
        else if(this.angleMod < 0.0) {

            this.angleMod += MONSTER_ANGLE_PLUS_SPEED * tm;
            if(this.angleMod > 0.0)
                this.angleMod = 0.0;
        }
    }

    // Move
    this.move(tm);

    // Calculate total speed
    this.calculate_total_speed();
}


// Draw Monster
Monster.prototype.draw = function() {

    let s = this.scale;
    let bitmap = assets.bitmaps.monster;
    
    if(!this.exist) {

        if(this.dying) {

            let t = this.deathTimer / MONSTER_DEATH_MAX;
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
    tr.rotate(this.angle + Math.sin(this.angleMod) * MONSTER_ANGLE_PLUS);
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
Monster.prototype.die = function(eindex, angle) {

    this.exist = false;
    this.dying = true;
    this.deathTimer = MONSTER_DEATH_MAX;

    // Create a skeletal animal
    if(eindex != null) {

        let x = this.pos.x;
        let y = this.pos.y;

        let o = objman.add_animal(x, y, -angle, this.speedTarget * 2, this.scale * 0.90,eindex, true);
        o.angle = this.angle;
    }
}


// Monster-explosion collision
Monster.prototype.exp_collision = function(e, tm) {

    if(this.get_exp_collision(e, tm)) {

        // Die
        let angle = this.isLeeching ? Math.atan2(this.pos.y, this.pos.x) 
            : Math.atan2(e.pos.y-this.pos.y, e.pos.x-this.pos.x);
        this.die(e.eindex, angle);
    }
}


// Handle monster-heart collision
Monster.prototype.heart_collision = function(o) {

    let DELTA = 96;
    let dist = Math.hypot(this.pos.x-o.pos.x, 
        this.pos.y-o.pos.y);

    if(dist > this.radius + o.radius + DELTA) {

        this.isLeeching = false;
    }

    if(this.object_collision(o)) {

        this.isLeeching = true;
        
    }
}


// Player collision
Monster.prototype.player_collision = function(o) {

    if(this.object_collision(o)) {

        this.isLeeching = false;
    }
}
