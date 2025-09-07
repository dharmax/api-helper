/**
 * This is a simple spinner that you can use to indicate that the application is busy.
 * You can define the spinner's appearance in the CSS class "spinner". No need to do anything more.
 */
declare class SpinnerClass {
    private readonly spinnerElement;
    private counter;
    constructor(spinnerElement?: HTMLElement | undefined);
    get spinner(): HTMLElement | undefined;
    show(): void;
    hide(): void;
}
export declare const Spinner: SpinnerClass | undefined;
export {};
