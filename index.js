'use strict';

require('dotenv').config(); // Librería para controlar las variables de entorno. Lee el archivo env
const webServer = require('./webserver'); //ESto tiene la carga de la librería express. Lo metió en un módulo para poder cambiarla cuando quiera
const httpServerConfig = require('./config/http-server-config'); //El puerto de conexion es una variable por eso se crea este módulo
// const mysqlPool = require('./app/domain/builders/mysql-pool-builder');
const mongoPool = require('./databases/mongo-pool'); // Es pool ya que crear varias conexiones a la vez.

/**
 * Initialize dependencies 
 * */
// Esto lo hace por si las bases de datos no están activas. Así no hace falta que node está activo.
(async function initApp() {
  try {
    // await mysqlPool.connect();
    await mongoPool.connect();
    await webServer.listen(httpServerConfig.port);
    console.log(`server running at: ${httpServerConfig.port}`);
  } catch (e) {
    await webServer.close();
    console.error(e);
    process.exit(1);
  }
}()); // estos paréntesis son para llamar a la función recursivamente
