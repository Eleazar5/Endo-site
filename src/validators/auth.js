const jwt = require('jsonwebtoken');
const { 
    SECRETKEY
} = process.env;

exports.isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next();
    }else{
        return res.send("User is not authorised!");
    }
}

exports.authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
  
    if (!authToken) {
      return res.status(403).send({ error: 'Unauthorized' });
    }
  
    jwt.verify(authToken, SECRETKEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).send({ error: 'Token expired' });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(401).send({ error: 'Invalid token' });
        } else {
          return res.status(500).send({ error: 'Internal Server Error' });
        }
      } else {
        req.user = decoded;
        next();
      }
    });
};
  