const BManager = require("./bocai/BManager")
const XLManager = require("./xianliao/XLManager")

const bm = new BManager({
  checkIssue: true,
  lossDouble: true,
  doubleRate: 2.5, // 5m: 2, 6码：2.5， 7码：3.33
  stopAtAmount: 1500 // 1500停止
})
const xl = new XLManager()

const OPTIONS = {
  chartName: "一起吃小火锅",
  name: "娜娜",
  bet: 2
}

setInterval(async () => {
  if (xl.isReady()) {
    const msgObj = await xl.getParsedFtLatestMessage(
      OPTIONS.chartName,
      OPTIONS.name
    )
    console.log(msgObj)
    if (msgObj) {
      bm.doFt({
        ...msgObj,
        bet: OPTIONS.bet
      })
    }
  }
}, 20 * 1000)
