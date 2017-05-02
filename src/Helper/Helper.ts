/**
 * Represents an arbitrary object literal
 */
export interface ArbitraryObjectLiteral {
  [s: string]: any
}

/**
 * Represents an object literal with arbitrary strings as values
 */
export interface StringHash {
  [s: string]: string
}

/**
 * Count occurrences of `needle` in `haystack`. Doesn't count overlapped substrings.
 * 
 * @param haystack The string to search in
 * @param needle   The substring to search for
 * @param offset   The offset where to start counting. If the offset is negative, counting starts from the end of the string.
 * @param length   The maximum length after the specified offset to search for the substring. A negative length counts from the end of haystack.
 */
export function countOccurences (haystack: string, needle: string, offset: number = 0, length: number = 0): number|false {
  let count = 0

  if (!needle.length) {
    return false
  }

  offset--
  while ((offset = haystack.indexOf(needle, offset + 1)) !== -1) {
    if (length > 0 && (offset + needle.length) > length) {
      return false
    }
    count++
  }

  return count
}

/**
 * Generates an array containing the integer values starting with `from` and ending with `to`.
 * 
 * @param from The lower bound
 * @param to   The upper bound
 */
export function range (from: number, to: number): number[] {
  from = Math.round(from)
  to = Math.round(to)
  const arr: number[] = []

  if (from < to) {
    for (let i = from; i <= to; i++) arr.push(i)
  } else {
    for (let i = to; i >= from; i--) arr.push(i)
  }

  return arr
}

/**
 * Formats a string.
 *  
 * This is a port of PHP's [`sprintf`](https://secure.php.net/manual/de/function.sprintf.php) function.
 * 
 * @param format The formatting template
 * @param args   The values to merge into the template
 */
