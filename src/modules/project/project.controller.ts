import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProjectCommand } from './command/create-project.command';
import { DeleteProjectCommand } from './command/delete-project.command';
import { UpdateProjectCommand } from './command/update-project.command';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectRequestDto } from './dto/get-project-request.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetProjectListQuery } from './query/get-project-list.query';
import { GetWordLevelNameProjcetQuery } from './query/get-wordLevelName-project.query';

/**
 * 프로젝트 컨트롤러 정의
 */
@Controller('project')
export class ProjectController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   *  프로젝트 조회
   * @param param
   * @returns 프로젝트 조회 쿼리 전송
   */
  @Get()
  getProjectList(@Body() param: GetProjectRequestDto) {
    const getProjectListQuery = new GetProjectListQuery(param);

    return this.queryBus.execute(getProjectListQuery);
  }

  @Get(':id')
  getWordLevelProjectList(@Param('id') wordLevelId: number, @Body() param: GetProjectRequestDto) {
    const wordLevelName = new GetWordLevelNameProjcetQuery(wordLevelId, param);
    return this.queryBus.execute(wordLevelName);
  }

  /**
   * 프로젝트 등록
   * @param createProjectDto : projectName, regBy
   * @returns 프로젝트 등록 커멘드 전송
   */
  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    const { projectName, regBy, wordLevelId } = createProjectDto;
    const command = new CreateProjectCommand(projectName, regBy, wordLevelId);

    return this.commandBus.execute(command);
  }

  /**
   * 프로젝트 수정
   * @param projectId
   * @param updateProjectDto : wordLevelName, projectName, isService, updateBy
   * @returns 프로젝트 수정 커멘드 전송
   */
  @Patch(':id')
  updateProject(@Param('id') projectId: number, @Body() updateProjectDto: UpdateProjectDto) {
    const { wordLevelName, wordLevelId, projectName, isService, updateBy } = updateProjectDto;

    const command = new UpdateProjectCommand(
      projectId,
      wordLevelName,
      wordLevelId,
      projectName,
      isService,
      updateBy,
    );

    return this.commandBus.execute(command);
  }

  /**
   * 프로젝트 삭제
   * @param projectId
   * @param delDate
   * @returns 프로젝트 삭제 커멘드 전송
   */
  @Delete(':id')
  async deleteProject(@Param('id') projectId: number, delDate: Date) {
    const command = new DeleteProjectCommand(projectId, delDate);

    return this.commandBus.execute(command);
  }
}
