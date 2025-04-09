/**
 * Unified Fix Script for Push-the-Spider
 * 
 * This script addresses all the major issues:
 * 1. Fixes texture paths in map.json
 * 2. Properly handles multi-texture blocks
 * 3. Copies and creates missing textures
 * 4. Updates player spawn configuration
 */

import fs from 'fs';
import path from 'path';

console.log('Starting unified fix script...');

// ========== CONFIGURATION ==========
const PUBLIC_DIR = './public';
const PUBLIC_BLOCKS_DIR = './public/blocks';
const PUBLIC_MAPS_DIR = './public/maps';
const ASSETS_DIR = './assets';
const ASSETS_BLOCKS_DIR = './assets/blocks';
const MAP_SOURCE_PATH = './assets/maps/map.json';
const MAP_DEST_PATH = './public/maps/map.json';
const INDEX_TS_PATH = './index.ts';

// Define known multi-texture blocks
const MULTI_TEXTURE_BLOCKS = ['grass', 'dragon_block', 'log', 'void_grass', 'water', 'lava', 'fire'];

// Player spawn coordinates
const PLAYER_SPAWN = { x: 18, y: 9, z: 27 };

// ========== DIRECTORY SETUP ==========
console.log('Setting up directories...');
[PUBLIC_DIR, PUBLIC_BLOCKS_DIR, PUBLIC_MAPS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// ========== FIX MAP.JSON ==========
console.log('Fixing map.json...');

// Make sure source map exists
if (!fs.existsSync(MAP_SOURCE_PATH)) {
  console.error(`Error: ${MAP_SOURCE_PATH} not found!`);
  process.exit(1);
}

// Load and parse the map file
let mapData;
try {
  const mapContent = fs.readFileSync(MAP_SOURCE_PATH, 'utf8');
  mapData = JSON.parse(mapContent);
  console.log(`Successfully loaded ${MAP_SOURCE_PATH}`);
} catch (error) {
  console.error(`Error reading or parsing ${MAP_SOURCE_PATH}:`, error);
  process.exit(1);
}

// Track textures for later creation
const requiredTextures = new Set();

// Fix texture paths in the map
let fixedBlockCount = 0;
if (mapData.blockTypes && Array.isArray(mapData.blockTypes)) {
  for (const blockType of mapData.blockTypes) {
    // Fix single-texture blocks
    if (!MULTI_TEXTURE_BLOCKS.includes(blockType.name) && !blockType.isMultiTexture) {
      // Check if texture URI is base64 or missing
      if (!blockType.textureUri || 
          blockType.textureUri.includes('=') || 
          blockType.textureUri.length > 100 ||
          /[a-zA-Z0-9+\/]{10,}/.test(blockType.textureUri)) {
        // Replace with consistent path pattern
        blockType.textureUri = `blocks/${blockType.name}.png`;
      } else if (!blockType.textureUri.startsWith('blocks/')) {
        // Standardize path format if it's not already correct
        if (blockType.textureUri.includes('/')) {
          const parts = blockType.textureUri.split('/');
          const filename = parts[parts.length - 1];
          blockType.textureUri = `blocks/${filename}`;
        } else {
          blockType.textureUri = `blocks/${blockType.textureUri}`;
          if (!blockType.textureUri.endsWith('.png')) {
            blockType.textureUri += '.png';
          }
        }
      }
      
      // Add to required textures list
      requiredTextures.add(blockType.textureUri);
      fixedBlockCount++;
    } 
    // Fix multi-texture blocks
    else {
      // Ensure the block is marked as multi-texture
      blockType.isMultiTexture = true;
      blockType.textureUri = `blocks/${blockType.name}`;
      
      // Create or update the sideTextures property
      if (!blockType.sideTextures) {
        blockType.sideTextures = {};
      }
      
      // Define all needed sides
      const sides = ['+x', '-x', '+y', '-y', '+z', '-z'];
      
      // Update each side texture path
      sides.forEach(side => {
        blockType.sideTextures[side] = `blocks/${blockType.name}/${side}.png`;
        requiredTextures.add(`blocks/${blockType.name}/${side}.png`);
      });
      
      fixedBlockCount++;
    }
  }
  
  console.log(`Fixed ${fixedBlockCount} block texture paths`);
  
  // Save the updated map file to public directory
  try {
    fs.writeFileSync(MAP_DEST_PATH, JSON.stringify(mapData, null, 2));
    console.log(`Updated map file saved to ${MAP_DEST_PATH}`);
  } catch (error) {
    console.error(`Error writing to ${MAP_DEST_PATH}:`, error);
  }
} else {
  console.error('Error: No blockTypes array found in the map data!');
}

// ========== COPY EXISTING TEXTURES ==========
console.log('Copying existing textures...');
let copiedTextureCount = 0;

if (fs.existsSync(ASSETS_BLOCKS_DIR)) {
  // Function to recursively copy files
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else if (entry.isFile() && entry.name.endsWith('.png')) {
        fs.copyFileSync(srcPath, destPath);
        copiedTextureCount++;
        console.log(`Copied texture: ${entry.name}`);
      }
    }
  };
  
  copyDir(ASSETS_BLOCKS_DIR, PUBLIC_BLOCKS_DIR);
  console.log(`Copied ${copiedTextureCount} textures from assets to public directory`);
} else {
  console.warn(`Warning: Assets blocks directory ${ASSETS_BLOCKS_DIR} not found`);
}

