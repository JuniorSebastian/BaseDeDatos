const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',  // Cambia esto según tu configuración
    database: 'bd_bidones'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        // Cierra la conexión en caso de error
        db.end();
    } else {
        console.log('Conexión a MySQL establecida con éxito.');
    }
});

module.exports = db;