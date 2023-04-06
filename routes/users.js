var express = require('express');
var router = express.Router();
const connection = require("../routes/db-config");
var nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
var randtoken = require('rand-token');
const loggedIn = require('../controllers/loggedIn');
const logout = require("../controllers/logout");
const login = require("../controllers/login");
const register = require("../controllers/register");



router.get("/register", (req, res)=>{
    res.sendFile("js/register.html", { root: "./public"});

})

router.get("/confirm-register", (req, res)=>{
    res.sendFile('js/confirm-register.html', {root: "./public"});
})

router.get("/confirm-changed-password", (req, res)=>{
    res.sendFile('js/confirm-changed-password.html', {root: "./public"});
})

router.get("/", loggedIn,(req,res)=>{
    if(req.user){
        res.render("index", {status: "loggedIn", user: req.user });
    }else{
        res.render("index", { status: "no", user: "nothing"})
    }
})

router.get("/the-app-red", (req, res)=>{
    res.sendFile('js/the-app-red.html', {root: "./public"});
})

router.get("/log-out", (req, res)=>{
    res.sendFile("js/log-out.html", { root: "./public"});

})

router.get("/logout", logout)

router.post("/", login)

router.post("/register", register)

//send email
function sendEmail(email, token) {
    var email = email;
    var token = token;
    var mail = nodemailer.createTransport({
        service: 'Hotmail',
        auth: {
            user: 'allwellresetpass@hotmail.com', 
            pass: 'AllWell10' 
        }
    });
    var mailOptions = {
        from: 'allwellresetpass@hotmail.com',
        to: email,
        subject: 'Reset Password Link',
        html: '<img src="https://all-well.it/wp-content/uploads/2022/05/All-Well-logo-light-optimized.png"><br><center>Hi! We received a request to reset your passowrd.<br>Please click on the link below to proceed<br> <a  style="text-decoration: none; border-radius: 20px; margin-left: 10px; margin-top: 10px; width: 100px; border-radius: 10px; background: #4EE0BC; color: black; height: 50px;" href="https://all-mmgn.onrender.com/reset-password?token='+ token +'"><b>Reset password link</b></a></center>'
    };
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(1)
        } else {
            console.log(0)
        }
    });
}


//send email
router.get('/sendEmail', function(req, res, next) {
    res.render('send-email', {
        title: 'send-email'
    });
});


/* send reset password link in email */
router.post('/reset-password-email', function(req, res, next) {
    var email = req.body.email;

    //console.log(sendEmail(email, fullUrl));
    connection.query('SELECT * FROM login WHERE email ="' + email + '"', function(err, result) {
        if (err) throw err;
        var type = ''
        var msg = ''
        console.log(result[0]);
        if (result.length > 0) {
            var token = randtoken.generate(20);
            var sent = sendEmail(email, token);
            if (sent != '0') {
                var data = {
                    token: token
                }
                connection.query('UPDATE login SET ? WHERE email ="' + email + '"', data, function(err, result) {
                    if(err) throw err
                })
                type = 'success';
                msg = 'The reset password link has been sent to your email address';
            } else {
                type = 'error';
                msg = 'Something goes to wrong. Please try again';
            }
        } else {
            console.log('2');
            type = 'error';
            msg = 'The Email is not registered with us';
        }
        req.flash(type, msg);
        res.redirect('/');
    });
})

/* reset page */
router.get('/reset-password', function(req, res, next) {
    res.render('reset-password', {
        title: 'Reset',
        token: req.query.token
    });
});

/* update password to database */
router.post('/update-password', function(req, res, next) {
    var token = req.body.token;
    var password = req.body.password;
    connection.query('SELECT * FROM login WHERE token ="' + token + '"', function(err, result) {
        if (err) throw err;
        var type
        var msg
        if (result.length > 0) {
            var saltRounds = 10;

            // var hash = bcrypt.hash(password, saltRounds);
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    var data = {
                        password: hash
                    }
                    connection.query('UPDATE login SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
                        if(err) throw err
                    });
                });
            });
            type = 'success';
            msg = 'Your password has been updated successfully';
        } else {
            console.log('2');
            type = 'success';
            msg = 'Invalid link; please try again';
        }
        req.flash(type, msg);
        res.redirect('/confirm-changed-password');
    });
})

module.exports = router;
