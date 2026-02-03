/**
 * Test Helpers
 * Phase 8: Integration Tests
 *
 * Utility functions for tests
 */

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export async function createTestUser(app: INestApplication) {
  const jwtService = app.get(JwtService);
  const token = jwtService.sign({
    sub: 'test-user-id',
    email: 'test@example.com',
  });
  return { token, userId: 'test-user-id' };
}

export async function cleanupDatabase(app: INestApplication) {
  // Clean up test data
  const orm = app.get('MikroORM');
  await orm.em.nativeDelete('AnalysisResult', {});
  await orm.em.nativeDelete('AnalysisScore', {});
  await orm.em.nativeDelete('AnalysisFinding', {});
  await orm.em.nativeDelete('AgentState', {});
  await orm.em.nativeDelete('PitchDeck', {});
  await orm.em.nativeDelete('User', {});
}
