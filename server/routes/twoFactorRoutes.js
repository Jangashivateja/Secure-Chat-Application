const {
  generate2FA,
  enable2FA,
  verify2FALogin,
  disable2FA,
} = require("../controllers/twoFactorController");
const router = require("express").Router();

router.post("/generate/:id", generate2FA);
router.post("/enable/:id", enable2FA);
router.post("/verify-login", verify2FALogin);
router.post("/disable/:id", disable2FA);

module.exports = router;