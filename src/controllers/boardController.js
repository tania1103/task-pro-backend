const fs = require("fs");
const asyncHandler = require("express-async-handler");
const cloudinaryService = require("../services/cloudinaryService");
const Board = require("../models/Board");
const Column = require("../models/Column");
const Card = require("../models/Card");

// ✅ GET ALL BOARDS
const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ owner: req.user._id });
  res.json({ boards });
});

// ✅ GET ONE BOARD CU COLUMNE ȘI CARDURI
const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: "Board not found" });

  if (board.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to access this board" });
  }

  const columns = await Column.find({ board: board._id }).sort({ order: 1 });
  const columnIds = columns.map((col) => col._id);
  const cards = await Card.find({ column: { $in: columnIds } }).sort({
    order: 1,
  });

  const columnMap = {};
  columns.forEach((col) => {
    columnMap[col._id] = { ...col.toObject(), cards: [] };
  });

  cards.forEach((card) => {
    if (columnMap[card.column]) {
      columnMap[card.column].cards.push(card);
    }
  });

  res.json({ ...board.toObject(), columns: Object.values(columnMap) });
});

// ✅ CREATE BOARD
const createBoard = asyncHandler(async (req, res) => {
  const { title, icon, background } = req.body;

  const board = await Board.create({
    title,
    icon: icon || "📋",
    background: background || "bg-1",
    owner: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: board,
  });
});

// ✅ PATCH /api/boards/:id/background – imagine custom (Cloudinary)
const uploadBoardBackground = asyncHandler(async (req, res) => {
  const boardId = req.params.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  const board = await Board.findById(boardId);
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const result = await cloudinaryService.uploadImage(file.path, {
      folder: "task_pro/boards",
      transformation: [{ width: 1200, height: 400, crop: "fill" }],
    });

    board.background = result.secure_url;
    await board.save();

    // 🧹 Șterge fișierul local după upload
    fs.unlink(file.path, (err) => {
      if (err) console.warn("⚠️ Failed to delete local file:", err.message);
    });

    res.status(200).json({
      status: "success",
      data: board,
    });
  } catch (error) {
    console.error("❌ Cloudinary error:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

// ✅ UPDATE BOARD (icon, title, background string sau URL)
const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: "Board not found" });

  if (board.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { title, icon, background } = req.body;
  if (title !== undefined) board.title = title;
  if (icon !== undefined) board.icon = icon;
  if (background !== undefined) board.background = background;

  const updatedBoard = await board.save();
  res.json(updatedBoard);
});

// ✅ DELETE BOARD CU COLUMNE + CARDURI
const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: "Board not found" });

  if (board.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const columns = await Column.find({ board: board._id });
  const columnIds = columns.map((col) => col._id);

  await Card.deleteMany({ column: { $in: columnIds } });
  await Column.deleteMany({ board: board._id });
  await Board.findByIdAndDelete(board._id);

  res.json({ message: "Board removed" });
});

module.exports = {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  uploadBoardBackground, // 🔥 folosește doar asta, renunță la `uploadCustomBackground`
  deleteBoard,
};
