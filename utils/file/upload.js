const path = require('path')
const fs = require('fs')

module.exports = (file, uploadPath) => {
  const extname = path.extname(file.name)
  const fileName = `${Date.now()}${extname}`

  const fileReader = fs.createReadStream(file.path)
  const writeStream = fs.createWriteStream(path.join(uploadPath, fileName))

  fileReader.pipe(writeStream)
  return `${uploadPath}/${fileName}`
}