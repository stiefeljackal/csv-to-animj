import fs from 'fs-extra'
import path from 'path'
import csv from 'csv-parser'

const OUT_PATH_POSTFIX = '_result'
//Drone Skybrush Animation
const generateMainTemplate = (name) => JSON.parse(`{
  "name": "${name}",
  "tracks": []
}`)

const generateTrackTemplate = (nodeName) => JSON.parse(`{
  "trackType": "Curve",
  "valueType": "float3",
  "data": {
    "node": "${nodeName}",
    "property": "Position",
    "keyframes": []
  }
}`)

const generateFloat3KeyFrame = (time, interpolation, x, y, z) => JSON.parse(`{
  "time": ${parseFloat(time) / 1000},
  "value": { "x": ${parseFloat(x)}, "y": ${parseFloat(z)}, "z": ${parseFloat(y)}},
  "interpolation": "${interpolation}"
}`)

/**
 * @param {string} folderPath
 */
export const convertToAnimjInFolder = async (folderPath, resultFileName) => {
  const basename = path.basename(folderPath)
  const outFolderPath = folderPath.replace(basename, `${basename}${OUT_PATH_POSTFIX}`)

  await fs.ensureDir(outFolderPath)

  const fileNames = await fs.readdir(folderPath)

  const tracksPerFile = await Promise.all(fileNames.filter((fileName) => path.extname(fileName) === '.csv')
    .map((fileName) =>
      new Promise((resolve, _) => {
        const results = []
        fs.createReadStream(path.join(folderPath, fileName))
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
      }).then((csv) => csv.reduce((tracks, csvObj,) => {
        const [dTrack, cTrack] = tracks
        const time = csvObj['Time [msec]']
        const interpolation = 'Linear'
        dTrack.data.keyframes.push(generateFloat3KeyFrame(time, interpolation, csvObj['x [m]'], csvObj['y [m]'], csvObj['z [m]']))
        cTrack.data.keyframes.push(generateFloat3KeyFrame(time, interpolation, parseInt(csvObj.Red) / 127, parseInt(csvObj.Green) / 127, parseInt(csvObj.Blue) / 127))

        return [dTrack, cTrack]
      }, [generateTrackTemplate('D'), generateTrackTemplate('C')]
      ))
    )
  )

  const animJInfo = generateMainTemplate('Drone Skybrush Animation')
  animJInfo.tracks.push(...tracksPerFile.flat())

  await fs.writeJson(path.join(outFolderPath, `${resultFileName}.animj`), animJInfo)
}