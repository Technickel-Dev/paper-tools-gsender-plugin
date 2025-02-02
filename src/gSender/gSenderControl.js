import {
  clickCancelJog,
  clickRunCommand,
  readPosition,
  typeCommand,
} from "./gSenderUI.js";

/**
 * @typedef {Object} JogDirection
 * @property {Object} X - The X axis information
 * @property {string} X.direction - The direction of the X axis
 * @property {number} X.feedrate - The metric feedrate of the X axis
 * @property {Object} Y - The Y axis information
 * @property {string} Y.direction - The direction of the Y axis
 * @property {number} Y.feedrate - The metric feedrate of the Y axis
 */

/** @type {boolean} - The running state of GCode */
let isRunningGcode = false;

/**
 * Returns the jog direction object initialized to empty
 * @returns {JogDirection} The default Jog command object.
 */
export const defaultJogCommand = () => {
  return {
    X: {
      direction: "",
      feedrate: 0,
    },
    Y: {
      direction: "",
      feedrate: 0,
    },
  };
};

/** @type {JogDirection} - The current command jog state */
let currentJogCommands = defaultJogCommand();

/** @type {JogDirection | null} - The previous command jog state */
let previousJogCommands = null;

/**
 * Get the current position
 * @returns An object denoting the x, y and z positions, with -1 as a default
 */
export const getPositions = async () => {
  try {
    return await readPosition();
  } catch (e) {
    return {
      x: -1,
      y: -1,
      z: -1,
    };
  }
};

/**
 * Run a GCode command.
 * @param {string} gcode - Valid GCode command.
 */
export const runGCode = async (gcode) => {
  if (isRunningGcode) {
    return;
  }

  isRunningGcode = true;

  console.log("Running GCode", gcode);

  typeCommand(gcode);
  clickRunCommand();

  isRunningGcode = false;
};

export const cancelMovement = async () => {
  console.log("Stopping movement");

  clickCancelJog();

  // currentJogCommands = defaultJogCommand();
  // previousJogCommands = null;
};

/**
 * Runs GCode to set the X position
 * @param {string} position - a string that includes both a unit and a direction
 */
export const setPosX = async (position) => {
  runGCode(`G0 X${position}`);
};

/**
 * Runs GCode to set the Y position
 * @param {string} position - a string that includes both a unit and a direction
 */
export const setPosY = async (position) => {
  runGCode(`G0 Y${position}`);
};

/**
 * Runs GCode to set the Z position
 * @param {string} position - a string that includes both a unit and a direction
 */
export const setPosZ = async (position) => {
  runGCode(`G0 Z${position}`);
};

export const handleContinuousJog = async (axis, direction, feedrate) => {
  // gSender uses a number for target distance while continuous jogging
  const GCODE_COORDINATE = 0.1;

  previousJogCommands = JSON.parse(JSON.stringify(currentJogCommands));

  currentJogCommands[axis].direction = direction;
  currentJogCommands[axis].feedrate = feedrate;
  // if (
  //   JSON.stringify(previousJogCommands) === JSON.stringify(currentJogCommands)
  // ) {
  //   return;
  // }

  let command = "";

  // Generate a command given the current instructions
  // Object.entries(currentJogCommands).forEach(async ([axis, value]) => {
  if (direction != "") {
    //value.direction != "") {
    command += `${axis}${direction}${GCODE_COORDINATE} `; //value.direction}${BIG_GCODE_COORDINATE} `;
  }
  // });

  let currentFeedrate;

  if (currentJogCommands.X.feedrate == 0) {
    currentFeedrate = currentJogCommands.Y.feedrate;
  } else if (currentJogCommands.Y.feedrate == 0) {
    currentFeedrate = currentJogCommands.X.feedrate;
  } else {
    currentFeedrate = Math.min(
      currentJogCommands.X.feedrate,
      currentJogCommands.Y.feedrate
    );
  }

  await runGCode(`$J=G21G91 ${command} F1000`); //${currentFeedrate}`);
};
