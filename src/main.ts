import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as fs from 'fs'
import parseSurefireXML from './parser'

async function run(): Promise<void> {
  try {
    const globOptions = {
      followSymbolicLinks:
        core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE'
    }
    const globber = await glob.create(
      core.getInput('report_paths'),
      globOptions
    )
    for await (const file of globber.globGenerator()) {
      const data = await fs.promises.readFile(file)
      const result = await parseSurefireXML(data)
      core.info(JSON.stringify(result))
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`Unknown error occurred ${error}`)
    }
  }
}

run()
