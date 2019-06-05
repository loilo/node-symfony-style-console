import OutputFormatter from '../Formatter/OutputFormatter'
import OutputFormatterInterface from '../Formatter/OutputFormatterInterface'
import OutputInterface, {
  OutputOptions,
  VERBOSITY_LEVEL,
  VERBOSITY_QUIET,
  VERBOSITY_NORMAL,
  VERBOSITY_VERBOSE,
  VERBOSITY_VERY_VERBOSE,
  VERBOSITY_DEBUG,
  OUTPUT_NORMAL,
  OUTPUT_RAW,
  OUTPUT_PLAIN
} from './OutputInterface'

import { stripTags } from '../Helper/Helper'

/**
 * Base class for output classes.
 *
 * There are five levels of verbosity:
 *
 *  * normal: no option passed (normal output)
 *  * verbose: `-v` (more output)
 *  * very verbose: `-vv` (highly extended output)
 *  * debug: `-vvv` (all debug output)
 *  * quiet: `-q` (no output)
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 */
abstract class Output implements OutputInterface {
  private formatter: OutputFormatterInterface
  private verbosity: VERBOSITY_LEVEL

  public constructor(
    verbosity: VERBOSITY_LEVEL = VERBOSITY_NORMAL,
    decorated: boolean = false,
    formatter: OutputFormatterInterface = null
  ) {
    this.verbosity = verbosity
    this.formatter = formatter || new OutputFormatter()
    this.formatter.setDecorated(decorated)
  }

  /**
   * Sets the decorated flag.
   *
   * @param decorated Whether to decorate the messages
   */
  public setDecorated(decorated: boolean) {
    this.formatter.setDecorated(decorated)
  }

  /**
   * Gets the decorated flag.
   *
   * @return boolean true if the output will decorate messages, false otherwise
   */
  public isDecorated() {
    return this.formatter.isDecorated()
  }

  /**
   * Sets output formatter.
   *
   * @param formatter
   */
  public setFormatter(formatter: OutputFormatterInterface) {
    this.formatter = formatter
  }

  /**
   * Returns current output formatter instance.
   */
  public getFormatter() {
    return this.formatter
  }

  /**
   * Sets the verbosity of the output.
   *
   * @param number level The level of verbosity (one of the VERBOSITY constants)
   */
  public setVerbosity(level: VERBOSITY_LEVEL) {
    this.verbosity = level
  }

  /**
   * Gets the current verbosity of the output.
   *
   * @return number The current level of verbosity (one of the VERBOSITY constants)
   */
  public getVerbosity() {
    return this.verbosity
  }

  /**
   * Returns whether verbosity is quiet (-q).
   *
   * @return bool true if verbosity is set to VERBOSITY_QUIET, false otherwise
   */
  public isQuiet() {
    return VERBOSITY_QUIET === this.verbosity
  }

  /**
   * Returns whether verbosity is verbose (-v).
   *
   * @return bool true if verbosity is set to VERBOSITY_VERBOSE, false otherwise
   */
  public isVerbose() {
    return VERBOSITY_VERBOSE === this.verbosity
  }

  /**
   * Returns whether verbosity is very verbose (-vv).
   *
   * @return bool true if verbosity is set to VERBOSITY_VERY_VERBOSE, false otherwise
   */
  public isVeryVerbose() {
    return VERBOSITY_VERY_VERBOSE === this.verbosity
  }

  /**
   * Returns whether verbosity is debug (-vvv).
   *
   * @return bool true if verbosity is set to VERBOSITY_DEBUG, false otherwise
   */
  public isDebug() {
    return VERBOSITY_DEBUG === this.verbosity
  }

  /**
   * Writes a message to the output and adds a newline at the end.
   *
   * @param messages The message as an array of lines of a single string
   * @param options  A bitmask of options (one of the OUTPUT or VERBOSITY constants),
   * 0 is considered the same as OUTPUT_NORMAL | VERBOSITY_NORMAL
   */
  public writeln(
    messages: string | string[],
    options: OutputOptions = OUTPUT_NORMAL
  ) {
    this.write(messages, true, options)
  }

  /**
   * Writes a message to the output.
   *
   * @param messages The message as an array of lines or a single string
   * @param newline  Whether to add a newline
   * @param options  A bitmask of options (one of the OUTPUT or VERBOSITY constants),
   * 0 is considered the same as OUTPUT_NORMAL | VERBOSITY_NORMAL
   */
  public write(
    messages: string | string[],
    newline: boolean = false,
    options: OutputOptions = OUTPUT_NORMAL
  ) {
    if (!Array.isArray(messages)) messages = [messages]

    const types = OUTPUT_NORMAL | OUTPUT_RAW | OUTPUT_PLAIN
    const type = types & options || OUTPUT_NORMAL

    const verbosities =
      VERBOSITY_QUIET |
      VERBOSITY_NORMAL |
      VERBOSITY_VERBOSE |
      VERBOSITY_VERY_VERBOSE |
      VERBOSITY_DEBUG
    const verbosity = verbosities & options || VERBOSITY_NORMAL

    if (verbosity > this.getVerbosity()) {
      return
    }

    for (let message of messages) {
      switch (type) {
        case OUTPUT_NORMAL:
          message = this.formatter.format(message)
          break

        case OUTPUT_RAW:
          break

        case OUTPUT_PLAIN:
          message = stripTags(this.formatter.format(message))
          break
      }

      this.doWrite(message, newline)
    }
  }

  /**
   * Writes a message to the output.
   *
   * @param message A message to write to the output
   * @param newline Whether to add a newline or not
   */
  protected abstract doWrite(message: string, newline: boolean): void
}

export default Output
