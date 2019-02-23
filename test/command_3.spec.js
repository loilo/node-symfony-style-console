

const wrapper = require('./wrapper')

test('03 Ensure has single blank line between two titles', wrapper(io => {
	io.title('First title')
	io.title('Second title')
}))
