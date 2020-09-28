const mysql = require('mysql2')

const pool = mysql.createPool({
  user: 'root',
  password: 'mysql@123',
  database: 'raspi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, rows, fields) => {
      if (err) {
        console.log('数据库操作失败！')
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
  
module.exports = { query }