export function sprintf (format: string, ...args: any[]) {
  let regex = /%%|%(\d+\$)?([-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g
  const a = args.map(arg => String(arg))
  let i = 0

  let _pad = function (str: string, len: number, chr = ' ', leftJustify: boolean) {
    let padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
    return leftJustify ? str + padding : padding + str
  }

  let justify = function (value: string, prefix: string, leftJustify: boolean, minWidth: number, zeroPad: boolean, customPadChar?: string) {
    let diff = minWidth - value.length
    if (diff > 0) {
      if (leftJustify || !zeroPad) {
        value = _pad(value, minWidth, customPadChar, leftJustify)
      } else {
        value = [
          value.slice(0, prefix.length),
          _pad('', diff, '0', true),
          value.slice(prefix.length)
        ].join('')
      }
    }
    return value
  }

  type NumberStringifyMethod = 'toExponential' | 'toFixed' | 'toPrecision'
  type TextTransform = 'toString' | 'toUpperCase'
  type AvailableBases = number
  const prefixValues: StringHash = {
    '2': '0b',
    '8': '0',
    '16': '0x'
  }

  let _formatBaseX = function (value: string|number, base: AvailableBases, prefix: string|boolean, leftJustify: boolean, minWidth: number, precision: number, zeroPad: boolean): string {
    // Note: casts negative numbers to positive ones
    value = +value
    let number = value >>> 0
    prefix = (prefix && number && prefixValues[String(base)]) || ''
    const strValue = prefix + _pad(number.toString(+base), precision || 0, '0', false)
    return justify(strValue, prefix, leftJustify, minWidth, zeroPad)
  }

  // _formatString()
  let _formatString = function (value: string, leftJustify: boolean, minWidth: number, precision: number, zeroPad: boolean, customPadChar?: string) {
    if (precision !== null && precision !== undefined) {
      value = value.slice(0, precision)
    }
    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar)
  }

  // doFormat()
  // RegEx replacer
  let doFormat = function (substring: string, valueIndex: number, flags: string, minWidth: string|number, precision: string|number, type: string) {

    let number, prefix, method: NumberStringifyMethod, textTransform: TextTransform, value

    if (substring === '%%') {
      return '%'
    }

    // parse flags
    let leftJustify = false
    let positivePrefix = ''
    let zeroPad = false
    let prefixBaseX = false
    let customPadChar = ' '
    let flagsl = flags.length
    let j
    for (j = 0; j < flagsl; j++) {
      switch (flags.charAt(j)) {
        case ' ':
          positivePrefix = ' '
          break
        case '+':
          positivePrefix = '+'
          break
        case '-':
          leftJustify = true
          break
        case "'":
          customPadChar = flags.charAt(j + 1)
          break
        case '0':
          zeroPad = true
          customPadChar = '0'
          break
        case '#':
          prefixBaseX = true
          break
      }
    }

    // parameters may be null, undefined, empty-string or real valued
    // we want to ignore null, undefined and empty-string values
    if (typeof minWidth === 'number') {
    } else if (!minWidth) {
      minWidth = 0
    } else if (minWidth === '*') {
      minWidth = +a[i++]
    } else if (minWidth.charAt(0) === '*') {
      minWidth = +a[+minWidth.slice(1, -1)]
    } else {
      minWidth = +minWidth
    }

    // Note: undocumented perl feature:
    if (minWidth < 0) {
      minWidth = -minWidth
      leftJustify = true
    }

    if (!isFinite(minWidth)) {
      throw new Error('sprintf: (minimum-)width must be finite')
    }

    if (typeof precision === 'number') {
    } else if (!precision) {
      precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined
    } else if (precision === '*') {
      precision = +a[i++]
    } else if (precision.charAt(0) === '*') {
      precision = +a[+precision.slice(1, -1)]
    } else {
      precision = +precision
    }

    // grab value using valueIndex if required?
    value = valueIndex ? a[+String(valueIndex).slice(0, -1)] : a[i++]

    switch (type) {
      case 's':
        return _formatString(value, leftJustify, minWidth, precision, zeroPad, customPadChar)
      case 'c':
        return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad)
      case 'b':
        return _formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'o':
        return _formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'x':
        return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'X':
        return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
        .toUpperCase()
      case 'u':
        return _formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
      case 'i':
      case 'd':
        number = +value || 0
        // Plain Math.round doesn't just truncate
        number = Math.round(number - number % 1)
        prefix = number < 0 ? '-' : positivePrefix
        value = prefix + _pad(String(Math.abs(number)), precision, '0', false)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)
      case 'e':
      case 'E':
      case 'f': // @todo: Should handle locales (as per setlocale)
      case 'F':
      case 'g':
      case 'G':
        number = +value
        prefix = number < 0 ? '-' : positivePrefix

        const methods: NumberStringifyMethod[] = ['toExponential', 'toFixed', 'toPrecision']
        method = methods['efg'.indexOf(type.toLowerCase())]

        const transforms: TextTransform[] = ['toString', 'toUpperCase']
        textTransform = transforms['eEfFgG'.indexOf(type) % 2]
        value = prefix + Math.abs(number)[method](precision)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]()
      default:
        return substring
    }
  }

  return format.replace(regex, doFormat)
}

/**
 * Creates a human-friendly representation of a number of bytes.
 * 
 * @param memory The number of bytes to format
 */
export function formatMemory(memory: number) {
  if (memory >= 1024 * 1024 * 1024) {
    return sprintf('%.1f GiB', memory / 1024 / 1024 / 1024)
  }

  if (memory >= 1024 * 1024) {
    return sprintf('%.1f MiB', memory / 1024 / 1024)
  }

  if (memory >= 1024) {
    return sprintf('%d KiB', memory / 1024)
  }

  return sprintf('%d B', memory)
}

import OutputFormatterInterface from '../Formatter/OutputFormatterInterface'

/**
 * Removes `<...>` formatting and ANSI escape sequences from a string.
 * 
 * @param formatter The formatter instance in charge to resolve `<...>` formatting
 * @param str       The string to perform the removing on
 */
