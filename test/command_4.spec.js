

const wrapper = require('./wrapper')

test('04 Ensure has single blank line after any text and a title', wrapper(io => {
    io.write('Lorem ipsum dolor sit amet')
    io.title('First title')

    io.writeln('Lorem ipsum dolor sit amet')
    io.title('Second title')

    io.write('Lorem ipsum dolor sit amet')
    io.write('')
    io.title('Third title')

    // Ensure edge case by appending empty strings to history:
    io.write('Lorem ipsum dolor sit amet')
    io.write(['', '', ''])
    io.title('Fourth title')

    // Ensure have manual control over number of blank lines:
    io.writeln('Lorem ipsum dolor sit amet')
    io.writeln(['', '']) //Should append an extra blank line
    io.title('Fifth title')

    io.writeln('Lorem ipsum dolor sit amet')
    io.newLine(2) //Should append an extra blank line
    io.title('Fifth title')
}))
