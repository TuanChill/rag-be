# Database Migrations

This directory contains database migration scripts for the RAG-be backend.

## Migration Files

### 260203-multi-file-pitch-deck.ts
**Date:** 2026-02-03
**Purpose:** Migrate single-file pitch decks to multi-file structure

## Usage

### Run Migration (up)
```bash
cd /Users/tuanchill/Desktop/Capylabs/tbx/RAG-be
npx ts-node migrations/260203-multi-file-pitch-deck.ts up
```

### Rollback Migration (down)
```bash
cd /Users/tuanchill/Desktop/Capylabs/tbx/RAG-be
npx ts-node migrations/260203-multi-file-pitch-deck.ts down
```

## Pre-Deployment Checklist

- [ ] Backup MongoDB `pitch_decks` collection
- [ ] Backup `/uploads/pitchdecks/` directory
- [ ] Test migration script in staging environment
- [ ] Verify staging data integrity after migration

## Post-Deployment Checklist

- [ ] Verify production data after migration
- [ ] Monitor error logs for migration-related issues
- [ ] Test upload flow
- [ ] Test delete flow
- [ ] Check disk space usage

## Migration Details

### What Changes
- Creates `PitchDeckFile` entities from existing deck file fields
- Sets `fileCount = 1` on migrated decks
- Original file fields remain in MongoDB but are no longer used

### What Preserves
- All file data (originalFileName, mimeType, fileSize, storagePath)
- All deck metadata (title, description, tags, status)
- File storage locations unchanged

### Rollback Capability
The `down` function restores decks to single-file structure:
- Removes `PitchDeckFile` records
- Resets `fileCount` to 0
- Original file fields in MongoDB remain untouched

## Safety Notes

1. **Always backup before running migrations**
2. **Test in staging first**
3. **Monitor logs during migration**
4. **Have rollback plan ready**