export function removeDecoration (formatter: OutputFormatterInterface, str: string) {
  const isDecorated = formatter.isDecorated()
  formatter.setDecorated(false)

  // Resolve <...> formatting
  str = formatter.format(str)

  // Remove ANSI-formatted characters
  str = str.replace(/\033\[[^m]*m/g, '')

  formatter.setDecorated(isDecorated)

  return str
}

/**
 * Get the length of a string ignoring `<...>` formatting and ANSI escape sequences.
 * 
 * @param formatter The formatter instance in charge to resolve `<...>` formatting 
 * @param str       The string whose length to determine
 */
export function lengthWithoutDecoration (formatter: OutputFormatterInterface, str: string) {
  return removeDecoration(formatter, str).length
}

/**
 * Creates an object literal with key/value pairs of the given `obj` swapped.
 * 
 * @param obj The object whose keys and values to use
 */
export function flipObject (obj: ArbitraryObjectLiteral): ArbitraryObjectLiteral {
  const flipped = Object.create(null)
  for (const key in obj) flipped[obj[key]] = key
  return flipped
}

/**
 * Checks if `item` is contained by `arr`.
 * 
 * @param arr  The array to search in
 * @param item The item to search for
 */
export function arrContains (arr: any[], item: any) {
  if (Array.prototype.includes) {
    return arr.includes(item)
  } else {
    return arr.indexOf(item) !== -1
  }
}

/**
 * Creates a human-friendly representation of a number of seconds.
 * 
 * @param secs The number of seconds to format
 */
export function formatTime (secs: number): string {
  interface TimeFormat extends Array<any> {
    0: number,
    1: string,
    2?: number
  }
  const timeFormats: TimeFormat[] = [
    [0, '< 1 sec'],
    [1, '1 sec'],
    [2, 'secs', 1],
    [60, '1 min'],
    [120, 'mins', 60],
    [3600, '1 hr'],
    [7200, 'hrs', 3600],
    [86400, '1 day'],
    [172800, 'days', 86400]
  ]

  for (let index = 0; index < timeFormats.length; index++) {
    const format = timeFormats[index]

    if (secs >= format[0]) {
      if (
        (timeFormats[index + 1] && secs < timeFormats[index + 1][0]) ||
        index == timeFormats.length - 1
      ) {
        if (2 == format.length) {
          return format[1]
        }

        return `${Math.floor(secs / format[2])} ${format[1]}`
      }
    }
  }
}

/**
 * The available variants to pad a string
 */
export type PAD_TYPE = 'STR_PAD_LEFT' | 'STR_PAD_RIGHT' | 'STR_PAD_BOTH'

/**
 * Pads a string to a certain length with another string.
 * 
 * @param input     The string to pad
 * @param padLength The desired length of the resulting string
 * @param padString The string to use as padding material
 * @param padType   Where to pad the string
 */
export function strPad (input: string, padLength: number, padString: string, padType: PAD_TYPE = 'STR_PAD_RIGHT') {
  let half = ''
  let padToGo
  let _strPadRepeater = function (s: string, len: number) {
    let collect = ''
    while (collect.length < len) {
      collect += s
    }
    collect = collect.substr(0, len)
    return collect
  }
  input += ''
  padString = padString !== undefined ? padString : ' '
  if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH') {
    padType = 'STR_PAD_RIGHT'
  }
  if ((padToGo = padLength - input.length) > 0) {
    if (padType === 'STR_PAD_LEFT') {
      input = _strPadRepeater(padString, padToGo) + input
    } else if (padType === 'STR_PAD_RIGHT') {
      input = input + _strPadRepeater(padString, padToGo)
    } else if (padType === 'STR_PAD_BOTH') {
      half = _strPadRepeater(padString, Math.ceil(padToGo / 2))
      input = half + input + half
      input = input.substr(0, padLength)
    }
  }
  return input
}

/**
 * Replaces elements from passed arrays into the first array recursively. (non-destructive)
 * 
 * @param arr  The array to patch
 * @param args The arrays to merge into `arr`
 */
export function arrayReplaceRecursive (arr: any[], ...args: any[][]): any[] {
  let i = 0
  let p = ''
  if (!args.length) {
    throw new Error('There should be at least 2 arguments passed to array_replace_recursive()')
  }
  // Although docs state that the arguments are passed in by reference,
  // it seems they are not altered, but rather the copy that is returned
  // So we make a copy here, instead of acting on arr itself
  const retArr: any[] = []
  for (p in arr) {
    if (typeof arr[p] === 'undefined') continue

    retArr[+p] = arr[p]
  }
  for (i = 0; i < args.length; i++) {
    for (p in args[i]) {
      if (retArr[+p] && typeof retArr[+p] === 'object') {
        retArr[+p] = arrayReplaceRecursive(retArr[+p], arguments[i][+p])
      } else {
        retArr[+p] = arguments[i][+p]
      }
    }
  }
  return retArr
}

