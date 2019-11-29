const sleep = s => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, s)
  })
}

async function run() {
  for (let i = 0; i < 10; i++) {
    await sleep(5000)
    console.log("sleep..", i)
    if (i === 2) {
      break
    }
  }
}

run()
