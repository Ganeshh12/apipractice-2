const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBandServer()

app.get('/todos/', async (req, res) => {
  const {status = '', priority = '', search_q = ''} = req.query
  let query = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE '%${search_q}%';`
  const DBResponse1 = await db.all(query)
  res.send(DBResponse1)
  console.log(status)
})

app.get('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  let query = `SELECT * FROM todo WHERE id=${todoId}`
  const dbres = await db.get(query)
  res.send(dbres)
})

app.post('/todos/', async (req, res) => {
  const {id, todo, priority, status} = req.body
  let query = `INSERT INTO todo(id,todo,priority,status) VALUES(${id},'${todo}','${priority}','${status}')`
  await db.run(query)
  res.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  let prevTodo = await db.get(`SELECT * FROM todo WHERE id=${todoId};`)
  const {
    todo = prevTodo.todo,
    priority = prevTodo.priority,
    status = prevTodo.status,
  } = req.body
  const reqBODY = req.body
  switch (true) {
    case reqBODY.todo !== undefined:
      updatedColumn = 'Todo'
      break
    case reqBODY.status !== undefined:
      updatedColumn = 'Status'
      break
    case reqBODY.priority !== undefined:
      updatedColumn = 'Priority'
  }
  let query = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}' WHERE id=${todoId};`
  await db.run(query)
  res.send(`${updatedColumn} Updated`)
})

app.delete('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  let query = `DELETE FROM todo WHERE id=${todoId}`
  await db.run(query)
  res.send('Todo Deleted')
})

module.exports = app
