# Paper Tools gSender Plugin
A NodeJs script that runs the remote version of [gSender](https://sienci.com/gsender/) and allows it to be controlled by [Paper Tools](https://www.papertools.ai/)

Originally created to work on my Shapeoko 2 CNC Router, this is a starting point for controlling your CNC through gSender with Paper Tools. The script facillitates communication using a TCP connection to Paper Tools and control of gSender through Puppeteer to control your CNC

> [!WARNING] 
> The script is a WIP and by no means has full functionality. YMMV with getting things to work escpecially on different machines

Feel free to PR improvments and functionality!

## Prerequisites

* You must set up gSender for [remote mode](https://resources.sienci.com/view/gs-additional-features/#remote-mode)
* You must run Paper Tools

## Usage

Run the following commands in a terminal from the root of this project:

This will install the dependencies needed
```bash
npm install
```
This will run the plugin

```bash
npm run start
```

The plugin will then start a Chromium instance that connects to gSender remote and control it based on the instructions from Paper Tools
