import { ICommand } from '@nestjs/cqrs';

/**
 * 학습관리 삭제 커멘드 정의
 */
export class DeleteStudyCommand implements ICommand {
  constructor(readonly studyId: number, readonly studyPlanId, readonly delDate: Date) {}
}
