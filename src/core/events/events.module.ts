import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsService } from './events.service';

/**
 * Event module - provides in-process event emitters
 * Uses EventEmitter2 for module-to-module communication
 */
@Module({
  providers: [EventsService, EventEmitter2],
  exports: [EventsService, EventEmitter2],
})
export class EventsModule {}
