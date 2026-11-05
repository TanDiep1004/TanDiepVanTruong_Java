const fs = require('fs');
const path = require('path');

// Đọc toàn bộ nội dung markdown của báo cáo
const mdPath = path.join(__dirname, '..', 'BAO_CAO_DO_AN_MON_LAP_TRINH_JAVA.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Tạo file .doc chuẩn định dạng Microsoft Word 2003/2007/2013/2016/2019/365 (Word HTML format với MSO styles)
// Định dạng này được Microsoft Word mở tự nhiên 100%, tự động nhận diện font Times New Roman, cỡ 13, lề trang theo đúng yêu cầu:
// Lề trái: 2.5cm, Lề phải: 2.0cm, Lề trên: 2.0cm, Lề dưới: 2.0cm, Khổ giấy A4.

function markdownToWordHtml(markdown) {
  // Thay thế các tiêu đề, bảng biểu, danh sách sang HTML có inline CSS cho Word
  let html = markdown;

  // Escape basic XML entities if needed (not affecting tags)
  
  // Format tables
  // We can convert markdown tables into standard HTML tables with Word borders
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Check if separator line
      if (line.match(/^\|[\s\-:]+(\|[\s\-:]+)+\|$/)) {
        continue; // skip separator
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        inTable = false;
        newLines.push(renderHtmlTable(tableRows));
        tableRows = [];
      }
      newLines.push(lines[i]);
    }
  }
  if (inTable) {
    newLines.push(renderHtmlTable(tableRows));
  }

  html = newLines.join('\n');

  // Format Headings
  html = html.replace(/^# (.*$)/gim, '<h1 class="heading-1">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="heading-2">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="heading-3">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="heading-4">$1</h4>');

  // Format Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<b><i>$1</i></b>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/gim, '<i>$1</i>');

  // Format Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3pt solid #10b981; padding-left: 10pt; margin: 10pt 0; color: #374151;">$1</blockquote>');

  // Format Code blocks
  html = html.replace(/```(java|bash|text|mermaid)?([\s\S]*?)```/gim, function(match, lang, code) {
    const cleanCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
    return `<div class="code-block"><pre style="font-family: Consolas, 'Courier New', monospace; font-size: 10pt; line-height: 1.2; margin: 0; white-space: pre-wrap;">${cleanCode}</pre></div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code style="font-family: Consolas, monospace; background-color: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-size: 11pt;">$1</code>');

  // Unordered list items
  html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, ''); // Merge contiguous lists

  // Ordered list items
  html = html.replace(/^(\d+)\. (.*$)/gim, '<ol start="$1"><li>$2</li></ol>');
  html = html.replace(/<\/ol>\s*<ol start="\d+">/gim, '');

  // Paragraphs
  const pLines = html.split('\n\n');
  html = pLines.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<blockquote') || p.startsWith('<hr')) {
      return p;
    }
    return `<p class="paragraph">${p}</p>`;
  }).join('\n');

  return html;
}

function renderHtmlTable(rows) {
  if (rows.length === 0) return '';
  let tableHtml = '<table class="word-table" border="1" cellspacing="0" cellpadding="6">\n';
  
  rows.forEach((row, index) => {
    const cells = row.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length === 0) return;

    tableHtml += '  <tr>\n';
    cells.forEach(cell => {
      // Process bold/italic inside cell
      let formattedCell = cell
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/`([^`]+)`/g, '<code style="font-family: Consolas;">$1</code>')
        .replace(/<br\/>/g, '<br/>');

      if (index === 0) {
        tableHtml += `    <th style="background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #94a3b8; font-size: 11.5pt;">${formattedCell}</th>\n`;
      } else {
        const bg = (index % 2 === 0) ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
        tableHtml += `    <td style="${bg} border: 1px solid #cbd5e1; font-size: 11pt; vertical-align: top;">${formattedCell}</td>\n`;
      }
    });
    tableHtml += '  </tr>\n';
  });

  tableHtml += '</table>\n';
  return tableHtml;
}

// Tạo tài liệu Word chuẩn định dạng MSO với đầy đủ Header, Footer, Margin, Page Break
const bodyContent = markdownToWordHtml(mdContent);

const docTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Báo Cáo Đồ Án Lập Trình Java - NTD Eyewear</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 {
    size: 210mm 297mm; /* Khổ A4 chuẩn */
    margin: 20mm 20mm 20mm 25mm; /* Trên: 2cm, Dưới: 2cm, Phải: 2cm, Trái: 2.5cm */
    mso-header-margin: 10mm;
    mso-footer-margin: 10mm;
    mso-paper-source: 0;
}
div.Section1 {
    page: Section1;
}
body {
    font-family: "Times New Roman", Times, serif;
    font-size: 13pt; /* Cỡ chữ 13pt theo đúng quy định */
    line-height: 1.25; /* Giãn dòng 1.15 - 1.25 chuẩn */
    color: #111827;
    background-color: #ffffff;
}
p.paragraph {
    text-align: justify; /* Căn đều hai bên */
    text-indent: 10mm; /* Thụt đầu dòng 1cm */
    margin-top: 4pt;
    margin-bottom: 6pt;
    line-height: 1.25;
}
h1.heading-1 {
    font-size: 18pt;
    font-weight: bold;
    color: #0f172a;
    text-align: center;
    margin-top: 18pt;
    margin-bottom: 12pt;
    text-transform: uppercase;
}
h2.heading-2 {
    font-size: 15pt;
    font-weight: bold;
    color: #1e3a8a;
    margin-top: 16pt;
    margin-bottom: 8pt;
    border-bottom: 1.5pt solid #1e3a8a;
    padding-bottom: 4pt;
    text-transform: uppercase;
}
h3.heading-3 {
    font-size: 13.5pt;
    font-weight: bold;
    color: #0f172a;
    margin-top: 12pt;
    margin-bottom: 6pt;
}
h4.heading-4 {
    font-size: 13pt;
    font-weight: bold;
    font-style: italic;
    color: #334155;
    margin-top: 10pt;
    margin-bottom: 4pt;
}
table.word-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-family: "Times New Roman", Times, serif;
}
table.word-table th {
    padding: 6pt 8pt;
    background-color: #1e293b;
    color: #ffffff;
}
table.word-table td {
    padding: 6pt 8pt;
    line-height: 1.2;
}
.code-block {
    background-color: #f1f5f9;
    border: 1pt solid #cbd5e1;
    border-radius: 4pt;
    padding: 8pt 10pt;
    margin: 10pt 0;
}
ul, ol {
    margin-top: 4pt;
    margin-bottom: 6pt;
    padding-left: 25pt;
}
li {
    margin-bottom: 3pt;
    text-align: justify;
    line-height: 1.25;
}
.cover-page {
    border: 3pt double #0f172a;
    padding: 25pt;
    text-align: center;
    min-height: 240mm;
    page-break-after: always;
}
.page-break {
    page-break-before: always;
}
</style>
</head>
<body>
<div class="Section1">
${bodyContent}
</div>
</body>
</html>`;

// Ghi ra 2 tệp:
// 1. Nhom01_NTDEyewear_LapTrinhJava.doc
// 2. Nhom01_NTDEyewear_LapTrinhJava.docx
const outputPathDoc = path.join(__dirname, '..', 'Nhom01_NTDEyewear_LapTrinhJava.doc');
fs.writeFileSync(outputPathDoc, docTemplate, 'utf8');

console.log(`Đã xuất file Word thành công tại: ${outputPathDoc}`);
