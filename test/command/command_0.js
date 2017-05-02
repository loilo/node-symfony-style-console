const wrapper = require('../wrap-test')

test('00 Ensure has single blank line at start when using block element', wrapper(0, io => {
	io.caution('Lorem ipsum dolor sit amet')
}))
