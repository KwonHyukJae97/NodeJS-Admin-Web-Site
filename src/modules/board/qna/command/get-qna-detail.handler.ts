import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetQnaDetailCommand } from './get-qna-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';

/**
 * 1:1 문의 상세조회 시, 커맨드를 처리하는 커맨드 핸들러 (서비스 로직 수행)
 */

@Injectable()
@CommandHandler(GetQnaDetailCommand)
export class GetQnaDetailHandler implements ICommandHandler<GetQnaDetailCommand> {
  constructor(
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  async execute(command: GetQnaDetailCommand) {
    const { qnaId, role, accountId } = command;

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      throw new NotFoundException('존재하지 않는 문의 내역입니다.');
    }

    // role = 본사 관리자 이거나 qna 작성자가 본인일 경우에만 상세 조회
    if (role === '본사 관리자' || accountId == qna.boardId.accountId) {
      const board = await this.boardRepository.findOneBy({ boardId: qna.boardId.boardId });
      // 문의 내역 상세 조회할 때마다 조회수 반영
      /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
      board.viewCount++;

      try {
        await this.boardRepository.save(board);
      } catch (err) {
        console.log(err);
      }

      qna.boardId = board;

      try {
        await this.qnaRepository.save(qna);
      } catch (err) {
        console.log(err);
      }

      const files = await this.fileRepository.findBy({ boardId: board.boardId });

      const getQnaDetailDto = {
        qnaId: qnaId,
        boardId: board,
        fileList: files,
      };

      return getQnaDetailDto;
    } else {
      throw new BadRequestException('본인 또는 해당 관리자만 조회 가능합니다.');
    }
  }
}
