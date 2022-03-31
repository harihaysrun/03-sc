const checkIfAuthenticated = function(req,res,next){
    if(req.session.user){
        next(); // go to the middleware. if no more middleware then go to the route function
    } else{
        // no user has logged in
        req.flash('error_messages', 'Log in is required to view page');
        res.redirect('/login')
    }
}

const checkIfAuthenticatedAdmin = function(req,res,next){
    if(req.session.user && req.session.user.role === 1){
        next(); // go to the middleware. if no more middleware then go to the route function
    } else{
        // no user has logged in
        req.flash('error_messages', 'You are not allowed to view this page');
        res.redirect('/dashboard')
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
                res.json({
                    'message': 'Forbidden'
                })
                // res.send("401").json({
                //     'message': 'Forbidden'
                // })
            } else{
                req.user = user;
                next();
            }
        })
    } else{
        res.status(401).json("Forbidden");
    }
}

module.exports = { checkIfAuthenticated, checkIfAuthenticatedAdmin, checkIfAuthenticatedWithJWT }