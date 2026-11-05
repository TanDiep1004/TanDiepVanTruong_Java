const { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType, UnderlineType 
} = require('docx');
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'BAO_CAO_DO_AN_MON_LAP_TRINH_JAVA.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Định nghĩa thông số văn bản theo đúng yêu cầu:
// Font: Times New Roman, Cỡ chữ: 13pt (trong docx: 26 half-points)
// Lề trang: Trái 2.5cm, Phải 2.0cm, Trên 2.0cm, Dưới 2.0cm
// 1 cm = 567 twips => 2.5cm = 1418 twips, 2.0cm = 1134 twips.

const children = [];

// Helper styles
const font = "Times New Roman";
const baseSize = 26; // 13pt

// Tách các dòng trong markdown
const lines = mdContent.split('\n');
let inTable = false;
let tableRowsData = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Bỏ qua dòng phân cách bảng markdown
  if (line.match(/^\|[\s\-:]+(\|[\s\-:]+)+\|$/)) {
    continue;
  }

  // Xử lý bảng
  if (line.startsWith('|') && line.endsWith('|')) {
    if (!inTable) {
      inTable = true;
      tableRowsData = [];
    }
    const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    tableRowsData.push(cells);
    continue;
  } else if (inTable) {
    inTable = false;
    children.push(createDocxTable(tableRowsData));
    children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    tableRowsData = [];
  }

  // Xử lý tiêu đề H1
  if (line.startsWith('# ')) {
    const text = line.replace(/^# /, '').trim();
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 180 },
      children: [
        new TextRun({
          text: text,
          font: font,
          size: 34, // 17pt
          bold: true,
          color: "0F172A",
        })
      ]
    }));
    continue;
  }

  // Xử lý tiêu đề H2
  if (line.startsWith('## ')) {
    const text = line.replace(/^## /, '').trim();
    children.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: text,
          font: font,
          size: 29, // 14.5pt
          bold: true,
          color: "1E3A8A",
        })
      ]
    }));
    continue;
  }

  // Xử lý tiêu đề H3
  if (line.startsWith('### ')) {
    const text = line.replace(/^### /, '').trim();
    children.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({
          text: text,
          font: font,
          size: 27, // 13.5pt
          bold: true,
          color: "0F172A",
        })
      ]
    }));
    continue;
  }

  // Xử lý tiêu đề H4
  if (line.startsWith('#### ')) {
    const text = line.replace(/^#### /, '').trim();
    children.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 120, after: 60 },
      children: [
        new TextRun({
          text: text,
          font: font,
          size: baseSize,
          bold: true,
          italics: true,
          color: "334155",
        })
      ]
    }));
    continue;
  }

  // Xử lý khối code
  if (line.startsWith('```')) {
    let codeContent = [];
    i++;
    while (i < lines.length && !lines[i].trim().startsWith('```')) {
      codeContent.push(lines[i]);
      i++;
    }
    const fullCode = codeContent.join('\n');
    children.push(new Paragraph({
      spacing: { before: 120, after: 120 },
      shading: {
        type: ShadingType.CLEAR,
        fill: "F1F5F9",
      },
      children: [
        new TextRun({
          text: fullCode,
          font: "Consolas",
          size: 20, // 10pt
          color: "0F172A",
        })
      ]
    }));
    continue;
  }

  // Xử lý gạch ngang phân cách
  if (line === '---' || line === '***') {
    children.push(new Paragraph({
      spacing: { before: 120, after: 120 },
      border: {
        bottom: {
          color: "CBD5E1",
          space: 1,
          value: BorderStyle.SINGLE,
          size: 6,
        }
      }
    }));
    continue;
  }

  // Xử lý danh sách đầu dòng (Bullets)
  if (line.startsWith('* ') || line.startsWith('- ')) {
    const content = line.replace(/^[\*\-]\s+/, '');
    children.push(new Paragraph({
      bullet: { level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 40, line: 276 },
      children: parseInlineFormatting(content)
    }));
    continue;
  }

  // Xử lý danh sách số (Numbered list)
  const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
  if (numMatch) {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 40, line: 276 },
      children: [
        new TextRun({ text: `${numMatch[1]}. `, bold: true, font: font, size: baseSize }),
        ...parseInlineFormatting(numMatch[2])
      ]
    }));
    continue;
  }

  // Đoạn văn thông thường
  if (line.length > 0) {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 60, after: 60, line: 276 }, // 276 twips = 1.15 line spacing
      indent: { firstLine: 567 }, // Thụt đầu dòng 1cm
      children: parseInlineFormatting(line)
    }));
  }
}

if (inTable) {
  children.push(createDocxTable(tableRowsData));
}

function parseInlineFormatting(text) {
  const runs = [];
  // Phân tích bold, italic, code
  // Cắt text bằng regex
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: font,
        size: baseSize,
      }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        italics: true,
        font: font,
        size: baseSize,
      }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        font: "Consolas",
        size: 22,
        shading: {
          type: ShadingType.CLEAR,
          fill: "F3F4F6",
        }
      }));
    } else {
      runs.push(new TextRun({
        text: part,
        font: font,
        size: baseSize,
      }));
    }
  }

  return runs;
}

function createDocxTable(data) {
  if (data.length === 0) return new Paragraph("");

  const rows = data.map((row, rIdx) => {
    const isHeader = rIdx === 0;
    const cells = row.map(cellText => {
      return new TableCell({
        shading: {
          type: ShadingType.CLEAR,
          fill: isHeader ? "1E293B" : (rIdx % 2 === 0 ? "F8FAFC" : "FFFFFF"),
        },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [
          new Paragraph({
            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: cellText.replace(/\*\*/g, '').replace(/<br\/>/g, ' - '),
                font: font,
                size: isHeader ? 24 : 22, // 12pt / 11pt
                bold: isHeader,
                color: isHeader ? "FFFFFF" : "0F172A",
              })
            ]
          })
        ]
      });
    });

    return new TableRow({
      children: cells,
      tableHeader: isHeader,
    });
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: rows,
  });
}

// Khởi tạo tài liệu Docx
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1134,    // 2.0 cm
            bottom: 1134, // 2.0 cm
            left: 1418,   // 2.5 cm
            right: 1134,  // 2.0 cm
          },
        },
      },
      children: children,
    },
  ],
});

const outputPathDocx = path.join(__dirname, '..', 'Nhom18_WebBanMatKinh_Java.docx');

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPathDocx, buffer);
  console.log(`Đã tạo tệp DOCX chuẩn OpenXML thành công tại: ${outputPathDocx}`);
});
