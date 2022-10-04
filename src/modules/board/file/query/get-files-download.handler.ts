import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetFileDownloadQuery } from './get-file-download.query';
import { BoardFile } from '../entities/board_file';
import * as AWS from 'aws-sdk';
import { GetAllFileDownloadQuery } from './get-files-download.query';
import { Board } from '../../entities/board';

/**
 * 다중 파일 다운로드 시, 쿼리를 구현하는 쿼리 핸들러
 */

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

@QueryHandler(GetAllFileDownloadQuery)
export class GetAllFileDownloadHandler implements IQueryHandler<GetAllFileDownloadQuery> {
  constructor(
    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async execute(query: GetAllFileDownloadQuery) {
    const { boardId, res } = query;

    const files = await this.fileRepository.findBy({ boardId: boardId });

    if (!files) {
      throw new NotFoundException('DB에 해당 파일이 존재하지 않습니다.');
    }

    const downloadList = [];

    for (const file of files) {
      downloadList.push(file);
    }

    downloadList.map((file) => {
      const fileName = file.originalFileName + file.fileExt;
      const downloadName = encodeURIComponent(`${fileName}`); // 한글 파일명 사용 시 인코딩

      const getParam = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.fileName,
      };

      // headObject()를 통해 S3에 해당 파일이 있는지 확인
      try {
        s3.headObject(getParam, function (error, data) {
          if (error) {
            res.status(200).json({
              statusCode: error.statusCode,
              message: 'S3에 파일이 존재하지 않습니다.',
              error: error.code,
            });
            // throw new NotFoundException('S3에 파일이 존재하지 않습니다.');
          } else {
            // 브라우저에게 파일을 다운로드 하도록 알려주기 위해 Header에 Content-Disposition 설정하여 응답
            res.setHeader('Content-Disposition', `attachment; filename=${downloadName}`);

            // createReadStream()을 통해 파일 스트림을 읽어오고, pipe()를 통해 스트림을 파이핑하여 응답
            s3.getObject(getParam).createReadStream().pipe(res);
            console.log(data, '정상적으로 처리되었습니다.');
          }
        });
      } catch (err) {
        console.log(err);
        throw new BadRequestException('다운로드에 실패하였습니다.');
      }

      // 파일 정보 반환 (임시)
      return file;
    });
  }
}