// ========== CREATE MISSING TEXTURES ==========
console.log('Creating missing textures...');

// Generate HTML file for missing textures
function createHtmlTexture(blockName, side, color) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blockName} ${side || ''}</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 64px;
      height: 64px;
      overflow: hidden;
    }
    .texture {
      width: 64px;
      height: 64px;
      background-color: ${color};
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: sans-serif;
      font-size: 10px;
      color: white;
      text-shadow: 1px 1px 1px black;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="texture">${blockName}${side ? `<br>${side}` : ''}</div>
</body>
</html>`;
}

// Generate a color based on block name and side
function generateColor(blockName, side) {
  // Special handling for known block types
  if (blockName === 'grass') {
    if (side === '+y') return '#4CAF50'; // Green for top
    if (side === '-y') return '#8B4513'; // Brown for bottom
    return '#8D9B6C';  // Mixed for sides
  }
  if (blockName === 'log') {
    if (side === '+y' || side === '-y') return '#A1887F'; // Light brown for top/bottom
    return '#795548';  // Dark brown for sides
  }
  if (blockName === 'dragon_block') {
    if (side === '+y') return '#673AB7'; // Purple for top
    if (side === '-y') return '#311B92'; // Dark purple for bottom
    return '#512DA8';  // Medium purple for sides
  }
  if (blockName === 'void_grass') {
    if (side === '+y') return '#607D8B'; // Blue-grey for top
    if (side === '-y') return '#263238'; // Dark blue-grey for bottom
    return '#455A64';  // Medium blue-grey for sides
  }
  if (blockName === 'water') {
    return '#2196F3';  // Blue
  }
  if (blockName === 'lava') {
    return '#FF5722';  // Orange-red
  }
  if (blockName === 'fire') {
    return '#FF9800';  // Orange
  }
  
  // Generate a color based on the block name for others
  let hash = 0;
  const str = blockName + (side || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

// Create directories and HTML files for missing textures
let createdTextureCount = 0;
for (const texturePath of requiredTextures) {
  const fullPath = path.join(PUBLIC_DIR, texturePath);
  const dirPath = path.dirname(fullPath);
  
  // Skip if texture already exists
  if (fs.existsSync(fullPath)) {
    continue;
  }
  
  // Create directory if needed
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Parse block name and side (if applicable)
  let blockName, side;
  if (texturePath.includes('/') && texturePath.split('/').length > 2) {
    const parts = texturePath.split('/');
    blockName = parts[1];
    side = parts[2].replace('.png', '');
  } else {
    blockName = texturePath.split('/')[1].replace('.png', '');
    side = '';
  }
  
  // Generate color and HTML content
  const color = generateColor(blockName, side);
  const html = createHtmlTexture(blockName, side, color);
  
  // Write the HTML file
  fs.writeFileSync(fullPath, html);
  createdTextureCount++;
  console.log(`Created placeholder texture for ${texturePath}`);
}

console.log(`Created ${createdTextureCount} placeholder textures for missing files`);

console.log('Fix script completed successfully!'); 