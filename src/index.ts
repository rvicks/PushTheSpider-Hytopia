/**
 * S.I.N. – Sentient Intelligence Nexus
 * Entry point for the Hytopia game server.
 */

import { logger } from './utils/logger';
import { startServer, ModelRegistry } from 'hytopia';
import { initializeGame } from './core/game'; // Ensure this path is correct

// --- Attempt to disable model optimization globally (EARLY) ---
// https://dev.hytopia.com/sdk-guides/entities/model-entities#automatic-model-optimizations
try {
    if (ModelRegistry?.instance) {
        ModelRegistry.instance.optimize = false;
        logger.info('[Bootstrap] Attempted ModelRegistry.instance.optimize = false;');
    } else {
        logger.warn('[Bootstrap] ModelRegistry.instance not found for early optimization disable.');
    }
} catch(e) {
     logger.error('[Bootstrap] Error during early ModelRegistry access', e);
}

// --- Attempt to disable model optimization globally --- 
// This needs to run BEFORE startServer is called.
try {
    const hytopiaGlobal = (globalThis as any).Hytopia;
  if (hytopiaGlobal?.ModelRegistry?.instance) {
    hytopiaGlobal.ModelRegistry.instance.optimize = false;
        logger.info('[Bootstrap] Attempted global Hytopia.ModelRegistry optimization disable.');
    }
    // Maybe also try setting a global flag if one exists (speculative)
    if (typeof (globalThis as any).DISABLE_MODEL_OPTIMIZATION !== 'undefined') {
        (globalThis as any).DISABLE_MODEL_OPTIMIZATION = true;
        logger.info('[Bootstrap] Attempted global DISABLE_MODEL_OPTIMIZATION=true');
    }
  } catch (error) {
    logger.warn('[Bootstrap] Failed attempt to disable model optimization globally', error);
}
// --- End optimization disable attempt ---

logger.info('[Bootstrap] Game initialization sequence started');

// Log environment information for debugging
logger.info(`[Bootstrap] Node environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`[Bootstrap] Server port: ${process.env.PORT || 8080}`);
logger.info(`[Bootstrap] Server host: ${process.env.HOST || '0.0.0.0'}`);

// Start the server with error handling
logger.info('[Bootstrap] Starting server initialization...');

startServer((world) => {
    logger.info('[Bootstrap] Server started successfully! World object received.');
    try {
        logger.info('[Bootstrap] Initializing game components...');
        initializeGame(world);
        logger.info('[Bootstrap] Game initialization completed successfully.');
    } catch (error) {
        logger.error('[CRITICAL] Unhandled exception during game initialization:', error);
        // Log but don't crash the server
    }
    
    // Log success message
    logger.info('[Bootstrap] Server is ready to accept connections!');
    logger.info('[Bootstrap] Connect at https://hytopia.com/play and enter localhost:8080');
});

// Set up global error handlers
process.on('uncaughtException', (error) => {
    logger.error('[CRITICAL] Uncaught exception:', error);
    // Keep the server running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('[CRITICAL] Unhandled promise rejection:', reason);
    // Keep the server running despite the rejection
});

logger.info('[Bootstrap] Server initialization script completed.');

// This file should now ideally contain only the bootstrap logic.
// All game setup, event handling, and world manipulation
// should be handled within the modules loaded by './core/game'.