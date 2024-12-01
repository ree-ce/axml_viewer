import { AxmlParser } from './axml-parser.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const loading = document.getElementById('loading');
const filename = document.getElementById('filename');

let currentXmlContent = '';

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function downloadXML() {
    if (!currentXmlContent) return;

    const blob = new Blob([currentXmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AndroidManifest.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function handleFile(file) {
    try {
        filename.textContent = `選擇的檔案: ${file.name}`;
        showLoading(true);

        const buffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });

        const xmlContent = AxmlParser.convert(buffer);
        currentXmlContent = xmlContent;

        output.innerHTML = hljs.highlight(xmlContent, {
            language: 'xml'
        }).value;
        output.className = 'output hljs';
        downloadBtn.disabled = false;
        copyBtn.style.display = 'block';

    } catch (error) {
        output.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
        downloadBtn.disabled = true;
        copyBtn.style.display = 'none';
    } finally {
        showLoading(false);
    }
}

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
downloadBtn.addEventListener('click', downloadXML);

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentXmlContent)
        .then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已複製！';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});