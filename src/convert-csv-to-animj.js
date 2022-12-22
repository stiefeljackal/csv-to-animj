import fs from 'fs-extra'
import path from 'path'
import csv from 'csv-parser'

const OUT_PATH_POSTFIX = '_result'

/**
 * @param {string} folderPath 
 */
export const convertToAnimjInFolder = async (folderPath) => {
  const basename = path.basename(folderPath)
  const outFolderPath = folderPath.replace(basename, `${basename}${OUT_PATH_POSTFIX}`)
  
  await fs.ensureDir(outFolderPath)
  
  const fileNames = await fs.readdir(folderPath)
 
  await Promise.all(fileNames.filter((fileName) => path.extname(fileName) === '.csv')
    .map((fileName) =>
      new Promise((resolve, reject) => {
        const results = []
        fs.createReadStream(path.join(folderPath, fileName))
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
      }).then(async (csv) => csv.map((csvObj) => [{

      }]))))
}