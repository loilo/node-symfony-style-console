const path = require('path')

const { SymfonyStyle, ConsoleOutput, VERBOSITY_NORMAL } = require('../dist')

const { Writable } = require('stream')
const { inherits } = require('util')
const fs = require('fs')

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
module.exports = (i, test) => () => {
	const output = new ConsoleOutput(VERBOSITY_NORMAL, new TestStream)
	const io = new SymfonyStyle(undefined, output)
	io.setDecorated(false)
	test(io)

	const file = path.resolve(__dirname, 'output', `output_${i}.txt`)
	const referenceResult = fs.readFileSync(file, { encoding: 'utf8' })

	expect(output.stream.result).toBe(referenceResult)
}
