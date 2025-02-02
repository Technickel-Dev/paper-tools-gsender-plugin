import { Socket } from "net";
import {
  getPositions,
  cancelMovement,
  setPosX,
  setPosY,
  setPosZ,
  runGCode,
  handleContinuousJog,
} from "./gSender/gSenderControl.js";
import { feedrateInchesPerMinuteToMillimetersPerMinute } from "./utils.js";
import { browser, initializeGSenderBrowser } from "./gSender/gSenderUI.js";

/** @type {string} */
const PAPER_TOOLS_ADDRESS = "127.0.0.1";
/** @type {number} */
const PAPER_TOOLS_COMMAND_PORT = 53019;
/** @type {number} */
const PAPER_TOOLS_FILE_PORT = 53020;

/** @type {number} */
const POSITION_POLL_MS = 100;

/**
 * Report the current position to Paper Tools
 */
const reportPosition = async () => {
  let { x, y, z } = await getPositions();

  if (x == -1 || y == -1 || z == -1) {
    return;
  }

  let moveString = `/position ${x} ${y} ${z}\n`;
  // console.log(moveString);

  if (isCommandConnected) {
    commandClient.write(moveString);
  }
};

const loopReportPosition = () => {
  setInterval(reportPosition, POSITION_POLL_MS);
};

// TCP Command Client
const commandClient = new Socket();
let isCommandConnected = false;
commandClient.connect({
  host: PAPER_TOOLS_ADDRESS,
  port: PAPER_TOOLS_COMMAND_PORT,
  family: 4,
});

commandClient.on("connect", async () => {
  console.log("Command TCP connection established");

  let connectedMessage = "Paper Tools connected.\n";
  commandClient.write(connectedMessage);

  isCommandConnected = true;

  // Initialize gSender
  await initializeGSenderBrowser();

  loopReportPosition();
});

// Buffer to store incoming data
let buffer = "";

commandClient.on("data", async (data) => {
  buffer += data.toString();

  const newlineIndex = buffer.indexOf("\n");
  if (newlineIndex !== -1) {
    // Extract the line from the buffer
    const line = buffer.slice(0, newlineIndex);

    // Process the line
    console.log("Received line:", line);

    // Process the command
    await processCommand(line);

    // Remove the processed line from the buffer
    buffer = buffer.slice(newlineIndex + 1);
  }

  if (isCommandConnected) {
    await reportPosition();
  }
});

commandClient.on("error", (error) => {
  console.error("Error:", error);
});

commandClient.on("close", async () => {
  console.log("TCP connection closed");
  isCommandConnected = false;
  if (browser) {
    await browser.close();
  }
});

/**
 * Process a command coming from Paper Tools
 * @param {string} line
 */
const processCommand = async (line) => {
  if (line.includes("FileStart")) {
    await processFile(line);
  } else if (line.includes("JogStop")) {
    await cancelMovement();
  } else if (line.includes("JogInc")) {
    let axis = line.slice(8);
    // let distance = parseFeedRate(line);
    // await jogPrecise(axis, distance);
  } else if (line.includes("JogStart")) {
    let axis = line.charAt(10);
    let direction = line.charAt(9);
    let feedrateInchesPerMinute = line.slice(12); //parseFeedRate(line);

    await handleContinuousJog(
      axis,
      direction,
      +feedrateInchesPerMinute //feedrateInchesPerMinuteToMillimetersPerMinute(+feedrateInchesPerMinute)
    );
  } else if (line.includes("Execute")) {
    await runGCode(line.slice(8));
  } else if (line.includes("SetPosX")) {
    await setPosX(line.slice(9));
  } else if (line.includes("SetPosY")) {
    await setPosY(line.slice(9));
  } else if (line.includes("SetPosZ")) {
    await setPosZ(line.slice(9));
  } else if (line.includes("GetPos")) {
    await reportPosition();
  }
};

const processFile = async (data) => {
  // TCP File Client
  const fileClient = new Socket();
  fileClient.connect({
    host: PAPER_TOOLS_ADDRESS,
    port: PAPER_TOOLS_FILE_PORT,
    family: 4,
  });

  fileClient.on("data", (data) => {});

  // if file then
  //   mc.mcCntlLog(inst, "Completed receiving file with ".. tonumber(file.len(file)).." bytes.", "",-1)
  //   processCommand(file)
  // end
};
