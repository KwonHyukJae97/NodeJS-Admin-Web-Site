import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateNoticeCommand } from './create-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository, DataSource } from 'typeorm';
import { Board } from '../../entities/board';
import { FilesCreateEvent } from '../../../file/event/files-create-event';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * 공지사항 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateNoticeCommand)
export class CreateNoticeHandler implements ICommandHandler<CreateNoticeCommand> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @Inject('noticeFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 공지사항 등록 메소드
   * @param command : 공지사항 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 공지사항 정보 반환
   */
  async execute(command: CreateNoticeCommand) {
    const { title, content, isTop, noticeGrant, role, files, account } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    // queryRunner 생성
    const queryRunner = this.dataSource.createQueryRunner();
    // db 연결
    await queryRunner.connect();
    // 트랜잭션 시작
    await queryRunner.startTransaction();

    const board = this.boardRepository.create({
      accountId: account.accountId,
      boardTypeCode: '0',
      title,
      content,
      viewCount: 0,
    });

    try {
      await queryRunner.manager.getRepository(Board).save(board);

      const notice = queryRunner.manager.getRepository(Notice).create({
        noticeGrant,
        isTop,
        boardId: board.boardId,
        board: board,
      });

      await queryRunner.manager.getRepository(Notice).save(notice);

      if (files.length !== 0) {
        // 파일 업로드 이벤트 처리
        this.eventBus.publish(
          new FilesCreateEvent(board.boardId, FileType.NOTICE, files, this.boardFileDb),
        );
      }
      // 정상 동작 시 데이터 커밋
      await queryRunner.commitTransaction();

      return notice;
    } catch (err) {
      // 에러 발생 시 데이터 롤백
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('공지사항 정보에', 400);
    } finally {
      // db 연결 해제 (필수)
      await queryRunner.release();
    }
  }
}
