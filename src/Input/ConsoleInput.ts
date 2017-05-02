import InputInterface from './InputInterface'

/**
 * This is pretty much a dummy class.
 * 
 * It allows for enabling or disabling "interactive" mode to prevent questions.
 */
export default class ConsoleInput implements InputInterface {
  private interactive: boolean = true

  public isInteractive () {
    return this.interactive
  }

  public setInteractive (interactive: boolean) {
    this.interactive = interactive
  }
}
