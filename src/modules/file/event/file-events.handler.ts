import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { FilesCreateEvent } from './files-create-event';
import { FilesUpdateEvent } from './files-update-event';
import { FilesDeleteEvent } from './files-delete-event';
import { FileService } from '../file.service';
import { Inject } from '@nestjs/common';
import { BoardFileDb } from '../../board/board-file-db';
import { AccountFileDb } from '../../account/account-file-db';
import { FileUpdateEvent } from './file-update-event';
import { FileDeleteEvent } from './file-delete-event';

/**
 * 게시글의 파일 관련 필요 로직을 처리하는 이벤트 핸들러
 */

@EventsHandler(
  FilesCreateEvent,
  FilesUpdateEvent,
  FilesDeleteEvent,
  FileUpdateEvent,
  FileDeleteEvent,
)
export class FileEventsHandler
  implements
    IEventHandler<
      FilesCreateEvent | FilesUpdateEvent | FilesDeleteEvent | FileUpdateEvent | FileDeleteEvent
    >
{
  constructor(
    private fileService: FileService,

    @Inject('boardFile')
    private boardFileDb: BoardFileDb,

    @Inject('accountFile')
    private accountFileDb: AccountFileDb,
  ) {}

  // 하나의 이벤트 핸들러에 여러 이벤트를 받을 수 있기에, 하나의 이벤트 핸들러로 관리하도록 개선
  async handle(
    event:
      | FilesCreateEvent
      | FilesUpdateEvent
      | FilesDeleteEvent
      | FileUpdateEvent
      | FileDeleteEvent,
  ) {
    switch (event.name) {
      // 다중 파일 업로드 이벤트
      case FilesCreateEvent.name: {
        console.log('다중 파일 업로드 이벤트 발생!');
        const { id, fileType, files, fileDbInterface } = event as FilesCreateEvent;
        await this.fileService.uploadFiles(id, fileType, files, fileDbInterface);
        break;
      }
      // 다중 파일 업로드 및 삭제 이벤트 (업데이트)
      case FilesUpdateEvent.name: {
        console.log('다중 파일 업데이트 이벤트 발생!');
        const { id, fileType, files, fileDbInterface } = event as FilesUpdateEvent;
        await this.fileService.updateFiles(id, fileType, files, fileDbInterface);
        break;
      }
      // 다중 파일 삭제 이벤트
      case FilesDeleteEvent.name: {
        console.log('파일 삭제 이벤트 발생!');
        const { id, fileDbInterface } = event as FilesDeleteEvent;
        await this.fileService.deleteFiles(id, fileDbInterface);
        break;
      }
      // 단일 파일 업로드 및 삭제 이벤트 (업데이트)
      case FileUpdateEvent.name: {
        console.log('단일 파일 업데이트 이벤트 발생!');
        const { id, fileType, file, fileDbInterface } = event as FileUpdateEvent;
        await this.fileService.updateFile(id, fileType, file, fileDbInterface);
        break;
      }
      // 단일 파일 삭제 이벤트
      case FileDeleteEvent.name: {
        console.log('단일 파일 삭제 이벤트 발생!');
        const { id, fileDbInterface } = event as FileDeleteEvent;
        await this.fileService.deleteFile(id, fileDbInterface);
        break;
      }
      default:
        break;
    }
  }
}
