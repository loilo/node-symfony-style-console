

const wrapper = require('../wrap-test')

test('06 Ensure has proper blank line after text block when using a block like with SymfonyStyle::success', wrapper(6, io => {
    io.listing([
        'Lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
    ])
    io.success('Lorem ipsum dolor sit amet')
}))
