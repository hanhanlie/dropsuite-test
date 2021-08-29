const http = require("http")
const fs = require("fs")

const PORT = 5000

const server = http.createServer(async (req, res) => {
  if (req.url.includes("/count") && req.method === "GET") {
    const url = new URL(req.url, `http://${req.headers.host}/`)
    const query = new URLSearchParams(url.search)
    const path = query.get("path")
    const filesPath = []
    let temporaryPath = "./"
    await path.split("/").forEach(async (directory) => {
      temporaryPath += directory + "/"
      const dirSync = fs.readdirSync(temporaryPath)
      dirSync.forEach((foundDir) => {
        if (foundDir.includes(".txt")) {
          const fileSync = fs.readFileSync(
            `${temporaryPath}${foundDir}`,
            "utf8"
          )
          filesPath.push({
            content: fileSync,
            path: `${temporaryPath}${foundDir}`,
          })
        }
      })
    })
    const results = {}
    const uniqueFileNames = filesPath.filter(
      (v, i, self) => self.findIndex((t) => t.content === v.content) === i
    )
    uniqueFileNames.forEach((uniqueFileName) => {
      results[uniqueFileName.content] = 0
      filesPath.forEach((filePath) => {
        if (filePath.content === uniqueFileName.content)
          results[uniqueFileName.content]++
      })
    })

    const highestCountIndex = Object.values(results).indexOf(
      Math.max(...Object.values(results))
    )

    const result = Object.entries(results)[highestCountIndex]
    console.log(`${result[0]} ${result[1]}`)

    res.writeHead(200, { "Content-Type": "application/json" })
    res.write(`${result[0]} ${result[1]}`)
    res.end()
  } else {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Route not found" }))
  }
})

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`)
})
