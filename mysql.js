const mysql = require("mysql2/promise")

let connection
mysql.createConnection({
  user: "root",
  password: "mysql@123",
  database: "mysql",
})
  .then(conn => {
    console.log('mysql connect success')
    connection = conn
  })
  .catch(err => console.log('数据库连接失败！！！'))
  
  module.exports = connection
