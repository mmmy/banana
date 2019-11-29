const puppeteer = require("puppeteer")

class XLManager {
  constructor(options) {
    this._events = {}
    this._options = {
      ...options
    }
  }

  async _init() {
    await this._init()
    await this._initXianliaoWeb()
  }

  async _initBrowser() {
    this._browser = await puppeteer.launch({
      headless: false,
      executablePath: "F:/chrome-win/chrome.exe",
      defaultViewport: {
        width: 500,
        height: 500
      },
      args: [`--window-size=${500},${500}`] // new option
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
    await page0.waitFor("#betbtn", {
      timeout: 0
    })
    console.log("login end")
    this._xlPage = page0
  }

  on(eventName, func) {}
}

module.exports = XLManager
