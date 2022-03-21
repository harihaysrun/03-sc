const checkIfAuthenticated = function(req,res,next){
    if(req.session.user){
        next(); // go to the middleware. if no more middleware then go to the route function
    } else{
        // no user has logged in
        req.flash('error_messages', 'Log in is required to view page');
        res.redirect('/users/login')
    }
}

// for API
const jwt = require('jsonwebtoken');
const checkIfAuthenticatedWithJWT = function(req,res,next){
    
    const authHeader = req.headers.authorization;
    if (authHeader){
        const token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.TOKEN_SECRET, function(err, user){
            if(err){
                res.send("401").json({
                    'message': 'Forbidden'
                })
            } else{
                req.user = user;
                next();
            }
        })
    } else{
        res.status(401).json("Forbidden");
    }
}

module.exports = { checkIfAuthenticated, checkIfAuthenticatedWithJWT }