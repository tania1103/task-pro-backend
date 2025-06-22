/**
 * @file cardRoutes.js
 * @description Routes for card CRUD operations within a column
 */

const express = require("express");
const {
  createCard,
  getCardsByColumnId,
  getCardById,
  updateCard,
  deleteCard,
  updateCardsOrder,
  moveCardToColumn,
} = require("../controllers/cardController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validateCardCreate,
  validateCardUpdate,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All card routes require authentication
router.use(protect);

/**
 * @route POST /api/cards
 * @desc Create a new card in a column
 * @access Private
 */
// router.post("/", validateCardCreate, createCard);

/**
 * @route GET /api/cards/column/:columnId
 * @desc Get all cards for a specific column
 * @access Private
 */
// router.get("/column/:columnId", getCardsByColumnId);

/**
 * @route GET /api/cards/:id
 * @desc Get a card by ID
 * @access Private
 */
// router.get("/:id", getCardById);

/**
 * @route PUT /api/cards/:id
 * @desc Update a card
 * @access Private
 */
// router.put("/:id", validateCardUpdate, updateCard);

/**
 * @route DELETE /api/cards/:id
 * @desc Delete a card
 * @access Private
 */
// router.delete("/:id", deleteCard);

/**
 * @route PATCH /api/cards/reorder
 * @desc Update the order of cards in a column
 * @access Private
 */
// router.patch("/reorder", updateCardsOrder);

/**
 * @route PATCH /api/cards/:id/move
 * @desc Move a card to another column
 * @access Private
 */
// router.patch("/:id/move", moveCardToColumn);

module.exports = router;
