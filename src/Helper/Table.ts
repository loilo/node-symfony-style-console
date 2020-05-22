import {
  sprintf,
  range,
  strPad,
  lengthWithoutDecoration,
  removeDecoration,
  countOccurences,
  arrayReplaceRecursive,
  arrayFill,
  chunkString,
  arrContains
} from './Helper'

import OutputInterface from '../Output/OutputInterface'

import TableCell from './TableCell'
import TableSeparator from './TableSeparator'
import { TableCellInput, TableRowInput } from './TableCellInterface'
import TableStyle from './TableStyle'

export interface TableStyleHash {
  [s: string]: TableStyle
}

/**
 * Provides helpers to display a table.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * Original PHP Class
 *
 * @author Саша Стаменковић <umpirsky@gmail.com>
 * @author Abdellatif Ait boudad <a.aitboudad@gmail.com>
 * @author Max Grigorian <maxakawizard@gmail.com>
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 */
export default class Table {
  /**
   * Available styles for Table elements.
   */
  private static styles: TableStyleHash

  /**
   * Table headers.
   */
  private headers: TableCellInput[][] = []

  /**
   * Table rows.
   */
  private rows: TableRowInput[] = []

  /**
   * Column widths cache.
   */
  private effectiveColumnWidths: number[] = []

  /**
   * Number of columns cache.
   */
  private numberOfColumns: number

  /**
   * Output
   */
  private output: OutputInterface

  /**
   * TableStyle
   */
  private style: TableStyle

  /**
   * Column Styles
   */
  private columnStyles: TableStyle[] = []

  /**
   * User set column widths
   */
  private columnWidths: number[] = []

  public constructor(output: OutputInterface) {
    this.output = output

    if (!Table.styles) {
      Table.styles = Table.initStyles()
    }
  }

  /**
   * Sets a style definition.
   *
   * @param name  The style name
   * @param style A TableStyle instance
   */
  public static setStyleDefinition(name: string, style: TableStyle) {
    if (!Table.styles) {
      Table.styles = Table.initStyles()
    }

    Table.styles[name] = style
  }

  /**
   * Gets a style definition by name.
   *
   * @param name The style name
   * @return TableStyle
   */
  public static getStyleDefinition(name: string) {
    if (!Table.styles) {
      Table.styles = Table.initStyles()
    }

    if (Table.styles[name]) {
      return Table.styles[name]
    }

    throw new Error(`Style "${name}" is not defined.`)
  }

  private static initStyles() {
    const borderless = new TableStyle()
    borderless
      .setHorizontalBorderChar('=')
      .setVerticalBorderChar(' ')
      .setCrossingChar(' ')

    const compact = new TableStyle()
    compact
      .setHorizontalBorderChar('')
      .setVerticalBorderChar(' ')
      .setCrossingChar('')
      .setCellRowContentFormat('%s')

    const styleGuide = new TableStyle()
    styleGuide
      .setHorizontalBorderChar('-')
      .setVerticalBorderChar(' ')
      .setCrossingChar(' ')
      .setCellHeaderFormat('%s')

    return {
      default: new TableStyle(),
      borderless: borderless,
      compact: compact,
      'symfony-style-guide': styleGuide
    }
  }

  /**
   * Sets table style.
   *
   * @param name The style name or a TableStyle instance
   * @return this
   */
  public setStyle(name: TableStyle | string) {
    this.style = this.resolveStyle(name)

    return this
  }

  /**
   * Gets the current table style.
   *
   * @return TableStyle
   */
  public getStyle() {
    return this.style
  }

  /**
   * Sets table column style.
   *
   * @param columnIndex Column index
   * @param name        The style name or a TableStyle instance
   *
   * @return this
   */
  public setColumnStyle(columnIndex: number, name: TableStyle | string) {
    columnIndex = Math.round(columnIndex)

    this.columnStyles[columnIndex] = this.resolveStyle(name)

    return this
  }

