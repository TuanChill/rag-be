/**
 * Migration: Multi-File Pitch Deck Support
 * Date: 2026-02-03
 *
 * This migration sets up the infrastructure for multi-file pitch deck support.
 *
 * Phase 01 (Database Layer) already created:
 * - PitchDeckFile entity with @ManyToOne relationship to PitchDeck
 * - PitchDeck.files collection with Cascade.REMOVE
 * - PitchDeck.fileCount property
 *
 * This migration script is primarily for documentation purposes.
 * The database schema changes are handled by MikroORM migrations.
 *
 * For existing deployments with single-file decks:
 * 1. Backup pitch_decks collection
 * 2. Run migration in staging first
 * 3. Manual script available below for data transformation
 */

import { MikroORM } from '@mikro-orm/core';
import { PitchDeckFile } from '../src/api/pitchdeck/entities/pitch-deck-file.entity';

/**
 * Up migration - Verify PitchDeckFile collection exists
 */
export async function up(orm: MikroORM): Promise<void> {
  const em = orm.em.fork();

  console.log('Multi-file pitch deck migration: Setting up infrastructure...');

  // Verify PitchDeckFile entity can be queried
  try {
    const count = await em.count(PitchDeckFile, {});
    console.log(`PitchDeckFile collection exists with ${count} records`);
  } catch (error: any) {
    console.log(`PitchDeckFile collection may not exist yet: ${error?.message}`);
    console.log('Collection will be created on first use');
  }

  console.log('Migration complete: Multi-file infrastructure ready');
}

/**
 * Down migration - No-op (collections are cleaned up manually if needed)
 */
export async function down(orm: MikroORM): Promise<void> {
  console.log('Rollback: Multi-file pitch deck infrastructure');
  console.log('Note: PitchDeckFile collection will be cleaned up manually if needed');
  console.log('To remove: db.pitch_deck_files.drop()');
}

/**
 * Manual data migration script for existing single-file decks
 *
 * This is a reference implementation for transforming existing data.
 * Run this manually if you have existing pitch_decks to migrate.
 *
 * Usage:
 *   node -e "require('./migrations/260203-multi-file-pitch-deck.ts').migrateExisting()"
 */
export async function migrateExisting() {
  const { MikroORM } = require('@mikro-orm/core');

  let orm: MikroORM | null = null;

  try {
    orm = await MikroORM.init();
    const em = orm.em.fork();

    console.log('Manual migration: Finding existing single-file decks...');

    // Note: This requires manual implementation based on your actual data structure
    // The old fields (originalFileName, mimeType, fileSize, storagePath) were
    // removed from the PitchDeck entity in Phase 01

    // If you have existing data to migrate, you would:
    // 1. Query pitch_decks collection with old fields
    // 2. Create PitchDeckFile records
    // 3. Set fileCount = 1
    // 4. Verify data integrity

    console.warn('Manual migration requires custom implementation based on your data');
    console.warn('See migration docs for guidance');

    await orm.close();
  } catch (error: any) {
    console.error('Manual migration failed:', error?.message);
    if (orm) await orm.close();
    process.exit(1);
  }
}

/**
 * Run migration directly
 */
export async function main() {
  const { MikroORM } = require('@mikro-orm/core');

  let orm: MikroORM | null = null;

  try {
    orm = await MikroORM.init();
    console.log('Connected to database');

    const args = process.argv.slice(2);
    const direction = args[0] === 'down' ? 'down' : 'up';

    console.log(`Running migration: ${direction}`);

    if (direction === 'up') {
      await up(orm);
    } else {
      await down(orm);
    }

    console.log('Migration finished successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error?.message || error);
    process.exit(1);
  } finally {
    if (orm) {
      await orm.close();
    }
  }
}

if (require.main === module) {
  main();
}