/**
 * Creates an array filled with a value.
 * 
 * @param startIndex The index to start filling at. Previous values will be `undefined`.
 * @param num        The number elements to insert
 * @param value      The element to fill the array with
 */
export function arrayFill<T> (startIndex: number, num: number, value: T): T[] {
  let key
  let tmpArr = []
  if (!isNaN(startIndex) && !isNaN(num)) {
    for (key = 0; key < num; key++) {
      tmpArr[(key + startIndex)] = value
    }
  }
  return tmpArr
}

/**
 * Cuts a string into an array of chunks of given length.
 * 
 * @param string      The string to cut
 * @param splitLength The length of the resulting chunks
 */
export function chunkString (string: string, splitLength: number = 1): string[]|false {
  if (string === null || splitLength < 1) {
    return false
  }
  string += ''
  let chunks = []
  let pos = 0
  let len = string.length
  while (pos < len) {
    chunks.push(string.slice(pos, pos += splitLength))
  }
  return chunks
}

/**
 * Strips HTML tags from a string.
 * 
 * @param input   The string to sanitize
 * @param allowed A string containing a set of allowed tags. Example: `<a><strong><em>`
 */
export function stripTags (input: string, allowed: string = ''): string {
  allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
  let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  let comments = /<!--[\s\S]*?-->/gi
  return input.replace(comments, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
  })
}

/**
 * Trims the end of a string.
 * 
 * @param str      The string to trim
 * @param charlist The characters to trim. Everything that can go into a regex character class is allowed.
 */
export function trimEnd (str: string, charlist = ' \\s\u00A0'): string {
  charlist = String(charlist).replace(/([[\]().?/*{}+$^:])/g, '\\$1')
  let re = new RegExp('[' + charlist.replace(/\\/g, '\\\\') + ']+$', 'g')
  return (str + '').replace(re, '')
}

/**
 * Non-recursively replaces a set of values inside a string.
 * 
 * @param str          The string to perform replacements on
 * @param replacePairs An object that maps strings to their respective replacements
 */
export function safeReplace (str: string, replacePairs: StringHash): string {
    'use strict';
    str = String(str)
    let key, re;
    for (key in replacePairs) {
        if (replacePairs.hasOwnProperty(key)) {
            re = new RegExp(key, 'g');
            str = str.replace(re, replacePairs[key]);
        }
    }
    return str;
}

/**
 * Wraps a string to a given number of characters.
 * 
 * Note that, as opposed to PHP's wordwrap, this always cuts words which are too long for one line.
 * 
 * @param str           The string to wrap
 * @param width         The maximum length of a line
 * @param breakSequence The character(s) to use as line breaks
 */
export function wordwrap (str: string, width = 75, breakSequence = '\n'): string {
  let j, l, s, r
  str += ''
  if (width < 1) {
    return str
  }

  let splitted = str.split(/\r\n|\n|\r/)
  for (let i = 0; i < splitted.length; i++) {
    let rest = splitted[i]
    const partials = []

    while (rest.length > width) {
      let line = rest.slice(0, width)
      if (rest.slice(width).match(/^\s/)) {
        rest = rest.slice(line.length + 1)
      } else if (line.match(/\s/)) {
        line = line.slice(0, line.match(/\s(?=[^\s]*$)/).index)
        rest = rest.slice(line.length + 1)
      } else {
        rest = rest.slice(line.length)
      }

      partials.push(line)
    }
    if (rest.length) partials.push(rest)

      splitted[i] = partials.join(breakSequence)
  }

  return splitted.join(breakSequence)
}

/**
 * Returns the current timestamp in seconds.
 */
export function time () {
  return Math.floor(Date.now() / 1000)
}