  /**
   * Gets the current style for a column.
   *
   * If style was not set, it returns the global table style.
   *
   * @param columnIndex Column index
   *
   * @return TableStyle
   */
  public getColumnStyle(columnIndex: number) {
    if (this.columnStyles[columnIndex]) {
      return this.columnStyles[columnIndex]
    }

    return this.getStyle()
  }

  /**
   * Sets the minimum width of a column.
   *
   * @param columnIndex Column index
   * @param width       Minimum column width in characters
   *
   * @return this
   */
  public setColumnWidth(columnIndex: number, width: number) {
    this.columnWidths[Math.round(columnIndex)] = Math.round(width)

    return this
  }

  /**
   * Sets the minimum width of all columns.
   *
   * @param widths
   *
   * @return this
   */
  public setColumnWidths(widths: number[]) {
    this.columnWidths = []
    for (let index = 0; index < widths.length; index++) {
      if (typeof widths[index] === 'undefined') continue

      const width = widths[index]
      this.setColumnWidth(index, width)
    }

    return this
  }

  public setHeaders(headers: TableCellInput[] | TableCellInput[][]) {
    const isNestedRows = (
      headers: TableCellInput[] | TableCellInput[][]
    ): headers is TableCellInput[][] =>
      !(headers.length && !Array.isArray(headers[0]))

    if (!isNestedRows(headers)) {
      headers = [headers]
    }

    this.headers = headers

    return this
  }

  public setRows(rows: TableRowInput[]) {
    this.rows = []

    return this.addRows(rows)
  }

  public addRows(rows: TableRowInput[]) {
    for (const row of rows) {
      this.addRow(row)
    }

    return this
  }

  public addRow(row: TableRowInput) {
    if (row instanceof TableSeparator) {
      this.rows.push(row)

      return this
    }

    if (!Array.isArray(row)) {
      throw new Error('A row must be an array or a TableSeparator instance.')
    }

    this.rows.push(row)

    return this
  }

  public setRow(column: number, row: TableRowInput) {
    this.rows[column] = row

    return this
  }

  /**
   * Renders table to output.
   *
   * Example:
   * +---------------+-----------------------+------------------+
   * | ISBN          | Title                 | Author           |
   * +---------------+-----------------------+------------------+
   * | 99921-58-10-7 | Divine Comedy         | Dante Alighieri  |
   * | 9971-5-0210-0 | A Tale of Two Cities  | Charles Dickens  |
   * | 960-425-059-0 | The Lord of the Rings | J. R. R. Tolkien |
   * +---------------+-----------------------+------------------+
   */
  public render() {
    this.calculateNumberOfColumns()
    const rows = this.buildTableRows(this.rows)
    const headers = this.buildTableRows(this.headers)

    this.calculateColumnsWidth(headers.concat(rows))

    this.renderRowSeparator()
    if (headers.length) {
      for (const header of headers) {
        this.renderRow(header, this.style.getCellHeaderFormat())
        this.renderRowSeparator()
      }
    }
    for (const row of rows) {
      if (row instanceof TableSeparator) {
        this.renderRowSeparator()
      } else {
        this.renderRow(row, this.style.getCellRowFormat())
      }
    }
    if (rows.length) {
      this.renderRowSeparator()
    }

    this.cleanup()
  }

  /**
   * Gets number of columns by row.
   *
   * @param row
   *
   * @return int
   */
  public getNumberOfColumns(row: TableCellInput[]) {
    let columns = row.filter(cell => typeof cell !== 'undefined').length
    for (const column of row) {
      columns += column instanceof TableCell ? column.getColspan() - 1 : 0
    }

    return columns
  }

  /**
   * Gets list of columns for the given row.
   *
   * @param array row
   *
   * @return array
   */
  public getRowColumns(row: TableCellInput[]) {
    let columns = range(0, this.numberOfColumns - 1)
    for (let cellKey = 0; cellKey < row.length; cellKey++) {
      if (typeof row[cellKey] === 'undefined') continue

      const cell = row[cellKey]
      if (cell instanceof TableCell && cell.getColspan() > 1) {
        // exclude grouped columns.
        const diffRange = range(cellKey + 1, cellKey + cell.getColspan() - 1)
        columns = columns.filter(column => !arrContains(diffRange, column))
      }
    }

    return columns
  }

