import OutputFormatterStyle, {
  ColorName,
  OptionName
} from './OutputFormatterStyle'
import OutputFormatterStyleStack from './OutputFormatterStyleStack'
import OutputFormatterInterface from './OutputFormatterInterface'
import OutputFormatterStyleInterface from './OutputFormatterStyleInterface'

import { trimEnd, safeReplace } from '../Helper/Helper'

/**
 * Represents an object literal with [[OutputFormatterStyleInterface]] values mapped to their respective names.
 */
export interface OutputFormatterStyleInterfaceCollection {
  [s: string]: OutputFormatterStyleInterface
}

/**
 * Formatter class for console output.
 *
 *
 * @author Konstantin Kudryashov <ever.zet@gmail.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 */
export default class OutputFormatter implements OutputFormatterInterface {
  /**
   * Indicates whether the output may contain ANSI control characters.
   */
  private decorated: boolean

  /**
   * A mapping of formatter style names to their respective classes.
   */
  private styles: OutputFormatterStyleInterfaceCollection = {}

  /**
   * The stack manager used for nesting styles.
   */
  private styleStack: OutputFormatterStyleStack

  /**
   * Initializes console output formatter.
   *
   * @param decorated Whether this formatter should actually decorate strings
   * @param styles    Object mappping names to [[OutputFormatterStyleInterface]] instances
   */
  public constructor(
    decorated: boolean = false,
    styles: OutputFormatterStyleInterfaceCollection = {}
  ) {
    this.decorated = !!decorated

    this.setStyle('error', new OutputFormatterStyle('white', 'red'))
    this.setStyle('info', new OutputFormatterStyle('green'))
    this.setStyle('comment', new OutputFormatterStyle('yellow'))
    this.setStyle('question', new OutputFormatterStyle('black', 'cyan'))

    for (const name in styles) {
      this.setStyle(name, styles[name])
    }

    this.styleStack = new OutputFormatterStyleStack()
  }

  /**
   * Escapes the "<" special char in given text.
   *
   * @param text Text to escape
   * @return Escaped text
   */
  public static escape(text: string) {
    text = text.replace(/([^\\]?)</g, '$1\\<')

    return OutputFormatter.escapeTrailingBackslash(text)
  }

  /**
   * Escapes trailing backslash "\" in given text.
   *
   * @param text Text to escape
   * @return Escaped text
   *
   * @internal
   */
  public static escapeTrailingBackslash(text: string) {
    if ('\\' === text.slice(-1)) {
      const len = text.length
      text = trimEnd(text, '\\')
      text += '<<'.repeat(len - text.length)
    }

    return text
  }

  /**
   * Creates a new instance containing the same `decorated` flag and styles.
   *
   * @return The cloned [[OutputFormatter]] instance
   */
  public clone() {
    return new OutputFormatter(
      this.isDecorated(),
      Object.assign({}, this.styles)
    )
  }

  /**
   * Sets the `decorated` flag property.
   *
   * @param decorated Whether to decorate the messages or not
   */
  public setDecorated(decorated: boolean): void {
    this.decorated = !!decorated
  }

  /**
   * Gets the `decorated` flag property.
   *
   * @return True if the output will decorate messages, false otherwise
   */
  public isDecorated(): boolean {
    return this.decorated
  }

  /**
   * Sets a new style.
   *
   * @param name  The style name
   * @param style The style instance
   */
  public setStyle(name: string, style: OutputFormatterStyleInterface) {
    this.styles[name.toLowerCase()] = style
  }

  /**
   * Checks if output formatter has style with specified name.
   *
   * @param string name
   * @return bool
   */
  public hasStyle(name: string) {
    return !!this.styles[name.toLowerCase()]
  }

  /**
   * Gets style options from style with specified name.
   *
   * @param name
   * @return The style
   *
   * @throws ReferenceError When style isn't defined
   */
  public getStyle(name: string): OutputFormatterStyleInterface {
    if (!this.hasStyle(name)) {
      throw new ReferenceError(`Undefined style: ${name}`)
    }

    return this.styles[name.toLowerCase()]
  }

  /**
   * Formats a message according to the given styles.
   *
   * @param message The message to style
   *
   * @return The styled message
   */
  public format(message: string) {
    message = String(message)
    let offset = 0
    let output = ''
    const tagRegex = '[a-z][a-z0-9,_=;-]*'
    const tagsRegex = new RegExp(`<((${tagRegex})|\\/(${tagRegex})?)>`, 'gi')

    let match
    while ((match = tagsRegex.exec(message))) {
      const text = match[0]
      const pos = match.index

      if (0 != pos && '\\' == message[pos - 1]) {
        continue
      }

      // add the text up to the next tag
      output += this.applyCurrentStyle(message.substr(offset, pos - offset))
      offset = pos + text.length

      // opening tag?
      const open = '/' !== text[1]
      let tag
      if (open) {
        tag = match[1]
      } else {
        tag = match[3] || ''
      }

      const style = this.createStyleFromString(tag.toLowerCase())

      if (!open && !tag) {
        // </>
        this.styleStack.pop()
      } else if (false === style) {
        output += this.applyCurrentStyle(text)
      } else if (open) {
        this.styleStack.push(style)
      } else {
        this.styleStack.pop(style)
      }
    }

    output += this.applyCurrentStyle(message.slice(offset))

    if (-1 !== output.indexOf('<<')) {
      return safeReplace(output, {
        '\\<': '<',
        '<<': '\\'
      })
    }

    return output.replace(/\\</g, '<')
  }

  /**
   * Gets the used style stack.
   */
  public getStyleStack() {
    return this.styleStack
  }

  /**
   * Tries to create new [[OutputFormatterStyleInterface]] instance from string.
   *
   * @param str The string to create the formatter style from
   * @return `false` if `str` is not format string
   */
  private createStyleFromString(str: string) {
    if (this.styles[str]) {
      return this.styles[str]
    }

    const styleRegex = /([^=]+)=([^;]+)(;|$)/g
    const style = new OutputFormatterStyle()
    let gotMatch = false
    let match
    while ((match = styleRegex.exec(str))) {
      gotMatch = true

      if ('fg' == match[1]) {
        style.setForeground(match[2] as ColorName)
      } else if ('bg' == match[1]) {
        style.setBackground(match[2] as ColorName)
      } else if ('options' === match[1]) {
        const options = Array.from(match[2].match(/([^,;]+)/g))
        for (const option of options) {
          try {
            style.setOption(option as OptionName)
          } catch (e) {
            console.warn(`Unknown style options are deprecated since version 3.2 \
and will be removed in 4.0. Error "${e}".`)

            return false
          }
        }
      } else {
        return false
      }
    }

    if (gotMatch) {
      return style
    } else {
      return false
    }
  }

  /**
   * Applies current style from stack to text, if must be applied.
   *
   * @param text The text to format
   * @return The formatted text
   */
  private applyCurrentStyle(text: string) {
    return this.isDecorated() && text.length > 0
      ? this.styleStack.getCurrent().apply(text)
      : text
  }
}
