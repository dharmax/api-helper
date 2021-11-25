'use strict';

const Hapi = require('@hapi/hapi');
import { mainRoutes } from "./routes";
const init = async () => {

    const server = Hapi.server({
        port: 3001,
        host: 'localhost'
    });
    server.route(mainRoutes);

    await server.start();
    console.log('Server ff running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();