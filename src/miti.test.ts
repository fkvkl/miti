const puppeteer = require("puppeteer");
let browser;
let page;
//shared on github
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    devtools: false,
    args: ["--window-size=1920,1080"],
    slowMo: 30,
  });
  page = await browser.newPage();
  await page.goto("https://www.mitigram.com");
  await page.waitForSelector(".jl-notification-message");
  await page.hover(".jl-notification-message");
  await page.waitForSelector(".jl-notification-close");
  await page.click(".jl-notification-close");
  await page.click(".cc-compliance");
});

afterEach(async () => {
  await browser.close();
});
describe("Test suite", () => {
  test("Display open positions", async () => {
    await page.click("[href='/careers']");
    await page.waitForSelector("[href='#open-positions']");
    await page.click("[href='#open-positions']");
    await page.waitForSelector("span#open-positions");
    let element = await page.$("span#open-positions");
    const value = await page.evaluate((element) => element.innerText, element);
    //let value = await page.evaluate((el) => el.textContent, element);
    expect(value).toBe("Open positions");
  });

  test("Filter positions", async () => {
    let test = "FilterPositions";
    await page.click("[href='/careers']");
    await page.waitForSelector("[href='#open-positions']");
    await page.click("[href='#open-positions']");
    const elements = await page.$x("//a[.='Engineering']"); //using xpath
    await elements[0].click();
    await page.screenshot({
      path: `screenshots/${test + Date.now()}.png`,
      fullPage: "true",
    });
    const positions = await page.$$("[data-tag='engineering']>a"); //findall
    for (const el of positions) {
      var value = await page.evaluate((el) => el.innerText, el);
      expect(value).toContain("Engineer");
    }
  });

  test("test in progress", async () => {
    await page.click("[href='/careers']");
    await page.waitForSelector("[href='#open-positions']");
    await page.click("[href='#open-positions']");
    const elements = await page.$x("//a[.='Engineering']"); //using xpath
    await elements[0].click();
    const options = await page.$$eval("[data-tag='engineering']>a", (options) =>
      options.map((option) => option.textContent)
    );
    console.log(options);
  });

  it.each`
    position                         | address
    ${"Back-end Software Engineer"}  | ${"https://www.mitigram.com/images/ads/Back-End_Software_Engineer.pdf"}
    ${"Front-end Software Engineer"} | ${"https://www.mitigram.com/images/ads/Front-End_Software_Engineer.pdf"}
    ${"Test Engineer"}               | ${"https://www.mitigram.com/images/ads/Test_Engineer.pdf"}
    ${"Test Automation Engineer"}    | ${"https://www.mitigram.com/images/ads/Test_Automation_Engineer.pdf"}
    ${"Legal Counsel"}               | ${"https://www.mitigram.com/images/ads/Legal_Counsel.pdf"}
  `(
    "should display web adress when clicked 'Learn more' under position",
    async ({ position, address }) => {
      await page.click("[href='/careers']");
      await page.waitForSelector("[href='#open-positions']");
      await page.click("[href='#open-positions']");
      const $position = await page.$x(`//a[.='${position}']`);
      await $position[0].click();
      const learnMore = await page.$x(`(//a[.='${position}']/..//a)[2]`);
      await page.waitForXPath(`(//a[.='${position}']/..//a)[2]`);
      await learnMore[0].click();
      await page.waitForNavigation();

      expect(address).toEqual(await page.url());
    }
  );
});
