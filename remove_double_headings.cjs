const fs = require('fs');
const path = require('path');

const dir = 'src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

let modifiedCount = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We are looking for:
  // <div className="flex justify-between items-center mb-10"> or similar
  //   <div>
  //     <h2 className="...">Title</h2>
  //     <p className="...">Subtitle</p>
  //   </div>
  //   <div className="flex gap-4">...buttons...</div>
  // </div>
  
  // A regex to match the inner div containing an h2/h1 and optionally a p tag.
  // It should be within the main page content, usually near the top.
  // We'll specifically target a div that contains an h1 or h2 with text sizes like text-2xl or text-3xl, 
  // followed by an optional p tag.
  
  const titleBlockRegex = /<div>\s*<h[12][^>]*text-[23]xl[^>]*>[\s\S]*?<\/h[12]>\s*(?:<p[^>]*>[\s\S]*?<\/p>\s*)?<\/div>/g;
  
  if (titleBlockRegex.test(content)) {
    console.log(`Matched in ${file}`);
    content = content.replace(titleBlockRegex, '');
    fs.writeFileSync(filePath, content);
    modifiedCount++;
  }
}

console.log(`Modified ${modifiedCount} files.`);
