const fs = require('fs');
const path = require('path');
const { promises: fsp } = require('fs');

// Paths to your text files
const filesToWatch = ['./utils.js', './popupUtils.js', './widget.js'];

// Path to output file
const outputPath = './dist/combined.js';

// Function to combine files
async function combineFiles() {
  try {
    const fileContents = await Promise.all(
      filesToWatch.map(async file => {
        const content = await fsp.readFile(file, 'utf-8');
        return content;
      })
    );

    const combinedContent = fileContents.join('\n');
    await fsp.writeFile(outputPath, combinedContent, 'utf-8');
    console.log('Files combined successfully');
  } catch (err) {
    console.error('Error combining files:', err);
  }
}

// Function to set up file watchers
function watchFiles() {
  filesToWatch.forEach(file => {
    fs.watch(file, (eventType, filename) => {
      if (filename && eventType === 'change') {
        console.log(`${filename} has changed, combining files...`);
        combineFiles();
      }
    });
  });
}

// Initial combination of files
combineFiles();

// Watch for file changes
watchFiles();
