const { baseTemplate } = require("../utils/emailBody");

exports.OtpTemplate = (otp) => {
  const content = `
    <h3 style="color:#333;">Your Verification Code</h3>
    <p>Use the code below to continue:</p>

    <div style="text-align:center;margin:25px 0;">
      <span style="
        display:inline-block;
        padding:15px 25px;
        font-size:24px;
        font-weight:bold;
        letter-spacing:4px;
        color:#fff;
        background:#4CAF50;
        border-radius:6px;
      ">
        ${otp}
      </span>
    </div>

    <p>This code will expire in <strong>5 minutes</strong>.</p>
  `;

  return baseTemplate(content);
};

exports.NewsletterTemplate = () => {
  const content = `
    <h3>Welcome</h3>
    <p>Thanks for subscribing to our newsletter.</p>
    <p>You'll receive updates, tips, and exclusive offers.</p>
  `;

  return baseTemplate(content);
};

exports.OrderConfirmationTemplate = (order, status, totalAmount) => {
  const content = `
    <h3>Order Confirmed</h3>
    <p>Order ID: <strong>#${order.id}</strong></p>
    <p>Status: <strong>${status}</strong></p>
    <p>Total Amount: <strong>$${totalAmount}</strong></p>

    <p>We'll notify you when your order progresses.</p>
  `;

  return baseTemplate(content);
};

exports.ReturnStatusTemplate = (returnRequest) => {
  const content = `
    <h3>Return Update</h3>
    <p>Order ID: <strong>#${returnRequest.saleId}</strong></p>
    <p>Status: <strong>${returnRequest.status}</strong></p>
  `;

  return baseTemplate(content);
};
exports.PromotionTemplate = (heading, text) => {
  const content = `
    <h3>${heading}</h3>
    <p>${text}</p>

    <div style="text-align:center;margin-top:20px;">
      <a href="${process.env.DOMAIN_URL}" style="
        background:#007bff;
        color:#fff;
        padding:10px 20px;
        text-decoration:none;
        border-radius:5px;
      ">Shop Me Now</a>
    </div>
  `;

  return baseTemplate(content);
};
exports.NewsletterMsgTemplate = (heading, text) => {
  const content = `
    <h3>${heading},</h3>
    <p>${text}</p>

    <div style="text-align:center;margin-top:20px;">
      <a href="${process.env.DOMAIN_URL}" style="
        background:#007bff;
        color:#fff;
        padding:10px 20px;
        text-decoration:none;
        border-radius:5px;
      ">Shop Me Now</a>
    </div>
  `;

  return baseTemplate(content);
};

exports.PasswordResetTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use the OTP code below to reset it:</p>
        <p><strong>${otp}</strong></p>
        <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
};

exports.AccountVerificationTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <h2>Account Verification</h2>
        <p>Thank you for creating an account with us! Please use the OTP code below to verify your email address:</p>
        <p><strong>${otp}</strong></p>
        <p>If you did not create an account, please ignore this email.</p>
    </div>
  `;
};

exports.registrationConfirmationTemplate = () => {
  const content = `
    <h3>Welcome </h3>
    <p>Your account has been successfully created.</p>
    <p>You can now log in and start using our platform.</p>
  `;

  return baseTemplate(content);
};
exports.userMailTemplate = (user, Text) => {
  const content = `
    <h3 style="color:#333; margin-bottom:10px;"> Dear ${user},</h3>
    <p>${Text}</p>
  `;

  return baseTemplate(content);
};

exports.OrderStatusTemplate = (order, status) => {
  const statusColor = {
    pending: "#f39c12",
    processing: "#3498db",
    shipped: "#8e44ad",
    delivered: "#2ecc71",
    cancelled: "#e74c3c",
  };

  const content = `
    <h3> Order Update</h3>

    <p>Hello,</p>

    <p>Your order <strong>#${order.id}</strong> status has been updated.</p>

    <div style="text-align:center;margin:20px 0;">
      <span style="
        padding:10px 20px;
        background:${statusColor[status] || "#333"};
        color:#fff;
        border-radius:5px;
        font-weight:bold;
        text-transform:uppercase;
      ">
        ${status}
      </span>
    </div>

    <p>We'll keep you updated on further progress.</p>

    <p>Thank you for shopping with us</p>
  `;

  return baseTemplate(content);
};
