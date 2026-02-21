import { By, until } from "selenium-webdriver";
import { createDriver } from "./helpers/driver";
import { strict as assert } from "assert";

describe("Addition", function () {
  // this.timeout(15000); // Set timeout for async Selenium

  let driver: any;

  beforeEach(async () => {
    driver = await createDriver();
    await driver.get("http://localhost:5174");
  });

  afterEach(async () => {
    await driver.quit();
  });

  it("should add two numbers correctly", async () => {
   const inputA = await driver.findElement(By.css('[data-testid="input-a"]'));
    const inputB = await driver.findElement(By.css('[data-testid="input-b"]'));

    await inputA.sendKeys("5");
    await inputB.sendKeys("3");

    const addButton = await driver.findElement(By.xpath("//button[text()='Add']"));
    await addButton.click();

    const resultElem = await driver.wait(
      until.elementLocated(By.xpath("//h6[contains(text(), 'Result')]")),
      5000
    );

    const result = await resultElem.getText();
    assert.equal(result, "Result: 8");
  });
});
