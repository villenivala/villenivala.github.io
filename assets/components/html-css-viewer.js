class HtmlCssViewer extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
  
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
          }
          pre {
            display:flex;
            margin:0;
          }
          code {
            padding: 1.5rem 1rem 1rem;
            background-color: black;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            font-family: 'FontWithASyntaxHighlighter', monospace;
            color: #f1f1f1;
            line-height: 1.4;
            overflow: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            position: relative;
          }
          #htmlContainer code::before, #cssContainer code::before {
            position:absolute;
            font-size:0.7em;
            top:4px;
            left:4px;
            color:gray;
          }
          #htmlContainer code::before {
            content:"HTML";
          }
          #cssContainer code::before {
            content:"CSS";
          }
          #codeblock > *:nth-child(2) {
            border-bottom: 1px solid gray;
          }
  
          #codeblock > * {
            position:relative;
          }
          #codeblock {
            border: 1px solid #ddd;
            border-radius: 0.5rem;
            overflow:auto;
          }
          .previewContent {
            padding: 1rem;
          }
        </style>
        <div id="codeblock">
          <div id="previewContainer"></div>
          <pre id="htmlContainer"></pre>
          <pre id="cssContainer"></pre>
        </div>
      `;
  
      this.previewContainer = this.shadowRoot.getElementById("previewContainer");
      this.htmlContainer = this.shadowRoot.getElementById("htmlContainer");
      this.cssContainer = this.shadowRoot.getElementById("cssContainer");
  
      this.addEditorFont();
    }
  
    addEditorFont() {
      if (document.querySelector('style[data-description="tinybox-font-face"]')) {
        return;
      }
      const EDITOR_FONT = `@font-face {
        font-family: 'FontWithASyntaxHighlighter';
        src: url('./assets/fonts/FontWithASyntaxHighlighter-Regular.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
      }`;
      const style = document.createElement("style");
      style.dataset.description = "tinybox-font-face";
      style.textContent = EDITOR_FONT;
      document.head.appendChild(style);
    }
  
    connectedCallback() {
      this.updateDisplay();
    }
  
    static get observedAttributes() {
      return ['preview'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'preview') {
        this.updateDisplay();
      }
    }
  
    updateDisplay() {
      const template = this.querySelector("template");
  
      this.cssContainer.innerHTML = '';
      this.htmlContainer.innerHTML = '';
      this.previewContainer.innerHTML = '';
  
      if (template) {
        const content = template.content.cloneNode(true);
        const style = content.querySelector("style");
  
        let htmlContent = '';
        let cssContent = '';
  
        if (style) {
          cssContent = this.formatCode(style.textContent)
          const cssCode = document.createElement('code');
          cssCode.textContent = cssContent;
          this.cssContainer.appendChild(cssCode);
          style.remove();
        }
  
        htmlContent = Array.from(content.childNodes)
          .map(node => node.nodeType === Node.ELEMENT_NODE ? node.outerHTML : node.textContent)
          .join('');
        if (htmlContent.trim()) {
          const htmlCode = document.createElement('code');
          htmlCode.textContent = this.formatCode(htmlContent);
          this.htmlContainer.appendChild(htmlCode);
        }
  
        if (this.hasAttribute('preview')) {
          const previewDiv = document.createElement('div');
          previewDiv.className = 'previewContent';
          previewDiv.innerHTML = `
            <style>${cssContent}</style>
            ${htmlContent}
          `;
          this.previewContainer.appendChild(previewDiv);
        }
  
      } else {
        console.log("No template found inside TinyBox component");
      }
    }
  
    decodeHTMLEntities(text) {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    }
  
    formatCode(str) {
      str = this.decodeHTMLEntities(str);
      const lines = str.split("\n");
      const minIndent = Math.min(
        ...lines
          .filter(l => l.trim())
          .map(l => l.match(/^\s*/)[0].length)
      );
      let code = lines
        .map(l => l.slice(minIndent))
        .join("\n")
        .replace(/^\s*\n/, "")
        .replace(/\s*$/, "");
      return code;
    }
  }
  
  customElements.define("html-css-viewer", HtmlCssViewer);