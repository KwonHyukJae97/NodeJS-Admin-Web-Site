import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetNoticeDetailCommand } from './get-notice-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';

/**
 * 공지사항 상세조회 시, 커맨드를 처리하는 커맨드 핸들러 (서비스 로직 수행)
 */

@Injectable()
@CommandHandler(GetNoticeDetailCommand)
export class GetNoticeDetailHandler implements ICommandHandler<GetNoticeDetailCommand> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  async execute(command: GetNoticeDetailCommand) {
    const { noticeId } = command;

    const notice = await this.noticeRepository.findOneBy({ noticeId: noticeId });

    if (!notice) {
      throw new NotFoundException('존재하지 않는 공지사항입니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId.boardId });
    // 공지사항 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    await this.boardRepository.save(board);

    notice.boardId = board;

    await this.noticeRepository.save(notice);

    const files = await this.fileRepository.findBy({ boardId: board.boardId });
    // console.log({ fileList: files });

    const getNoticeDetailDto = {
      noticeId: noticeId,
      noticeGrant: notice.noticeGrant,
      isTop: notice.isTop,
      boardId: board,
      fileList: files,
    };

    return getNoticeDetailDto;
  }
}
