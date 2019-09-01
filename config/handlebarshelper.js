//customized if/else, options.fn() & options.inverse() are methods.
module.exports = {
  ifEquals:
    function (arg1, arg2, options) {
      if (arg1 === arg2) {
        return options.fn(this)
      } else {
        return options.inverse(this)
      }
    }
}