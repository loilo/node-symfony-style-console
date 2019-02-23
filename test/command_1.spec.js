

const wrapper = require('./wrapper')

test('01 Ensure has single blank line between titles and blocks', wrapper(io => {
	io.title('Title')
	io.warning('Lorem ipsum dolor sit amet')
	io.title('Title')
}))
