import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../common/public.decorator';
import { QuerySearchDto } from './dto/query-search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Search across courses, wiki pages, resources and exams',
  })
  search(@Query() query: QuerySearchDto) {
    return this.searchService.search(query);
  }
}
