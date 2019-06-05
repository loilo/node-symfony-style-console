import {
  VERBOSITY_QUIET,
  VERBOSITY_VERBOSE,
  VERBOSITY_VERY_VERBOSE,
  VERBOSITY_DEBUG
} from '../Output/OutputInterface'

import {
  countOccurences,
  lengthWithoutDecoration,
  formatTime,
  formatMemory,
  strPad,
  sprintf,
  time,
  StringHash
} from '../Helper/Helper'

import OutputInterface from '../Output/OutputInterface'
import ConsoleOutput from '../Output/ConsoleOutput'

/**
 * A callback function mapping a [[ProgressBar]] to a string and writing it to an [[OutputInterface]].
 */
export interface FormatterFn {
  (bar: ProgressBar, output?: OutputInterface): string
}

/**
 * Represents an object literal mapping formatter names to their respective callbacks
 */
export interface FormatterHash {
  [formatter: string]: FormatterFn
}

/**
 * The ProgressBar provides helpers to display progress output.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * Original PHP class
 *
 * @author Chris Jones <leeked@gmail.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 *
 */
export default class ProgressBar {
  /**
   * The available formatters.
   */
  private static formatters: FormatterHash

  /**
   * The available format placeholders.
   */
  private static formats: StringHash

  /**
   * The width of the progress bar.
   */
  private barWidth = 28

  /**
   * The character that represents completed progress.
   */
  private barChar: string

  /**
   * The character that represents uncompleted progress.
   */
  private emptyBarChar = '-'

  /**
   * The character that represents the outer pointer of the completed progress.
   */
  private progressChar = '>'

  /**
   * The template of the progress bar.
   */
  private format: string

  /**
   * The originally set template of the progress bar.
   */
  private internalFormat: string

  /**
   * The frequency of redrawing the bar (in steps).
   */
  private redrawFreq: number = 1

  /**
   * The output to write the progress bar to.
   */
  private output: OutputInterface

  /**
   * The current step of the progress.
   */
  private step = 0

  /**
   * The maximum number of steps of the progress.
   */
  private max: number

  /**
   * The UNIX timestamp when the progress started.
   */
  private startTime: number

  /**
   * The width of each single step.
   */
  private stepWidth: number

  /**
   * The current progress in percent.
   */
  private percent = 0.0

  /**
   * The number of lines the progress bar template contains.
   */
  private formatLineCount: number

  /**
   * A Hash containing mapping format template placeholders to custom messages.
   */
  private messages: StringHash = {}

  /**
   * If the progress should be rewritten to the same position.
   */
  private shouldOverwrite: boolean = true

  /**
   * Indicator for the `overwrite` method if it's the first render cycle.
   */
  private firstRun: boolean = true

  /**
   * Creates a new progress bar.
   *
   * @param OutputInterface output An OutputInterface instance
   * @param int             max    Maximum steps (0 if unknown)
   */
  public constructor(output: OutputInterface, max = 0) {
    if (output instanceof ConsoleOutput) {
      output = output.getErrorOutput()
    }

    this.output = output
    this.setMaxSteps(max)

    if (!this.output.isDecorated()) {
      // disable overwrite when output does not support ANSI codes.
      this.shouldOverwrite = false
      // set a reasonable redraw frequency so output isn't flooded
      this.setRedrawFrequency(max / 10)
    }

    this.startTime = time()
  }

  /**
   * Sets a format for a given name.
   *
   * This method also allow you to override an existing format.
   *
   * @param name   The format name
   * @param format A format string
   */
  public static setFormatDefinition(name: string, format: string) {
    if (!this.formats) {
      this.formats = this.initFormats()
    }
    this.formats[name] = format
  }
  /**
   * Gets the format for a given name.
   *
   * @param name The format name
   * @return A format string
   */
  public static getFormatDefinition(name: string) {
    if (!this.formats) {
      this.formats = this.initFormats()
    }
    return this.formats[name] || null
  }

