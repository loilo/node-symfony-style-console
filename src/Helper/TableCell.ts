import TableCellInterface from './TableCellInterface'

/**
 * Represents an object literal containing the options of a [[TableCell]].
 */
export interface TableCellOptions {
  rowspan: number
  colspan: number
}

/**
 * @author Abdellatif Ait boudad <a.aitboudad@gmail.com>
 *
 * Original PHP Class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 */
export default class TableCell implements TableCellInterface {
  /**
   * The cell's options.
   */
  private options: TableCellOptions

  /**
   * The cell's text content.
   */
  private value: string

  /**
   * Creates a new TableCell.
   *
   * @param value The cell's text content
   * @param options The cell's options
   */
  public constructor(
    value: string = '',
    options: Partial<TableCellOptions> = {}
  ) {
    this.value = value

    this.options = Object.assign(
      {
        rowspan: 1,
        colspan: 1
      },
      options
    )
  }

  /**
   * Returns the cell value.
   *
   * @return string
   */
  public toString() {
    return this.value
  }

  /**
   * Gets number of colspan.
   *
   * @return colspan
   */
  public getColspan() {
    return this.options.colspan
  }

  /**
   * Gets number of rowspan.
   *
   * @return rowspan
   */
  public getRowspan() {
    return this.options.rowspan
  }
}
