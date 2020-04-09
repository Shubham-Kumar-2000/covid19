const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 786,
    height: 543,
    deviceScaleFactor: 1,
  });
  await page.goto('http://ec2-13-58-166-188.us-east-2.compute.amazonaws.com:3000/graph');
await page
    .waitForSelector('#shu')
    await page.waitFor(3000);
  await page.screenshot({path: __dirname+'/example.png'});
    console.log("ss taken")
  await browser.close();
})()