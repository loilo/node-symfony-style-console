import { arrContains, PAD_TYPE } from './Helper'

/**
 * Defines the styles for a Table.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 *
 * Original PHP class
 *
 * @author Саша Стаменковић <umpirsky@gmail.com>
 *
 * Original PHP class
 *
 * @author Florian Reuschel <florian@loilo.de>
 *
 * Port to TypeScript
 *
 */
export default class TableStyle {
  /**
   * The character that pads the end of cell contents.
   */
  private paddingChar = ' '

  /**
   * The character horizontal borders are built from.
   */
  private horizontalBorderChar = '-'

  /**
   * The character vertical borders are built from.
   */
  private verticalBorderChar = '|'

  /**
   * The character horizontal + vertical intersections are built from
   */
  private crossingChar = '+'

  /**
   * A format for header cells.
   */
  private cellHeaderFormat = '<info>%s</info>'

  /**
   * A format for regular cells.
   */
  private cellRowFormat = '%s'

  /**
   * A format for regular cell's content.
   */
  private cellRowContentFormat = ' %s '

  /**
   * A format for borders.
   */
  private borderFormat = '%s'

  /**
   * The direction cells should be padded at.
   */
  private padType: PAD_TYPE = 'STR_PAD_RIGHT'

  /**
   * Clones the [[TableStyle]] instance.
   */
  public clone() {
    const inst = new TableStyle()
    inst.setPaddingChar(this.getPaddingChar())
    inst.setHorizontalBorderChar(this.getHorizontalBorderChar())
    inst.setVerticalBorderChar(this.getVerticalBorderChar())
    inst.setCrossingChar(this.getCrossingChar())
    inst.setCellHeaderFormat(this.getCellHeaderFormat())
    inst.setCellRowFormat(this.getCellRowFormat())
    inst.setCellRowContentFormat(this.getCellRowContentFormat())
    inst.setBorderFormat(this.getBorderFormat())
    inst.setPadType(this.getPadType())
    return inst
  }

  /**
   * Sets padding character, used for cell padding.
   *
   * @param paddingChar The cell padding character to use
   */
  public setPaddingChar(paddingChar: string) {
    if (!paddingChar) {
      throw new Error('The padding char must not be empty')
    }

    this.paddingChar = paddingChar

    return this
  }

  /**
   * Gets padding character, used for cell padding.
   */
  public getPaddingChar() {
    return this.paddingChar
  }

  /**
   * Sets horizontal border character.
   *
   * @param horizontalBorderChar The horizontal border character to use
   */
  public setHorizontalBorderChar(horizontalBorderChar: string) {
    this.horizontalBorderChar = horizontalBorderChar

    return this
  }

  /**
   * Gets horizontal border character.
   */
  public getHorizontalBorderChar() {
    return this.horizontalBorderChar
  }

  /**
   * Sets vertical border character.
   *
   * @param verticalBorderChar The vertical border character to use
   */
  public setVerticalBorderChar(verticalBorderChar: string) {
    this.verticalBorderChar = verticalBorderChar

    return this
  }

  /**
   * Gets vertical border character.
   */
  public getVerticalBorderChar() {
    return this.verticalBorderChar
  }

  /**
   * Sets crossing character.
   *
   * @param crossingChar The crossing character to use
   */
  public setCrossingChar(crossingChar: string) {
    this.crossingChar = crossingChar

    return this
  }

  /**
   * Gets crossing character.
   */
  public getCrossingChar() {
    return this.crossingChar
  }

  /**
   * Sets header cell format.
   *
   * @param cellHeaderFormat The header cell format to use
   */
  public setCellHeaderFormat(cellHeaderFormat: string) {
    this.cellHeaderFormat = cellHeaderFormat

    return this
  }

  /**
   * Gets header cell format.
   */
  getCellHeaderFormat() {
    return this.cellHeaderFormat
  }

  /**
   * Sets row cell format.
   *
   * @param cellRowFormat The row cell format to use
   */
  setCellRowFormat(cellRowFormat: string) {
    this.cellRowFormat = cellRowFormat

    return this
  }

  /**
   * Gets row cell format.
   */
  getCellRowFormat() {
    return this.cellRowFormat
  }

  /**
   * Sets row cell content format.
   *
   * @param cellRowContentFormat The cell content format to use
   */
  setCellRowContentFormat(cellRowContentFormat: string) {
    this.cellRowContentFormat = cellRowContentFormat

    return this
  }

  /**
   * Gets row cell content format.
   */
  getCellRowContentFormat() {
    return this.cellRowContentFormat
  }

  /**
   * Sets table border format.
   *
   * @param borderFormat The border format to use
   */
  setBorderFormat(borderFormat: string) {
    this.borderFormat = borderFormat

    return this
  }

  /**
   * Gets table border format.
   */
  getBorderFormat() {
    return this.borderFormat
  }

  /**
   * Sets cell padding type.
   *
   * @param padType The padding type to use
   */
  setPadType(padType: PAD_TYPE) {
    if (
      !arrContains(['STR_PAD_LEFT', 'STR_PAD_RIGHT', 'STR_PAD_BOTH'], padType)
    ) {
      throw new ReferenceError(
        'Invalid padding type. Expected one of (STR_PAD_LEFT, STR_PAD_RIGHT, STR_PAD_BOTH).'
      )
    }

    this.padType = padType

    return this
  }

  /**
   * Gets cell padding type.
   */
  getPadType() {
    return this.padType
  }
}
