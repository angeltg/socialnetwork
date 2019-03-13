'use strict';

const mysql = require('mysql2/promise');

// create the connection to database
let connection = null;
(async () => {
    connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'socialnetwork',
        password: 'pasword',
    });
})();

function recodVerifiedDate(code) {
    const now = new Date(); // cogemos la fecha del sistema
    const createDate = now.toISOString().substring(0, 19).replace('T', ' '); // Pasamos la fecha al formato del MySql. Lo pasamos a string, Cogemos los 19 primeros caracteres y quitamos la T que divide el día de la hora.

    connection.query('UPDATE users_activation SET verified_at="' + createDate + '" where verification_code="' + code + '"',
        function (err, result) {
            if (err) throw err;
            console.log('Se ha actualizado ' + result.affectedRows + ' record(s)');

        });
}
function validationUserCode(req, res, next) {
    const code = req.params.verificationCode;
    connection.query('SELECT * FROM users_activation where verification_code ="' + code + '"',
        function (err, rows, fiedls) {
            if (err) throw err;

            if (rows[0].verified_at == null) {

                recodVerifiedDate(code);
            } else {
                console.log("Este usuario ya está activado");
            }


        });

}


module.exports = validationUserCode;