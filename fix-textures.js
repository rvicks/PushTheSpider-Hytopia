// fix-textures.js
// Script to fix texture loading issues in the game

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting texture fix script...');

// Configuration
const PUBLIC_DIR = path.join(__dirname, 'public');
const PUBLIC_BLOCKS_DIR = path.join(PUBLIC_DIR, 'blocks');
const ASSETS_DIR = path.join(__dirname, 'assets');
const ASSETS_BLOCKS_DIR = path.join(ASSETS_DIR, 'blocks');
const MAP_SOURCE_PATH = path.join(ASSETS_DIR, 'maps/map.json');
const MAP_DEST_PATH = path.join(PUBLIC_DIR, 'maps/map.json');

// Define known multi-texture blocks
const MULTI_TEXTURE_BLOCKS = ['grass', 'dragon_block', 'log', 'void_grass', 'water', 'lava', 'fire'];

// Create directories if they don't exist
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.log(`Created directory: ${PUBLIC_DIR}`);
}

if (!fs.existsSync(PUBLIC_BLOCKS_DIR)) {
    fs.mkdirSync(PUBLIC_BLOCKS_DIR, { recursive: true });
    console.log(`Created directory: ${PUBLIC_BLOCKS_DIR}`);
}

if (!fs.existsSync(path.join(PUBLIC_DIR, 'maps'))) {
    fs.mkdirSync(path.join(PUBLIC_DIR, 'maps'), { recursive: true });
    console.log(`Created directory: ${path.join(PUBLIC_DIR, 'maps')}`);
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
}

console.log(`Fixed ${fixedBlockCount} block type texture paths`);

// Save the fixed map file
try {
    const fixedMapContent = JSON.stringify(mapData, null, 2);
    fs.writeFileSync(MAP_DEST_PATH, fixedMapContent);
    console.log(`Saved fixed map to ${MAP_DEST_PATH}`);
} catch (error) {
    console.error(`Error saving fixed map to ${MAP_DEST_PATH}:`, error);
}

// Copy existing textures from assets to public
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
    console.log(`Copied ${copiedTextureCount} textures from assets to public`);
} else {
    console.warn(`Assets blocks directory ${ASSETS_BLOCKS_DIR} does not exist, skipping copy`);
}

// Helper function to generate a color based on block name and side
function generateColor(blockName, side) {
    // Simple hash function to generate a consistent color
    let hash = 0;
    const str = blockName + side;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to RGB
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper function to create HTML content for a texture
function createHtmlTexture(blockName, side, color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <rect width="128" height="128" fill="${color}" />
    <text x="64" y="64" font-family="Arial" font-size="12" text-anchor="middle" fill="white">${blockName}${side ? ' ' + side : ''}</text>
</svg>`;
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
console.log('Texture fix script completed successfully!');
