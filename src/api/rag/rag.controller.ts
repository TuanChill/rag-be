import { Controller, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { HttpExceptionFilter } from '@core/filter/http-exception.filter';

@ApiTags('rag')
@Controller('rag')
@UseFilters(HttpExceptionFilter)
export class RagController {
  constructor(private readonly ragService: RagService) {}

  // Endpoints will be implemented in Phase 4
}
