const Sales = require("../models/salesModel");
const Stock = require("../models/stockModel");
const User = require("../models/userModel");
const SalesItems = require("../models/salesitemsModel");
const Purchase = require("../models/purchaseModel");
const Staff = require("../models/staffModel");
const StockFlow = require("../models/stockFlowModel");
const Category = require("../models/categoryModel");
const MainCategory = require("../models/mainCategory");
const Supplier = require("../models/supplierModel");
const Returns = require("../models/returnVendorModel");
const Damages = require("../models/damageModel");
const { Op, Sequelize } = require("sequelize");
const Order = require("../models/orderModel");

const getSalesReport = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const email = req.query.email;
  const status = req.query.status;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  const offset = (page - 1) * limit;

  try {
    const whereClause = {};
    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (status) {
      whereClause.paymentStatus = status;
    }

    if (email) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found with the provided email" });
      }
    }

    const { count, rows: sales } = await Sales.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["fullName", "email"],
          where: email ? { email } : undefined,
        },
        {
          model: SalesItems,
          include: [
            {
              model: Stock,
              attributes: ["name"],
            },
          ],
        },
        { model: Order, attributes: ["orderNumber"] },
      ],
      order: [["createdAt", "DESC"]],

      limit,
      offset,
    });

    res.json({
      sales,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSaleDetails = async (req, res) => {
  const { saleId } = req.params;
  try {
    const sale = await Sales.findByPk(saleId, {
      include: [
        { model: User, attributes: ["fullName", "email"] },
        {
          model: SalesItems,
          include: [
            {
              model: Stock,
              attributes: ["name", "image"],
            },
          ],
        },
        { model: Order, attributes: ["orderNumber"] },
      ],
    });
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.status(200).json({ sale });
  } catch (error) {
    console.error("Error fetching sale details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const stocks = await StockFlow.findAll({
      include: [
        {
          model: Stock,
          attributes: ["name"],

          include: [
            {
              model: Category,
              attributes: ["name"],
              include: [
                {
                  model: MainCategory,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      group: ["stockId", "flowType"],
      attributes: [
        "stockId",
        "flowType",
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalQuantity"],
      ],
    });
    res.status(200).json({ stocks });
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
//sumarize shockFlow by stockId and flowType to get total inflow and outflow for each stock
const getInventorySummary = async (req, res) => {
  try {
    const inventorySummary = await StockFlow.findAll({
      attributes: [
        "stockId",

        // total IN
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN flowType = 'in' THEN quantity ELSE 0 END`,
            ),
          ),
          "totalIn",
        ],

        // total OUT
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN flowType = 'out' THEN quantity ELSE 0 END`,
            ),
          ),
          "totalOut",
        ],
      ],

      include: [
        {
          model: Stock,
          attributes: ["name"],
        },
      ],

      group: ["stockId", "Stock.id"],
    });

    res.status(200).json({ inventorySummary });
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
//get inventoryByDateAndStock
const getInventorySummaryByDateAndStock = async (req, res) => {
  // const { startDate, endDate, stockId } = req.query;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  const stockId = req.query.stockId;

  const whereClause = {};
  if (startDate && endDate) {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 999);
    whereClause.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }
  if (stockId) {
    whereClause.stockId = stockId;
  }

  try {
    const inventorySummary = await StockFlow.findAll({
      where: whereClause,
      attributes: [
        "stockId",

        // total IN
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN flowType = 'in' THEN quantity ELSE 0 END`,
            ),
          ),
          "totalIn",
        ],

        // total OUT
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN flowType = 'out' THEN quantity ELSE 0 END`,
            ),
          ),
          "totalOut",
        ],
      ],

      include: [
        {
          model: Stock,
          attributes: ["name"],
          include: [
            {
              model: Category,
              attributes: ["name"],
              include: [
                {
                  model: MainCategory,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],

      group: ["stockId", "Stock.id"],
    });

    res.status(200).json({ inventorySummary });
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// New controller function to get summary report
const getSummaryReport = async (req, res) => {
  try {
    const totalSales = await Sales.count();
    const totalRevenue = await Sales.sum("totalAmount");
    const totalPurchases = await Purchase.sum("totalAmount");
    const purchasePaid = await Purchase.sum("amountPaid");
    const totalStaffs = await Staff.count();
    const amountRemainingPurchase = await Purchase.sum("amountRemaining");
    const totalOrders = await Order.count();
    const totalProducts = await Stock.count();
    const totalUsers = await User.count();
    const cashFlow = await StockFlow.findOne({
      attributes: [
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN flowType = 'in' THEN amount ELSE 0 END",
            ),
          ),
          "totalCashFlowIn",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN flowType = 'out' THEN amount ELSE 0 END",
            ),
          ),
          "totalCashFlowOut",
        ],
      ],
      // group: ["flowType"],
    });

    res.status(200).json({
      totalSales,
      totalRevenue,
      totalPurchases,
      purchasePaid,
      totalStaffs,
      amountRemainingPurchase,
      totalOrders,
      totalProducts,
      totalUsers,
      cashFlow,
    });
  } catch (error) {
    console.error("Error fetching summary report:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

//purchase table report
const getPurchaseReport = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  const offset = (page - 1) * limit;
  try {
    const whereClause = {};
    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }
    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Staff,
          attributes: ["name", "email"],
        },
        {
          model: Stock,
          attributes: ["name"],
        },
        {
          model: Supplier,
          attributes: ["name", "contactInfo"],
        },
      ],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      totalPages,
      purchases,
    });
  } catch (error) {
    console.error("Error fetching purchase report:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

//returned table report
const getReturnedReport = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  const offset = (page - 1) * limit;
  try {
    const whereClause = {};
    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }
    const { count, rows: returns } = await Returns.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Staff,
          attributes: ["name", "email"],
        },
        {
          model: Stock,
          attributes: ["name"],
        },
        {
          model: Supplier,
          attributes: ["name", "contactInfo"],
        },
      ],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      totalPages,
      returns,
    });
  } catch (error) {
    console.error("Error fetching returned report:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

//Damaged table report
const getDamagedReport = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  const offset = (page - 1) * limit;
  try {
    const whereClause = {};
    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }
    const { count, rows: damages } = await Damages.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Staff,
          attributes: ["name", "email"],
        },
        {
          model: Stock,
          attributes: ["name"],
          include: [
            {
              model: Category,
              attributes: ["name"],
              include: [{ model: MainCategory, attributes: ["name"] }],
            },
          ],
        },
      ],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({
      totalPages,
      damages,
    });
  } catch (error) {
    console.error("Error fetching damaged report:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = {
  getSalesReport,
  getSaleDetails,
  getInventoryReport,
  getSummaryReport,
  getInventorySummary,
  getInventorySummaryByDateAndStock,
  getPurchaseReport,
  getReturnedReport,
  getDamagedReport,
};
