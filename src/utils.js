import { Page } from "puppeteer";

/**
 * Converts feedrate from inches per minute to millimeters per minute
 * @param {number} feedrateInchesPerMinute feedrate in inches per minute
 * @returns {number} feedrate in millimeters per minute
 */
export const feedrateInchesPerMinuteToMillimetersPerMinute = (
  feedrateInchesPerMinute
) => {
  const conversionFactor = 25.4;

  const feedrate = feedrateInchesPerMinute * conversionFactor;

  return feedrate;
};

/**
 *
 * @param {Page} page Puppeteer page
 * @param {string} selector The CSS selector for connection button
 */
export const clickButtonUsingCssSelector = async (page, selector) => {
  /**
   * @param {Element} element The element to be clicked
   */
  const clickButton = (element) => {
    /** @type {HTMLButtonElement} */ (element).click();
  };

  await page.$eval(selector, clickButton);
};

/**
 * @param {Page} page Puppeteer page
 * @param {string} selector The XPath selector for the button
 */
export const clickButtonUsingXPathSelector = async (page, selector) => {
  const [buttonNode] = await page.$x(selector);

  if (buttonNode) {
    let button = await buttonNode.toElement("button");
    button.click();
  }
};

/**
 * Callback function to get the value of an HTML input element
 * @param {Element} element
 * @returns {string | undefined}
 */
export const getHtmlInputElementValue = (element) => {
  if (element instanceof HTMLInputElement) {
    return element.value;
  }
};
