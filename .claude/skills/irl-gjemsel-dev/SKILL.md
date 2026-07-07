---
name: irl-gjemsel-dev
description: Architecture and conventions reference for the IRL Gjemsel codebase (GPS-based hide-and-seek game, single-page PWA). Consult this whenever making changes to index.html, sw.js, server.js, or manifest.json in this repo — e.g. tuning ghost AI/vision behavior, CONFIG game balance values, the boundary/shrink system, MapLibre map layers, Turf.js geo calculations, the game loop, or Firebase leaderboard integration. Also use it when running the app locally for testing (HTTPS requirement for geolocation) or when confused about the {lat,lng} vs [lng,lat] coordinate convention.
---

# IRL Gjemsel Development Guide

GPS-based mobile hide-and-seek game: players run from AI-controlled ghosts in
real-world locations using GPS tracking and vision-cone/pathfinding AI.

**Architecture:** Single-page PWA, vanilla JavaScript, no frameworks, no build step.
- **All game logic lives in [index.html](../../../index.html)** (~1600 lines) — HTML, CSS, and JS in one file
- Deployment: GitHub Pages (static hosting), auto-deploys on push
- Backend: Firebase Realtime Database (leaderboard only)
- **CONFIG object** (line ~536) centralizes all tunable parameters: map settings, boundary defaults, timing, ghost AI, player settings

Edit `index.html` directly and refresh the browser — there is no compile/bundle step.

## Key technologies

- **MapLibre GL JS** (not Leaflet, despite what the README may say) — vector map rendering via OpenFreeMap tiles
- **Turf.js** — the only library used for geographic math. Never hand-roll haversine or bearing math.
  - `turf.distance()` — meters between coordinates
  - `turf.bearing()` — direction between points
  - `turf.booleanPointInPolygon()` — boundary/containment checks
  - Custom helper `pointInside(poly, {lat,lng})` (line ~853) wraps Turf with the coordinate-order conversion
  - All Turf functions are **synchronous** — never `await` them

## Coordinate format inconsistency (easy to get wrong)

- **Turf.js** expects `[lng, lat]` arrays
- **Game code** uses `{lat, lng}` objects everywhere else
- Always go through the existing helpers (`pointInside`, `tPoint`, `metersBetween`, `bearingTo` around line ~846) rather than constructing Turf geometry inline — they handle the conversion correctly

## State management

Global `Game` object (line ~816) tracks all run state:
```javascript
const Game = {
  state: STATE.IDLE,  // IDLE, COUNTDOWN, RUNNING, CAUGHT
  timer: null,
  startedAt: null,
  shrunk: false,
  lastGhostSpawn: null,
  spawnGhostInterval: CONFIG.game.spawnGhostIntervalSeconds,
  maxGhosts: CONFIG.game.maxGhosts
};
```
Use the `$('id')` helper (line ~804, wraps `document.getElementById`) instead of calling the DOM API directly, to stay consistent with the rest of the file.

## Ghost AI (Ghost class, line ~1078)

Three behavioral modes, all handled inside `steer(dt, playerLL, allGhosts)` (line ~1158):
1. **PATROL** — random wandering toward `patrolTarget`, recalculated periodically
2. **CHASE** — direct pursuit once `seesPlayer()` (line ~1142) returns true; updates `lastSeenTarget`
3. **SEARCH** — sweeps toward `lastSeenTarget` after losing line-of-sight

Vision:
- `seesPlayer(playerLatLng)` checks FOV cone AND unobstructed line-of-sight (no boundary/obstacle blocking)
- Vision cones are rendered as a filled polygon on the `ghost-cones` map layer
- Ghost separation: repulsion force keeps ghosts from clustering when within `CONFIG.ghost.separationDistance` (line ~1222) — check `!dist || dist > separationDistance` short-circuits before doing the vector math
- Max turn rates differ by mode: chase 160°/s, search 100°/s, patrol 60°/s — this is steering/vector math, not a pathfinding library

When adjusting ghost difficulty, start with `CONFIG.ghost.*` values before touching `steer()` logic.

## MapLibre source/layer pattern

