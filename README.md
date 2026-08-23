# AppShunya Engine — Make Android Apps Directly Inside Your Web Browser!

[![Live Web App](https://img.shields.io/badge/Live_App-app--shunya--engine.vercel.app-blue?style=for-the-badge&logo=vercel)](https://app-shunya-engine.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"No heavy computers needed. Build and package your own Android apps straight inside your web browser!"**

---

##  What is this?

**AppShunya Engine** is a free, web-based tool that lets you turn websites or web pages into Android app files (`.apk`) right inside your browser. 

Usually, to build Android apps, you need expensive computers and heavy software like Android Studio. But AppShunya Engine does all the hard work right inside your browser tab. Whether you are using a cheap phone or an old laptop, you can build your own apps for free!

---

##  We Need Your Help! (Open-Source Challenge)

Right now, our tool can successfully bundle web pages into an unsigned app file. But we are stuck on two big challenges and need help from expert programmers:

```text
+-----------------------------------------------------------------------------------+
|                            WE NEED YOUR HELP WITH:                                |
+-----------------------------------------------------------------------------------+
| 1. Signing Apps Inside the Browser (V2/V3)                                       |
|    - Current: It creates an unsigned app file using JSZip.              |
|    - Goal: Help us write a script to sign the app security block directly         |
|      inside the browser.                                                          |
|                                                                                   |
| 2. Changing Package Names Dynamically                                            |
|    - Current: App package names are fixed.                              |
|    - Goal: Help us change package IDs (like com.my.app) on the fly using JS.     |
+-----------------------------------------------------------------------------------+
