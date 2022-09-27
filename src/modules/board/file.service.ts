import { BadRequestException, Injectable } from "@nestjs/common";
import * as path from 'path';

@Injectable()
export class FileService {
  uploadFile(file: Express.MulterS3.File) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }
    const ext = path.extname(file.originalname);

    const boardFile = {
      originalFileName: path.basename(file.originalname, ext),
      fileName: file.key,
      fileExt: path.extname(file.originalname),
      filePath: file.location,
      fileSize: file.size,
    };

    return boardFile;
  }
}
