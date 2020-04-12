var requireFunc =
    typeof __webpack_require__ === 'function'
        ? __non_webpack_require__
        : require;

const overlay = requireFunc('../build/Release/overlay.node');
module.exports = overlay;