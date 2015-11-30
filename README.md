# Notiforward Chrome Extension

## Getting Started
1. Clone the repo to your local machine using `git@github.com:YeomansIII/notiforward-chrome.git` or `https://github.com/YeomansIII/notiforward-chrome.git`

2. Install node.js and npm using Node Version Manager (https://github.com/creationix/nvm)
  - Run `nvm install 0.12.7`
  - You will need to run this command before working on the project every time

3. Run `npm install -g grunt-cli grunt` and `npm install`

4. Run `bower install`

5. Finally, run `grunt` to build the project
  - You can now open the Google Chrome extensions page at [chrome://extensions/](chrome://extensions/)
  - Ensure that the developer mode is checked
  - Click "Load unpacked extension..." and navigate to the repo folder, then select the `dist/` folder

The extension will now load into chrome. When you want to load changes, just run `grunt` in the terminal again.

## Set Up Firebase Database
https://github.com/YeomansIII/notiforward-android/wiki/Notiforward-Setup-(Getting-Started)
