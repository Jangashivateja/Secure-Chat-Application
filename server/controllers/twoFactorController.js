const User = require("../models/userModel");
const { generateSecret, verify, generateURI} = require("otplib");
const qrcode = require("qrcode");

module.exports.generate2FA = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.json({ status: false, msg: "User not found" });

    const secret = generateSecret();
   
    const otpauthUrl =generateURI({
      issuer: "ArkChat",
      label: user.username,
      secret
    })
    const qrCode = await qrcode.toDataURL(otpauthUrl);

    res.json({ status: true, secret, qrCode });
  } catch (ex) {
    next(ex);
  }
};

module.exports.enable2FA = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token, secret } = req.body;

    const result = await verify({token, secret});
    if(result.valid){
      await User.findByIdAndUpdate(id, {
         is2FAEnabled: true,
         twoFactorSecret: secret,
      });
    
      return res.json({ status: true, msg: "2FA Enabled Successfully" });
    } else {
      return res.json({ status: false, msg: "Invalid Verification Code" });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.verify2FALogin = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);

    if (!user || !user.is2FAEnabled || !user.twoFactorSecret) {
      return res.json({ status: false, msg: "Invalid 2FA state" });
    }

    const result = await verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (result.valid) {
      const userObj = user.toObject();
      delete userObj.password;
      delete userObj.twoFactorSecret; // Never leak secret to client

      return res.json({ status: true, user: userObj });
    } else {
      return res.json({ status: false, msg: "Invalid Verification Code" });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.disable2FA = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    const user = await User.findById(id);
    if(!user || !user.is2FAEnabled || !user.twoFactorSecret){
      return res.json({ status: false, msg: "2FA is not currently enabled"});
    }

    const result = await verify({
      token,
      secret: user.twoFactorSecret
    });

    if(result.valid){
      await User.findByIdAndUpdate(id, {
        is2FAEnabled: false,
        twoFactorSecret: null,
      });
      return res.json({status: true, msg: "2FA Disabled Successfully"});
    }
    else{
      return res.json({ status: false, ms: "Invalid Verification Code"});
    }
  } catch (ex) {
    next(ex);
  }
};