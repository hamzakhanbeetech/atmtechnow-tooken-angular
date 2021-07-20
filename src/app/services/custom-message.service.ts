import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {MessageService} from '../../../node_modules/primeng/components/common/messageservice';

export interface Message {
    severity?: string;
    summary?: string;
    detail?: string;
    id?: any;
}

@Injectable()
export class CustomMessageService {
  
    constructor(private messageService: MessageService)  {
    }
    showMessage(obj : Message) {
        this.messageService.clear();
        this.messageService.add({
            severity: obj.severity,
            summary: obj.summary,
            detail: obj.detail
        })
    }
    
}
     
