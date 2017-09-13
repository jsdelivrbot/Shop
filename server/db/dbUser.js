const User = require('../dbSchemas/user');
const Purchase = require('../dbSchemas/purchase');
const bcrypt = require('bcrypt')

exports.editPassword = (req, res) => {
    bcrypt.compare(req.body.oldPassword, req.user.password
    ).then(res => {
        if (!res) throw new Error('Wrong password')
        if (res) return bcrypt.hash(req.body.newPassword, 10)
    }).then(hash =>
        User.findByIdAndUpdate(
            req.user._id, {
                $set: { password: hash }
            }, { new: true })
    ).then(user => req.login(user, err => {
        if (err) throw new Error("Can't logged user")
        if (!err) res.send(user)
    })).catch(err => res.send(err.message))
}

exports.saveProfile = (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                bankCart: +req.body.bankCart
            }
        }, { new: true },
        (err, newuser) => {
            if (err) return res.send(err);
            req.login(newuser, err => {
                if (!err) res.send(newuser._id);
            });
        }
    );
}

exports.findCurrentUser = (req, res) => {
    User.findById(req.user._id, (err, user) => {
        return res.send(user);
    })
}

exports.register = (req, res) => {
    var newuser;
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        newuser = new User({
            name: 'new User',
            phone: '',
            email: req.body.email,
            password: hash
        });

        return User.create(newuser)
    }).then(user => {
        newuser = user;
        let cart = { userId: user._id, status: 'shoppingCart', date: Date.now() }
        return Purchase.create(cart);
    }).then(cart => {
        if (cart) {
            req.login(newuser, err => {
                if (!err) res.send(newuser)
            })
        }
    }).catch(err => res.json({ error: err.message }));

}