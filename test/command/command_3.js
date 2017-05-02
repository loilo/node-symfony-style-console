

const wrapper = require('../wrap-test')

test('03 Ensure has single blank line between two titles', wrapper(3, io => {
	io.title('First title')
	io.title('Second title')
}))