  /**
   * Sets a placeholder formatter for a given name.
   *
   * This method also allow you to override an existing placeholder.
   *
   * @param name     The placeholder name (including the delimiter char like %)
   * @param callback A formatter callback
   */
  public static setPlaceholderFormatterDefinition(
    name: string,
    callable: FormatterFn
  ) {
    if (!this.formatters) {
      this.formatters = this.initPlaceholderFormatters()
    }
    this.formatters[name] = callable
  }

  /**
   * Gets the placeholder formatter for a given name.
   *
   * @param name       The placeholder name (including the delimiter char like %)
   * @return A formatter callback
   */
  public static getPlaceholderFormatterDefinition(name: string) {
    if (!this.formatters) {
      this.formatters = this.initPlaceholderFormatters()
    }
    return this.formatters[name] || null
  }

  /**
   * Gets the initially available format templates.
   */
  private static initFormats(): StringHash {
    return {
      normal: ' %current%/%max% [%bar%] %percent:3s%%',
      normal_nomax: ' %current% [%bar%]',
      verbose: ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%',
      verbose_nomax: ' %current% [%bar%] %elapsed:6s%',
      very_verbose:
        ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%',
      very_verbose_nomax: ' %current% [%bar%] %elapsed:6s%',
      debug:
        ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%',
      debug_nomax: ' %current% [%bar%] %elapsed:6s% %memory:6s%'
    }
  }

  /**
   * Gets the initially available format placeholder callbacks.
   */
  private static initPlaceholderFormatters(): FormatterHash {
    return {
      bar(bar, output) {
        const completeBars = Math.floor(
          bar.getMaxSteps() > 0
            ? bar.getProgressPercent() * bar.getBarWidth()
            : bar.getProgress() % bar.getBarWidth()
        )
        let display = bar.getBarCharacter().repeat(completeBars)

        if (completeBars < bar.getBarWidth()) {
          const emptyBars =
            bar.getBarWidth() -
            completeBars -
            lengthWithoutDecoration(
              output.getFormatter(),
              bar.getProgressCharacter()
            )
          display +=
            bar.getProgressCharacter() +
            bar.getEmptyBarCharacter().repeat(emptyBars)
        }
        return display
      },
      elapsed(bar) {
        return formatTime(time() - bar.getStartTime())
      },
      remaining(bar) {
        if (!bar.getMaxSteps()) {
          throw new Error(
            'Unable to display the remaining time if the maximum number of steps is not set.'
          )
        }

        let remaining
        if (!bar.getProgress()) {
          remaining = 0
        } else {
          remaining = Math.round(
            ((time() - bar.getStartTime()) / bar.getProgress()) *
              (bar.getMaxSteps() - bar.getProgress())
          )
        }
        return formatTime(remaining)
      },
      estimated(bar) {
        if (!bar.getMaxSteps()) {
          throw new Error(
            'Unable to display the estimated time if the maximum number of steps is not set.'
          )
        }

        let estimated
        if (!bar.getProgress()) {
          estimated = 0
        } else {
          estimated = Math.round(
            ((time() - bar.getStartTime()) / bar.getProgress()) *
              bar.getMaxSteps()
          )
        }
        return formatTime(estimated)
      },
      memory(bar) {
        return formatMemory(process.memoryUsage().heapTotal)
      },
      current(bar) {
        return strPad(
          String(bar.getProgress()),
          bar.getStepWidth(),
          ' ',
          'STR_PAD_LEFT'
        )
      },
      max(bar) {
        return String(bar.getMaxSteps())
      },
      percent(bar) {
        return String(Math.floor(bar.getProgressPercent() * 100))
      }
    }
  }

  /**
   * Associates a text with a named placeholder.
   *
   * The text is displayed when the progress bar is rendered but only
   * when the corresponding placeholder is part of the custom format line
   * (by wrapping the name with %).
   *
   * @param message The text to associate with the placeholder
   * @param name    The name of the placeholder
   */
  public setMessage(message: string, name: string = 'message') {
    this.messages[name] = message
  }

