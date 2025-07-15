// importBillService.js
const ImportBill = require('../models/ImportBill');
const ImportBillDetails = require('../models/ImportBillDetails');

exports.searchImportBills = async (queryParams) => {
  const { startDate, endDate, minAmount, maxAmount } = queryParams;
  const query = {};
  if (startDate && endDate) {
    query.create_date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  } else if (startDate) {
    query.create_date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.create_date = { $lte: new Date(endDate) };
  }
  if (minAmount && maxAmount) {
    query.total_amount = { $gte: Number(minAmount), $lte: Number(maxAmount) };
  } else if (minAmount) {
    query.total_amount = { $gte: Number(minAmount) };
  } else if (maxAmount) {
    query.total_amount = { $lte: Number(maxAmount) };
  }
  return await ImportBill.find(query);
};

exports.createImportBill = async (data) => {
  const importBill = new ImportBill(data);
  return await importBill.save();
};

exports.getAllImportBills = async () => {
  return await ImportBill.find();
};

exports.getImportBillById = async (id) => {
  return await ImportBill.findById(id);
};

exports.updateImportBill = async (id, data) => {
  return await ImportBill.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteImportBill = async (id) => {
  const importBill = await ImportBill.findByIdAndDelete(id);
  if (!importBill) return null;
  await ImportBillDetails.deleteMany({ bill_id: id });
  return true;
};

exports.createImportBillDetail = async (data) => {
  const importBillDetail = new ImportBillDetails(data);
  return await importBillDetail.save();
};

exports.getImportBillDetailsByBill = async (billId) => {
  return await ImportBillDetails.find({ bill_id: billId }).populate('variant_id');
};

exports.getImportBillDetailById = async (id) => {
  return await ImportBillDetails.findById(id).populate('variant_id');
};

exports.updateImportBillDetail = async (id, data) => {
  return await ImportBillDetails.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteImportBillDetail = async (id) => {
  const importBillDetail = await ImportBillDetails.findByIdAndDelete(id);
  if (!importBillDetail) return null;
  return true;
}; 