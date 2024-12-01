const express = require('express');
const multer = require('multer');
const path = require('path');
const Axml2Xml = require('axml2xml');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '請選擇檔案' });
    }

    // 修正: 使用正確的方法路徑
    const xmlContent = Axml2Xml.Axml2xml.convert(req.file.buffer);
    res.json({ xml: xmlContent });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: '解析錯誤: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});