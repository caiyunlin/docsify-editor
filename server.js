const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

const docsPath = "docs";

function formatTimestamp(str) {
  let now = new Date();
  if (str) {
    now = new Date(str);
  }
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0') +
    String(now.getMilliseconds()).padStart(3, '0');
}

// Set up middleware to parse request bodies and log requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from the docs folder (to load the Markdown files)
app.use(express.static(path.join(__dirname, docsPath)));

// Handle saving Markdown content
app.post('/save', (req, res) => {
  const { filename, content } = req.body;
  const filePath = path.join(__dirname, docsPath, `${filename}.md`);

  // Write the new content to the file
  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to save the file' });
    }
    res.json({ success: true, message: 'File saved successfully' });
  });
});

// Serve the Docsify homepage (index.html) by default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, docsPath + '/', 'index.html'));
});


// 自定义存储引擎，确保文件扩展名为 .png
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docsPath + '/uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = formatTimestamp();
    cb(null, `${timestamp}.png`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '上传失败' });
  }

  const filePath = `/uploads/${req.file.filename}`;
  res.json({ url: filePath }); // 返回带 .png 的 URL
});

// 确保 uploads 目录存在
if (!fs.existsSync(docsPath + '/uploads')) {
  fs.mkdirSync(docsPath + '/uploads');
}



// list markdown files
app.get('/filelist.md', (req, res) => {
  const directoryPath = path.join(__dirname, 'docs');
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to list files' });
    }
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    // output markdown table format with predefined columns
    let markdown = `| File Name | Description | Size | Last Modified | \n`;
    markdown += `| --- | --- | --- | --- | \n`;
    filelist = markdownFiles.map(file => {
      const stats = fs.statSync(path.join(directoryPath, file));
      const formattedDate = formatTimestamp(stats.mtime);
      return `| [${file}](${file}) |  | ${stats.size} | ${formattedDate} |`;
    });
    markdown += filelist.join('\n');

    res.setHeader('Content-Type', 'text/markdown');
    res.send(markdown);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
