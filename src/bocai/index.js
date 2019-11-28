const BManager = require("./BManager")

const bm = new BManager()

setInterval(async () => {
  if (!bm._ready) {
    return
  }
  await bm.closeAlertIfHave()
  // todo: 判断是否封盘
  const hasXd = await bm.hasFtZhudan()
  if (!hasXd) {
    console.log("start bet test")
    const data = { indexes: [2, 3, 4, 5, 6, 7, 8], numbers: [3], bet: 1 }
    // todo: 判断期号
    bm.ftGoGo(data)
  }
}, 10000)
