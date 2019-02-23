

const wrapper = require('./wrapper')

test('02 Ensure has single blank line between blocks', wrapper(io => {
	io.warning('Warning')
	io.caution('Caution')
	io.error('Error')
	io.success('Success')
	io.note('Note')
	io.block('Custom block', 'CUSTOM', 'fg=white;bg=green', 'X ', true)
}))
