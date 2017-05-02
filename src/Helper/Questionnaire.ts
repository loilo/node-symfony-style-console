import { arrContains, flipObject, StringHash } from '../Helper/Helper'
import OutputStyle from '../Style/OutputStyle'

let readline: any

/**
 * The options that go into a `doAsk` call.
 */
export interface QuestionnaireOptions {
	/**
	 * The question string to show. May contain styles.
	 */
	question: string,

	/**
	 * Validates given answers.
	 */
	validator: AnswerValidator,

	/**
	 * Whether the input characters should be hidden.
	 */
	hideInput: boolean,
	errorMsg: string|((value: string) => string)
}

/**
 * A callback to validate answer strings.
 */
export type AnswerValidator = (value: string) => boolean

/**
 * Provides simple Q&A with text input, password input, choice and confirmation
 * 
 * @author Florian Reuschel <florian@loilo.de>
 */
export default class Questionnaire {
	/**
	 * The output to use for the questions.
	 */
	private output: OutputStyle

	/**
	 * Creates a new Questionnaire instance.
	 * 
	 * @param output The output to use for the questions.
	 */
	public constructor (output: OutputStyle) {
		Questionnaire.initReadline()
		this.output = output
	}

	/**
	 * Initializes the Node.js `readline` module.
	 */
	private static initReadline () {
		if (!readline) {
			readline = require('readline')
		}
	}

	/**
	 * Checks if a string does contain anything but whitespace.
	 * 
	 * @param value The string to check
	 */
    private static isFilled (value: string) {
        return !!value.trim().length
    }

    /**
     * Disables the printing of `stdin` data to `stdout`.
     * 
     * @param char The character that's currently going into `stdin`
     */
    private static suppressStdinOutput (char: any) {
        switch (String(char)) {
            case '\n':
            case '\r':
            case '\u0004':
                process.stdin.pause()
                process.stdin.removeListener('data', this.suppressStdinOutput)
                break

            default:
                setImmediate(() => {
                    process.stdout.write(`\u001b[2K\u001b[200D > `)
                })
                break
        }
    }

	/**
	 * Performs the actual interaction between user and terminal via `readline`.
	 *
	 * @param _ Question options
	 */
	private doAsk ({ question, validator = null, hideInput = false, errorMsg = 'Invalid value.' }: Partial<QuestionnaireOptions>) {
		this.output.writeln(question)

		if (hideInput) {
			process.stdin.resume()
			process.stdin.on('data', Questionnaire.suppressStdinOutput)
		}

		const rl = readline.createInterface(process.stdin, process.stdout)
		rl.setPrompt(' > ')
		rl.prompt()

		return new Promise<string>(resolve => {
			rl.on('line', (value: string) => {
				rl.history.shift()
				rl.close()

				this.output.newLine()

			    if (!validator || validator(value)) {
			    	resolve(value)
			    } else {
			    	this.output.error(typeof errorMsg === 'function' ? errorMsg(value) : errorMsg)

			    	resolve(this.doAsk({ question, hideInput, validator, errorMsg }))
			    }
			})
		})
	}

	/**
	 * Ask for a string answer.
	 * 
	 * @param question     The (formatted) question to put
	 * @param defaultValue A default value to provide
	 * @param validator    A validator callback
	 */
	public ask (question: string, defaultValue: string = null, validator: AnswerValidator = null) {
		const hasDefaultValue = defaultValue != null

		let formattedQuestion = ` <fg=green>${question}</>`
		if (hasDefaultValue) {
			formattedQuestion += ` [<fg=yellow>${defaultValue}</>]`
		}
		formattedQuestion += ':'

		return this.doAsk({
			question: formattedQuestion,
			validator: validator || (hasDefaultValue ? null : Questionnaire.isFilled),
			errorMsg: 'A value is required.'
		})
			// Return default value if exists and input is empty
			.then(value => (!hasDefaultValue || Questionnaire.isFilled(value)) ? value : defaultValue)
	}

	/**
	 * Ask for a string answer, hide input chars.
	 * 
	 * @param question  The (formatted) question to put
	 * @param validator A validator callback
	 */
    public askHidden (question: string, validator: AnswerValidator = null) {
		const formattedQuestion = ` <fg=green>${question}</>:`

		return this.doAsk({
			question: formattedQuestion,
			hideInput: true,
			validator: validator || Questionnaire.isFilled,
			errorMsg: 'A value is required.'
		})
	}

	/**
	 * Ask for picking an option.
	 * 
	 * @param question     The (formatted) question to put
	 * @param choices      A value-label map of options
	 * @param defaultValue A default value to provide
	 */
	public choice (question: string, choices: StringHash, defaultValue: string = null) {
		const hasDefaultValue = defaultValue != null

		const flippedChoices: StringHash = flipObject(choices)
		const choiceValues = Object.keys(choices)
		const choiceLabels = Object.keys(flippedChoices)

		if (hasDefaultValue && !arrContains(choiceLabels, defaultValue)) {
			throw new RangeError(
				`Invalid default value "${defaultValue}",` +
				`must be one of: ${choiceLabels.map(label => `"${label}"`).join(', ')}`
			)
		}

		let formattedQuestion = ` <fg=green>${question}</>`
		if (hasDefaultValue) {
			formattedQuestion += ` [<fg=yellow>${defaultValue}</>]`
		}
		formattedQuestion += ':\n'

		for (const option in choices) {
			formattedQuestion += `  [<fg=yellow>${option}</>] ${choices[option]}\n`
		}

		formattedQuestion = formattedQuestion.slice(0, -1)

		return this.doAsk({
			question: formattedQuestion,
			validator (value) {
				return Questionnaire.isFilled(value)
					? arrContains(choiceValues, value)
					: hasDefaultValue
			},
			errorMsg (value) {
				return `Value "${value}" is invalid.`
			}
		})
			// Return default value if exists and input is empty
			.then(value => (!hasDefaultValue || Questionnaire.isFilled(value)) ? value : flippedChoices[defaultValue])
	}

	/**
	 * Ask a yes/no question.
	 * 
	 * @param question     The (formatted) question to put
	 * @param defaultValue If the answer should default to "yes"
	 */
	public confirm (question: string, defaultValue: boolean = true) {
		const formattedQuestion = ` <fg=green>${question} (yes/no)</> [<fg=yellow>${defaultValue ? 'yes' : 'no'}</>]`
		const truthyRegex = /^y/i

		return this.doAsk({
			question: formattedQuestion,
		})
		.then(value => Questionnaire.isFilled(value)
			? truthyRegex.test(value.trim())
			: defaultValue)
	}
}
