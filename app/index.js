"use strict";

const log4js = require('log4js');
const log_appenders = process.env.LOG_FILE ? ['file'] : ['console'];
log4js.configure({
	appenders: {
		console: { type: 'console' },
		file: { type: 'file', filename: process.env.LOG_FILE }
	},
	categories: {
		default: { appenders: log_appenders, level: process.env.LOG_LEVEL || 'INFO' },
		server: { appenders: log_appenders, level: process.env.LOG_LEVEL || 'INFO' },
		db: { appenders: log_appenders, level: process.env.LOG_LEVEL || 'INFO' }
	}
});
global.log = log4js.getLogger();

const mariadb = require('mariadb');
const dbLog = log4js.getLogger('db');
global.db = mariadb.createPool({
	socketPath: '/var/run/mysqld/mysqld.sock',
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: 'arcscrape',
	queryTimeout: 10000,
	connectionLimit: 1,
	logger: {
		network: (msg) => dbLog.trace(msg),
		query:   (msg) => dbLog.debug(msg),
		warning: (msg) => dbLog.warn(msg),
		error:   (msg) => dbLog.error(msg)
	},
	sessionVariables: {
		// keep connection alive for 2 weeks
		wait_timeout: 1209600,
		interactive_timeout: 1209600,
		query_cache_type: 0 // rely on webserver caching instead of query cache
	},
	// initSql: []
});


const nyaasi = require('./nyaasi');
const svLog = log4js.getLogger('server');

let server = require('http').createServer((req, resp) => {
	let m;
	
	svLog.debug('HTTP request: ' + req.url);
	req.time = Date.now();
	
	// routing
	if(m = req.url.match(/^\/nyaasi(-sukebei)?\/view\/(?:\?id=)?(\d+)(\?|$)/)) {
		nyaasi.view(m, req, resp);
	} else if(m = req.url.match(/^\/nyaasi(-sukebei)?\/(\?|$)/)) {
		nyaasi._index(m, req, resp);
	} else {
		resp.setHeader('Content-Type', 'text/plain; charset=iso-8859-1');
		resp.setHeader('Cache-Control', 'public');
		resp.writeHead(404);
		resp.end('Not found');
	}
});


const util = require('util');
const shutdown = async () => {
	// TODO: add timeout to server close
	if(server) await util.promisify(server.close.bind(server))();
	server = null;
	if(db) await db.end();
	global.db = null;
};

process.on('SIGTERM', async () => {
	setTimeout(() => process.exit(2), 5000).unref();
	svLog.info('SIGTERM received, exiting');
	await shutdown();
	process.exit(0);
});
let shutdownRequested = false;
process.on('SIGINT', async () => {
	if(shutdownRequested) {
		svLog.warn('SIGINT received twice, force exiting');
		process.exit(2);
	} else {
		shutdownRequested = true;
		svLog.info('SIGINT received, exiting');
		await shutdown();
		process.exit(0);
	}
});
process.on('exit', () => {
	svLog.info('Process terminated');
});
process.on('uncaughtException', async (err) => {
	svLog.fatal('Unhandled exception: ', err);
	setTimeout(() => process.exit(2), 5000).unref();
	await shutdown();
	process.exit(1);
});


if(process.env.LISTEN_SOCK) {
	try {
		require('fs').unlinkSync(process.env.LISTEN_SOCK);
	} catch(x){}
	server.listen(process.env.LISTEN_SOCK);
} else {
	server.listen(process.env.LISTEN_PORT);
}
svLog.info('Server started listening');
