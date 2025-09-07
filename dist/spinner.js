"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const browser_1 = require("./browser");
/**
 * This is a simple spinner that you can use to indicate that the application is busy.
 * You can define the spinner's appearance in the CSS class "spinner". No need to do anything more.
 */
class SpinnerClass {
    constructor(spinnerElement = undefined) {
        this.spinnerElement = spinnerElement;
        this.counter = 0;
        if (this.spinnerElement)
            return;
        this.spinnerElement = document.body.getElementsByClassName('spinner')[0];
        if (!this.spinnerElement) {
            this.spinnerElement = document.createElement('div');
            this.spinnerElement.className = 'spinner';
            document.body.appendChild(this.spinnerElement);
        }
    }
    get spinner() {
        return this.spinnerElement;
    }
    show() {
        this.counter++;
        const s = this.spinner;
        if (s)
            s.style.visibility = 'visible';
    }
    hide() {
        if (--this.counter > 0)
            return;
        const s = this.spinner;
        if (s)
            s.style.visibility = 'hidden';
    }
}
exports.Spinner = browser_1.browser ? new SpinnerClass() : undefined;
