#!/usr/bin/env node

import yargs from 'yargs'
import { convertToAnimjInFolder } from './src/convert-csv-to-animj.js'

const argv = yargs(process.argv.slice(2))

argv
  .usage('$0 <cmd> [args]')
  .command('convert [folderPath] [resultFileName]', 'Convert CSV to AnimJ in folder.', (yargs) => {
    yargs.positional('folderPath', {
      type: 'string',
      describe: 'The file path to convert the files'
    })
      .positional('resultFileName', {
        type: 'string',
        describe: 'The name of the file that the AnimJ file should have'
      })
  }, (argv) => convertToAnimjInFolder(argv.folderPath, argv.resultFileName)
  ).help()
  .argv