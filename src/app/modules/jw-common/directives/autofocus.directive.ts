import { Directive, ElementRef, Renderer, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[autofocus]'
})
export class Autofocus implements AfterViewInit {
    constructor(private el: ElementRef, private renderer: Renderer) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.renderer.invokeElementMethod(this.el.nativeElement, 'focus', []);
    }
}