import events from 'events';
import fs from 'fs';
import https from 'https';

const url = 'https://memegen-link-examples-upleveled.netlify.app';
const imagesEmitter = new events.EventEmitter();
const targetDir = './memes';

function leftFillNum(num, targetLength) {
  return num.toString().padStart(targetLength, 0);
}

//Get the HTML string from website
async function getIndexPage(url) {
  let penddingRequest = https.get(url, (res) => {
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (data) => {
      body += data;
      imagesEmitter.emit('😝', body);
    });
    res.on('end', () => {
      //I'm already gone 🤫
    });
  });
  imagesEmitter.on('🤪', () => {
    //I know what I'm doing 🤣
    penddingRequest.abort();
  });
}

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, { flags: 'wx' });

    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(
          `Server responded with ${response.statusCode}: ${response.statusMessage}`,
        );
      }
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err.message);
    });

    file.on('finish', () => {
      resolve();
    });

    file.on('error', (err) => {
      file.close();

      if (err.code === 'EEXIST') {
        reject('File already exists');
      } else {
        fs.unlink(dest, () => {});
        reject(err.message);
      }
    });
  });
}

imagesEmitter.on('😝', (data) => {
  let found = data.match(/<img.*src=(["|']([^>]+))/g);
  if (found && found.length > 10) {
    imagesEmitter.emit('🤪');
    for (const [index, value] of Object.entries(found)) {
      if (index < 10) {
        let last = value.match(/src=["|']([^"|']+)/);
        if (last && last[1]) {
          download(last[1], `${targetDir}/${leftFillNum(index, 2)}.jpg`);
        }
      }
    }
  }
});

//Make targetDir if doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

fs.promises
  .readdir(targetDir)
  // If promise resolved and
  // datas are fetched
  .then((filenames) => {
    for (let filename of filenames) {
      fs.unlink(`${targetDir}/${filename}`, () => {});
    }
  })
  // If promise is rejected
  .catch((err) => {
    console.log(err);
  })
  // Do this anyway
  .then(() => {
    getIndexPage(url);
  });
