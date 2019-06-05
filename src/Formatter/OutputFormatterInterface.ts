import OutputFormatterStyleInterface from './OutputFormatterStyleInterface'

/**
 * Formatter interface for console output.
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
interface OutputFormatterInterface {
  clone(): OutputFormatterInterface

  /**
   * Sets the decorated flag.
   *
   * @param bool $decorated Whether to decorate the messages or not
   */
  setDecorated(decorated: boolean): void

  /**
   * Gets the decorated flag.
   *
   * @return bool true if the output will decorate messages, false otherwise
   */
  isDecorated(): boolean

  /**
   * Sets a new style.
   *
   * @param string                        $name  The style name
   * @param OutputFormatterStyleInterface $style The style instance
   */
  setStyle(name: string, style: OutputFormatterStyleInterface): void

  /**
   * Checks if output formatter has style with specified name.
   *
   * @param string $name
   *
   * @return bool
   */
  hasStyle(name: string): boolean

  /**
   * Gets style options from style with specified name.
   *
   * @param string $name
   *
   * @return OutputFormatterStyleInterface
   */
  getStyle(name: string): OutputFormatterStyleInterface

  /**
   * Formats a message according to the given styles.
   *
   * @param string $message The message to style
   *
   * @return string The styled message
   */
  format(message: string): string
}

export default OutputFormatterInterface