  /**
   * Gets column width.
   *
   * @return int
   */
  public getColumnSeparatorWidth() {
    return sprintf(
      this.style.getBorderFormat(),
      this.style.getVerticalBorderChar()
    ).length
  }

  /**
   * Gets cell width.
   *
   * @param row
   * @param column
   *
   * @return int
   */
  public getCellWidth(row: TableCellInput[], column: number) {
    let cellWidth = 0

    if (row[column]) {
      const cell = row[column]
      const cellStr = String(cell)
      cellWidth = lengthWithoutDecoration(this.output.getFormatter(), cellStr)
    }

    const columnWidth = this.columnWidths[column] || 0

    return Math.max(cellWidth, columnWidth)
  }

  /**
   * Renders horizontal header separator.
   *
   * Example: +-----+-----------+-------+
   */
  private renderRowSeparator() {
    const count = this.numberOfColumns

    if (!count) {
      return
    }

    if (
      !this.style.getHorizontalBorderChar() &&
      !this.style.getCrossingChar()
    ) {
      return
    }

    let markup = this.style.getCrossingChar()
    for (let column = 0; column < count; ++column) {
      markup +=
        this.style
          .getHorizontalBorderChar()
          .repeat(this.effectiveColumnWidths[column]) +
        this.style.getCrossingChar()
    }

    this.output.writeln(sprintf(this.style.getBorderFormat(), markup))
  }

  /**
   * Renders vertical column separator.
   */
  private renderColumnSeparator() {
    return sprintf(
      this.style.getBorderFormat(),
      this.style.getVerticalBorderChar()
    )
  }

  /**
   * Renders table row.
   *
   * Example: | 9971-5-0210-0 | A Tale of Two Cities  | Charles Dickens  |
   *
   * @param row
   * @param cellFormat
   */
  private renderRow(row: TableCellInput[], cellFormat: string) {
    if (!row.length) {
      return
    }

    let rowContent = this.renderColumnSeparator()
    for (const column of this.getRowColumns(row)) {
      rowContent += this.renderCell(row, column, cellFormat)
      rowContent += this.renderColumnSeparator()
    }

    this.output.writeln(rowContent)
  }

  /**
   * Renders table cell with padding.
   *
   * @param row
   * @param column
   * @param cellFormat
   */
  private renderCell(
    row: TableCellInput[],
    column: number,
    cellFormat: string
  ) {
    const cell = row[column] || ''
    const cellStr = String(cell)
    let width = this.effectiveColumnWidths[column]

    if (cell instanceof TableCell && cell.getColspan() > 1) {
      // add the width of the following columns(numbers of colspan).
      for (const nextColumn of range(
        column + 1,
        column + cell.getColspan() - 1
      )) {
        width +=
          this.getColumnSeparatorWidth() +
          this.effectiveColumnWidths[nextColumn]
      }
    }

    const style = this.getColumnStyle(column)

    if (cell instanceof TableSeparator) {
      return sprintf(
        style.getBorderFormat(),
        style.getHorizontalBorderChar().repeat(width)
      )
    }

    width +=
      cellStr.length -
      lengthWithoutDecoration(this.output.getFormatter(), cellStr)
    const content = sprintf(style.getCellRowContentFormat(), cell)

    return sprintf(
      cellFormat,
      strPad(content, width, style.getPaddingChar(), style.getPadType())
    )
  }

  /**
   * Calculate number of columns for this table.
   */
  private calculateNumberOfColumns() {
    if (null != this.numberOfColumns) {
      return
    }

    const columns = [0]
    for (const row of this.headers.concat(this.rows as TableCellInput[])) {
      if (row instanceof TableSeparator) {
        continue
      }

      columns.push(this.getNumberOfColumns(row))
    }

    this.numberOfColumns = Math.max(...columns)
  }

