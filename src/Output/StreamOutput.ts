import Output from './Output'
import { VERBOSITY_LEVEL, VERBOSITY_NORMAL } from './OutputInterface'
import OutputFormatterInterface from '../Formatter/OutputFormatterInterface'
import { EOL, DIRECTORY_SEPARATOR } from '../env'

/**
 * StreamOutput writes the output to a given stream.
 *
 * Usage:
 *
 * ```
 * const output = new StreamOutput(process.stdout)
 * ```
 *
 * As `StreamOutput` can use any stream, you can also use a file:
 *
 * ```
 * const output = new StreamOutput(fs.createWriteStream('/path/to/output.log', { flags: 'a' }))
 * ```
 *
 * @author Fabien Potencier <fabien@symfony.com>
 * 
 * Original PHP class
 * 
 * @author Florian Reuschel
 * 
 * Port to TypeScript
 */
export default class StreamOutput extends Output {
  private stream: NodeJS.WritableStream

  /**
   * Creates a new StreamOutput instance
   *
   * @param stream    A stream resource
   * @param verbosity The verbosity level (one of the VERBOSITY constants in OutputInterface)
   * @param decorated Whether to decorate messages (null for auto-guessing)
   * @param formatter Output formatter instance (null to use default OutputFormatter)
   *
   * @throws InvalidArgumentException When first argument is not a real stream
   */
  public constructor (
    stream: NodeJS.WritableStream,
    verbosity: VERBOSITY_LEVEL = VERBOSITY_NORMAL,
    decorated: boolean = null,
    formatter: OutputFormatterInterface = null
  ) {
    super(verbosity, decorated, formatter)

    this.stream = stream

    if (null === decorated) {
      decorated = this.hasColorSupport()
    }
  }

  /**
   * Gets the stream attached to this StreamOutput instance.
   *
   * @return A stream resource
   */
  public getStream () {
    return this.stream
  }

  /**
   * {@inheritdoc}
   */
  protected doWrite (message: string, newline: boolean) {

    if (false === this.stream.write(message) || (newline && (false === this.stream.write(EOL)))) {
      // should never happen
      throw new Error('Unable to write output.')
    }
  }

  /**
   * Returns true if the stream supports colorization.
   *
   * Colorization is disabled if not supported by the stream:
   *
   *  -  Windows != 10.0.10586 without Ansicon, ConEmu or Mintty
   *  -  non tty consoles
   *
   * @return bool true if the stream supports colorization, false otherwise
   */
  protected hasColorSupport () {
    if (DIRECTORY_SEPARATOR === '\\') {
      const os = require('os')

      return '10.0.10586' === os.release()
        || process.env.ANSICON
        || 'ON' === process.env.ConEmuANSI
        || 'xterm' === process.env.TERM
    }

    if (typeof (this.stream as any).fd !== 'undefined') {
      return require('tty').isatty((this.stream as any).fd)
    } else {
      return false
    }
  }
}
