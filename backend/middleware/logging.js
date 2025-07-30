// Request logging middleware
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  console.log(`User-Agent: ${userAgent}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const logBody = { ...req.body };
    // Hide sensitive fields
    if (logBody.token) logBody.token = '[HIDDEN]';
    if (logBody.password) logBody.password = '[HIDDEN]';
    console.log('Request Body:', JSON.stringify(logBody, null, 2));
  }
  
  console.log('---');
  next();
};