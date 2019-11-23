const puppeteer = require('puppeteer')
const devices = puppeteer.devices
const iPhone = devices["iPhone 6"]

class BManager {
  constructor(options) {
    this._init()
  }
  async _init() {
    await this._initBrowser()
    await this._initFTPage()
  }

  async _initBrowser() {
    this._browser = await puppeteer.launch({
      headless: false,
      executablePath: 'F:/chrome-win/chrome.exe',
      defaultViewport: {
        width: 500,
        height: 1000,
      },
      args: [`--window-size=${500},${1000}`] // new option
    })
  }

  async _initFTPage() {
    const page = await this._browser.pages()
    const page0 = page[0]
    await page0.emulate(iPhone)
    await page0.goto('https://98100a.com/m/#/bjpk10?id=5519&code=mamlaft&name=摩纳哥飞艇&title=摩纳哥飞艇&Value=0.07753564755402653')
    await page0.waitFor('#betbtn')
    this._ftPage = page0

    this.ftGoGo({ indexes: [2, 3, 4, 6] })
  }

  async ftIsReady() {

  }

  async ftGoGo(data) { // {indexes: [], numbers: []}
    data.indexes.forEach(async (index) => {
      try {
        const element = await this._ftPage.$(`.shortcut ul li:nth-child(${index})`)
        // this._ftPage.tap()
        await element.click()
      } catch (e) {
        console.log(e)
      }
      console.log('点击', index)
    })
  }
}

module.exports = BManager