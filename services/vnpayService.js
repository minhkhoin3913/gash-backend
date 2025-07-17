const Orders = require('../models/Orders');
const config = require('config');
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

exports.createPaymentUrl = async (orderId, bankCode, language, user, req) => {
  const order = await Orders.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (user.role !== 'admin' && user.role !== 'manager' && order.acc_id.toString() !== user.id)
    throw new Error('Access denied: Can only pay for own order');
  if (order.pay_status === 'paid') throw new Error('Order already paid');

  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const tmnCode = config.get('vnp_TmnCode');
  const secretKey = config.get('vnp_HashSecret');
  let vnpUrl = config.get('vnp_Url');
  const returnUrl = config.get('vnp_ReturnUrl');
  const amount = order.totalPrice;
  const orderRef = orderId;

  let vnp_Params = {
    'vnp_Version': '2.1.0',
    'vnp_Command': 'pay',
    'vnp_TmnCode': tmnCode,
    'vnp_Locale': language || 'vn',
    'vnp_CurrCode': 'VND',
    'vnp_TxnRef': orderRef,
    'vnp_OrderInfo': 'Thanh toan don hang:' + orderRef,
    'vnp_OrderType': 'other',
    'vnp_Amount': amount * 100,
    'vnp_ReturnUrl': returnUrl,
    'vnp_IpAddr': ipAddr,
    'vnp_CreateDate': createDate
  };
  if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

exports.handleReturn = async (vnp_Params) => {
  const secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];
  const secretKey = config.get('vnp_HashSecret');
  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  if (secureHash !== signed) throw new Error('Checksum failed');

  const orderId = vnp_Params['vnp_TxnRef'];
  const rspCode = vnp_Params['vnp_ResponseCode'];
  const order = await Orders.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (rspCode === "00") {
    order.pay_status = 'paid';
    await order.save();
    return { code: rspCode, message: 'Payment successful' };
  } else {
    return { code: rspCode, message: 'Payment failed or cancelled' };
  }
};

exports.handleIpn = async (vnp_Params) => {
  const secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];
  const secretKey = config.get('vnp_HashSecret');
  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  if (secureHash !== signed) return { RspCode: '97', Message: 'Checksum failed' };

  const orderId = vnp_Params['vnp_TxnRef'];
  const rspCode = vnp_Params['vnp_ResponseCode'];
  const amount = parseInt(vnp_Params['vnp_Amount'], 10) / 100;
  const order = await Orders.findById(orderId);
  if (!order) return { RspCode: '01', Message: 'Order not found' };
  if (order.totalPrice !== amount) return { RspCode: '04', Message: 'Amount invalid' };

  if (order.pay_status === 'paid') return { RspCode: '02', Message: 'Order already updated' };
  if (rspCode === "00") {
    order.pay_status = 'paid';
    await order.save();
    return { RspCode: '00', Message: 'Success' };
  } else {
    order.pay_status = 'failed';
    await order.save();
    return { RspCode: '00', Message: 'Payment failed' };
  }
}; 