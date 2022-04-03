const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { User, BlackListedToken } = require('../../models')
const { checkIfAuthenticatedWithJWT } = require('../../middlewares');

const generateToken = function(user, secret, expiresIn){
    const token = jwt.sign({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'address_line_1': user.address_line_1,
        'address_line_2': user.address_line_2,
        'country': user.country,
        'postal_code': user.postal_code,
        'phone_number': user.phone_number
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

router.post('/register', async function(req,res) {
    const user = new User({
        'username': req.body.username,
        'email': req.body.email,
        'first_name': req.body.first_name,
        'last_name': req.body.last_name,
        'address_line_1': req.body.address_line_1,
        'address_line_2': req.body.address_line_2,
        'country': req.body.country,
        'postal_code': req.body.postal_code,
        'phone_number': req.body.phone_number,
        'password': getHashedPassword(req.body.password),
    });
    await user.save();

    res.json(user);
})

router.post('/login', async function(req,res){
    let username = req.body.username;
    let password = req.body.password;

    let user = await User.where({
        'username': username
    }).fetch({
        'require': false
    })

    if (user && user.get('password') == getHashedPassword(password)){
        let accessToken = generateToken(user.toJSON(), process.env.TOKEN_SECRET, "2min");
        let refreshToken = generateToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, "5min");
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
        'user': req.user
    })
})


// router.post('/profile', function(req,res){
    

//     let userId = req.user.id;
//     const cartServices = new CartServices(userId);
//     const allCartItems = await cartServices.getAllCartItems();
//     // res.json({
//     //     'cart': allCartItems
//     // })
// })

// router.get('/profile', async function(req, res) {
//     if (req.session.user) {
//         const user = await User.where({
//             'id': req.session.user.id
//         }).fetch({
//             require: true
//         })
//         res.render('users/profile',{
//             'user': user.toJSON()
//         })
//     } else {
//         req.flash('error_messages', 'Please log in to view this page');
//         res.redirect('/login');
//     }

// })

router.post('/profile/edit', async function(req,res){

    let user = await User.where({
        'id': req.body.user_id
    }).fetch({
        'require': true
    })

    user.set('username', req.body.username);
    user.set('email', req.body.email);
    user.set('first_name', req.body.first_name);
    user.set('last_name', req.body.last_name);
    await user.save();

    res.json(user)
})

router.post('/profile/password/edit', async function(req,res){

    let user = await User.where({
        'id': req.body.user_id
    }).fetch({
        'require': true
    })

    user.set('password', getHashedPassword(req.body.password));
    await user.save();

    res.json(user)
})

router.post('/profile/address/edit', async function(req,res){

    let user = await User.where({
        'id': req.body.user_id
    }).fetch({
        'require': true
    })

    user.set('address_line_1', req.body.address_line_1);
    user.set('address_line_2', req.body.address_line_2);
    user.set('country', req.body.country);
    user.set('postal_code', req.body.postal_code);
    user.set('phone_number', req.body.phone_number);
    await user.save();

    res.json(user)
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