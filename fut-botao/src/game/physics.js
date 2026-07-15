"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSTEPS = exports.MAX_LAUNCH_FORCE = exports.MIN_SPEED = exports.RESTITUTION = exports.FRICTION = exports.FIELD = void 0;
exports.isMoving = isMoving;
exports.resolveCircles = resolveCircles;
exports.stepPhysics = stepPhysics;
exports.getInitialPositions = getInitialPositions;
exports.FIELD = {
    WIDTH: 800,
    HEIGHT: 500,
    GOAL_WIDTH: 90,
    GOAL_DEPTH: 22,
    BORDER: 10,
};
exports.FRICTION = 0.978; // per-frame velocity multiplier
exports.RESTITUTION = 0.62; // bounciness (1 = fully elastic)
exports.MIN_SPEED = 0.18;
exports.MAX_LAUNCH_FORCE = 16;
exports.SUBSTEPS = 4; // sub-steps per frame (anti-tunneling)
// Masses — ratio determines momentum transfer
var BUTTON_MASS = 2.0; // heavier button
var BALL_MASS = 1.0; // lighter ball (button:ball = 2:1 like real futebol de botão)
// ── helpers ─────────────────────────────────────────────────────────────────
function isMoving(buttons, ball) {
    if (speed(ball) > exports.MIN_SPEED)
        return true;
    return buttons.some(function (b) { return speed(b) > exports.MIN_SPEED; });
}
function speed(obj) {
    return Math.hypot(obj.vx, obj.vy);
}
// ── circle vs circle collision (elastic + CoR) ───────────────────────────────
function resolveCircles(ax, ay, avx, avy, ar, am, bx, by, bvx, bvy, br, bm) {
    var dx = bx - ax;
    var dy = by - ay;
    var dist = Math.hypot(dx, dy);
    var minDist = ar + br;
    if (dist >= minDist || dist < 0.001)
        return null;
    // --- Separate overlapping circles ---
    var overlap = minDist - dist;
    var nx = dx / dist;
    var ny = dy / dist;
    var pushA = overlap * (bm / (am + bm));
    var pushB = overlap * (am / (am + bm));
    var newAx = ax - nx * pushA;
    var newAy = ay - ny * pushA;
    var newBx = bx + nx * pushB;
    var newBy = by + ny * pushB;
    // --- Velocity impulse (1D along normal) ---
    var relVx = avx - bvx;
    var relVy = avy - bvy;
    var velAlongNormal = relVx * nx + relVy * ny;
    // nx points FROM A → B, so velAlongNormal > 0 means A is approaching B → need impulse
    // velAlongNormal <= 0 means objects are separating or stationary → no impulse needed
    if (velAlongNormal <= 0) {
        return { avx: avx, avy: avy, bvx: bvx, bvy: bvy, ax: newAx, ay: newAy, bx: newBx, by: newBy };
    }
    var e = exports.RESTITUTION;
    var impulseScalar = -(1 + e) * velAlongNormal / (1 / am + 1 / bm);
    return {
        avx: avx + (impulseScalar / am) * nx,
        avy: avy + (impulseScalar / am) * ny,
        bvx: bvx - (impulseScalar / bm) * nx,
        bvy: bvy - (impulseScalar / bm) * ny,
        ax: newAx, ay: newAy,
        bx: newBx, by: newBy,
    };
}
// ── main step (called SUBSTEPS times per frame, with dt = 1/SUBSTEPS) ────────
// Returns the scoring team if a goal happened this sub-step, otherwise null.
function subStep(buttons, ball, dt) {
    var GY1 = exports.FIELD.HEIGHT / 2 - exports.FIELD.GOAL_WIDTH / 2;
    var GY2 = exports.FIELD.HEIGHT / 2 + exports.FIELD.GOAL_WIDTH / 2;
    var GD = exports.FIELD.GOAL_DEPTH;
    var W = exports.FIELD.WIDTH;
    var H = exports.FIELD.HEIGHT;
    var B = exports.FIELD.BORDER;
    var br = ball.radius;
    // ── Move ──────────────────────────────────────────────────────────────────
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    for (var _i = 0, buttons_1 = buttons; _i < buttons_1.length; _i++) {
        var btn = buttons_1[_i];
        btn.x += btn.vx * dt;
        btn.y += btn.vy * dt;
    }
    // ── Goal detection (BEFORE any wall bounce so the ball isn't pushed back) ──
    // Ball centre crosses x=0 (left canvas edge) inside goal opening → Team B scored
    if (ball.x - br < 0 && ball.y >= GY1 && ball.y <= GY2)
        return 'B';
    // Ball centre crosses x=W (right canvas edge) → Team A scored
    if (ball.x + br > W && ball.y >= GY1 && ball.y <= GY2)
        return 'A';
    // ── Ball wall collisions ──────────────────────────────────────────────────
    // Left wall — open in goal Y range (ball passes through for goal detection above)
    if (ball.x - br < B) {
        if (ball.y < GY1 || ball.y > GY2) {
            ball.x = B + br;
            ball.vx = Math.abs(ball.vx) * exports.RESTITUTION;
        }
        // else: ball is sliding into the goal opening, let it through
    }
    // Right wall
    if (ball.x + br > W - B) {
        if (ball.y < GY1 || ball.y > GY2) {
            ball.x = W - B - br;
            ball.vx = -Math.abs(ball.vx) * exports.RESTITUTION;
        }
    }
    // Top / Bottom
    if (ball.y - br < B) {
        ball.y = B + br;
        ball.vy = Math.abs(ball.vy) * exports.RESTITUTION;
    }
    if (ball.y + br > H - B) {
        ball.y = H - B - br;
        ball.vy = -Math.abs(ball.vy) * exports.RESTITUTION;
    }
    // Goal back-wall — only reached if ball didn't score yet
    if (ball.y >= GY1 && ball.y <= GY2) {
        if (ball.x - br < -GD) {
            ball.x = -GD + br;
            ball.vx = Math.abs(ball.vx) * exports.RESTITUTION;
        }
        if (ball.x + br > W + GD) {
            ball.x = W + GD - br;
            ball.vx = -Math.abs(ball.vx) * exports.RESTITUTION;
        }
    }
    // Goal post corners (small circular deflectors at the four goal posts)
    var posts = [
        { x: B, y: GY1 }, { x: B, y: GY2 },
        { x: W - B, y: GY1 }, { x: W - B, y: GY2 },
    ];
    for (var _a = 0, posts_1 = posts; _a < posts_1.length; _a++) {
        var post = posts_1[_a];
        var dx = ball.x - post.x;
        var dy = ball.y - post.y;
        var dist = Math.hypot(dx, dy);
        if (dist < br + 4 && dist > 0.001) {
            var nx2 = dx / dist;
            var ny2 = dy / dist;
            ball.x = post.x + nx2 * (br + 4);
            ball.y = post.y + ny2 * (br + 4);
            var dot = ball.vx * nx2 + ball.vy * ny2;
            if (dot < 0) {
                ball.vx -= 2 * dot * nx2 * exports.RESTITUTION;
                ball.vy -= 2 * dot * ny2 * exports.RESTITUTION;
            }
        }
    }
    // ── Button wall collisions ────────────────────────────────────────────────
    for (var _b = 0, buttons_2 = buttons; _b < buttons_2.length; _b++) {
        var btn = buttons_2[_b];
        var r = btn.radius;
        if (btn.x - r < B) {
            btn.x = B + r;
            btn.vx = Math.abs(btn.vx) * exports.RESTITUTION;
        }
        if (btn.x + r > W - B) {
            btn.x = W - B - r;
            btn.vx = -Math.abs(btn.vx) * exports.RESTITUTION;
        }
        if (btn.y - r < B) {
            btn.y = B + r;
            btn.vy = Math.abs(btn.vy) * exports.RESTITUTION;
        }
        if (btn.y + r > H - B) {
            btn.y = H - B - r;
            btn.vy = -Math.abs(btn.vy) * exports.RESTITUTION;
        }
    }
    // ── Button vs Button collisions ───────────────────────────────────────────
    for (var i = 0; i < buttons.length; i++) {
        for (var j = i + 1; j < buttons.length; j++) {
            var a = buttons[i];
            var b = buttons[j];
            var res = resolveCircles(a.x, a.y, a.vx, a.vy, a.radius, BUTTON_MASS, b.x, b.y, b.vx, b.vy, b.radius, BUTTON_MASS);
            if (res) {
                a.vx = res.avx;
                a.vy = res.avy;
                a.x = res.ax;
                a.y = res.ay;
                b.vx = res.bvx;
                b.vy = res.bvy;
                b.x = res.bx;
                b.y = res.by;
            }
        }
    }
    // ── Button vs Ball collisions ─────────────────────────────────────────────
    for (var _c = 0, buttons_3 = buttons; _c < buttons_3.length; _c++) {
        var btn = buttons_3[_c];
        var res = resolveCircles(btn.x, btn.y, btn.vx, btn.vy, btn.radius, BUTTON_MASS, ball.x, ball.y, ball.vx, ball.vy, ball.radius, BALL_MASS);
        if (res) {
            btn.vx = res.avx;
            btn.vy = res.avy;
            btn.x = res.ax;
            btn.y = res.ay;
            ball.vx = res.bvx;
            ball.vy = res.bvy;
            ball.x = res.bx;
            ball.y = res.by;
        }
    }
    return null;
}
// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Run one full frame of physics (4 sub-steps).
 * Mutates buttons and ball in place.
 * Returns the scoring TeamSide if a goal was detected, otherwise null.
 */
