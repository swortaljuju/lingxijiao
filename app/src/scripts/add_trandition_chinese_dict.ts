import {OpenCC} from 'opencc';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

(async () => {
    const opencc = new OpenCC('s2t.json');
    const dictPath = path.resolve(__dirname, process.argv[2]);
    const fileStream = fs.createReadStream(dictPath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    let traditionalChinese = '';
    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        traditionalChinese = traditionalChinese + opencc.convertSync(line) + '\r\n';
    }
    fs.appendFileSync(dictPath, traditionalChinese);
})();
