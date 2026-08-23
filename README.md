# AppShunya Engine — Build Android Apps in Your Browser!

[![Live Web App](https://img.shields.io/badge/Live_App-app--shunya--engine.vercel.app-blue?style=for-the-badge&logo=vercel)](https://app-shunya-engine.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"No heavy computers needed. Build Android apps straight inside your web browser!"**

---

## 📖 About the Project
**AppShunya Engine** is a powerful zero-server web tool that allows developers to turn websites, web pages, and web asset bundles into clean Android application structures (`.apk`) entirely inside the client-side browser sandbox. 

Traditional native Android compilation requires heavy software like Android Studio, powerful multi-core processors, and massive storage space. AppShunya Engine bypasses these hardware limitations, letting anyone on budget laptops or mobile devices package web assets effortlessly.

---

## 🛠️ The Open-Source Challenge (Help Needed!)
While the engine successfully bundles web payloads and assets into unsigned APK layouts in browser memory, we are currently tackling two major low-level architecture hurdles. We invite expert developers and open-source contributors to help us solve:

1. **Browser-Based V2/V3 APK Signing:** Developing a pure JavaScript or WebAssembly crypto module to inject Android V2/V3 signature blocks into the ZIP Central Directory and perform in-browser alignment.
2. **Dynamic Package Name Mutation:** Building a client-side Android Binary XML (AXML) parser to dynamically modify package identifiers (e.g., `com.user.app`) inside JSZip streams before sealing the binary.

---

## 🚀 Step-by-Step User Workflow
1. **App Name:** Enter your application title to define the home screen launcher label.
2. **App Icon:** Upload a square image (`.png`, `.jpg`). The canvas resizes it to 512x512 with adaptive squircle clipping and a 3D gloss overlay (`ic_launcher.png`).
3. **Permissions:** Toggle required system permissions such as Camera, Microphone, Location, Storage, or Vibration to inject declarations into `AndroidManifest.xml`.
4. **Source Payload:** Choose between a remote web URL (for hosted PWAs) or upload a local `.zip` / `.html` asset bundle.
5. **Compile Binary:** Click the **GENERATE UNSIGNED APK** button to bundle everything in browser memory and trigger instant download.

---

## 📦 On-Device APK Signing & Installation Guide
Because Android requires all application binaries to carry a valid cryptographic signature before installation, follow these simple steps on your phone:

1. Download a free utility app called **APK Signer** from the Google Play Store or F-Droid.
2. Open the app and select **Sign a File**.
3. Choose your downloaded unsigned APK file from your device storage.
4. Select the **Testkey** profile for quick local deployment and tap **Sign the File**.
5. Open your phone's File Manager, tap the newly generated signed APK, allow installation from unknown sources if prompted, and tap **Install**!

---

## 🌐 KernelVoltage Ecosystem
Explore other open-source tools and repositories across our ecosystem:

* **Central GitHub Profile:** [KernelVoltage Overview](https://github.com/KernelVoltage)
* **Web Projects Directory:** [Web Projects Repository](https://github.com/KernelVoltage/web-projects)
* **Game Projects Hub:** [Game Projects Repository](https://github.com/KernelVoltage/game-projects)

---

## 📄 License
Distributed under the terms of the **MIT License**. See the `LICENSE` file for details.
