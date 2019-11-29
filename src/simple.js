const BManager = require("./bocai/BManager")
// const XLManager = require("./xianliao/XLManager")

const bm = new BManager({
  checkIssue: false,
  lossDouble: true
})
// const xl = new XLManager()

// const OPTIONS = {
//   chartName: "一起吃小火锅",
//   name: "娜娜",
//   bet: 1
// }

setInterval(async () => {
  const data = {
    indexes: [7],
    numbers: [5, 6, 7, 8, 9],
    bet: 1
  }
  await bm.doFt(data)
}, 4 * 1000)
