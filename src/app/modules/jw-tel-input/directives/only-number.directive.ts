import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[onlyNumber]'
})
export class OnlyNumberDirective {

    @Input()
    onlyNumber: boolean;

    // regexStr = '^[0-9]*$';
    regexStr = /^[0-9\+]*$/;//'^[+-]?\d$';

    constructor(private el: ElementRef) {
    }

    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        let e = <KeyboardEvent>event;
        if (this.onlyNumber) {
            if (
                [46, 8, 9, 27, 13, 110, 190, 171].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode === 65 && e.ctrlKey === true) ||
                // Allow: Ctrl+C
                (e.keyCode === 67 && e.ctrlKey === true) ||
                // Allow: Ctrl+V
                (e.keyCode === 86 && e.ctrlKey === true) ||
                // Allow: Ctrl+X
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39) ||
                (e.keyCode === 107)) {
                // let it happen, don't do anything
                return;
            }
            //console.log(event)
            let ch = e.key;//String.fromCharCode(e.keyCode);
            let regEx = new RegExp(this.regexStr);
            if (regEx.test(ch)) {
                return;
            } else if ((e.keyCode!=16 && (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        } else {
            return;
        }
    }
}