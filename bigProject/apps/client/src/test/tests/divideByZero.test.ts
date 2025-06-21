import { By, until } from 'selenium-webdriver';
import { CLIENT_URL } from '../../../../../libs/Utils';
import { createDriver } from '../helpers/driver';

async function run() {
  console.log('🚀 Starting Selenium test - Divide by zero...');
  console.log('🧱 Building driver...');
  const driver = await createDriver();

  try {
    console.log('🌐 Opening calculator app...');
    await driver.get(CLIENT_URL); // Vite dev server

    console.log('🔎 Locating inputs...');
    const inputA = await driver.findElement(By.css('[data-testid="input-a"]'));
    const inputB = await driver.findElement(By.css('[data-testid="input-b"]'));
    const addButton = await driver.findElement(
      By.xpath("//button[text()='Divide']")
    );

    await inputA.sendKeys('6');
    await inputB.sendKeys('0');
    await addButton.click();

    const resultElem = await driver.wait(
      until.elementLocated(By.css('h6.MuiTypography-root')),
      5000
    );

    const text = await resultElem.getText();
    if (!text.includes('Division by zero'))
      throw new Error('No result found: ' + text);

    if (text !== undefined) { //
      console.warn(
        '❌ Test failed: result is supposed to be Division by zero, instead ' +
          text
      );
      process.exit(1);
    }
    console.log('✅ Test passed: ' + text);
    process.exit(0);
  } catch (e) {
    console.error('❌ Test failed:', e);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

run();
