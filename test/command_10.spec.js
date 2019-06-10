

const wrapper = require('./wrapper')

test('10 Ensure that all lines are aligned to the begin of the first line in a very long line block', wrapper(io => {
	io.block(
		'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
		'CUSTOM',
		'fg=white;bg=green',
		'X ',
		true
	)
}))