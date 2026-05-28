const fs = require('fs');
const http = require('http');
const path = require('path');

const root = __dirname;
const host = '127.0.0.1';
const port = Number(process.env.PORT) || 5177;

const mimeTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.ttf': 'font/ttf',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2'
};

function send(response, statusCode, body, contentType = 'text/plain; charset=utf-8') {
	response.writeHead(statusCode, { 'Content-Type': contentType });
	response.end(body);
}

function sendTemplateList(response) {
	fs.readdir(path.join(root, 'templates'), (error, files) => {
		if (error) {
			send(response, 404, 'Template directory not found');
			return;
		}

		const links = files
			.filter(file => {
				const filePath = path.join(root, 'templates', file);
				return fs.statSync(filePath).isDirectory() || /\.(html|js)$/i.test(file);
			})
			.sort((a, b) => a.localeCompare(b))
			.map(file => {
				const filePath = path.join(root, 'templates', file);
				const href = fs.statSync(filePath).isDirectory() ? `${file}/` : file;
				return `<a href="${href}">${href}</a>`;
			})
			.join('\n');

		send(response, 200, `<!doctype html><html><body>${links}</body></html>`, 'text/html; charset=utf-8');
	});
}

function resolveRequestPath(requestUrl) {
	const url = decodeURIComponent(requestUrl.split('?')[0]);
	let relativePath = url === '/' ? '/index.html' : url;
	if (relativePath.endsWith('/')) relativePath += 'index.html';
	const filePath = path.normalize(path.join(root, relativePath));
	return filePath.startsWith(root) ? filePath : null;
}

http.createServer((request, response) => {
	const cleanUrl = request.url.split('?')[0];

	if (request.method === 'POST' && cleanUrl === '/save-thumb') {
		const chunks = [];
		request.on('data', chunk => chunks.push(chunk));
		request.on('end', () => {
			try {
				const body = Buffer.concat(chunks).toString('utf8');
				const { id, dataUrl } = JSON.parse(body);
				if (!id || !dataUrl) throw new Error('Missing id or dataUrl');
				if (!/^[a-z][a-z0-9]{1,10}$/.test(id)) throw new Error('Invalid id: ' + id);
				const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
				const filePath = path.resolve(root, 'templates', id, 'screenshot.png');
				const rel = path.relative(root, filePath);
				if (rel.startsWith('..')) throw new Error('Forbidden path');
				fs.writeFile(filePath, Buffer.from(base64, 'base64'), err => {
					if (err) {
						console.error('[save-thumb] write error:', err.message);
						send(response, 500, JSON.stringify({ ok: false, error: err.message }), 'application/json; charset=utf-8');
					} else {
						console.log('[save-thumb] saved:', filePath);
						send(response, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8');
					}
				});
			} catch (e) {
				console.error('[save-thumb] error:', e.message);
				send(response, 400, JSON.stringify({ ok: false, error: e.message }), 'application/json; charset=utf-8');
			}
		});
		return;
	}

	if (cleanUrl === '/templates/' || cleanUrl === '/templates') {
		sendTemplateList(response);
		return;
	}

	const filePath = resolveRequestPath(request.url);
	if (!filePath) {
		send(response, 403, 'Forbidden');
		return;
	}

	fs.readFile(filePath, (error, body) => {
		if (error) {
			send(response, 404, 'Not found');
			return;
		}

		send(response, 200, body, mimeTypes[path.extname(filePath)] || 'application/octet-stream');
	});
}).listen(port, host, () => {
	console.log(`GridBuilder running at http://${host}:${port}/`);
});
