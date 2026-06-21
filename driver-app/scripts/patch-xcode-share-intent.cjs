const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'node_modules', 'xcode', 'lib', 'pbxProject.js')
const unsafeLine = 'if (project.pbxGroupByName(group).path)'
const safeLine = 'if (project.pbxGroupByName(group) && project.pbxGroupByName(group).path)'

if (!fs.existsSync(filePath)) {
  process.exit(0)
}

const source = fs.readFileSync(filePath, 'utf8')

if (source.includes(safeLine)) {
  process.exit(0)
}

if (!source.includes(unsafeLine)) {
  console.warn('[postinstall] xcode patch skipped: target line not found')
  process.exit(0)
}

fs.writeFileSync(filePath, source.replace(unsafeLine, safeLine))
console.log('[postinstall] xcode share-intent patch applied')