  private buildTableRows(rows: TableRowInput[]) {
    let unmergedRows: TableCellInput[][][] = []
    rows = rows.slice(0)

    for (let rowKey = 0; rowKey < rows.length; ++rowKey) {
      if (typeof rows[rowKey] === 'undefined') continue
      if (rows[rowKey] instanceof TableSeparator) continue

      rows = this.fillNextRows(rows, rowKey)
      const row = rows[rowKey] as TableCellInput[]

      // Remove any new line breaks and replace it with a new line
      for (let column = 0; column < row.length; column++) {
        if (typeof row[column] === 'undefined') continue

        const cell = row[column]
        const cellStr = String(cell)

        if (cellStr.includes('\n')) {
          continue
        }
        const lines = cellStr.split('\n')
        for (let lineKey = 0; lineKey < lines.length; lineKey++) {
          let line: TableCellInput = lines[lineKey]
          if (cell instanceof TableCell) {
            line = new TableCell(line, {
              colspan: cell.getColspan()
            })
          }
          if (0 === lineKey) {
            row[column] = line
          } else {
            if (!Array.isArray(unmergedRows[rowKey])) unmergedRows[rowKey] = []
            if (!Array.isArray(unmergedRows[rowKey][lineKey]))
              unmergedRows[rowKey][lineKey] = []
            unmergedRows[rowKey][lineKey][column] = line
          }
        }
      }
    }

    let tableRows: TableCellInput[][] = []
    for (let rowKey = 0; rowKey < rows.length; rowKey++) {
      if (typeof rows[rowKey] === 'undefined') continue
      if (rows[rowKey] instanceof TableSeparator) continue

      const row = rows[rowKey] as TableCellInput[]
      tableRows.push(this.fillCells(row))
      if (unmergedRows[rowKey]) {
        tableRows = tableRows.concat(unmergedRows[rowKey])
      }
    }

    return tableRows
  }

  /**
   * fill rows that contains rowspan > 1.
   *
   * @param inputRows
   * @param line
   *
   * @return array
   */
  private fillNextRows(inputRows: TableRowInput[], line: number) {
    let unmergedRows: TableCellInput[][] = ([] = [])

    if (inputRows[line] instanceof TableSeparator) return inputRows.slice(0)

    const rows = inputRows.slice(0) as TableCellInput[][]

    for (let column = 0; column < rows[line].length; column++) {
      const cell = rows[line][column]

      if (cell instanceof TableCell && cell.getRowspan() > 1) {
        const cellStr = String(cell)
        let nbLines = cell.getRowspan() - 1
        let lines = [cellStr]
        if (cellStr.includes('\n')) {
          lines = cellStr.split('\n')
          nbLines =
            lines.length > nbLines
              ? (countOccurences(cellStr, '\n') as number)
              : nbLines

          rows[line][column] = new TableCell(lines[0], {
            colspan: cell.getColspan()
          })

          delete lines[0]
        }

        // create a two dimensional array (rowspan x colspan)
        unmergedRows = arrayReplaceRecursive(
          arrayFill(line + 1, nbLines, []),
          unmergedRows
        )

        for (
          let unmergedRowKey = 0;
          unmergedRowKey < unmergedRows.length;
          unmergedRowKey++
        ) {
          if (typeof unmergedRows[unmergedRowKey] === 'undefined') continue

          const unmergedRow = unmergedRows[unmergedRowKey]
          const value = lines[unmergedRowKey - line] || ''

          unmergedRows[unmergedRowKey][column] = new TableCell(value, {
            colspan: cell.getColspan()
          })
          if (nbLines === unmergedRowKey - line) {
            break
          }
        }
      }
    }

    for (
      let unmergedRowKey = 0;
      unmergedRowKey < unmergedRows.length;
      unmergedRowKey++
    ) {
      if (typeof unmergedRows[unmergedRowKey] === 'undefined') continue

      const unmergedRow = unmergedRows[unmergedRowKey]

      // we need to know if unmergedRow will be merged or inserted into rows
      if (
        typeof rows[unmergedRowKey] !== 'undefined' &&
        Array.isArray(rows[unmergedRowKey]) &&
        this.getNumberOfColumns(rows[unmergedRowKey]) +
          this.getNumberOfColumns(unmergedRows[unmergedRowKey]) <=
          this.numberOfColumns
      ) {
        for (let cellKey = 0; cellKey < unmergedRow.length; cellKey++) {
          if (typeof unmergedRow[cellKey] === 'undefined') continue

          const cell = unmergedRow[cellKey]
          // insert cell into row at cellKey position
          rows[unmergedRowKey].splice(cellKey, 0, cell)
        }
      } else {
        const row = this.copyRow(rows, unmergedRowKey - 1)
        for (let column = 0; column < unmergedRow.length; column++) {
          if (typeof unmergedRow[column] === 'undefined') continue

          const cell = unmergedRow[column]
          const cellStr = String(cell)

          if (cellStr.length) {
            row[column] = unmergedRow[column]
          }
        }
        rows.splice(unmergedRowKey, 0, row)
      }
    }

    return rows
  }