GeoJSON sources are updated in place, not recreated:
```javascript
const ghostSourceData = { type: 'FeatureCollection', features: [] };
// mutate features, then:
refreshSource('ghosts', ghostSourceData);  // calls map.getSource().setData()
```
- Layers are created once in `ensureSources()` (line ~720), after map load — **never recreate a layer**, check `map.getLayer(id)` first if adding conditionally
- Batch feature mutations, then call `setData()` once per update — don't call it per-feature

## Boundary system

Two modes:
1. **Circle mode** (default) — radius from `CONFIG.boundary.defaultRadiusMeters` (50m); tracks a center point for easy shrinking
2. **Custom GeoJSON** — user-uploaded polygon, shrunk by scaling coordinates around its centroid

Shrink logic (~line 922): after `CONFIG.boundary.shrinkTimeSeconds` (120s default), boundary reduces to `CONFIG.boundary.shrinkFactor` (0.8) and ghosts outside the new boundary are relocated inside it.

Ghost spawning must check **both** `pointInside(boundary)` **and** `!pointInsideAnyObstacle()` — missing either check lets ghosts spawn out of bounds or inside obstacles.

## Game loop

1. `startGame()` (line ~1361) — creates ghosts, starts 20s countdown
2. `runLoop()` (line ~1411) — starts `setInterval` calling `tick(dt)` every `CONFIG.game.tickMs` (100ms default)
3. `tick(dt)` (line ~1419) — moves ghosts, checks vision, spawns new ghosts (up to `CONFIG.game.maxGhosts`, every `CONFIG.game.spawnGhostIntervalSeconds`), detects game over
4. `gameOver()` (line ~1467) — stops the loop, shows the caught screen, submits to leaderboard

## UI state conventions

- `#hud.min` class hides controls / shows the compact HUD view; toggled via `.classList.toggle('min')`
- `#leaderboard.min` follows the same collapse pattern
- Follow this class-toggle pattern for any new collapsible UI rather than inline style manipulation

## Firebase integration

Leaderboard at `https://irl-gjemsel-default-rtdb.europe-west1.firebasedatabase.app` (config hardcoded in `index.html` ~line 611 — this is a public leaderboard DB, not a secret):
- Top scores by survival time, schema `{playerName, time, ghostCount, timestamp}`
- Reads use `orderByChild('time').limitToLast(5)` — keep using indexed queries like this rather than fetching the whole leaderboard client-side

## Local dev & testing

- Run `node server.js` — starts an HTTPS server (required for the browser Geolocation API)
  - Auto-generates a self-signed cert if missing (needs OpenSSL)
  - Serves HTTPS on :8443, HTTP→HTTPS redirect on :8080
- No build step: edit `index.html`, refresh
- **Testing on a phone**: must use HTTPS — use `server.js` at `https://localhost:8443` or tunnel with ngrok
- [sw.js](../../../sw.js) — service worker for PWA offline support, network-first strategy for CDN resources
- [server.js](../../../server.js) — dev-only HTTPS server, not used in production (GitHub Pages serves the static files)
- [manifest.json](../../../manifest.json) — PWA metadata (icons, display mode, shortcuts)

## Common pitfalls

1. Don't `await` Turf.js calls — everything in Turf is synchronous
2. Ghost spawn placement needs both `pointInside(boundary)` and the obstacle check — see Boundary section above
3. MapLibre throws if you add a layer ID that already exists — guard with `map.getLayer(id)`
4. `ensurePlayer()` validates player moves against the boundary; GPS drift near the edge can trigger spurious boundary warnings — this is a known sensor-noise issue, not necessarily a logic bug

## Where to make changes

| Change | Location |
|---|---|
| Game balance (speeds, timings, distances) | `CONFIG` object, line ~536 |
| New game features | inline `<script>` section starting ~line 524 |
| Styling | `<style>` tag, lines ~30–470 |
| Ghost behavior | `Ghost` class, line ~1078, especially `steer()` (~1158) |
| Map rendering | `ensureSources()` (~720) and `refresh*()` functions |
| Mobile/GPS testing | `server.js` over HTTPS, or ngrok tunnel |
