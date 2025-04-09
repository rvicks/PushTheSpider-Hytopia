# Fixing Camera and Texture Issues

## Camera Issues (Not in First-Person View)

The camera issue appears to be related to the game's focus. Here's how to fix it:

1. **Focus the game window**: Click inside the game viewport to ensure it has focus.
2. **Press ESC**: This opens and closes the game menu, which can help reset focus issues.
3. **Press F5 key**: This toggles between first-person and third-person views. Press it once or twice until you see the first-person view (no character visible).
4. **Ensure keyboard control**: Press WASD keys to move. If nothing happens, click in the game window again.

## Missing Texture Issues

Many textures are missing because they're being loaded from incorrect paths. Here's how to fix this:

### 1. Reset Player Spawn Position

The logs show an error: "Chunk coordinates must be divisible by CHUNK_SIZE (16)"

Edit `index.ts`:
```javascript
// Change this line 
const PLAYER_SPAWN: Vector3Like = { x: 18, y: 9, z: 27 }; 

// To this
const PLAYER_SPAWN: Vector3Like = { x: 16, y: 1, z: 16 }; 
```

### 2. Copy All Texture Files

Run this script to copy all existing textures from `assets/blocks` to `public/blocks`:

```javascript
// Create a file named 'fix-textures.js' with this content
import fs from 'fs';
import path from 'path';

const assetsBlocksDir = './assets/blocks';
const publicBlocksDir = './public/blocks';

// Create public/blocks directory
if (!fs.existsSync(publicBlocksDir)) {
  fs.mkdirSync(publicBlocksDir, { recursive: true });
}

// Copy all PNG files
if (fs.existsSync(assetsBlocksDir)) {
  const files = fs.readdirSync(assetsBlocksDir);
  
  for (const file of files) {
    const srcPath = path.join(assetsBlocksDir, file);
    const destPath = path.join(publicBlocksDir, file);
    
    // Copy files
    if (fs.lstatSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file}`);
    } 
    // Copy directories (for multi-texture blocks)
    else if (fs.lstatSync(srcPath).isDirectory()) {
      const blockDir = path.join(publicBlocksDir, file);
      if (!fs.existsSync(blockDir)) {
        fs.mkdirSync(blockDir, { recursive: true });
      }
      
      const subfiles = fs.readdirSync(srcPath);
      for (const subfile of subfiles) {
        const subSrcPath = path.join(srcPath, subfile);
        const subDestPath = path.join(blockDir, subfile);
        if (fs.lstatSync(subSrcPath).isFile()) {
          fs.copyFileSync(subSrcPath, subDestPath);
          console.log(`Copied ${file}/${subfile}`);
        }
      }
    }
  }
}

console.log('Textures copied successfully!');
```

Run it with: `node fix-textures.js`

### 3. Fix the Map Texture Paths

Update your `texture-fix.js` script to simplify the texture paths:

```javascript
// In texture-fix.js, replace the code for fixing texture paths with:
for (const blockType of map.blockTypes) {
  if (blockType.isMultiTexture) {
    // Multi-texture blocks (like grass, log, etc.)
    blockType.textureUri = `blocks/${blockType.name}`;
    
    // Fix side textures paths
    if (blockType.sideTextures) {
      for (const side in blockType.sideTextures) {
        blockType.sideTextures[side] = `blocks/${blockType.name}/${side}.png`;
      }
    }
  } else {
    // Single-texture blocks
    blockType.textureUri = `blocks/${blockType.name}.png`;
  }
  
  console.log(`Fixed texture for ${blockType.name}: ${blockType.textureUri}`);
}
```

Run it and copy the fixed map:
```
node texture-fix.js
cp assets/maps/fixed-map.json public/maps/map.json
```

### 4. Restart Server

After making these changes, restart your server:

```
bun run start
```

Then connect to the game. You should now have:
1. First-person view with proper player controls
2. More textures loading correctly
3. A stable playing experience

## Extra: Check Console for Specific Texture Errors

If you're still having issues, check the browser's developer console (F12) to see which specific textures are failing to load. You may need to manually copy or create those textures in the `public/blocks` directory. 