function stepPhysics(buttons, ball) {
    var dt = 1 / exports.SUBSTEPS;
    var fricPerSub = Math.pow(exports.FRICTION, dt);
    for (var s = 0; s < exports.SUBSTEPS; s++) {
        var goal = subStep(buttons, ball, dt);
        if (goal)
            return goal; // stop immediately — no more movement after a goal
        // Per-substep friction (total = FRICTION per frame)
        ball.vx *= fricPerSub;
        ball.vy *= fricPerSub;
        if (Math.abs(ball.vx) < exports.MIN_SPEED / exports.SUBSTEPS)
            ball.vx = 0;
        if (Math.abs(ball.vy) < exports.MIN_SPEED / exports.SUBSTEPS)
            ball.vy = 0;
        for (var _i = 0, buttons_4 = buttons; _i < buttons_4.length; _i++) {
            var btn = buttons_4[_i];
            btn.vx *= fricPerSub;
            btn.vy *= fricPerSub;
            if (Math.abs(btn.vx) < exports.MIN_SPEED / exports.SUBSTEPS)
                btn.vx = 0;
            if (Math.abs(btn.vy) < exports.MIN_SPEED / exports.SUBSTEPS)
                btn.vy = 0;
        }
    }
    return null;
}
// ── Initial positions ─────────────────────────────────────────────────────────
function getInitialPositions(teamAId, teamBId, teamANames, teamBNames, teamALogo, teamBLogo, teamAColor, teamBColor, excludeIds) {
    var R = 22;
    var W = exports.FIELD.WIDTH;
    var H = exports.FIELD.HEIGHT;
    var cx = H / 2;
    var posA = [
        { x: 70, y: cx, gk: true },
        { x: 210, y: cx - 130, gk: false },
        { x: 210, y: cx - 43, gk: false },
        { x: 210, y: cx + 43, gk: false },
        { x: 210, y: cx + 130, gk: false },
    ];
    var posB = [
        { x: W - 70, y: cx, gk: true },
        { x: W - 210, y: cx - 130, gk: false },
        { x: W - 210, y: cx - 43, gk: false },
        { x: W - 210, y: cx + 43, gk: false },
        { x: W - 210, y: cx + 130, gk: false },
    ];
    var buttons = [];
    posA.forEach(function (p, i) {
        var id = "A-".concat(i);
        if (excludeIds === null || excludeIds === void 0 ? void 0 : excludeIds.includes(id))
            return;
        var name = teamANames[i] || "J".concat(i + 1);
        buttons.push({
            id: id,
            teamSide: 'A', isGoalkeeper: p.gk,
            playerName: name, shortName: name,
            x: p.x, y: p.y, vx: 0, vy: 0, radius: R,
            teamId: teamAId, logoUrl: teamALogo, primaryColor: teamAColor,
        });
    });
    posB.forEach(function (p, i) {
        var id = "B-".concat(i);
        if (excludeIds === null || excludeIds === void 0 ? void 0 : excludeIds.includes(id))
            return;
        var name = teamBNames[i] || "J".concat(i + 1);
        buttons.push({
            id: id,
            teamSide: 'B', isGoalkeeper: p.gk,
            playerName: name, shortName: name,
            x: p.x, y: p.y, vx: 0, vy: 0, radius: R,
            teamId: teamBId, logoUrl: teamBLogo, primaryColor: teamBColor,
        });
    });
    return {
        buttons: buttons,
        ball: { x: W / 2, y: H / 2, vx: 0, vy: 0, radius: 10 },
    };
}
