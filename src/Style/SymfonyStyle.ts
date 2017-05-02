import { EOL, DIRECTORY_SEPARATOR } from '../env'
import { countOccurences, lengthWithoutDecoration, wordwrap, flipObject, StringHash } from '../Helper/Helper'

import InputInterface from '../Input/InputInterface'
import OutputInterface, { OutputOptions, OUTPUT_NORMAL } from '../Output/OutputInterface'
import Output from '../Output/Output'

import ConsoleInput from '../Input/ConsoleInput'
import ConsoleOutput from '../Output/ConsoleOutput'
import BufferedOutput from '../Output/BufferedOutput'

import Questionnaire, { AnswerValidator } from '../Helper/Questionnaire'
import ProgressBar from '../Helper/ProgressBar'
import Table from '../Helper/Table'
import { TableCellInput, TableRowInput } from '../Helper/TableCellInterface'

import OutputFormatter from '../Formatter/OutputFormatter'
import OutputStyle from './OutputStyle'

export default class SymfonyStyle extends OutputStyle {
  public static MAX_LINE_LENGTH = 120

  private input: InputInterface
  private progressBar: ProgressBar
  private lineLength: number
  private bufferedOutput: BufferedOutput
  private questionnaire: Questionnaire

  public constructor (input: InputInterface = new ConsoleInput(), output: OutputInterface = new ConsoleOutput()) {
    super(output)

    this.input = input
    this.bufferedOutput = new BufferedOutput(output.getVerbosity(), false, output.getFormatter().clone())

    const width = ((<any>process.stdout).columns) || SymfonyStyle.MAX_LINE_LENGTH
    this.lineLength = Math.min(
      width - Number(DIRECTORY_SEPARATOR === '\\'),
      SymfonyStyle.MAX_LINE_LENGTH
    )
  }

  /**
   * Formats a message as a block of text.
   *
   * @param messages The message to write in the block
   * @param type     The block type (in [] on first line)
   * @param style    The style to apply to the whole block
   * @param prefix   The prefix for the block
   * @param padding  Whether to add vertical padding
   * @param escape   Whether to escape the messages
   */
  public block (
    messages: string|string[],
    type: string,
    style: string,
    prefix: string = ' ',
    padding: boolean = false
  ) {
    if (!Array.isArray(messages)) messages = [messages]

    this.autoPrependBlock()
    this.writeln(this.createBlock(messages, type, style, prefix, padding, true))
    this.newLine()
  }

  /**
   * {@inheritdoc}
   */
  public title (message: string) {
    this.autoPrependBlock()
    this.writeln([
      `<comment>${OutputFormatter.escapeTrailingBackslash(message)}</>`,
      `<comment>${'='.repeat(lengthWithoutDecoration(this.getFormatter(), message))}</>`
    ])
    this.newLine()
  }


  /**
   * {@inheritdoc}
   */
  public section (message: string) {
    this.autoPrependBlock()
    this.writeln([
      `<comment>${OutputFormatter.escapeTrailingBackslash(message)}</>`,
      `<comment>${'-'.repeat(lengthWithoutDecoration(this.getFormatter(), message))}</>`
    ])
    this.newLine()
  }

  /**
   * {@inheritdoc}
   */
  public listing (elements: string[]) {
    this.autoPrependText()
    elements = elements.map(element => ` * ${element}`)

    this.writeln(elements)
    this.newLine()
  }

  /**
   * {@inheritdoc}
   */
  public text (message: string|string[]) {
    this.autoPrependText()

    const messages = Array.isArray(message) ? message.slice(0) : [message]

    for (const message of messages) {
      this.writeln(` ${message}`)
    }
  }

  /**
   * Formats a command comment.
   *
   * @param message
   */
  public comment (message: string|string[]) {
      const messages = Array.isArray(message) ? message.slice(0) : [message]

      this.autoPrependBlock()
      this.writeln(this.createBlock(messages, null, null, '<fg=default;bg=default> // </>'))
      this.newLine()
  }


  /**
   * {@inheritdoc}
   */
  public success (message: string|string[]) {
    this.block(message, 'OK', 'fg=black;bg=green', ' ', true)
  }

  /**
   * {@inheritdoc}
   */
  public error (message: string|string[]) {
    this.block(message, 'ERROR', 'fg=white;bg=red', ' ', true)
  }

  /**
   * {@inheritdoc}
   */
  public warning (message: string|string[]) {
    this.block(message, 'WARNING', 'fg=white;bg=red', ' ', true)
  }

  /**
   * {@inheritdoc}
   */
  public note (message: string|string[]) {
    this.block(message, 'NOTE', 'fg=yellow', ' ! ')
  }

  /**
   * {@inheritdoc}
   */
  public caution (message: string|string[]) {
    this.block(message, 'CAUTION', 'fg=white;bg=red', ' ! ', true)
  }

  /**
   * {@inheritdoc}
   */
  public table (headers: TableCellInput[] | TableCellInput[][], rows: TableRowInput[]) {
    const style = Table.getStyleDefinition('symfony-style-guide').clone()
    style.setCellHeaderFormat('<info>%s</info>')

    const table = new Table(this)
    table.setHeaders(headers)
    table.setRows(rows)
    table.setStyle(style)

    table.render()
    this.newLine()
  }

  /**
   * {@inheritdoc}
   */
  public ask (question: string, defaultAnswer: string = null, validator: AnswerValidator = null) {
    if (!this.input.isInteractive()) return Promise.resolve(null)

    this.initQuestionnaire()
    return this.questionnaire.ask(question, defaultAnswer, validator)
  }

