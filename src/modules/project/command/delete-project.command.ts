import { ICommand } from '@nestjs/cqrs';

/**
 * 프로젝트 삭제 커멘드 정의
 */
export class DeleteProjectCommand implements ICommand {
  constructor(readonly projectId: number, readonly delDate: Date) {}
}
