import { Builder, By, until } from "selenium-webdriver";
import { Options, ServiceBuilder } from "selenium-webdriver/chrome";
import * as chromedriver from "chromedriver";

async function run() {
  console.log("🚀 Starting Selenium test...");
  const service = new ServiceBuilder(chromedriver.path);
  const chromeOptions = new Options();
  //chromeOptions.addArguments("--headless", "--no-sandbox", "--disable-gpu");

  console.log("🧱 Building driver...");
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .setChromeService(service)
    .build();

  try {
    console.log("🌐 Opening calculator app...");
    await driver.get("http://localhost:5174"); // Vite dev server

    console.log("🔎 Locating input A...");
    const inputA = await driver.findElement(By.css('[data-testid="input-a"]'));
    const inputB = await driver.findElement(By.css('[data-testid="input-b"]'));
    const addButton = await driver.findElement(
      By.xpath("//button[text()='Add']")
    );

    await inputA.sendKeys("4");
    await inputB.sendKeys("3");
    await addButton.click();

    const resultElem = await driver.wait(
      until.elementLocated(By.css("h6.MuiTypography-root")),
      5000
    );

    const text = await resultElem.getText();
    if (!text.includes("Result:")) throw new Error("No result found");
    if (text !== "Result: 7") {
      console.warn("❌ Test failed: result is supposed to be 7, instead " + text);
      process.exit(1);
    }
    console.log("✅ Test passed: " + text);
    process.exit(0);
  } catch (e) {
    console.error("❌ Test failed:", e);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

run();
