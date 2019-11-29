const XLManager = require("./XLManager")

const xl = new XLManager()

setInterval(async () => {
  if (xl.isReady()) {
    const msgObj = await xl.getParsedFtLatestMessage("一起吃小火锅", "娜娜")
    console.log(msgObj)
  }
}, 5000)
