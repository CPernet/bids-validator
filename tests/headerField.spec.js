const assert = require('assert')
const headerFields = require('../validators/headerFields')

describe('headerFields', () => {
  it('should throw an error if _magnitude1 or _magnitude2 files have too many dimensions.', () => {
    // each of these headers has one too many dimensions on the 'dim' field.
    // the first entry is the total count, and the following three entries are spatial.
    const headers = [
      [
        {
          name: 'sub-01_magnitude1.nii',
          relativePath: 'sub-01_magnitude1.nii',
        },
        {
          dim: [5, 1, 1, 1, 1],
          pixdim: [5, 1, 1, 1, 1],
          xyzt_units: [5, 1, 1, 1, 1],
        },
      ],
      [
        {
          name: 'sub-01_magnitude2.nii',
          relativePath: 'sub-01_magnitude2.nii',
        },
        {
          dim: [5, 1, 1, 1, 1],
          pixdim: [5, 1, 1, 1, 1],
          xyzt_units: [5, 1, 1, 1, 1],
        },
      ],
    ]
    const issues = headerFields(headers)
    assert(
      issues.length == 2 && issues[0].code == '94' && issues[1].code == '94',
    )
  })

  it('_magnitude1 or _magnitude2 files should have 3 dimensions.', () => {
    const headers = [
      [
        {
          name: 'sub-01_magnitude1.nii',
          relativePath: 'sub-01_magnitude1.nii',
        },
        {
          dim: [4, 1, 1, 1],
          pixdim: [4, 1, 1, 1],
          xyzt_units: [4, 1, 1, 1],
        },
      ],
      [
        {
          name: 'sub-01_magnitude2.nii',
          relativePath: 'sub-01_magnitude2.nii',
        },
        {
          dim: [3, 1, 1],
          pixdim: [4, 1, 1, 1],
          xyzt_units: [4, 1, 1, 1],
        },
      ],
    ]
    const issues = headerFields(headers)
    assert.deepEqual(issues, [])
  })
})
