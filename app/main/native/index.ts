const native =
    typeof __webpack_require__ === 'function'
        ? __non_webpack_require__('../../build/Release/native.node')
        : require('../../../build/Release/native.node')

module.exports = native;