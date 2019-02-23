const wrapper = require('./wrapper')
const { TableCell } = require('../dist')

test('08 Ensure formatting tables when using multiple headers with TableCell', wrapper(io => {
    const headers = [
        [new TableCell('Main table title', { colspan: 3 })],
        ['ISBN', 'Title', 'Author'],
    ]

    const rows = [
        [
            '978-0521567817',
            'De Monarchia',
            new TableCell("Dante Alighieri\nspans multiple rows", { rowspan: 2 }),
        ],
        ['978-0804169127', 'Divine Comedy'],
    ]

    io.table(headers, rows)
}))
