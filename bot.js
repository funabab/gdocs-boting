const pt = require('puppeteer-core')
const faker = require('faker')

const DOCS_URI =
  'https://docs.google.com/forms/d/e/1FAIpQLSfJ3oNlEMK_iUHeGmL1sKAUrAkam2zM2wBkYNeKS9rvHirxzQ/viewform?usp=sf_link'

pt.launch({
  headless: true,
  product: 'chrome',
  executablePath: '/usr/bin/google-chrome-stable',
  defaultViewport: {
    width: 1366,
    height: 768,
  },
  args: ['--no-sandbox'],
})
  .then(async (browser) => {
    browser
    browser.on('disconnected', () => {
      process.exit()
    })

    await browser.userAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
    )

    const fillForm = async (context) => {
      const page = await context.newPage()

      await page.goto(DOCS_URI, {
        waitUntil: 'domcontentloaded',
      })

      await page.waitForSelector('input[type="email"]:not([disabled])')

      const inputEmail = await page.$(
        `input[type="email"].exportInput:nth-of-type(1)`
      )

      const inputName = await page.$(
        `input[type="text"].exportInput:nth-of-type(1)`
      )

      const likeOpt = await page.$$(
        `.freebirdFormviewerViewNumberedItemContainer:nth-of-type(3) .freebirdFormviewerComponentsQuestionRadioChoice label`
      )

      const hateOpt = await page.$$(
        `.freebirdFormviewerViewNumberedItemContainer:nth-of-type(4) .freebirdFormviewerComponentsQuestionRadioChoice label`
      )

      const impOpt = await page.$$(
        `.freebirdFormviewerViewNumberedItemContainer:nth-of-type(5) .freebirdFormviewerComponentsQuestionRadioChoice label`
      )

      const btnSubmit = await page.$(`div[role="button"][jsname="M2UYVd"]`)

      await inputEmail.type(faker.internet.email())
      await inputName.type(faker.name.findName())

      await likeOpt[Math.floor(Math.random() * likeOpt.length)].click()
      await hateOpt[Math.floor(Math.random() * hateOpt.length)].click()
      await impOpt[Math.floor(Math.random() * impOpt.length)].click()

      await btnSubmit.click()
      await page.waitForNavigation()

      await page.waitForSelector(
        '.freebirdFormviewerViewResponseConfirmationMessage'
      )

      const isSuccess = await page.$eval(
        '.freebirdFormviewerViewResponseConfirmationMessage',
        (e) => e.textContent === 'Your response has been recorded.'
      )

      await page.waitForTimeout(2000)
      return isSuccess
    }

    let count = 0

    while (true) {
      let context = await browser.createIncognitoBrowserContext()
      try {
        const isSuccess = await fillForm(context)
        if (isSuccess) {
          count++
          console.log('Form filled:', count)
        } else {
          console.error('failed to fill form, retrying....')
        }
      } catch (err) {
        console.error('failed to fill form, retrying....')
        console.log(err)
      } finally {
        context.close()
      }
    }
  })
  .catch((err) => {
    console.log('Unable to launch browser')
    console.error(err)
  })
