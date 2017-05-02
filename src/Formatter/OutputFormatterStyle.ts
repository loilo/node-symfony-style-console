import OutputFormatterStyleInterface from './OutputFormatterStyleInterface'
import { arrContains } from '../Helper/Helper'

/**
 * Represents an object literal with ANSI *set* and *unset* codes
 */
export interface AnsiCodeConfig {
  set: number
  unset: number
}

/**
 * Available color names
 */
export type ColorName = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'default'

/**
 * Represents an object literal with [[ColorName]] keys and [[AnsiCodeConfig]] values.
 */
export type StyleColorSet = { [key in ColorName]: AnsiCodeConfig }

/**
* Available style options
*/
export type OptionName = 'bold' | 'underscore' | 'blink' | 'reverse' | 'dim' | 'conceal'

/**
 * Represents an object literal with [[OptionName]] keys and [[AnsiCodeConfig]] values.
 */
export type StyleOptionsSet = { [key in OptionName]: AnsiCodeConfig }

/**
 * Represents an object literal with supported ANSI codes.
 */
export type StyleSet = StyleColorSet | StyleOptionsSet

/**
 * Formatter style class for defining styles.
 * 
 * 
 * @author Florian Reuschel <florian@loilo.de>
 * 
 * Port to TypeScript
 * 
 */
export default class OutputFormatterStyle implements OutputFormatterStyleInterface {
  /**
   * The ANSI escape sequences for available foreground colors.
   */
  private static availableForegroundColors: StyleColorSet = {
    black: { set: 30, unset: 39 },
    red: { set: 31, unset: 39 },
    green: { set: 32, unset: 39 },
    yellow: { set: 33, unset: 39 },
    blue: { set: 34, unset: 39 },
    magenta: { set: 35, unset: 39 },
    cyan: { set: 36, unset: 39 },
    white: { set: 37, unset: 39 },
    default: { set: 39, unset: 39 }
  }

  /**
   * The ANSI escape sequences for available background colors.
   */
  private static availableBackgroundColors: StyleColorSet = {
    black: { set: 40, unset: 49 },
    red: { set: 41, unset: 49 },
    green: { set: 42, unset: 49 },
    yellow: { set: 43, unset: 49 },
    blue: { set: 44, unset: 49 },
    magenta: { set: 45, unset: 49 },
    cyan: { set: 46, unset: 49 },
    white: { set: 47, unset: 49 },
    default: { set: 49, unset: 49 }
  }

  /**
   * The ANSI escape sequences for available style options.
   */
  private static availableOptions: StyleOptionsSet = {
    bold: { set: 1, unset: 22 },
    underscore: { set: 4, unset: 24 },
    blink: { set: 5, unset: 25 },
    reverse: { set: 7, unset: 27 },
    dim: { set: 2, unset: 22 },
    conceal: { set: 8, unset: 28 }
  }

  /**
   * The chosen foreground color escape sequences.
   */
  private foreground: AnsiCodeConfig

  /**
   * The chosen background color escape sequences.
   */
  private background: AnsiCodeConfig

  /**
   * The enabled style options escape sequences.
   */
  private options: AnsiCodeConfig[] = []

  /**
   * Initializes output formatter style.
   *
   * @param foreground The style foreground color name
   * @param background The style background color name
   * @param options    The style options
   */
  public constructor (foreground: ColorName = null, background: ColorName = null, options: OptionName[] = []) {
    if (null !== foreground) {
      this.setForeground(foreground)
    }
    if (null !== background) {
      this.setBackground(background)
    }

    if (options.length) {
      this.setOptions(options)
    }
  }

  /**
   * Sets style foreground color.
   *
   * @param color The color name
   *
   * @throws `ReferenceError` if the color name is not available
   */
  public setForeground (color: ColorName = null) {
    if (null === color) {
      this.foreground = null

      return
    }

    if (!OutputFormatterStyle.availableForegroundColors[color]) {
      throw new ReferenceError(`Invalid foreground color specified: "${color}". \
Expected one of (${Object.keys(OutputFormatterStyle.availableForegroundColors).join(', ')})`)
    }

    this.foreground = OutputFormatterStyle.availableForegroundColors[color]
  }

  /**
   * Sets style background color.
   *
   * @param color The color name
   *
   * @throws `ReferenceError` if the color name is not available
   */
  public setBackground (color: ColorName = null) {
    if (null === color) {
      this.background = null

      return
    }

    if (!OutputFormatterStyle.availableBackgroundColors[color]) {
      throw new ReferenceError(`Invalid background color specified: "${color}". \
Expected one of (${Object.keys(OutputFormatterStyle.availableBackgroundColors).join(', ')})`)
    }

    this.background = OutputFormatterStyle.availableBackgroundColors[color]
  }

  /**
   * Sets some specific style option.
   *
   * @param option The option name
   *
   * @throws `ReferenceError` if the option name is not available
   */
  public setOption (option: OptionName) {
    if (!OutputFormatterStyle.availableOptions[option]) {
      throw new ReferenceError(`Invalid option specified: "${option}". \
Expected one of (${Object.keys(OutputFormatterStyle.availableOptions).join(', ')})`)
    }

    if (!arrContains(this.options, OutputFormatterStyle.availableOptions[option])) {
      this.options.push(OutputFormatterStyle.availableOptions[option]);
    }
  }

  /**
   * Unsets some specific style option.
   *
   * @param string option The option name
   *
   * @throws `ReferenceError` if the option name is not available
   */
  public unsetOption (option: OptionName) {
    if (!OutputFormatterStyle.availableOptions[option]) {
      throw new ReferenceError(`Invalid option specified: "${option}". \
Expected one of (${Object.keys(OutputFormatterStyle.availableOptions).join(', ')})`)
    }

    this.options = this.options.filter(setOption => setOption !== OutputFormatterStyle.availableOptions[option])
  }

  /**
   * Sets multiple style options at once.
   *
   * @param The style options to enable
   */
  public setOptions (options: OptionName[]) {
    this.options = []

    for (const option of options) {
      this.setOption(option)
    }
  }

  /**
   * Applies the style to a given text.
   *
   * @param The text to style
   * @return The formatted text
   */
  public apply (text: string) {
    const setCodes = []
    const unsetCodes = []

    if (null != this.foreground) {
      setCodes.push(this.foreground.set)
      unsetCodes.push(this.foreground.unset)
    }
    if (null != this.background) {
      setCodes.push(this.background.set)
      unsetCodes.push(this.background.unset)
    }
    if (this.options.length) {
      for (const option of this.options) {
        setCodes.push(option.set)
        unsetCodes.push(option.unset)
      }
    }

    if (!setCodes.length) {
      return text
    }

    return `\u001b[${setCodes.join(';')}m${text}\u001b[${unsetCodes.join(';')}m`
  }
}
