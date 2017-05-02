

const wrapper = require('../wrap-test')

test('01 Ensure has single blank line between titles and blocks', wrapper(1, io => {
	io.title('Title')
	io.warning('Lorem ipsum dolor sit amet')
	io.title('Title')
}))
