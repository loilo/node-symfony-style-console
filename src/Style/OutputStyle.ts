import { EOL } from '../env'
import { StringHash } from '../Helper/Helper'
import ConsoleOutput from '../Output/ConsoleOutput'
import { OUTPUT_NORMAL } from '../Output/OutputInterface'
import OutputInterface, {
  VERBOSITY_LEVEL,
  OutputOptions
} from '../Output/OutputInterface'
import OutputFormatterInterface from '../Formatter/OutputFormatterInterface'
import { TableCellInput, TableRowInput } from '../Helper/TableCellInterface'

import StyleInterface from './StyleInterface'

import ProgressBar from '../Helper/ProgressBar'

/**
 * Decorates output to add console style guide helpers.
 *
 * @author Kevin Bond <kevinbond@gmail.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 */
abstract class OutputStyle implements OutputInterface, StyleInterface {
  /**
   * The output to style.
   */
  private output: OutputInterface

  /**
   * Create an OutputStyle instance.
   *
   * @param output The output to style
   */
  public constructor(output: OutputInterface = new ConsoleOutput()) {
    this.output = output
  }

  /**
   * {@inheritdoc}
   */
  public abstract title(message: string): void

  /**
   * {@inheritdoc}
   */
  public abstract section(message: string): void

  /**
   * {@inheritdoc}
   */
  public abstract listing(elements: string[]): void

  /**
   * {@inheritdoc}
   */
  public abstract text(message: string | string[]): void

  /**
   * {@inheritdoc}
   */
  public abstract success(message: string | string[]): void

  /**
   * {@inheritdoc}
   */
  public abstract error(message: string | string[]): void

  /**
   * {@inheritdoc}
   */
  public abstract warning(message: string | string[]): void

  /**
   * {@inheritdoc}
   */
  public abstract note(message: string | string[]): void

  /**
   * {@inheritdoc}
   */
  public abstract caution(message: string | string[]): void

  /**
   * {@inheritdoc}
   */
  public abstract table(
    headers: TableCellInput[] | TableCellInput[][],
    rows: TableRowInput[]
  ): void

  /**
   * {@inheritdoc}
   */
  public abstract ask(
    question: string,
    defaultValue?: string,
    validator?: (...args: any[]) => boolean
  ): Promise<string>

  /**
   * {@inheritdoc}
   */
  public abstract askHidden(
    question: string,
    validator?: (...args: any[]) => boolean
  ): Promise<string>

  /**
   * {@inheritdoc}
   */
  public abstract confirm(
    question: string,
    defaultValue?: boolean
  ): Promise<boolean>

  /**
   * {@inheritdoc}
   */
  public abstract choice(
    question: string,
    choices: StringHash,
    defaultValue?: string | number
  ): Promise<string | number>

  /**
   * {@inheritdoc}
   */
  public abstract progressStart(max?: number): void

  /**
   * {@inheritdoc}
   */
  public abstract progressAdvance(step?: number): void

  /**
   * {@inheritdoc}
   */
  public abstract progressSet(step: number): void

  /**
   * {@inheritdoc}
   */
  public abstract progressFinish(): void

  /**
   * Add newline(s).
   *
   * @param number count The number of newlines
   */
  public newLine(count = 1) {
    this.output.write(EOL.repeat(count))
  }

  /**
   * @param number max
   *
   * @return ProgressBar
   */
  protected createProgressBar(max = 0) {
    return new ProgressBar(this.output, max)
  }

  /**
   * Writes a message to the output.
   *
   * @param messages The message as an array of lines or a single string
   * @param newline  Whether to add a newline
   * @param type     A bitmask of options (one of the OUTPUT or VERBOSITY constants),
   * 0 is considered the same as OUTPUT_NORMAL | VERBOSITY_NORMAL
   */
  public write(
    messages: string | string[],
    newline: boolean = false,
    type: OutputOptions = OUTPUT_NORMAL
  ) {
    this.output.write(messages, newline, type)
  }

  /**
   * Writes a message to the output and adds a newline at the end.
   *
   * @param messages The message as an array of lines of a single string
   * @param type     A bitmask of options (one of the OUTPUT or VERBOSITY constants),
   * 0 is considered the same as OUTPUT_NORMAL | VERBOSITY_NORMAL
   */
  public writeln(
    messages: string | string[],
    type: OutputOptions = OUTPUT_NORMAL
  ) {
    this.output.write(messages, true, type)
  }

  /**
   * Sets the verbosity of the output.
   *
   * @param level The level of verbosity (one of the [[VERBOSITY_LEVEL]] constants)
   */
  public setVerbosity(level: VERBOSITY_LEVEL) {
    this.output.setVerbosity(level)
  }

  /**
   * Gets the current verbosity of the output.
   *
   * @return number The current level of verbosity (one of the [[VERBOSITY_LEVEL]] constants)
   */
  public getVerbosity() {
    return this.output.getVerbosity()
  }

  /**
   * Sets the decorated flag.
   *
   * @param decorated Whether to decorate the messages
   */
  public setDecorated(decorated: boolean) {
    this.output.setDecorated(decorated)
  }

  /**
   * Gets the decorated flag.
   *
   * @return True if the output will decorate messages, false otherwise
   */
  public isDecorated() {
    return this.output.isDecorated()
  }

  /**
   * Sets output formatter.
   *
   * @param The formatter to use
   */
  public setFormatter(formatter: OutputFormatterInterface) {
    this.output.setFormatter(formatter)
  }

  /**
   * Returns current output formatter instance.
   */
  public getFormatter() {
    return this.output.getFormatter()
  }

  /**
   * Returns whether verbosity is quiet (-q).
   *
   * @return True if verbosity is set to [[VERBOSITY_QUIET]], false otherwise
   */
  public isQuiet() {
    return this.output.isQuiet()
  }

  /**
   * Returns whether verbosity is verbose (-v).
   *
   * @return True if verbosity is set to [[VERBOSITY_VERBOSE]], false otherwise
   */
  public isVerbose() {
    return this.output.isVerbose()
  }

  /**
   * Returns whether verbosity is very verbose (-vv).
   *
   * @return True if verbosity is set to [[VERBOSITY_VERY_VERBOSE]], false otherwise
   */
  public isVeryVerbose() {
    return this.output.isVeryVerbose()
  }

  /**
   * Returns whether verbosity is debug (-vvv).
   *
   * @return True if verbosity is set to [[VERBOSITY_DEBUG]], false otherwise
   */
  public isDebug() {
    return this.output.isDebug()
  }
}

export default OutputStyle
