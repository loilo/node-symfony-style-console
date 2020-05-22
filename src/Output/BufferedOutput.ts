import { EOL } from '../env'
import Output from './Output'

/**
 * An [[OutputInterface]] that buffers its written messages.
 *
 * @author Jean-François Simon <contact@jfsimon.fr>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 */
export default class BufferedOutput extends Output {
  private buffer: string = ''

  /**
   * Empties buffer and returns its content.
   *
   * @return string
   */
  public fetch() {
    const content = this.buffer
    this.buffer = ''

    return content
  }

  /**
   * {@inheritdoc}
   */
  protected doWrite(message: string, newline: boolean) {
    this.buffer += message
    if (newline) this.buffer += EOL
  }
}
