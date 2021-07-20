import { Directive, ElementRef, Renderer, Input, EventEmitter, Output, OnInit } from '@angular/core';

@Directive({
    selector: '[keyboard-event]'
})
export class KeyboardEvent implements OnInit {
    private _isEnabled: boolean;
    @Output()
    public esc: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    public enter: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    public keydownEvent: EventEmitter<any> = new EventEmitter<any>();
    @Input()
    public set isEnabled(val: boolean) {
        this._isEnabled = val;
        this.toggleEvents();
    }
    public get isEnabled() {
        return this._isEnabled;
    }
    private globalListenFunc: Function


    constructor(private renderer: Renderer) {
    }

    ngOnInit() {
    }

    private toggleEvents() {
        if (this.isEnabled) {
            this.enableKeypress();
        }
        else
            this.disableKeypress();
    }

    private enableKeypress() {
        this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
            this.keydownEvent.emit(e);
            if (e.keyCode == 27)
                this.esc.emit(e);
            else if (e.keyCode == 13)
                this.enter.emit(e)
        });

    }
    private disableKeypress() {
        if (this.globalListenFunc)
            this.globalListenFunc();
    }

}