  /**
   * {@inheritdoc}
   */
  public askHidden (question: string, validator: AnswerValidator = null): Promise<string> {
    if (!this.input.isInteractive()) return Promise.resolve(null)

    this.initQuestionnaire()
    return this.questionnaire.askHidden(question, validator)
  }

  /**
   * {@inheritdoc}
   */
  public confirm (question: string, defaultAnswer: boolean = true): Promise<boolean> {
    if (!this.input.isInteractive()) return Promise.resolve(null)

    this.initQuestionnaire()
    return this.questionnaire.confirm(question, defaultAnswer)
  }

  /**
   * {@inheritdoc}
   */
  public choice (question: string, choices: StringHash, defaultAnswer: string = null): Promise<string> {
    if (!this.input.isInteractive()) return Promise.resolve(null)

    this.initQuestionnaire()
    return this.questionnaire.choice(question, choices, defaultAnswer)
  }

  /**
   * {@inheritdoc}
   */
  public progressStart (max: number = 0) {
    this.progressBar = this.createProgressBar(max)
    this.progressBar.start()
  }

  /**
   * {@inheritdoc}
   */
  public progressAdvance (step: number = 1) {
    this.getProgressBar().advance(step)
  }

  /**
   * {@inheritdoc}
   */
  public progressSet (step: number) {
    this.getProgressBar().setProgress(step)
  }

  /**
   * {@inheritdoc}
   */
  public progressFinish () {
    this.getProgressBar().finish()
    this.newLine(2)
    this.progressBar = null
  }

  /**
   * {@inheritdoc}
   */
  protected createProgressBar (max = 0) {
      const progressBar = super.createProgressBar(max)

      if ('\\' !== DIRECTORY_SEPARATOR) {
        progressBar.setEmptyBarCharacter('░') // light shade character \u2591
        progressBar.setProgressCharacter('')
        progressBar.setBarCharacter('▓') // dark shade character \u2593
      }

      return progressBar
  }

  /**
   * {@inheritdoc}
   */
  public writeln (messages: string|string[], type: OutputOptions = OUTPUT_NORMAL) {
    super.writeln(messages, type)
    this.bufferedOutput.writeln(this.reduceBuffer(messages), type)
  }

  /**
   * {@inheritdoc}
   */
  public write (messages: string|string[], newline: boolean = false, type: OutputOptions = OUTPUT_NORMAL) {
    super.write(messages, newline, type)
    this.bufferedOutput.write(this.reduceBuffer(messages), newline, type)
  }

  /**
   * {@inheritdoc}
   */
  public newLine (count = 1) {
    super.newLine(count)
    this.bufferedOutput.write('\n'.repeat(count))
  }

  /**
   * @return ProgressBar
   */
  private getProgressBar () {
    if (!this.progressBar) {
      throw new Error('The ProgressBar is not started.')
    }

    return this.progressBar;
  }

  private autoPrependBlock () {
    const chars = this.bufferedOutput.fetch()
      .replace(new RegExp(EOL, 'g'), '\n')
      .slice(-2)

    if (!chars.length) {
      return this.newLine() // Empty history, so we should start with a new line
    }

    // Prepend new line for each non LF chars (This means no blank line was output before)
    this.newLine(2 - (countOccurences(chars, '\n') || 0))
  }

  private autoPrependText () {
    const fetched = this.bufferedOutput.fetch()

    // Prepend new line if last char isn't EOL:
    if ('\n' !== fetched.slice(-1)) {
      this.newLine()
    }
  }

  private reduceBuffer (messages: string|string[]) {
    if (!Array.isArray(messages)) messages = [ messages ]

    // We need to know if the two last chars are EOL
    // Preserve the last 4 chars inserted (EOL on windows is two chars) in the history buffer
    return [ this.bufferedOutput.fetch() ]
      .concat(messages)
      .map(value => value.slice(-4))
  }

  private createBlock (
    messages: string[],
    type: string = null,
    style: string = null,
    prefix: string = ' ',
    padding: boolean = false,
    escape: boolean = false
  ) {
    let indentLength = 0
    let lineIndetation
    const prefixLength = lengthWithoutDecoration(this.getFormatter(), prefix)
    const lines: string[] = []

    if (null !== type) {
      type = `[${type}] `
      indentLength = type.length
      lineIndetation = ' '.repeat(indentLength)
    }

    for (let key = 0; key < messages.length; key++) {
      let message = messages[key]

      if (escape) {
        message = OutputFormatter.escape(message)
      }

      lines.push(...wordwrap(message, this.lineLength - prefixLength - indentLength, EOL).split(EOL))

      if (messages.length > 1 && key < messages.length - 1) {
        lines.push('')
      }
    }

    let firstLineIndex = 0
    if (padding && this.isDecorated()) {
      firstLineIndex = 1
      lines.unshift('')
      lines.push('')
    }

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]

      if (null !== type) {
        line = firstLineIndex === i
          ? type + line
          : lineIndetation + line
      }

      line = prefix + line
      line += ' '.repeat(this.lineLength - lengthWithoutDecoration(this.getFormatter(), line))

      if (style) {
        line = `<${style}>${line}</>`
      }

      lines[i] = line
    }

    return lines
  }

  private initQuestionnaire () {
    if (!this.questionnaire) {
      this.questionnaire = new Questionnaire(this)
    }
  }
}
