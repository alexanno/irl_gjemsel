# IRL Gjemsel - AI Coding Agent Instructions

## Project Overview
IRL Gjemsel is a GPS-based mobile hide-and-seek game where players physically run from AI-controlled ghosts in real-world locations. The player's GPS position is tracked, and ghosts patrol/hunt using realistic vision cones and pathfinding logic.

**Architecture:** Single-page PWA (Progressive Web App) with vanilla JavaScript - no frameworks.
- **All game logic lives in [index.html](../index.html)** (~1600 lines) - HTML, CSS, and JavaScript in one file
- Deployment: GitHub Pages (static hosting)
- Backend: Firebase Realtime Database (leaderboard only)
- **Configuration:** Centralized CONFIG object (starts line ~524) contains all game parameters (speeds, distances, timings, defaults)

## Key Technologies & Usage Patterns

### Mapping & Geospatial
- **MapLibre GL JS** (not Leaflet as README states) - Vector map rendering using OpenFreeMap tiles
- **Turf.js** - ALL geographic calculations (distance, bearing, point-in-polygon, line intersections)
  - Use `turf.distance()` for meters between coordinates
  - Use `turf.bearing()` for directions
  - Use `turf.booleanPointInPolygon()` for boundary checks
  - Custom helper: `pointInside(poly, latlng)` wraps Turf with proper coordinate ordering

### State Management Pattern
Global `Game` object tracks all state (found around line 757):
```javascript
const Game = {
  state: STATE.IDLE,  // IDLE, COUNTDOWN, RUNNING, CAUGHT
  timer: null,
  startedAt: null,
  shrunk: false,      // Has boundary shrunk?
  lastGhostSpawn: null,
  spawnGhostInterval: CONFIG.game.spawnGhostIntervalSeconds,
  maxGhosts: CONFIG.game.maxGhosts
};
```

### Ghost AI Architecture (Ghost class ~line 1095)
Three behavioral modes (all handled in `steer(dt, playerLL, allGhosts)` method):
1. **PATROL** - Random wandering toward `patrolTarget` with periodic recalculation
2. **CHASE** - Direct pursuit when `seesPlayer()` returns true, updates `lastSeenTarget`
3. **SEARCH** - Continues to `lastSeenTarget` with sweeping motion when player escapes line-of-sight

Vision system:
- `seesPlayer(playerLatLng)` - Calculates if player is in FOV cone AND has line-of-sight (no boundary/obstacle blocking)
- Vision cone rendered as filled polygon on map layer `ghost-cones`
- Ghost separation: Ghosts avoid clustering using repulsion force when within `CONFIG.ghost.separationDistance`

### MapLibre Source/Layer Pattern
Uses GeoJSON sources that get updated in-place:
```javascript
const ghostSourceData = { type: 'FeatureCollection', features: [] };
// Add/modify features, then:
refreshSource('ghosts', ghostSourceData);  // Calls map.getSource().setData()
```

Layers created once in `ensureSources()` after map load, never recreated.

## Critical Workflows

### Development & Testing
- **Local testing:** Run `node server.js` (HTTPS server for geolocation API)
  - Auto-generates self-signed cert if missing (requires OpenSSL)
  - Serves on https://localhost:8443 (HTTPS) and http://localhost:8080 (HTTP redirect)
- **No build step** - Edit [index.html](../index.html) directly and refresh browser

### Deployment
- Push to GitHub → Auto-deploys via GitHub Pages
- Firebase config is hardcoded in [index.html](../index.html) (lines ~530-537)

### Configuration Management
- All game parameters centralized in CONFIG object (line ~524)
- Includes: map settings, boundary defaults, timing, ghost AI parameters, player settings
- Override defaults via UI inputs or modify CONFIG directly for permanent changes

### Game Loop
1. `startGame()` - Creates ghosts, starts 20s countdown
2. `runLoop()` - Starts interval timer calling `tick(dt)` every 100ms
3. `tick()` - Moves ghosts, checks vision, spawns new ghosts, detects game over
4. `gameOver()` - Stops loop, shows caught screen, checks leaderboard

## Project-Specific Conventions

### Coordinate Format Inconsistency (IMPORTANT!)
- **Turf.js**: Expects `[lng, lat]` arrays
- **Game code**: Uses `{lat, lng}` objects
- Helper functions handle conversion: `pointInside(poly, {lat, lng})` converts before calling Turf

### UI State Management
- HUD toggle: `#hud.min` class hides controls, shows compact view
- Leaderboard toggle: `#leaderboard.min` similar pattern
- Use `$('id')` helper instead of `document.getElementById()` (defined line ~757)

### Boundary System
Two modes:
1. **Circle mode** - Default radius from `CONFIG.boundary.defaultRadiusMeters` (50m), tracks center for easy shrink
2. **Custom GeoJSON** - User uploads polygon, shrinks by scaling coordinates around centroid

Shrink logic (line ~886): After `CONFIG.boundary.shrinkTimeSeconds` (default 2 minutes), reduces to `CONFIG.boundary.shrinkFactor` (80%) and relocates ghosts inside.

### Performance Patterns
- Game tick rate: `CONFIG.game.tickMs` (default 100ms)
- Ghost steering: Uses vector math with heading constraints, NOT pathfinding libraries
  - Max turn rates vary by mode: chase (160°/s), search (100°/s), patrol (60°/s)
- Map updates: Batch feature changes, then single `setData()` call
- Only ghosts within view distance check player vision (distance filter first)
- Dynamic ghost spawning: New ghost every `CONFIG.game.spawnGhostIntervalSeconds` up to `CONFIG.game.maxGhosts`

## Firebase Integration
Leaderboard at `https://irl-gjemsel-default-rtdb.europe-west1.firebasedatabase.app`:
- Top 10 scores by survival time
- Schema: `{playerName, time, ghostCount, timestamp}`
- Uses `orderByChild('time').limitToLast(5)` for efficient queries

## File Structure Notes
- [sw.js](../sw.js) - Service worker for PWA offline support (network-first strategy for CDN resources)
- [server.js](../server.js) - Development HTTPS server only (not used in production)
- [manifest.json](../manifest.json) - PWA metadata (icons, display mode, shortcuts)

## Common Pitfalls
1. **Don't use `async/await` with Turf** - All Turf functions are synchronous
2. **Ghost spawning**: Must check `pointInside(boundary)` AND `!pointInsideAnyObstacle()` 
3. **Map layers**: Can't add same layer ID twice - check with `map.getLayer(id)` first
4. **GPS accuracy**: `ensurePlayer()` validates moves against boundary - GPS drift can trigger warnings

## When Making Changes
- **Adjusting game balance**: Modify CONFIG object values (starts line ~524)
- **Adding game features**: Modify [index.html](../index.html) inline JavaScript section (starts line ~524)
- **Styling changes**: CSS is in `<style>` tag (lines ~30-470)
- **Ghost behavior**: See Ghost class starting line ~1095, especially `steer()` method
- **Map rendering**: Check `ensureSources()` (line ~715) and `refresh*()` functions
- **Testing on mobile**: Must use HTTPS for geolocation API - use [server.js](../server.js) on https://localhost:8443 or ngrok
