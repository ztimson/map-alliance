import {animate, state, style, transition, trigger} from "@angular/animations";

const defaultTiming = '200ms';

export const collapse = trigger('collapse', [
    transition(':leave', [
        style({height: '*'}),
        animate(defaultTiming, style({height: '0'}))
    ])
]);

export const expand = trigger('expand', [
    transition(':enter', [
        style({height: '0'}),
        animate(defaultTiming, style({height: '*'}))
    ])
]);

export const fadeIn = trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate(defaultTiming, style({ opacity: 1 }))
    ])
]);

export const fadeOut = trigger('fadeOut', [
    transition(':leave', [
        style({ opacity: 1 }),
        animate(1500, style({ opacity: 0 }))
    ])
]);

export const flyInRight = trigger('flyInRight', [
    transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate(defaultTiming, style({transform: 'translateX(0%)'}))
    ])
]);

export const flyOutRight = trigger('flyOutRight', [
    transition(':leave', [
        style({transform: 'translateX(0%)'}),
        animate(defaultTiming, style({transform: 'translateX(100%)'}))
    ])
]);

export const flyInTop = trigger('flyInTop', [
    transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate(defaultTiming, style({transform: 'translateY(0%)'}))
    ])
]);

export const flyOutTop = trigger('flyOutTop', [
    transition(':leave', [
        style({transform: 'translateY(0%)'}),
        animate(defaultTiming, style({transform: 'translateY(-100%)'}))
    ])
]);

export const rotate = trigger('rotate', [
    state('up', style({transform: 'rotate(0deg)'})),
    state('right', style({transform: 'rotate(90deg)'})),
    state('down', style({transform: 'rotate(180deg)'})),
    state('left', style({transform: 'rotate(270deg)'})),
    transition('* => *', [animate(defaultTiming)])
]);
