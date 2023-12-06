<!-- Header -->
<div id="top" align="center">
  <br />

  <!-- Logo -->
  <img src="./src/assets/images/logo.png" alt="Logo" width="200" height="200">

  <!-- Title -->
  ### Template

  <!-- Description -->
  Map Collaboration Tool

  <!-- Repo badges -->
  [![Version](https://img.shields.io/badge/dynamic/json.svg?label=Version&style=for-the-badge&url=https://git.zakscode.com/api/v1/repos/ztimson/map-alliance/tags&query=$[0].name)](https://git.zakscode.com/ztimson/map-alliance/tags)
  [![Pull Requests](https://img.shields.io/badge/dynamic/json.svg?label=Pull%20Requests&style=for-the-badge&url=https://git.zakscode.com/api/v1/repos/ztimson/map-alliance&query=open_pr_counter)](https://git.zakscode.com/ztimson/map-alliance/pulls)
  [![Issues](https://img.shields.io/badge/dynamic/json.svg?label=Issues&style=for-the-badge&url=https://git.zakscode.com/api/v1/repos/ztimson/map-alliance&query=open_issues_count)](https://git.zakscode.com/ztimson/map-alliance/issues)

  <!-- Links -->

  ---
  <div>
    <a href="https://git.zakscode.com/ztimson/map-alliance/releases" target="_blank">Release Notes</a>
    • <a href="https://git.zakscode.com/ztimson/map-alliance/issues/new?template=.github%2fissue_template%2fbug.md" target="_blank">Report a Bug</a>
    • <a href="https://git.zakscode.com/ztimson/map-alliance/issues/new?template=.github%2fissue_template%2fenhancement.md" target="_blank">Request a Feature</a>
  </div>

  ---
</div>

## Table of Contents
- [Map Alliance](#top)
    - [About](#about)
        - [Demo](#demo)
        - [Built With](#built-with)
    - [Setup](#setup)
        - [Development](#development)
    - [License](#license)

## About

Map Alliance is a map editing & collaboration tool. It provides several tile sets from multiple satellite image providers. From there users can
markup the map with shapes & notations.

Maps are saved to a unique URL. To access or share any map, you just need to share the URL to your map. Anyone viewing the map will have their position synced & displayed on the map.

This was built using Angular & Firebase's Firestore.

### Demo

Website: https://maps.zakscode.com

### Built With
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-FFFFFF?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

## Setup

<details>
<summary>
  <h3 id="development" style="display: inline">
    Development
  </h3>
</summary>

#### Prerequisites
- [Node.js](https://nodejs.org/en/download)

#### Instructions
1. Install the dependencies: `npm install`
2. Start the Angular server: `npm run start`
3. Open [http://localhost:4200](http://localhost:4200)

</details>

## License
Copyright © 2023 Zakary Timson | All Rights Reserved

See the [license](./LICENSE) for more information.