  /**
   * fill cells for a row that contains colspan > 1.
   *
   * @param row
   *
   * @return array
   */
  private fillCells(row: TableCellInput[]) {
    const newRow = []
    for (let column = 0; column < row.length; column++) {
      if (typeof row[column] === 'undefined') continue

      const cell = row[column]
      newRow.push(cell)
      if (cell instanceof TableCell && cell.getColspan() > 1) {
        for (const position of range(
          column + 1,
          column + cell.getColspan() - 1
        )) {
          // insert empty value at column position
          newRow.push('')
        }
      }
    }

    return newRow || row
  }

  /**
   * @param rows
   * @param line
   *
   * @return array
   */
  private copyRow(rows: TableCellInput[][], line: number) {
    const row = rows[line].slice(0)
    for (let cellKey = 0; cellKey < row.length; cellKey++) {
      if (typeof row[cellKey] === 'undefined') continue

      const cellValue = row[cellKey]
      row[cellKey] = ''
      if (cellValue instanceof TableCell) {
        row[cellKey] = new TableCell('', {
          colspan: cellValue.getColspan()
        })
      }
    }

    return row
  }

  /**
   * Calculates columns widths.
   *
   * @param array rows
   */
  private calculateColumnsWidth(rows: TableRowInput[]) {
    rows = rows.slice(0)

    for (let column = 0; column < this.numberOfColumns; ++column) {
      const lengths = []
      for (let row of rows) {
        if (row instanceof TableSeparator) {
          continue
        }

        row = row.slice(0)

        for (let i = 0; i < row.length; i++) {
          if (typeof row[i] === 'undefined') continue

          const cell = row[i]
          if (cell instanceof TableCell) {
            const textContent = removeDecoration(
              this.output.getFormatter(),
              String(cell)
            )
            const textLength = textContent.length
            if (textLength > 0) {
              const contentColumns = chunkString(
                textContent,
                Math.ceil(textLength / cell.getColspan())
              )

              if (contentColumns === false) {
                throw new Error(`Could not chunk string: ${textContent}`)
              }

              for (
                let position = 0;
                position < contentColumns.length;
                position++
              ) {
                if (typeof contentColumns[position] === 'undefined') continue

                const content = contentColumns[position]
                row[i + position] = content
              }
            }
          }
        }

        lengths.push(this.getCellWidth(row, column))
      }

      this.effectiveColumnWidths[column] =
        Math.max(...lengths) + this.style.getCellRowContentFormat().length - 2
    }
  }

  /**
   * Called after rendering to cleanup cache data.
   */
  private cleanup() {
    this.effectiveColumnWidths = []
    this.numberOfColumns = null
  }

  private resolveStyle(name: TableStyle | string) {
    if (name instanceof TableStyle) {
      return name
    }

    if (Table.styles[name]) {
      return Table.styles[name]
    }

    throw new Error(`Style "${name}" is not defined.`)
  }
}
