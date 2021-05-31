const { SymfonyStyle, ConsoleOutput, VERBOSITY_NORMAL } = require('../dist')
const { Writable } = require('stream')

class TestStream extends Writable {
	constructor () {
		super()
		this.result = ''
	}

	_write(chunk, enc, next) {
		this.result += chunk.toString()
		next()
	}
}

/**
 * A wrapper for the rather simple tests.
 */
module.exports = test => () => {
	const output = new ConsoleOutput(VERBOSITY_NORMAL, new TestStream)

	SymfonyStyle.LINE_LENGTH = 80
	const io = new SymfonyStyle(undefined, output)
	io.setDecorated(false)
	test(io)

	expect(output.stream.result.replace(/\r\n/g, '\n').trim()).toMatchSnapshot()
}