  /**
   * Gets the message associated with a certain placeholder.
   *
   * @param name A format placeholder
   */
  public getMessage(name: string = 'message') {
    return this.messages[name]
  }

  /**
   * Gets the progress bar start time.
   */
  public getStartTime() {
    return this.startTime
  }

  /**
   * Gets the progress bar maximal steps.
   */
  public getMaxSteps() {
    return this.max
  }

  /**
   * Gets the current step position.
   */
  public getProgress() {
    return this.step
  }

  /**
   * Gets the progress bar step width.
   */
  public getStepWidth() {
    return this.stepWidth
  }

  /**
   * Gets the current progress bar percent.
   */
  public getProgressPercent() {
    return this.percent
  }

  /**
   * Sets the progress bar width.
   */
  public setBarWidth(size: number) {
    this.barWidth = Math.max(1, size)
  }

  /**
   * Gets the progress bar width in characters.
   */
  public getBarWidth() {
    return this.barWidth
  }

  /**
   * Sets the bar character.
   *
   * @param char A character
   */
  public setBarCharacter(char: string) {
    this.barChar = char
  }

  /**
   * Gets the bar character.
   */
  public getBarCharacter() {
    if (null == this.barChar) {
      return this.max ? '=' : this.emptyBarChar
    }
    return this.barChar
  }

  /**
   * Sets the empty bar character.
   *
   * @param char A character
   */
  public setEmptyBarCharacter(char: string) {
    this.emptyBarChar = char
  }

  /**
   * Gets the empty bar character.
   */
  public getEmptyBarCharacter() {
    return this.emptyBarChar
  }

  /**
   * Sets the progress bar character.
   *
   * @param char A character
   */
  public setProgressCharacter(char: string) {
    this.progressChar = char
  }

  /**
   * Gets the progress bar character.
   */
  public getProgressCharacter() {
    return this.progressChar
  }

  /**
   * Sets the progress bar format.
   *
   * @param format The format
   */
  public setFormat(format: string) {
    this.format = null
    this.internalFormat = format
  }

  /**
   * Sets the redraw frequency.
   *
   * @param freq The frequency in steps
   */
  public setRedrawFrequency(freq: number) {
    this.redrawFreq = Math.max(freq, 1)
  }

  /**
   * Starts the progress output.
   *
   * @param max Number of steps to complete the bar (`0` if indeterminate), `null` to leave unchanged
   */
  public start(max: number = null) {
    this.startTime = time()
    this.step = 0
    this.percent = 0.0
    if (null != max) {
      this.setMaxSteps(max)
    }
    this.display()
  }

  /**
   * Advances the progress output X steps.
   *
   * @param step Number of steps to advance
   */
  public advance(step: number = 1) {
    this.setProgress(this.step + step)
  }

  /**
   * Sets whether to overwrite the progress bar, `false` for new line.
   *
   * @param overwrite Whether the progress bar should be overwritten
   */
  public setOverwrite(overwrite: boolean) {
    this.shouldOverwrite = overwrite
  }

  /**
   * Sets the current progress.
   *
   * @param step The current progress
   */
  public setProgress(step: number) {
    if (this.max && step > this.max) {
      this.max = step
    } else if (step < 0) {
      step = 0
    }
    const prevPeriod = Math.round(this.step / this.redrawFreq)
    const currPeriod = Math.round(step / this.redrawFreq)
    this.step = step
    this.percent = this.max ? this.step / this.max : 0
    if (prevPeriod !== currPeriod || this.max === step) {
      this.display()
    }
  }

  /**
   * Finishes the progress output.
   */
  public finish() {
    if (!this.max) {
      this.max = this.step
    }
    if (this.step === this.max && !this.shouldOverwrite) {
      // prevent double 100% output
      return
    }
    this.setProgress(this.max)
  }

