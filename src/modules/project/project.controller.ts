import { Body, Controller, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetProjectRequestDto } from './dto/get-project-request.dto';
import { GetProjectListQuery } from './query/get-project-list.query';

/**
 * 프로젝트 컨트롤러 정의
 */
@Controller('project')
export class ProjectController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get()
  getProjectList(@Body() param: GetProjectRequestDto) {
    const getProjectListQuery = new GetProjectListQuery(param);
    return this.queryBus.execute(getProjectListQuery);
  }
}
