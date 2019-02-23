

const wrapper = require('./wrapper')

test('07 Ensure questions do not output anything when input is non-interactive', wrapper(io => {
    io.input.setInteractive(false)

    io.title('Title')
    io.askHidden('Hidden question')
    io.choice('Choice question with default', ['choice1', 'choice2'], 'choice1')
    io.confirm('Confirmation with yes default', true)
    io.text('Duis aute irure dolor in reprehenderit in voluptate velit esse')
}))
