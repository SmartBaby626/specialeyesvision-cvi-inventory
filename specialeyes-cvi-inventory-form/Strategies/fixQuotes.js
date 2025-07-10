const fs = require('fs');


const data = JSON.parse(fs.readFileSync('strategiesAtHome9-12.json', 'utf8'));


function escapeInnerQuotes(value) {

  value = value.replace(/[“”]/g, '"');


  return value.replace(/([^\\])"/g, '$1\\"');
}


function processJSON(obj) {
  if (typeof obj === 'string') {
    return escapeInnerQuotes(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(processJSON);
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      obj[key] = processJSON(obj[key]);
    }
    return obj;
  } else {
    return obj; 
  }
}

const updated = processJSON(data);

fs.writeFileSync('yourfile-fixed.json', JSON.stringify(updated, null, 2), 'utf8');

console.log('Done! Fixed JSON saved as yourfile-fixed.json');
