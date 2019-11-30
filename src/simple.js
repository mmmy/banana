const BManager = require("./bocai/BManager")
// const XLManager = require("./xianliao/XLManager")

const bm = new BManager({
  checkIssue: false,
  lossDouble: true,
  doubleRate: 2 // 5m: 2, 6码：2.5， 7码：3.33
})
// const xl = new XLManager()

// const OPTIONS = {
//   chartName: "一起吃小火锅",
//   name: "娜娜",
//   bet: 1
// }

setInterval(async () => {
  const data = {
    indexes: [9],
    numbers: [6, 7, 8, 9, 10],
    bet: 2
  }
  await bm.doFt(data)
}, 4 * 1000)
