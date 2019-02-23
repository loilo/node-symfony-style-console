

const wrapper = require('./wrapper')

test('05 Ensure has proper line ending before outputting a text block like with SymfonyStyle.listing() or SymfonyStyle.text()', wrapper(io => {
    io.writeln('Lorem ipsum dolor sit amet')
    io.listing([
        'Lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
    ])

    // Even using write:
    io.write('Lorem ipsum dolor sit amet')
    io.listing([
        'Lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
    ])

    io.write('Lorem ipsum dolor sit amet')
    io.text([
        'Lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
    ])

    io.newLine()

    io.write('Lorem ipsum dolor sit amet')
    io.comment([
        'Lorem ipsum dolor sit amet',
        'consectetur adipiscing elit',
    ])
}))
