import TableSeparator from './TableSeparator'

/**
 * User input for a cell: Either its string content or a [[TableCellInterface]] instance.
 */
export type TableCellInput = string | TableCellInterface

/**
 * User input for a row: An array of [[TableCellInput]]s or a [[TableSeparator]]
 */
export type TableRowInput = TableCellInput[] | TableSeparator

/**
 * Interface for Table cells.
 *
 * @author Florian Reuschel <florian@loilo.de>
 */
export interface TableCellInterface {
  /**
   * Gets number of colspan.
   *
   * @return colspan
   */
  getColspan(): number

  /**
   * Gets number of rowspan.
   *
   * @return rowspan
   */
  getRowspan(): number
}

export default TableCellInterface
