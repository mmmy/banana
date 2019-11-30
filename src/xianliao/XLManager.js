const puppeteer = require("puppeteer")
// '1234567890' or '4-2' => [1,2,3,4,5,6,7,8,9,10]
function parseStringToNumbers(string = "") {
  if (string.length === 3 && string.indexOf("-") > -1) {
    const nums = []
    const start = +string[0]
    const end = +string[2]
    if (end === 0) {
      end = 10
    }
    for (let i = start; i <= end; i++) {
      nums.push(i)
    }
    return nums
  }
  return string.split("").map(s => {
    const n = +s
    if (n === 0) {
      return 10
    } else {
      return n
    }
  })
}

function parseLastFtMessage(message = "", reg) {
  let msges = message.split("\n")
  msges = msges.reverse()
  for (let i = 0; i < msges.length; i++) {
    const msg = msges[i]
    let result = null
    if (reg) {
      result = reg.exec(msg)
    } else {
      // 使用默认测试
      const reg1 = /(\d+)期(\d+)名(\d+)各/ // 一般5m
      const reg2 = /(\d+)期(\d+)名买(\d+)各/ // 一般5m
      const reg3 = /(\d+)期(\d\-\d)[买|名](\d+)[各|个]/
      result = reg1.exec(msg) || reg2.exec(msg) || reg3.exec(msg)
    }

    if (result) {
      return {
        msg: result[0],
        issue: result[1], // 期数
        indexes: parseStringToNumbers(result[2]),
        numbers: parseStringToNumbers(result[3])
      }
    }
  }
}

class XLManager {
  constructor(options) {
    this._events = {}
    this._options = {
      ...options
    }
    this._ready = false
    this._init()
  }

  async _init() {
    await this._initBrowser()
    await this._initXianliaoWeb()
    console.log("init ok")
  }

  async _initBrowser() {
    this._browser = await puppeteer.launch({
      headless: false,
      executablePath: "F:/chrome-win/chrome.exe",
      defaultViewport: {
        width: 1000,
        height: 800
      },
      args: [`--window-size=${1000},${930}`] // new option
    })
  }

  async _initXianliaoWeb() {
    const page = await this._browser.pages()
    const page0 = page[0]
    // await page0.emulate(iPhone)
    await page0.goto("https://web.xianliao.updrips.com/", {
      timeout: 0
    })
    console.log("login start")
    await page0.waitFor(".user-name", {
      timeout: 0
    })
    console.log("login end")
    this._xlPage = page0
    this._ready = true
  }
  // 切换到某个聊天室
  async switchToSession(charName) {
    const eles = await this._xlPage.$$(".dialog-title .dialog-name")
    for (let i = 0; i < eles.length; i++) {
      const el = eles[i]
      if ((await el.evaluate(node => node.innerText)) === charName) {
        el.click()
        return true
      }
    }
    return false
  }
  // 获取聊天室的最新消息
  async getChartRoomLatestMessage(name) {
    let messagesDom = await this._xlPage.$$(".message-list .msg-chat")
    messagesDom = messagesDom.reverse()

    for (let i = 0; i < messagesDom.length; i++) {
      const dom = messagesDom[i]
      if (
        (await dom.$eval(".message-speaker-name", n => n.innerText)) === name
      ) {
        // console.log('getChartRoomLatestMessage find name:', name)
        let message = dom.$eval(".message-info-text", n => n.innerText)
        return message
      }
    }
  }
  // 获取最新消息
  async getLatestMessage(charName, name) {
    // 1.切换到某个频道
    if (await this.switchToSession(charName)) {
      // console.log('has found', charName)
      // 2获取消息
      const message = await this.getChartRoomLatestMessage(name)
      return message
    }
  }

  async getParsedFtLatestMessage(charName, name) {
    const message = await this.getLatestMessage(charName, name)
    if (message) {
      return parseLastFtMessage(message)
    }
  }

  isReady() {
    return this._ready
  }

  on(eventName, func) {}
}

module.exports = XLManager
