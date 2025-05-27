const express = require("express");
const router = express.Router();
const Accounts = require("../models/Accounts");

// Create
router.post("/", async (req, res) => {
  try {
    const account = new Accounts(req.body);
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  try {
    const accounts = await Accounts.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
router.get("/:id", async (req, res) => {
  try {
    const account = await Accounts.findById(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const account = await Accounts.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const account = await Accounts.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
