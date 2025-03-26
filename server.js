const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

const formatDate = (date) => {
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '');
};

// Set up middleware to parse request bodies and log requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from the docs folder (to load the Markdown files)
app.use(express.static(path.join(__dirname, 'docs')));

// Handle saving Markdown content
app.post('/save', (req, res) => {
  const { filename, content } = req.body;
  const filePath = path.join(__dirname, 'docs', `${filename}.md`);

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
  res.sendFile(path.join(__dirname, 'docs/', 'index.html'));
});

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
      const formattedDate = formatDate(stats.mtime);
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
