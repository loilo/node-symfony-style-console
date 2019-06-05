import OutputFormatterInterface from '../Formatter/OutputFormatterInterface'

/**
 * All available output options. May be combined as a bitmask.
 */
export enum OutputOptions {
  VERBOSITY_QUIET = 16,
  VERBOSITY_NORMAL = 32,
  VERBOSITY_VERBOSE = 64,
  VERBOSITY_VERY_VERBOSE = 128,
  VERBOSITY_DEBUG = 256,

  OUTPUT_NORMAL = 1,
  OUTPUT_RAW = 2,
  OUTPUT_PLAIN = 4
}

/**
 * Output with this option will be formatted.
 */
export const OUTPUT_NORMAL = 1

/**
 * Output with this option will be passed as-is.
 */
export const OUTPUT_RAW = 2

/**
 * Output with this option will have any formatting stripped away.
 */
export const OUTPUT_PLAIN = 4

/**
 * Output with this verbosity won't write anyting at all.
 */
export const VERBOSITY_QUIET = 16

/**
 * Output with this verbosity will write default content.
 */
export const VERBOSITY_NORMAL = 32

/**
 * Output with this verbosity will be more detailed.
 */
export const VERBOSITY_VERBOSE = 64

/**
 * Output with this verbosity will be super detailed.
 */
export const VERBOSITY_VERY_VERBOSE = 128

/**
 * Output with this verbosity will reveal internals.
 */
export const VERBOSITY_DEBUG = 256

/**
 * Any of the output types [[OUTPUT_NORMAL]], [[OUTPUT_RAW]] and [[OUTPUT_PLAIN]].
 */
export type OUTPUT_TYPE = 1 | 2 | 4

/**
 * Any of the verbosity types [[VERBOSITY_QUIET]], [[VERBOSITY_NORMAL]], [[VERBOSITY_VERBOSE]], [[VERBOSITY_VERY_VERBOSE]] nad [[VERBOSITY_DEBUG]].
 */
export type VERBOSITY_LEVEL = 16 | 32 | 64 | 128 | 256

/**
 * OutputInterface is the interface implemented by all [[Output]] classes.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript.
 *
 */
interface OutputInterface {
  /**
   * Writes a message to the output.
   *
   * @param messages The message as an array of lines or a single string
   * @param newline  Whether to add a newline
   * @param options  A bitmask of options (one of the OUTPUT or VERBOSITY constants),
   * 0 is considered the same as OUTPUT_NORMAL | VERBOSITY_NORMAL
   */
  write(
    messages: string | string[],
    newline?: boolean,
    options?: OutputOptions
  ): void

  /**
   * Writes a message to the output and adds a newline at the end.
   *
   * @param messages The message as an array of lines of a single string
   * @param options  A bitmask of options (one of the OUTPUT or VERBOSITY constants),
   * 0 is considered the same as OUTPUT_NORMAL | VERBOSITY_NORMAL
   */
  writeln(messages: string | string[], options?: OutputOptions): void

  /**
   * Sets the verbosity of the output.
   *
   * @param level The level of verbosity (one of the VERBOSITY constants)
   */
  setVerbosity(level: VERBOSITY_LEVEL): void

  /**
   * Gets the current verbosity of the output.
   *
   * @return The current level of verbosity (one of the VERBOSITY constants)
   */
  getVerbosity(): VERBOSITY_LEVEL

  /**
   * Returns whether verbosity is quiet (-q).
   *
   * @return True if verbosity is set to VERBOSITY_QUIET, false otherwise
   */
  isQuiet(): boolean

  /**
   * Returns whether verbosity is verbose (-v).
   *
   * @return True if verbosity is set to VERBOSITY_VERBOSE, false otherwise
   */
  isVerbose(): boolean

  /**
   * Returns whether verbosity is very verbose (-vv).
   *
   * @return True if verbosity is set to VERBOSITY_VERY_VERBOSE, false otherwise
   */
  isVeryVerbose(): boolean

  /**
   * Returns whether verbosity is debug (-vvv).
   *
   * @return True if verbosity is set to VERBOSITY_DEBUG, false otherwise
   */
  isDebug(): boolean

  /**
   * Sets the decorated flag.
   *
   * @param decorated Whether to decorate the messages
   */
  setDecorated(decorated: boolean): void

  /**
   * Gets the decorated flag.
   *
   * @return True if the output will decorate messages, false otherwise
   */
  isDecorated(): boolean

  /**
   * Sets output formatter.
   *
   * @param formatter
   */
  setFormatter(formatter: OutputFormatterInterface): void

  /**
   * Returns current output formatter instance.
   *
   * @return OutputFormatterInterface
   */
  getFormatter(): OutputFormatterInterface
}

export default OutputInterface
