var Issue = require('../utils').issues.Issue
var type = require('../utils').type

/**
 * bval
 *
 * Takes a bval file, its contents as a string
 * and a callback as arguments. Callsback
 * with any issues it finds while validating
 * against the BIDS specification.
 */
module.exports = function bval(file, contents, callback) {
  var issues = []

  if (contents.replace(/^\s+|\s+$/g, '').split('\n').length !== 1) {
    issues.push(
      new Issue({
        code: 30,
        file: file,
      }),
    )
  }

  // check for proper separator and value type
  var row = contents.replace(/^\s+|\s+$/g, '').split(' ')
  var invalidValue = false
  for (var j = 0; j < row.length; j++) {
    var value = row[j]
    if (!type.isNumber(value)) {
      invalidValue = true
    }
  }
  if (invalidValue) {
    issues.push(
      new Issue({
        code: 47,
        file: file,
      }),
    )
  }

  callback(issues)
}
