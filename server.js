const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;
const PASSWORD = process.env.LOGIN_PASSWORD || 'docsify';
let docsPath = process.env.DOCS_PATH || "docs";

function formatTimestamp(str) {
  let now = new Date();
  if (str) {
    now = new Date(str);
  }
  return now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, '0') + "-" +
    String(now.getDate()).padStart(2, '0') + " " +
    String(now.getHours()).padStart(2, '0') + ":" +
    String(now.getMinutes()).padStart(2, '0') + ":" +
    String(now.getSeconds()).padStart(2, '0');
}


// Middleware to check for password
function authMiddleware(req, res, next) {
  const pwd = req.cookies.auth;
  if (pwd === PASSWORD) {
    return next();
  }
  res.redirect('/login');
}

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/login', (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input type="password" name="password" placeholder="Enter password" />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.cookie('auth', password, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365  // 365 天（单位是毫秒）
    });
    return res.redirect('/');
  }
  res.send('Password incorrect. <a href="/login">Try again</a>');
});

app.get('/logout', (req, res) => {
  res.clearCookie('auth');
  res.redirect('/login');
});


// check if docsPath a full path
if (!path.isAbsolute(docsPath)) {
  docsPath = path.join(__dirname, docsPath);
}
// make sure uploads path exists
if (!fs.existsSync(docsPath + '/uploads')) {
  fs.mkdirSync(docsPath + '/uploads');
}

// Set up middleware to parse request bodies and log requests
app.use(cookieParser());
app.use(bodyParser.json());

app.use(morgan('dev'));

// use the auth middleware for all routes
app.use(authMiddleware);
// Serve static files from the docs folder (to load the Markdown files)
app.use(express.static(docsPath));

// Serve the Docsify homepage (index.html) by default
app.get('/', authMiddleware, (req, res) => {
  res.sendFile(path.join(docsPath + '/', 'index.html'));
});

// Handle saving Markdown content
app.post('/save', (req, res) => {
  let { filename, content } = req.body;
  filename = decodeURIComponent(filename);
  const filePath = path.join(docsPath, `${filename}.md`);

  // Write the new content to the file
  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to save the file' });
    }
    res.json({ success: true, message: 'File saved successfully' });
  });
});

// custom storage, file saved to .png
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docsPath + '/uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = formatTimestamp().replace(/:/g, '').replace(/ /g, '').replace(/-/g, '');
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

app.post('/delete', (req, res) => {
  let { path: filePath } = req.body;
  filePath = decodeURIComponent(filePath);
  const fullPath = path.join(docsPath, filePath + ".md");
  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete file' });
    }
    console.log(`File deleted: ${fullPath}`);
    res.json({ success: true });
  });
});

// list markdown files
app.get('/filelist.md', (req, res) => {
  const directoryPath = docsPath;
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to list files' });
    }
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    // output markdown table format with predefined columns
    let markdown = `| No. | File Name | Size | Last Modified | \n`;
    markdown += `| --- | --- | --- | --- | \n`;
    var num = 0;
    filelist = markdownFiles.map(file => {
      num++;
      const stats = fs.statSync(path.join(directoryPath, file));
      const formattedDate = formatTimestamp(stats.mtime);
      return `| ${num} | [${file}](${file})  | ${stats.size} | ${formattedDate} |`;
    });
    markdown += filelist.join('\n');
    res.setHeader('Content-Type', 'text/markdown');
    res.send(markdown);
  });
});

app.get('/filelinks.md', (req, res) => {
  const directoryPath = docsPath;
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to list files' });
    }
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    // output markdown table format with predefined columns
    let markdown = "";
    var num = 0;
    filelist = markdownFiles.map(file => {
      num++;
      return num == 1 ? `[${file}](${file})` : ` / [${file}](${file})`;
    });
    markdown += filelist.join('\n');
    res.setHeader('Content-Type', 'text/markdown');
    res.send(markdown);
  });
});

app.get('/recentfiles.md', (req, res) => {
  const directoryPath = docsPath;
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to list files' });
    }

    // Filter markdown files and get their stats
    const markdownFiles = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const stats = fs.statSync(path.join(directoryPath, file));
        return {
          name: file,
          mtime: stats.mtime,
          size: stats.size
        };
      });

    // Sort by modification time (newest first)
    markdownFiles.sort((a, b) => b.mtime - a.mtime);

    // Limit to recent files (optional)
    const recentFiles = markdownFiles.slice(0, 10); // Top 10 most recent

    let markdown = `| No. | File Name | Size | Last Modified |\n`;
    markdown += `| --- | --- | --- | --- |\n`;

    recentFiles.forEach((file, index) => {
      const formattedDate = formatTimestamp(file.mtime);
      markdown += `| ${index + 1} | [${file.name}](${file.name}) | ${file.size} | ${formattedDate} |\n`;
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.send(markdown);
  });
});

app.get("/_sidebar.md", (req, res) => {
  const directoryPath = docsPath;
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to list files' });
    }
    const markdownFiles = files.filter(file => file.endsWith('.md') && !file.startsWith('_'));
    let markdown = "";
    filelist = markdownFiles.map(file => {
      const stats = fs.statSync(path.join(directoryPath, file));
      return `- [${file}](${file})`;
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
