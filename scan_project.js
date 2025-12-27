const fs = require('fs');
const path = require('path');

// যে ফোল্ডারগুলো স্ক্যান করা হবে না
const ignoreFolders = ['node_modules', '.next', '.git', '.vscode', 'public'];
// যে এক্সটেনশনের ফাইলগুলো নেওয়া হবে
const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.prisma', '.json'];
// আউটপুট ফাইলের নাম
const outputFile = 'full_project_code.txt';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreFolders.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // এক্সটেনশন চেক
      if (allowedExtensions.includes(path.extname(file)) && file !== 'package-lock.json') {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function mergeFiles() {
  const projectRoot = __dirname;
  const allFiles = getAllFiles(projectRoot);
  
  let content = "PROJECT SCAN RESULT\n===================\n\n";

  allFiles.forEach(filePath => {
    // নিজের স্ক্রিপ্ট ফাইল এবং আউটপুট ফাইল বাদ দেওয়া
    if (filePath.includes('scan_project.js') || filePath.includes(outputFile)) return;

    const relativePath = path.relative(projectRoot, filePath);
    
    content += `\n--------------------------------------------------\n`;
    content += `FILE: ${relativePath}\n`;
    content += `--------------------------------------------------\n`;
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      content += fileContent + "\n\n";
    } catch (err) {
      content += `Error reading file: ${err.message}\n\n`;
    }
  });

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Success! All code saved to: ${outputFile}`);
}

mergeFiles();