

const wrapper = require('./wrapper')

test('09 Ensure that all lines are aligned to the begin of the first line in a multi-line block', wrapper(io => {
    io.block(['Custom block', 'Second custom block line'], 'CUSTOM', 'fg=white;bg=green', 'X ', true)
}))
