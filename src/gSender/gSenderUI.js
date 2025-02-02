import { Browser, Page, launch } from "puppeteer";
import {
  clickButtonUsingCssSelector,
  clickButtonUsingXPathSelector,
  getHtmlInputElementValue,
} from "../utils.js";

/** @type {string} - The URI of the gSender remote instance */
const GSENDER_REMOTE_ADDRESS = "http://127.0.0.1";
/** @type {number} - The port of the gSender remote instance */
const GSENDER_REMOTE_PORT = 8000;

/** @type {Browser} - The Puppeteer browser */
export let browser;
/** @type {Page} - The gSender remote instance Puppeteer page */
let page;

/**
 * Launches a Puppeteer browser and navigates to the remote gSender instance.
 * It connects to the machine and opens the console to ready itself for action.
 */
export const initializeGSenderBrowser = async () => {
  // Initialize or use the existing Puppeteer browser and page
  if (!browser) {
    browser = await launch({ headless: false });
    page = await browser.newPage();

    await page.goto(`${GSENDER_REMOTE_ADDRESS}:${GSENDER_REMOTE_PORT}`, {
      waitUntil: "networkidle0",
    });
  }

  await connectToFirstMachine();

  await openConsole();
};

/**
 * Opens the gSender console.
 */
const openConsole = async () => {
  if (!page) {
    throw Error("Unable to find gSender remote instance page");
  }

  await clickButtonUsingXPathSelector(
    page,
    "//button[contains(text(), 'Console')]"
  );
};

/**
 * Connect to the first machine available in gSender.
 */
const connectToFirstMachine = async () => {
  if (!page) {
    throw Error("Unable to find gSender remote instance page");
  }

  await clickButtonUsingCssSelector(
    page,
    "[class*='widgets-NavbarConnection-Index__PortListing']"
  );
};

/**
 * Click the gSender cancel jog button.
 */
export const clickCancelJog = async () => {
  if (!page) {
    throw Error("Unable to find gSender remote instance page");
  }

  await clickButtonUsingCssSelector(
    page,
    "[class*='widgets-JogControl-index__jog-cancel-button']"
  );
};

/**
 * Click the gSender run command button.
 */
export const clickRunCommand = async () => {
  if (!page) {
    throw Error("Unable to find gSender remote instance page");
  }

  await clickButtonUsingXPathSelector(
    page,
    "//div[contains(@class, 'widgets-Console-index__widget-content')]//button[contains(text(), 'Run')]"
  );
};

/**
 * Type a command in the the gSender console.
 * @param {string} command - The command to type
 */
export const typeCommand = async (command) => {
  if (!page) {
    throw Error("Unable to find gSender remote instance page");
  }

  const [inputElement] = await page.$x(
    "//input[@placeholder='Enter G-Code Here...']"
  );

  if (!inputElement) {
    throw Error("Unable to find command input");
  }

  await inputElement.type(command);
};

/**
 * Reads the x, y and z positions from the gSender UI.
 * @returns An object containing the x, y and z positions
 */
export const readPosition = async () => {
  if (!page) {
    throw Error("Unable to find gSender remote instance page");
  }

  let elements = await page.$$(
    "[class*='widgets-Location-components-MachinePositionInput']"
  );

  if (elements.length < 0) {
    throw Error("Unable to find positions");
  }

  let positions = await Promise.all([
    await elements[0].evaluate(getHtmlInputElementValue),
    await elements[1].evaluate(getHtmlInputElementValue),
    await elements[2].evaluate(getHtmlInputElementValue),
  ]);

  return {
    x: positions[0],
    y: positions[1],
    z: positions[2],
  };
};
