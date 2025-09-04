import {browser} from './browser'

/**
 * This is a simple spinner that you can use to indicate that the application is busy.
 * You can define the spinner's appearance in the CSS class "spinner". No need to do anything more.
 */
class SpinnerClass {

    private counter = 0

    constructor(private readonly spinnerElement: HTMLElement | undefined = undefined) {
        if (this.spinnerElement)
            return
        this.spinnerElement = document.body.getElementsByClassName('spinner')[0] as HTMLElement
        if (!this.spinnerElement) {
            this.spinnerElement = document.createElement('div') as HTMLElement
            this.spinnerElement.className = 'spinner'
            document.body.appendChild(this.spinnerElement)
        }
    }

    get spinner() {
        return this.spinnerElement
    }

    show() {
        this.counter++
        const s = this.spinner
        if (s)
            s.style.visibility = 'visible'
    }

    hide() {
        if (--this.counter > 0)
            return
        const s = this.spinner
        if (s)
            s.style.visibility = 'hidden'
    }
}

export const Spinner = browser ? new SpinnerClass() : undefined