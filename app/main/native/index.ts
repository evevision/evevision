let native

if(typeof __webpack_require__ === 'function') {
    try {
        // for some reason the production build needs this instead
        native = __non_webpack_require__('../../build/Release/native.node')
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND' &&
            e.code !== 'QUALIFIED_PATH_RESOLUTION_FAILED' &&
            !/not find/i.test(e.message)) {
            throw e;
        } else {
            native = require('../../../build/Release/native.node')
        }
    }
} else {
    native = require('../../../build/Release/native.node') // running in development, load directly
}

module.exports = native