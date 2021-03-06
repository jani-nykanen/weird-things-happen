// Heart
// (c) 2018 Jani Nykänen

// Constants
const HEART_BUMP_WAIT = 45.0;
const HEART_BUMP_LENGTH = 16.0;
const HEART_BASE_SCALE = 2.0;
const HEART_SCALE_MOD = 0.5;
const HEART_RADIUS = 144;
const HEART_HURT_MAX = 60.0;
const HEART_HURT_MOD = 1;


// Heart constructor
var Heart = function(x, y) {

    CollisionObject.call(this);

    this.pos.x = x;
    this.pos.y = y;
    this.scale = HEART_BASE_SCALE;
    this.bumpTimer = 0.0;
    this.bumpState = 0.0;
    this.radius = HEART_RADIUS;
    this.static = true;
    this.exist = true;
    this.hurtTimer = 0.0;

    this.isHeart = true;
    this.eindex = -1;
}
Heart.prototype = Object.create(CollisionObject.prototype);


// Update heart
Heart.prototype.update = function(tm) {

    this.scale = 2;

    // Hurt
    if(this.hurtTimer > 0.0) {

        this.hurtTimer -= 1.0 * tm;
    }

    // Update bump timer
    this.bumpTimer += 1.0 * tm;
    if(this.bumpTimer >= HEART_BUMP_WAIT) {

        this.bumpState += 1.0 * tm;
        if(this.bumpState >= HEART_BUMP_LENGTH) {

            this.bumpState = 0.0;
            this.bumpTimer = 0.0;
        }

        let t = (1.0 - Math.abs(this.bumpState - HEART_BUMP_LENGTH / 2.0) / (HEART_BUMP_LENGTH / 2))
             * HEART_SCALE_MOD;
        this.scale = HEART_BASE_SCALE + t;
    }
}


// Draw heart
Heart.prototype.draw = function() {

    if(this.hurtTimer > 0.0) {

        let s = Math.abs(Math.sin(this.hurtTimer / HEART_HURT_MAX 
            * (Math.PI*2 * HEART_HURT_MOD)));
        let t = 1 + 2*s;
        graph.set_color(t,t,t, 1);
    }

    graph.draw_scaled_bitmap(
        assets.bitmaps.heart,
        this.pos.x - assets.bitmaps.heart.width/2 * this.scale,
        this.pos.y - assets.bitmaps.heart.height/2 * this.scale,
        this.scale,
        this.scale,0
    );

    if(this.hurtTimer > 0.0) {

        graph.set_color(1,1,1,1);
    }
}


// Hurt the heart
Heart.prototype.hurt = function(leeching, exp) {

    const HURT_VOL = 0.40;
    const LEECH_VOL = 0.75;
    const DIE_VOL = 0.80;

    this.hurtTimer = HEART_HURT_MAX;


    if(_status.gameOver)
        audio.play_sample(assets.audio.die, DIE_VOL);
    else {

        const EXP_MOD = 0.5;

        let vol = leeching ? LEECH_VOL : HURT_VOL;
        if(exp)
            vol *= EXP_MOD;

        audio.play_sample(leeching ? assets.audio.leech : assets.audio.hurt, vol);
    }
}


// Is hurt
Heart.prototype.is_hurt = function() {

    return this.hurtTimer > 0.0;
}


// Heart-explosion collision
Heart.prototype.exp_collision = function(e) {

    const DMG_FACTOR = 0.05;

    if(!e.exist || e.eindex == this.eindex) return;

    let dist = Math.hypot(e.pos.x - this.pos.x, e.pos.y - this.pos.y);

    if(dist < e.radius + this.radius) {

        this.eindex = e.eindex;
        
        let dmg = e.targetScale * DMG_FACTOR;
        _status.reduce_health(dmg);

        this.hurt(false, true);
    }
}
