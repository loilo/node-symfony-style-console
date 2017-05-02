import OutputFormatterStyle from './OutputFormatterStyle'
import OutputFormatterStyleInterface from './OutputFormatterStyleInterface'

/**
 * Manages nesting of [[OutputFormatterStyleInterface]] styles.
 * 
 * 
 * @author Jean-François Simon <contact@jfsimon.fr>
 * 
 * Original PHP class
 * 
 * @author Florian Reuschel <florian@loilo.de>
 * 
 * Port to TypeScript
 * 
 */
class OutputFormatterStyleStack {
  private styles: OutputFormatterStyleInterface[]
  private emptyStyle: OutputFormatterStyleInterface

  /**
   * Constructor.
   *
   * @param emptyStyle
   */
  public constructor (emptyStyle: OutputFormatterStyleInterface = null) {
    this.emptyStyle = emptyStyle || new OutputFormatterStyle()
    this.reset()
  }

  /**
   * Resets stack (ie. empty internal arrays).
   */
  public reset () {
    this.styles = []
  }

  /**
   * Pushes a style in the stack.
   *
   * @param style
   */
  public push (style: OutputFormatterStyleInterface) {
    this.styles.push(style)
  }

  /**
   * Pops a style from the stack.
   *
   * @param OutputFormatterStyle|null style
   *
   * @return OutputFormatterStyle
   *
   * @throws InvalidArgumentException When style tags incorrectly nested
   */
  public pop (style: OutputFormatterStyleInterface = null) {
    if (!this.styles.length) {
      return this.emptyStyle
    }

    if (null === style) {
      return this.styles.pop()
    }

    for (let index = this.styles.length - 1; index >= 0; index--) {
      const stackedStyle = this.styles[index]

      if (style.apply('') === stackedStyle.apply('')) {
        this.styles = this.styles.slice(0, index)

        return stackedStyle
      }
    }

    throw new SyntaxError('Incorrectly nested style tag found.')
  }

  /**
   * Computes current style with stacks top codes.
   *
   * @return OutputFormatterStyle
   */
  public getCurrent () {
    if (!this.styles.length) {
      return this.emptyStyle
    }

    return this.styles[this.styles.length - 1]
  }

  /**
   * @param emptyStyle
   * @return this
   */
  public setEmptyStyle (emptyStyle: OutputFormatterStyleInterface) {
    this.emptyStyle = emptyStyle

    return this
  }

  /**
   * @return OutputFormatterStyle
   */
  public getEmptyStyle () {
    return this.emptyStyle
  }
}

export default OutputFormatterStyleStack