  /**
   * Outputs the current progress string.
   */
  public display() {
    if (VERBOSITY_QUIET === this.output.getVerbosity()) {
      return
    }
    if (null == this.format) {
      this.setRealFormat(this.internalFormat || this.determineBestFormat())
    }
    this.overwrite(this.buildLine())
  }

  /**
   * Removes the progress bar from the current line.
   *
   * This is useful if you wish to write some output while a progress bar is running.
   * Call display() to show the progress bar again.
   */
  public clear() {
    if (!this.shouldOverwrite) {
      return
    }
    if (null == this.format) {
      this.setRealFormat(this.internalFormat || this.determineBestFormat())
    }
    this.overwrite('')
  }

  /**
   * Sets the progress bar format template.
   *
   * @param format The format template
   */
  private setRealFormat(format: string) {
    // try to use the _nomax variant if available
    if (
      !this.max &&
      null != ProgressBar.getFormatDefinition(format + '_nomax')
    ) {
      this.format = ProgressBar.getFormatDefinition(format + '_nomax')
    } else if (null != ProgressBar.getFormatDefinition(format)) {
      this.format = ProgressBar.getFormatDefinition(format)
    } else {
      this.format = format
    }
    this.formatLineCount = countOccurences(this.format, '\n') || 0
  }

  /**
   * Sets the progress bar maximal steps.
   *
   * @param max The progress bar max steps
   */
  private setMaxSteps(max: number) {
    this.max = Math.max(0, max)
    this.stepWidth = this.max ? String(this.max).length : 4
  }

  /**
   * Overwrites a previous message to the output.
   *
   * @param message The message
   */
  private overwrite(message: string) {
    if (this.shouldOverwrite) {
      if (!this.firstRun) {
        // Move the cursor to the beginning of the line
        this.output.write('\x0D')
        // Erase the line
        this.output.write('\x1B[2K')
        // Erase previous lines
        if (this.formatLineCount > 0) {
          this.output.write('\x1B[1A\x1B[2K'.repeat(this.formatLineCount))
        }
      }
    } else if (this.step > 0) {
      this.output.writeln('')
    }
    this.firstRun = false
    this.output.write(message)
  }

  /**
   * Determines the fitting format template for the currently set verbosity.
   */
  private determineBestFormat() {
    switch (this.output.getVerbosity()) {
      // VERBOSITY_QUIET: display is disabled anyway
      case VERBOSITY_VERBOSE:
        return this.max ? 'verbose' : 'verbose_nomax'
      case VERBOSITY_VERY_VERBOSE:
        return this.max ? 'very_verbose' : 'very_verbose_nomax'
      case VERBOSITY_DEBUG:
        return this.max ? 'debug' : 'debug_nomax'
      default:
        return this.max ? 'normal' : 'normal_nomax'
    }
  }

  /**
   * Renders the current state of the progress bar.
   *
   * @return The output of the progress bar's current state
   */
  private buildLine() {
    const regex = /%([a-z\-_]+)(||\:([^%]+))?%/gi
    const callback = (...args: any[]) => {
      const str: string = args.pop()
      const offset: number = args.pop()
      const matches: string[] = args

      const formatter = ProgressBar.getPlaceholderFormatterDefinition(
        matches[1]
      )
      let text
      if (formatter) {
        text = formatter(this, this.output)
      } else if (this.messages[matches[1]]) {
        text = this.messages[matches[1]]
      } else {
        return matches[0]
      }
      if (matches[3]) {
        text = sprintf(`%${matches[3]}`, text)
      }
      return text
    }
    const line = this.format.replace(regex, callback)
    const lineLength = lengthWithoutDecoration(this.output.getFormatter(), line)
    const terminalWidth = (process.stdout as any).columns || 40
    if (lineLength <= terminalWidth) {
      return line
    }
    this.setBarWidth(this.barWidth - lineLength + terminalWidth)
    return this.format.replace(regex, callback)
  }
}
