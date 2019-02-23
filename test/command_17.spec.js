

const wrapper = require('./wrapper')

test('17 Ensure symfony style helper methods handle trailing backslashes properly when decorating user texts', wrapper(io => {
	io.title('Title ending with \\')
	io.section('Section ending with \\')
}))
