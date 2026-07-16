'use strict';

/**
 * CFC HTTPS 代理：GitHub Pages → CFC → 百度云 BCC HTTP API
 * Runtime: nodejs12（勿用 ?. / ??）
 */

var http = require('http');
var https = require('https');
var url = require('url');

var UPSTREAM_BASE = (process.env.UPSTREAM_BASE || 'http://180.76.180.105').replace(/\/$/, '');
var DEFAULT_CORS = [
  'https://ai.yuchuntest.com',
  'https://caoyuchun2003.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function corsOrigins() {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(',').map(function (s) {
      return s.trim();
    }).filter(Boolean);
  }
  return DEFAULT_CORS;
}

function corsHeaders(origin) {
  var allowed = corsOrigins();
  var ok = origin && allowed.indexOf(origin) !== -1 ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': ok,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function getHeader(headers, name) {
  if (!headers) return '';
  var lower = name.toLowerCase();
  for (var k in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, k) && k.toLowerCase() === lower) {
      return headers[k];
    }
  }
  return '';
}

function getPath(event) {
  var raw = event.path || '';
  if (!raw && event.requestContext && event.requestContext.http) {
    raw = event.requestContext.http.path || '';
  }
  if (!raw && event.requestContext) {
    raw = event.requestContext.path || '';
  }
  if (raw.indexOf('/ai/api') !== -1) {
    return raw.slice(raw.indexOf('/ai/api'));
  }
  if (event.pathParameters && event.pathParameters.proxy) {
    return '/ai/api/' + event.pathParameters.proxy;
  }
  return raw || '/ai/api/health';
}

function getMethod(event) {
  var m =
    event.httpMethod ||
    (event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
    event.method ||
    'GET';
  return String(m).toUpperCase();
}

function getQuery(event) {
  var q = event.queryStringParameters || event.queryString || {};
  var parts = [];
  Object.keys(q).forEach(function (k) {
    if (q[k] != null) {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(q[k]));
    }
  });
  return parts.length ? '?' + parts.join('&') : '';
}

function getBody(event) {
  if (event.body == null || event.body === '') return null;
  if (event.isBase64Encoded) {
    return Buffer.from(event.body, 'base64');
  }
  return typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
}

function proxyRequest(method, pathWithQuery, body, headers) {
  var target = url.parse(UPSTREAM_BASE + pathWithQuery);
  var lib = target.protocol === 'https:' ? https : http;
  var opts = {
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    path: target.path,
    method: method,
    headers: {
      Accept: getHeader(headers, 'accept') || 'application/json',
      'Content-Type': getHeader(headers, 'content-type') || 'application/json',
      'User-Agent': 'ai-learn-cfc-proxy/1.0',
      Host: target.host,
    },
    timeout: 25000,
  };
  if (body != null) {
    var buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
    opts.headers['Content-Length'] = buf.length;
  }

  return new Promise(function (resolve, reject) {
    var req = lib.request(opts, function (res) {
      var chunks = [];
      res.on('data', function (c) {
        chunks.push(c);
      });
      res.on('end', function () {
        resolve({
          statusCode: res.statusCode || 502,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', function () {
      req.destroy();
      reject(new Error('upstream timeout'));
    });
    if (body != null) {
      req.write(Buffer.isBuffer(body) ? body : String(body));
    }
    req.end();
  });
}

exports.handler = function (event, context) {
  event = event || {};
  var origin = getHeader(event.headers, 'origin');
  var cors = corsHeaders(origin);
  var method = getMethod(event);

  if (method === 'OPTIONS') {
    return Promise.resolve({
      statusCode: 204,
      headers: cors,
      body: '',
    });
  }

  var pathOnly = getPath(event).split('?')[0];
  if (pathOnly === '/' || pathOnly === '') {
    return Promise.resolve({
      statusCode: 200,
      headers: Object.assign({}, cors, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ok: true,
        service: 'ai-learn-cfc-proxy',
        upstream: UPSTREAM_BASE,
        hint: 'Use /ai/api/health',
      }),
    });
  }

  var path = getPath(event);
  var query = getQuery(event);
  var pathWithQuery = path.indexOf('?') !== -1 ? path : path + query;
  if (pathWithQuery.indexOf('/ai/api') !== 0) {
    pathWithQuery = '/ai/api' + pathWithQuery;
  }
  var body = method === 'GET' || method === 'HEAD' ? null : getBody(event);

  return proxyRequest(method, pathWithQuery, body, event.headers || {})
    .then(function (upstream) {
      var contentType =
        getHeader(upstream.headers, 'content-type') || 'application/json';
      return {
        statusCode: upstream.statusCode,
        headers: Object.assign({}, cors, { 'Content-Type': contentType }),
        body: upstream.body,
      };
    })
    .catch(function (err) {
      console.error('proxy error', err);
      return {
        statusCode: 502,
        headers: Object.assign({}, cors, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          error: 'Bad Gateway',
          message: String(err && err.message ? err.message : err),
          upstream: UPSTREAM_BASE,
        }),
      };
    });
};
