let easyMDE = null;
let isEditing = false;
var num = 0;


function getCurrentPageFileName() {
  var fileName = window.location.hash.split('/').pop().replace('.md', '');
  fileName = fileName.split("?")[0];
  return fileName === '' ? 'README' : fileName;
}

function loadMermaid(id, code) {
  console.log("Loading Mermaid code:", code);
  let container = document.getElementById(id);
  if (container) {
    container.innerHTML = `<div class="mermaid">${code}</div>`;
    mermaid.init(undefined, ".mermaid");
  }
}

function saveData(reload = false) {
  var filename = getCurrentPageFileName();

  const content = easyMDE.value();

  // Change the background to dark while saving
  document.body.style.backgroundColor = '#2e2e2e';  // Dark background color
  document.body.style.color = '#ddd';                // Light text color for readability

  // Send the content to the server for saving
  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Revert back to the original page style after save
        document.body.style.backgroundColor = ''; // Reset to original background color
        document.body.style.color = '';           // Reset text color
        if (reload) {
          window.location.reload();
        }
      } else {
        alert('Failed to save file');
      }
    })
    .catch(err => {
      console.error('Error saving file:', err);
      // Revert back to the original page style if there was an error
      document.body.style.backgroundColor = ''; // Reset to original background color
      document.body.style.color = '';           // Reset text color
      alert('Failed to save file');
    });
}

function editPage() {
  if (isEditing) {
    return;
  }

  isEditing = true;

  editorContainer.style.display = 'block';
  document.getElementsByTagName("main")[0].style.display = "none"
  document.getElementsByTagName("nav")[0].style.display = "none"

  // init EasyMDE
  easyMDE = new EasyMDE({
    element: document.getElementById('editor'),
    fullscreen: true,
    sideBySide: true,
    spellChecker: false,
    hideIcons: ["guide"],
    toolbar: [
      "bold", "italic", "|",
      "heading", "quote", "unordered-list", "ordered-list", "|",
      "link", "image", "|",
      "preview", "side-by-side", "fullscreen", "|",
      {
        name: "save", // Define the 'save' button
        action: function () {
          saveData();
        },
        className: "fa fa-save",
        title: "Save Document"
      }, {
        name: "saveClose",
        action: function () {
          saveData(true);
        },
        className: "fa fa-floppy-o",
        title: "Save and Return"
      }
    ],
    previewRender: function (plainText) {
      // use marked to render markdown
      let html = marked.parse(plainText);

      // replace the mermaid code blocks with placeholders to avoid keep re-rendering
      html = html.replace(/<div class="mermaid">([\s\S]*?)<\/div>/g, (match, code) => {
        let id = "mermaid-" + Math.random().toString(36).substr(2, 9);
        return `
          <div id="${id}" class="mermaid-placeholder">
            <button class="mermaid-load-btn" onclick="loadMermaid('${id}', decodeURIComponent('${encodeURIComponent(code)}'))">
              Click to load Mermaid diagram
            </button>
            <br/>
          </div>
        `;
      });
      return html;
    },
    uploadImage: true,
    imageUploadFunction: (file, onSuccess, onError) => {
      const formData = new FormData();
      formData.append('image', file);
      fetch('/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.url) {
            onSuccess(data.url);
          } else {
            onError('Upload failed');
          }
        })
        .catch(() => onError('Upload failed'))
    }
  });


  easyMDE.toggleSideBySide();

  // Load the current page content
  var currentPage = getCurrentPageFileName();
  fetch(`${currentPage}.md`)
    .then(response => response.text())
    .then(data => easyMDE.value(data))
    .catch(err => console.error('Load Error', err));

  // Bind the change event to update the preview
  easyMDE.codemirror.on("change", () => {
    const markdown = easyMDE.value();
    //setTimeout(() => mermaid.init(undefined, document.querySelectorAll(".mermaid")), 100);
  });


}

function initDocsify() {

  window.$docsify = {
    name: 'Docsify Editor',
    loadNavbar: true,
    basePath: '/',
    loadSidebar: false,
    markdown: {
      renderer: {
        code: function (code, lang) {
          if (lang == "mermaid") {
            var html = '<div class="mermaid">' + code + '</div>';
            return html;
          }
          return this.origin.code.apply(this, arguments);
        }
      }
    },
    plugins: [
      function processMermaid(hook, vm) {
        hook.ready(function () {
          mermaid.initialize({ startOnLoad: false });
        });
        hook.doneEach(function () {
          mermaid.init(undefined, '.mermaid');
        });
      },
      function editButton(hook, vm) {
        hook.beforeEach(function (html) {
          var editHtml = '<a id="editButton" style="cursor: pointer; text-decoration:underline;">📝 Edit Document</a>\n\n';
          //var editHtml = "";
          return (
            editHtml + html
          );
        });

        hook.ready(function () {
          initEasyMDE();
        });
      },
    ]
  };
}

function initEasyMDE() {
  const editButton = document.getElementById('editButton');
  editButton.addEventListener('click', () => {
    editPage();
  });
}

// Function to bind keyboard events (Ctrl+S, ESC, E)
function bindKeyEvents() {
  document.addEventListener('keydown', function (event) {
    // Intercept Ctrl+S for auto-save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault(); // Prevent default browser save action
      saveData();      // Trigger custom save
    }

    // Intercept ESC key to reload the page (refresh)
    if (event.key === 'Escape') {
      location.reload();      // Reload the page
    }

    // Intercept E key to enter edit mode (trigger Edit button)
    if (event.key === 'e' || event.key === 'E') {
      editPage();
    }

  });
}

document.addEventListener('DOMContentLoaded', function () {
  initDocsify();
  bindKeyEvents();
});

document.addEventListener('dblclick', function (event) {
  editPage();
});