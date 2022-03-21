const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { User, BlackListedToken } = require('../../models')
const { checkIfAuthenticatedWithJWT } = require('../../middlewares');

const generateToken = function(user, secret, expiresIn){
    const token = jwt.sign({
        'username': user.username,
        'id': user.id,
        'email': user.email
    }, secret,{
        'expiresIn': expiresIn
    });
    return token;
}

function getHashedPassword(password){
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.post('/login', async function(req,res){
    let username = req.body.username;
    let password = req.body.password;

    let user = await User.where({
        'username': username
    }).fetch({
        'require': false
    })

    if (user && user.get('password') == getHashedPassword(password)){
        let accessToken = generateToken(user.toJSON(), process.env.TOKEN_SECRET, "15min");
        let refreshToken = generateToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, "1h");
        res.json({
            'accessToken': accessToken,
            'refreshToken': refreshToken
        })
    } else {
        res.sendStatus = 401;
        res.send({
            'error': 'Wrong username or password'
        })
    }
})


router.get('/profile', checkIfAuthenticatedWithJWT, function(req,res){
    res.json({
        'username':req.user.username,
        'email':req.user.email
    })
})

router.post('/refresh', async function(req,res){
    let refreshToken = req.body.refreshToken;

    if(!refreshToken){
        res.sendStatus(401);
        return;
    }

    let result = await BlackListedToken.where({
        'token': refreshToken,
    }).fetch({
        require: false
    })

    if(result){
        res.status(401);
        res.json({
            'message': 'The refresh token has already expired or logged out'
        });
        return;
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function(err,user){
        if (err){
            res.sendStatus(403);
        } else{
            let accessToken = generateToken(user, process.env.TOKEN_SECRET, "15min");
            res.json({
                'accessToken': accessToken
            })
        }
    });
})

router.post('/logout', async function(req,res){
    let refreshToken = req.body.refreshToken;

    if (!refreshToken){
        res.sendStatus(401);
    } else{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async function(err,user){
            if (err){
                res.sendStatus(403);
                return;
            } else {
                const token = new BlackListedToken();
                token.set('token', refreshToken);
                token.set('date_created', new Date());
                await token.save();
                res.json({
                    'message': 'You have been logged out'
                })
            }
        })
    }
})

module.exports = router;