const puppeteer = require("puppeteer")
const devices = puppeteer.devices
const iPhone = devices["iPhone 6"]
const ActionTools = require("./utils/ActionTools")

function checkFtIsWin(data, resultNumbers) {
  const { indexes, numbers } = data
  for (let i = 0; i < indexes.length; i++) {
    const index = indexes[i]
    // 索引下结果
    const result = resultNumbers[index - 1]
    if (numbers.indexOf(result) > -1) {
      return true
    }
  }
  return false
}

class BManager {
  constructor(options) {
    this._options = {
      checkIssue: true,
      lossDouble: false,
      ...options
    }
    this._init()
    this._login = true
    this._ftBetTimes = 1 //倍数
    this._ftMaxTimes = 1
    this._lastFtBetInfo = {
      data: null,
      validated: false,
      isWin: true,
      issue: ""
    }
    this._ftCheckResultInterval = null
  }

  async _init() {
    await this._initBrowser()
    await this._initFTPage()
  }

  async _initBrowser() {
    this._browser = await puppeteer.launch({
      headless: false,
      executablePath: "F:/chrome-win/chrome.exe",
      defaultViewport: {
        width: 500,
        height: 1000
      },
      args: [`--window-size=${500},${1000}`] // new option
    })
  }

  async _initFTPage() {
    const page = await this._browser.pages()
    const page0 = page[0]
    await page0.emulate(iPhone)
    await page0.goto(
      "https://98100a.com/m/#/Login",
      // "https://98100a.com/m/#/",
      // "https://98100a.com/m/#/bjpk10?id=5519&code=mamlaft&name=摩纳哥飞艇&title=摩纳哥飞艇&Value=0.07753564755402653",
      {
        timeout: 0
      }
    )
    console.log("start waiting")
    await page0.waitFor("#betbtn", {
      timeout: 0
    })
    console.log("end waiting")

    // if (this._login) {
    //   await page0.waitFor("")
    // } else {
    // }
    this._ftPage = page0

    this._ready = true
    // await this.ftGoGo({ indexes: [2, 3, 4, 5, 6, 7, 8], numbers: [3], bet: 1 })
  }

  async ftGoGo(data) {
    // {indexes: [], numbers: [], bet: number}
    // clear
    await this.clearFt()

    data.indexes.forEach(async index => {
      try {
        const result = await ActionTools.tapSelector(
          this._ftPage,
          `.shortcut ul li:nth-child(${index})`
        )
        // console.log(result)
        // this._ftPage.tap()
        // await element.click()
      } catch (e) {
        console.log(e)
      }
      // console.log("点击", index)
    })

    data.numbers.forEach(async number => {
      try {
        await ActionTools.tapSelector(
          this._ftPage,
          `.select-ball-warpper .kuaijie a[data-id="${number - 1}"]`
        )
      } catch (e) {
        console.log(e)
      }
    })

    await this._ftPage.waitFor(10)

    return await this.ftBet(data)

    // bet
    // for test
    // setTimeout(() => {
    //   console.log('clear')
    //   this.clearFt()
    // }, 5000)
  }

  async clearFt() {
    await ActionTools.tapSelector(this._ftPage, ".footer .delete")
  }

  async ftBet(data) {
    await ActionTools.touchEndSelector(
      this._ftPage,
      ".footer .import .betValue"
    )

    const bet = data.bet * this._ftBetTimes

    const numbers = (bet + "").split("").map(n => +n)
    console.log("input numbers", numbers)
    numbers.forEach(async num => {
      if (num === 0) {
        await ActionTools.touchEndSelector(
          this._ftPage,
          "#pluginKeyborad .table-number tr:nth-child(4) td:nth-child(2)"
        )
      } else {
        const trChildIndex = Math.floor((num - 1) / 3) + 1
        let tdChildIndex = ((num - 1) % 3) + 1
        console.log("trChildIndex", trChildIndex, "tdChildIndex", tdChildIndex)
        await ActionTools.touchEndSelector(
          this._ftPage,
          `#pluginKeyborad .table-number tr:nth-child(${trChildIndex}) td:nth-child(${tdChildIndex})`
        )
      }
      console.log("touch number", num)
    })
    // click bet button
    await this._ftPage.waitFor(10)
    // await ActionTools.touchStartSelector(this._ftPage, "#betbtn")
    // await this._ftPage.waitFor(100)

    await ActionTools.touchEndSelector(this._ftPage, ".top_betBox #betbtn")
    await this._ftPage.waitFor(10)

    // check validate
    const totalInDialog = +(await this._ftPage.$$eval(".BET_AMT", doms => {
      // console.log(doms)
      return doms[0].innerText
    }))
    const total = data.indexes.length * data.numbers.length * bet
    // console.log("tttttt", totalInDialog, total)
    await this._ftPage.waitFor(10)

    // confirm
    if (totalInDialog === total) {
      await ActionTools.tapSelector(
        this._ftPage,
        "#actionsheet .sure .btn-sure"
      )
      console.log("done")
      return true
    } else {
      // await ActionTools.touchEndSelector(
      //   this._ftPage,
      //   "#actionsheet .sure .btn-sure"
      // )
      await ActionTools.touchEndSelector(this._ftPage, "#keyborad-mask")
      console.log("不吻合，退出")
    }
  }

