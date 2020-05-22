import OutputInterface, {
  VERBOSITY_LEVEL,
  VERBOSITY_NORMAL
} from './OutputInterface'
import OutputFormatterInterface from '../Formatter/OutputFormatterInterface'
import StreamOutput from './StreamOutput'

/**
 * `ConsoleOutput` is the default class for all CLI output. It uses `stdout` and `stderr`.
 *
 * This class is a convenient wrapper around [[StreamOutput]] for both `stdout` and `stderr`.
 *
 * ```
 * const output = new ConsoleOutput()
 * ```
 *
 * This is equivalent to:
 *
 * ```
 * const output = new StreamOutput(process.stdout)
 * const stdErr = new StreamOutput(process.stderr)
 * ```
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 *
 */
export default class ConsoleOutput extends StreamOutput {
  private stderr: OutputInterface

  public constructor(
    verbosity: VERBOSITY_LEVEL = VERBOSITY_NORMAL,
    output: NodeJS.WritableStream = process.stdout,
    decorated: boolean = true,
    formatter: OutputFormatterInterface = null
  ) {
    super(output, verbosity, decorated, formatter)

    const actualDecorated = this.isDecorated()
    this.stderr = new StreamOutput(
      this.openErrorStream(),
      verbosity,
      decorated,
      formatter
    )

    if (null === decorated) {
      this.setDecorated(actualDecorated && this.stderr.isDecorated())
    }
  }

  /**
   * {@inheritdoc}
   */
  public setDecorated(decorated: boolean) {
    super.setDecorated(decorated)
    this.stderr.setDecorated(decorated)
  }

  /**
   * {@inheritdoc}
   */
  public setFormatter(formatter: OutputFormatterInterface) {
    super.setFormatter(formatter)
    this.stderr.setFormatter(formatter)
  }

  /**
   * {@inheritdoc}
   */
  public setVerbosity(level: VERBOSITY_LEVEL) {
    super.setVerbosity(level)
    this.stderr.setVerbosity(level)
  }

  /**
   * {@inheritdoc}
   */
  public getErrorOutput() {
    return this.stderr
  }

  /**
   * {@inheritdoc}
   */
  public setErrorOutput(error: OutputInterface) {
    this.stderr = error
  }

  /**
   * Returns true if current environment supports writing console output to STDOUT.
   *
   * @return bool
   */
  protected hasStdoutSupport() {
    return !!process.stdout
  }

  /**
   * Returns true if current environment supports writing console output to STDERR.
   *
   * @return bool
   */
  protected hasStderrSupport() {
    return !!process.stderr
  }

  /**
   * @return NodeJS.WritableStream
   */
  private openOutputStream() {
    if (!this.hasStdoutSupport()) {
      throw new Error('No process.stdout available')
    }

    return process.stdout
  }

  /**
   * @return resource
   */
  private openErrorStream() {
    if (!this.hasStderrSupport()) {
      if (!this.hasStdoutSupport()) {
        throw new Error('Neither process.stderr nor process.stdout available')
      }

      return process.stdout
    }

    return process.stderr
  }
}
