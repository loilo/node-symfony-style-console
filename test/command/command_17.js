

const wrapper = require('../wrap-test')

test('17 Ensure symfony style helper methods handle trailing backslashes properly when decorating user texts', wrapper(17, io => {
	io.title('Title ending with \\')
	io.section('Section ending with \\')
}))