  async getCurrentFtZhudan() {
    const text = await this._ftPage.$$eval(".zhudan .userWin", doms => {
      return doms[0].innerText
    })
    return +text.replace("¥", "")
  }

  async hasFtZhudan() {
    const amount = await this.getCurrentFtZhudan()
    // console.log("hasFtZhudan", amount)
    return amount > 0
  }
  // 获取当前期号
  async getFtIssue() {
    return await this._ftPage.$eval(
      ".timeClose-container .colorInherit",
      n => n.innerText
    )
  }

  async closeAlertIfHave() {
    const hasDialogAlert = await this._ftPage.$("mui-popup-backdrop.mui-active")
    if (hasDialogAlert) {
      await ActionTools.tapSelector(".mui-popup-button")
    }
  }
  // { issue: '05', indexes: [2, 3, 4, 5, 6, 7, 8], numbers: [3], bet: 1 }
  async doFt(data) {
    if (!this._ready) {
      return false
    }
    // 判断期号
    if (this._options.checkIssue) {
      let currentIssue = await this.getFtIssue()
      if (currentIssue) {
        currentIssue = currentIssue.trim()
      }
      if (!currentIssue) {
        console.log("获取期号失败")
        return false
      }
      if (currentIssue.slice(-2) !== data.issue) {
        console.log(
          "期号不吻合,最新",
          currentIssue.slice(-2),
          "income",
          data.issue
        )
        return false
      }
    }

    await this.closeAlertIfHave()
    // todo: 判断是否封盘

    const hasXd = await this.hasFtZhudan()
    if (!hasXd) {
      console.log("start bet", data)
      const result = await this.ftGoGo(data)
      if (result) {
        this._lastFtBetInfo.data = data
        this._lastFtBetInfo.validated = false
        this._lastFtBetInfo.isWin = true
        this._lastFtBetInfo.issue = await this.getCurrentFtIssue()
        this.initCheckFtResultInterval()
      }
      return result
    }
    // console.log("hasXd, 已下单，不支持重复下")
    return false
  }

  initCheckFtResultInterval() {
    clearInterval(this._ftCheckResultInterval)

    this._ftCheckResultInterval = setInterval(async () => {
      const currentOpen = await this.getCurrentFtCloseIssueAndResult()
      // console.log(currentOpen.issue, currentOpen.numbers, 'cccccccccc')
      const { data, issue, validated } = this._lastFtBetInfo
      if (currentOpen.issue && currentOpen.issue === issue && !validated) {
        // check is win or not
        if (checkFtIsWin(data, currentOpen.numbers)) {
          console.log("last is win !!!!!!!!!!!")
          this._ftBetTimes = 1
          this._lastFtBetInfo.isWin = true
        } else {
          console.log("last is lost #############")
          this._lastFtBetInfo.isWin = false
          if (this._options.lossDouble) {
            this._ftBetTimes += 1
            this._ftMaxTimes = Math.max(this._ftBetTimes, this._ftMaxTimes)
            console.log("max times ...", this._ftMaxTimes)
          }
        }
        this._lastFtBetInfo.validated = true

        clearInterval(this._ftCheckResultInterval)
      }
    }, 3000)
  }

  async getCurrentFtCloseIssueAndResult() {
    let issue = await this._ftPage.$eval(
      ".header-top .colorInherit",
      n => n.innerText
    )
    issue = issue.trim()
    const numbers = await this._ftPage.$$eval(
      ".header-top .inlineBlockItem .item",
      doms => {
        return doms.map(d => +d.innerText)
      }
    )
    return {
      issue,
      numbers
    }
  }

  async getCurrentFtIssue() {
    let issue = await this._ftPage.$eval(
      ".header-bottom .colorInherit",
      n => n.innerText
    )
    return issue.trim()
  }
}

module.exports = BManager
