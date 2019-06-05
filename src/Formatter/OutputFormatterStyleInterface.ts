/**
 * Formatter style interface for defining styles.
 *
 *
 * @author Konstantin Kudryashov <ever.zet@gmail.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 *
 */
interface OutputFormatterStyleInterface {
  /**
   * Sets style foreground color.
   *
   * @param color The color name
   */
  setForeground(color: string): void

  /**
   * Sets style background color.
   *
   * @param color The color name
   */
  setBackground(color: string): void

  /**
   * Sets some specific style option.
   *
   * @param option The option name
   */
  setOption(option: string): void

  /**
   * Unsets some specific style option.
   *
   * @param option The option name
   */
  unsetOption(option: string): void

  /**
   * Sets multiple style options at once.
   *
   * @param options
   */
  setOptions(options: string[]): void

  /**
   * Applies the style to a given text.
   *
   * @param text The text to style
   * @return Styled text
   */
  apply(text: string): string
}

export default OutputFormatterStyleInterface
