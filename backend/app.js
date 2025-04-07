const express = require('express')
const cors = require('cors');
const { db } = require('./db/db');
const {readdirSync} = require('fs')
const app = express()
const authRoutes = require('./routes/auth')
const bodyParser = require('body-parser');
const suggestionsRoute = require("./routes/suggestions");
const emailRoutes = require("./routes/emailRoutes");
require('dotenv').config()

const PORT = process.env.PORT

//middlewares
app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/v1", suggestionsRoute);
app.use("/api", emailRoutes);
//routes
readdirSync('./routes').map((route) => app.use('/api/v1', require('./routes/' + route)))

const server = () => {
    db()
    app.listen(PORT, () => {
        console.log('listening to port:', PORT)
    })
}

server()