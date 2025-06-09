const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')



const JWT_SECRET = 'huzaifaisagoodb$oy';

// ROUTE:1 Create a User using: POST "/api/auth/createuser". Does not require login
router.post('/createuser', [], async (req, res) => {
  let success = false;
  console.log('🔍 Incoming user data:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, error: "User already exists" });
    }

    // Continue...


        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        await user.save();

        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);

        // ✅ Only one response sent
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
            authToken
        });

    } catch (error) {
  console.error("❌ Error saving user:", error.message, error.stack);
  res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
}

});









// ROUTE:2 Authenticate a User using: POST "/api/auth/login". Does not require login
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password connot be blank').exists()


], async (req, res) => {

    let success = false;

    const errors = validationResult(req);


    // if there are errors , return bad request and the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).json({ error: "Please try to login with correct credentionals" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentionals" })


        }

        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken })

    } catch (error) {
        console.error("❌ Error saving user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }


})










// ROUTE:3 GET a loggedIn Userdeatils using: POST "/api/auth/getuser". Does not require login
router.post('/getuser', fetchuser , async (req, res) => {
    


    try {
        let userId = req.user.id;
        let user = await User.findById(userId).select("-password")
        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

});
module.exports = router;
