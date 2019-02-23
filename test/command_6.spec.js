

const wrapper = require('./wrapper')

test('06 Ensure has proper blank line after text block when using a block like with SymfonyStyle::success', wrapper(io => {
    io.listing([
        'Lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
    ])
    io.success('Lorem ipsum dolor sit amet')
}))
