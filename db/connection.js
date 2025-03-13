const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mankaUqiti',  // Cambia esto según tu configuración
    database: 'bd_bidones'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});

module.exports = db;
