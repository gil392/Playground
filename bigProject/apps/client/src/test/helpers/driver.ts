import { Builder } from "selenium-webdriver";
import { Options, ServiceBuilder } from "selenium-webdriver/chrome";
import * as chromedriver from "chromedriver";

export const createDriver = () => {
  const options = new Options(); // .addArguments("--headless") if needed
  //chromeOptions.addArguments("--headless", "--no-sandbox", "--disable-gpu");
  const service = new ServiceBuilder(chromedriver.path);

  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();
};
