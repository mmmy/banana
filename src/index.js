const BManager = require("./bocai/BManager")
const XLManager = require("./xianliao/XLManager")

const bm = new BManager()
const xl = new XLManager()

const OPTIONS = {
  chartName: "一起吃小火锅",
  name: "娜娜",
  bet: 1
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
