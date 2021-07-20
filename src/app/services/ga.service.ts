import { Injectable } from '@angular/core';
declare var ga: Function;
@Injectable()
export class GaService {


    constructor() { }

   /**
   * Emit google analytics event
   * Fire event example:
   * this.emitEvent("testCategory", "testAction", "testLabel", 10);
   * @param {string} eventCategory
   * @param {string} eventAction
   * @param {string} eventLabel
   * @param {number} eventValue
   */
    public emitEvent(eventCategory: string,
        eventAction: string,
        eventLabel: string = null,
        eventValue: number = null) {
        ga('send', 'event', { eventCategory, eventLabel, eventAction, eventValue });
    }
}

