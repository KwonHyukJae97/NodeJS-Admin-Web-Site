import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BoardFile } from '../entities/board-file';
import * as AWS from 'aws-sdk';
import { GetAllFileDownloadQuery } from './get-files-download.query';
import { Board } from '../../board/entities/board';
import { PassThrough } from 'stream';
import * as archiver from 'archiver';
import { getTime } from '../../../common/utils/time-common-method';

/**
 * 다중 파일 다운로드 시, 쿼리를 구현하는 쿼리 핸들러
 */

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 파일 압축
const multiFilesStream = async (files) => {
  const archive = archiver('zip', { zlib: { level: 5 } });

  for (const file of files) {
    const passThrough = new PassThrough();

    const getParam = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.fileName,
    };

    // s3에 해당 파일이 있는지 확인 후, 파일 정보 읽기
    try {
      await s3.headObject(getParam).promise();

      await s3
        .getObject(getParam)
        .createReadStream()
        .pipe(passThrough)
        .on('error', (err) => {
          console.log(err);
          return new BadRequestException('파일 읽기에 실패하였습니다.');
        });
      archive.append(passThrough, { name: file.originalFileName + file.fileExt });

      // s3에 파일이 없을 경우 예외처리
    } catch (err) {
      console.log('S3 파일 다운로드 실패', err);
      throw new NotFoundException('S3에 파일이 존재하지 않습니다.');
    }
  }
  return archive;
};

@QueryHandler(GetAllFileDownloadQuery)
export class GetAllFilesDownloadHandler implements IQueryHandler<GetAllFileDownloadQuery> {
  constructor(
    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async execute(query: GetAllFileDownloadQuery) {
    const { boardId, res } = query;

    const files = await this.fileRepository.findBy({ boardId: boardId });

    if (files.length === 0) {
      throw new NotFoundException('DB에 해당 파일이 존재하지 않습니다.');
    }

    // 현재 시간으로 파일명 설정
    const downloadName = getTime() + '.zip';

    res.setHeader('Content-Disposition', `attachment; filename=${downloadName}`);

    const mfStream = await multiFilesStream(files);
    mfStream.pipe(res);
    mfStream.finalize();
  }
}
