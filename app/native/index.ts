const paths: string[] = [
  "../build/Release/native.node",
  "../../build/Release/native.node",
  "../../../build/Release/native.node"
];

let native;
if (typeof __webpack_require__ === "function") {
  const required = paths.some(path => {
    try {
      console.log("trying to require native at ", path);
      native = __non_webpack_require__(path);
      console.log("native node module successfully loaded at", path);
      return true;
    } catch (e) {
      if (
        e.code !== "MODULE_NOT_FOUND" &&
        e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" &&
        !/not find/i.test(e.message)
      ) {
        throw e;
      } else {
        return false;
      }
    }
  });
  if (!required) {
    throw new Error("Could not load native node module at any known paths");
  }
} else {
  native = require("../../build/Release/native.node"); // running in development, load directly
}

module.exports = native;
