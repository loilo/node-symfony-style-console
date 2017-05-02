import { TableCellInput, TableRowInput } from '../Helper/TableCellInterface'
import { StringHash } from '../Helper/Helper'

/**
 * Output style helpers.
 */
interface StyleInterface {
  /**
   * Formats a command title.
   *
   * @param message
   */
  title (message: string): void

  /**
   * Formats a section title.
   *
   * @param message
   */
  section (message: string): void

  /**
   * Formats a list.
   *
   * @param elements
   */
  listing (elements: string[]): void

  /**
   * Formats informational text.
   *
   * @param message
   */
  text (message: string|string[]): void

  /**
   * Formats a success result bar.
   *
   * @param message
   */
  success (message: string|string[]): void

  /**
   * Formats an error result bar.
   *
   * @param message
   */
  error (message: string|string[]): void

  /**
   * Formats an warning result bar.
   *
   * @param message
   */
  warning (message: string|string[]): void

  /**
   * Formats a note admonition.
   *
   * @param message
   */
  note (message: string|string[]): void

  /**
   * Formats a caution admonition.
   *
   * @param message
   */
  caution (message: string|string[]): void

  /**
   * Formats a table.
   *
   * @param headers
   * @param rows
   */
  table (headers: TableCellInput[] | TableCellInput[][], rows: TableRowInput[]): void

  /**
   * Asks a question.
   *
   * @param question
   * @param defaultValue
   * @param validator
   *
   * @return string
   */
  ask (question: string, defaultValue?: string, validator?: (...args: any[]) => boolean): Promise<string>

  /**
   * Asks a question with the user input hidden.
   *
   * @param question
   * @param validator
   *
   * @return string
   */
  askHidden (question: string, validator?: (...args: any[]) => boolean): Promise<string>

  /**
   * Asks for confirmation.
   *
   * @param question
   * @param defaultValue
   *
   * @return bool
   */
  confirm (question: string, defaultValue?: boolean): Promise<boolean>

  /**
   * Asks a choice question.
   *
   * @param question
   * @param choices
   * @param defaultValue
   *
   * @return string
   */
  choice (question: string, choices: StringHash, defaultValue?: string|number): Promise<string|number>

  /**
   * Add newline(s).
   *
   * @param count The number of newlines
   */
  newLine (count?: number): void

  /**
   * Starts the progress output.
   *
   * @param max Maximum steps (0 if unknown)
   */
  progressStart (max?: number): void

  /**
   * Advances the progress output X steps.
   *
   * @param step Number of steps to advance
   */
  progressAdvance (step?: number): void

  /**
   * Sets the progress output to X steps.
   *
   * @param step Number of steps to set
   */
  progressSet (step: number): void

  /**
   * Finishes the progress output.
   */
  progressFinish (): void
}

export default StyleInterface
