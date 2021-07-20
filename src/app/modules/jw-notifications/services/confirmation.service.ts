import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
interface IConfirmation {
    header?: string;
    message: string;
    accept: Function;
    reject?: Function;
    confirmBtnText?: string;
}
@Injectable()
export class ConfirmationService {
    public showPopup: boolean;
    public header: string;
    public message: string;
    public accept: Function;
    public reject: Function;
    public confirmBtnText: string;
    private _confirm: IConfirmation;
    constructor() { }

    public confirm(confirm: IConfirmation) {
        this.showPopup = true;
        this.header = confirm.header || 'Confirm';
        this.message = confirm.message || 'Are you sure?';
        this.confirmBtnText = confirm.confirmBtnText || '';
        this._confirm = confirm;
    }

    public onAccept() {
        this.showPopup = false;
        if (typeof this._confirm.accept === 'function') {
            this._confirm.accept();
        }
    }
    public onReject() {
        this.showPopup = false;
        if (typeof this._confirm.reject === 'function') {
            this._confirm.reject();
        }
    }
}
