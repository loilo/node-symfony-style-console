const wrapper = require('./wrapper')

test('00 Ensure has single blank line at start when using block element', wrapper(io => {
	io.caution('Lorem ipsum dolor sit amet')
}))
