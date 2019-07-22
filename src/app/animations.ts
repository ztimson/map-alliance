import {animate, state, style, transition, trigger} from "@angular/animations";

const defaultTiming = '500ms';

export const collapse = (timings: string = defaultTiming) => trigger('collapse', [
    transition(':leave', [
        style({height: '*'}),
        animate(timings, style({height: '0'}))
    ])
]);

export const expand = (timings: string = defaultTiming) => trigger('expand', [
    transition(':enter', [
        style({height: '0'}),
        animate(timings, style({height: '*'}))
    ])
]);

export const fadeIn = (timings: string = defaultTiming) => trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate(timings, style({ opacity: 1 }))
    ])
]);

export const fadeOut = (timings: string = defaultTiming) => trigger('fadeOut', [
    transition(':leave', [
        style({ opacity: 1 }),
        animate(timings, style({ opacity: 0 }))
    ])
]);

export const flyInRight = (timings: string = defaultTiming) => trigger('flyInRight', [
    transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate(timings, style({transform: 'translateX(0%)'}))
    ])
]);

export const flyOutRight = (timings: string = defaultTiming) => trigger('flyOutRight', [
    transition(':leave', [
        style({transform: 'translateX(0%)'}),
        animate(timings, style({transform: 'translateX(100%)'}))
    ])
]);

export const flyInTop = (timings: string = defaultTiming) => trigger('flyInTop', [
    transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate(timings, style({transform: 'translateY(0%)'}))
    ])
]);

export const flyOutTop = (timings: string = defaultTiming) => trigger('flyOutTop', [
    transition(':leave', [
        style({transform: 'translateY(0%)'}),
        animate(timings, style({transform: 'translateY(-100%)'}))
    ])
]);

export const rotate = (timings: string = defaultTiming) => trigger('rotate', [
    state('up', style({transform: 'rotate(0deg)'})),
    state('right', style({transform: 'rotate(90deg)'})),
    state('down', style({transform: 'rotate(180deg)'})),
    state('left', style({transform: 'rotate(270deg)'})),
    transition('* => *', [animate(timings)])
]);
