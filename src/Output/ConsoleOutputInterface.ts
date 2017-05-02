import OutputInterface from './OutputInterface'

/**
 * ConsoleOutputInterface is the interface implemented by [[ConsoleOutput]] class.
 * 
 * This adds information about `stderr` output stream.
 *
 * @author Dariusz Górecki <darek.krk@gmail.com>
 * 
 * Original PHP class
 * 
 * @author Florian Reuschel <florian@loilo.de>
 * 
 * Port to TypeScript
 */
interface ConsoleOutputInterface extends OutputInterface {
  /**
   * Gets the OutputInterface for errors.
   *
   * @return OutputInterface
   */
  getErrorOutput(): OutputInterface

  /**
   * Sets the OutputInterface used for errors.
   *
   * @param error
   */
  setErrorOutput(error: OutputInterface): void
}

export default ConsoleOutputInterface
