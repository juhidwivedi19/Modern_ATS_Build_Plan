const { Client } = require("pg");

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

client.connect()
    .then(() => {
        console.log("✅ PostgreSQL Connected Successfully");
    })
    .catch((err) => {
        console.log("❌ PostgreSQL Connection Failed");
        console.error(err.message);
    });

module.exports = client;