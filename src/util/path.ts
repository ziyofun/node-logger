import * as fs from'fs';
import * as mkdirp from 'mkdirp';

/**
 * 检验文件是否存在，否则创建一个文件夹
 * @param dirname 
 * @param mode 
 */
export function checkAndmkdirsSync(dirname: string) {
    const fileExistedAlready = fs.existsSync(dirname);
    if (fileExistedAlready) {
        return void 0;
    }
    
    mkdirp.sync(dirname)
}
