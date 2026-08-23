# AppShunya Engine

AppShunya Engine is a pure client-side build framework that transforms web assets and live URLs into native Android binaries (.apk) directly within the browser sandbox. Deploy your applications instantly via our [Live Portal](https://app-shunya-engine.vercel.app).

## The Origin: Tears Behind the IDE

Across the globe, millions of brilliant developers are imprisoned by hardware limitations. They learn to code on budget smartphones or aging 4GB RAM laptops, only to watch their dreams shatter when heavy IDEs like Android Studio crash and Gradle daemons freeze their systems. AppShunya was born from this exact frustration. We refuse to accept that a high-end workstation is a prerequisite for software innovation. By migrating the entire compilation pipeline—asset bundling, permission mapping, and zip archive generation—into the browser, we have eliminated the hardware barrier completely. Zero cloud servers, zero backend tracking, absolute freedom.

## The Open-Source Challenge

We have successfully bypassed traditional build servers, but two high-level technical walls remain. We challenge senior developers, software architects, and low-level engineers to crack these purely client-side puzzles:
*   **V2/V3 APK Signing:** Implement pure JavaScript or WASM Android V2/V3 signature blocks directly into the ZIP Central Directory without a backend.
*   **Dynamic Package Manipulation:** Engineer a client-side parser to modify binary `AndroidManifest.xml` identifiers natively via JSZip.

## Architecture & Quick Start

Transform your web project into a deployable package in seconds without any prior Android SDK experience:
*   **Step 1:** Access the builder and choose between a Live URL endpoint or an offline HTML5 ZIP.
*   **Step 2:** Configure your application identity, including nomenclature and versioning.
*   **Step 3:** Toggle hardware bridges to map Web APIs directly to native Android permissions (Camera, Location, Storage).
*   **Step 4:** Upload a raw image to auto-generate a 3D adaptive gloss launcher icon via the Canvas API.
*   **Step 5:** Click generate to assemble the unsigned binary cleanly within `window.URL.createObjectURL`.
*   **Step 6:** Sign the generated package locally using any on-device mobile signing utility for instant installation.
*   **Security Context:** Executes entirely offline post-load, ensuring complete memory hygiene and strict XSS protection.
*   **Component Map:** Driven securely by `index.html` (UI), `main.js` (Compilation Core), and `security-seo.js` (Integrity).
*   **Ecosystem:** Proudly maintained by the KernelVoltage Open-Source Initiative.
*   **License:** Distributed under the MIT License to guarantee borderless developer accessibility.
