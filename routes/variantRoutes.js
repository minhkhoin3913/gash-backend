const express = require("express");
const router = express.Router();
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createVariant,
  getVariants,
  getVariantById,
  updateVariant,
  deleteVariant
} = require("../controllers/variantController");

router.post(
  "/",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  createVariant
);

router.get("/", getVariants);
router.get("/:id", getVariantById);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  updateVariant
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole(["admin", "manager"]),
  deleteVariant
);

module.exports = router;