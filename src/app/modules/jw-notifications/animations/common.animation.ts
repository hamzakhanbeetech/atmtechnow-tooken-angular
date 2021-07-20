import { trigger, state, style, transition, animate } from '@angular/animations';

export const scale = trigger(
    'scale', [
        transition(':enter', [
            style({ transform: 'scale(0.8)', opacity: 0 }),
            animate('.32s .32s cubic-bezier(0.23, 1, 0.32, 1)', style({ transform: 'scale(1)', opacity: 1 }))
        ]),
        transition(':leave', [
            style({ transform: 'translateY(0)', opacity: 1 }),
            animate('.16s  cubic-bezier(0.23, 1, 0.32, 1)', style({ transform: 'translateY(-100px)', opacity: 0 }))
        ])
    ]);

export const layer = trigger(
    'layer', [
        transition(':enter', [
            style({ backgroundColor: 'transparent', opacity: 0 }),
            animate('.32s ease', style({ backgroundColor: 'rgba(0,0,0,0.7)', opacity: 1 }))
        ]),
        transition(':leave', [
            style({ backgroundColor: 'rgba(0,0,0,0.7)', opacity: 1 }),
            animate('.32s ease', style({ backgroundColor: 'transparent', opacity: 0 }))
        ])
    ])

export const slideup = trigger(
    'slideup', [
        transition(':enter', [
            style({ transform: 'translateY(50px)', opacity: 0 }),
            animate('.32s .16s cubic-bezier(0.23, 1, 0.32, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
            style({ transform: 'translateY(0)', opacity: 1 }),
            animate('1s ease', style({ transform: 'translateY(50px)', opacity: 0 }))
        ])
    ])
export const expand = trigger(
    'expand', [
        transition(':enter', [
            style({ 'max-height':0, opacity: 0 }),
            animate('.32s .16s cubic-bezier(0.23, 1, 0.32, 1)', style({ 'max-height':'auto', opacity: 1 }))
        ]),
        transition(':leave', [
            style({ transform: 'translateY(0)', opacity: 1 }),
            animate('1s ease', style({ transform: 'translateY(50px)', opacity: 0 }))
        ])
    ])