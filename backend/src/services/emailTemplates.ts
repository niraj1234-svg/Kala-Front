import { IOrder } from '../models/Order'

export interface FirstVisitEmailData {
  visitorId: string
  timestamp: Date
  device: string
  browser: string
  os: string
  referrer?: string
  location?: string
  ip?: string
}

/**
 * Common HTML email shell with KALA visual identity:
 * Clean white/off-white background, black typography, KALA orange (#D94700) accent.
 */
function emailLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF9F6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111111;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #FAF9F6;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EAE7E1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }
    .header {
      background-color: #111111;
      padding: 24px 30px;
      text-align: center;
      border-bottom: 3px solid #D94700;
    }
    .logo-text {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.15em;
      color: #FFFFFF;
      margin: 0;
      text-transform: uppercase;
    }
    .logo-sub {
      font-size: 11px;
      letter-spacing: 0.2em;
      color: #D94700;
      text-transform: uppercase;
      margin-top: 4px;
      font-weight: 700;
    }
    .content {
      padding: 32px 30px;
      box-sizing: border-box;
    }
    .headline {
      font-size: 20px;
      font-weight: 800;
      color: #111111;
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }
    .subtext {
      font-size: 14px;
      line-height: 1.5;
      color: #4B5563;
      margin: 0 0 24px 0;
    }
    .badge {
      display: inline-block;
      background-color: rgba(217, 71, 0, 0.1);
      color: #D94700;
      border: 1px solid rgba(217, 71, 0, 0.25);
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #111111;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 6px;
      margin: 24px 0 12px 0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .data-table td {
      padding: 7px 0;
      vertical-align: top;
    }
    .data-label {
      color: #6B7280;
      font-weight: 600;
      width: 38%;
    }
    .data-val {
      color: #111111;
      font-weight: 700;
      text-align: right;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin: 16px 0;
    }
    .items-table th {
      background-color: #F9FAFB;
      color: #374151;
      text-align: left;
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      border-bottom: 1px solid #E5E7EB;
    }
    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #F3F4F6;
      vertical-align: middle;
    }
    .total-box {
      background-color: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 14px 16px;
      margin-top: 16px;
    }
    .btn {
      display: inline-block;
      background-color: #D94700;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 12px 28px;
      border-radius: 6px;
      margin: 20px 0 10px 0;
      text-align: center;
    }
    .footer {
      background-color: #FAF9F6;
      border-top: 1px solid #EAE7E1;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #9CA3AF;
      line-height: 1.5;
    }
    @media only screen and (max-width: 600px) {
      .content { padding: 24px 18px; }
      .header { padding: 20px 18px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1 class="logo-text">KALA</h1>
        <div class="logo-sub">Streetwear &amp; Custom Apparel</div>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} KALA. All rights reserved.<br>
        Crafted with pride in India • Rooted in Culture
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Format IST Date Time
 */
function formatIST(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date)
}

/**
 * 1. FIRST-TIME VISITOR EMAIL TEMPLATE (To Admin)
 */
export function renderFirstVisitEmail(data: FirstVisitEmailData): { subject: string; html: string } {
  const subject = `New KALA Website Visitor`

  const body = `
    <div class="badge">First Visit Detected</div>
    <h2 class="headline">New Visitor on KALA</h2>
    <p class="subtext">A genuinely new visitor has just arrived on the KALA storefront.</p>

    <div class="section-title">Visitor Details</div>
    <table class="data-table">
      <tr>
        <td class="data-label">Date &amp; Time (IST):</td>
        <td class="data-val">${formatIST(data.timestamp)}</td>
      </tr>
      <tr>
        <td class="data-label">Visitor Identifier:</td>
        <td class="data-val" style="font-family: monospace; font-size: 11px;">${data.visitorId}</td>
      </tr>
      <tr>
        <td class="data-label">Device Type:</td>
        <td class="data-val">${data.device || 'Desktop'}</td>
      </tr>
      <tr>
        <td class="data-label">Browser:</td>
        <td class="data-val">${data.browser || 'Unknown'}</td>
      </tr>
      <tr>
        <td class="data-label">Operating System:</td>
        <td class="data-val">${data.os || 'Unknown'}</td>
      </tr>
      ${data.referrer ? `
      <tr>
        <td class="data-label">Referrer / Source:</td>
        <td class="data-val" style="word-break: break-all;">${data.referrer}</td>
      </tr>` : ''}
      ${data.location ? `
      <tr>
        <td class="data-label">Approximate Location:</td>
        <td class="data-val">${data.location}</td>
      </tr>` : ''}
      ${data.ip ? `
      <tr>
        <td class="data-label">Client IP:</td>
        <td class="data-val">${data.ip}</td>
      </tr>` : ''}
    </table>
  `

  return {
    subject,
    html: emailLayout(subject, body),
  }
}

/**
 * 2. ADMIN NEW ORDER EMAIL TEMPLATE (To Admin)
 */
export function renderAdminNewOrderEmail(order: IOrder): { subject: string; html: string } {
  const subject = `KALA Order Received: ${order.orderId} (₹${order.pricing.total.toLocaleString('en-IN')})`

  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim()
  const shipping = order.shippingAddress

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td>
        <strong>${item.name}</strong><br>
        <span style="font-size: 11px; color: #6B7280;">Size: ${item.size}${item.color ? ` • Color: ${item.color}` : ''}</span>
        ${item.customization?.backText ? `<br><span style="font-size: 11px; color: #D94700;">Custom: "${item.customization.backText}"</span>` : ''}
      </td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="text-align: right; font-weight: 700;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('')

  const body = `
    <div class="badge">New Order Received</div>
    <h2 class="headline">Order ${order.orderId}</h2>
    <p class="subtext">A customer has successfully placed an order on the KALA store.</p>

    <div class="section-title">Order Information</div>
    <table class="data-table">
      <tr>
        <td class="data-label">Order ID:</td>
        <td class="data-val" style="font-family: monospace;">${order.orderId}</td>
      </tr>
      <tr>
        <td class="data-label">Order Date:</td>
        <td class="data-val">${formatIST(order.createdAt || new Date())}</td>
      </tr>
      <tr>
        <td class="data-label">Order Status:</td>
        <td class="data-val" style="color: #15803D; text-transform: uppercase;">${order.status}</td>
      </tr>
      <tr>
        <td class="data-label">Payment Status:</td>
        <td class="data-val" style="color: #15803D; text-transform: uppercase;">${order.payment?.status || 'PAID'}</td>
      </tr>
      <tr>
        <td class="data-label">Payment Method:</td>
        <td class="data-val">${order.payment?.method || 'Razorpay Standard'}</td>
      </tr>
      ${order.payment?.razorpayPaymentId ? `
      <tr>
        <td class="data-label">Payment Reference:</td>
        <td class="data-val" style="font-family: monospace; font-size: 11px;">${order.payment.razorpayPaymentId}</td>
      </tr>` : ''}
    </table>

    <div class="section-title">Customer Information</div>
    <table class="data-table">
      <tr>
        <td class="data-label">Customer Name:</td>
        <td class="data-val">${customerName}</td>
      </tr>
      <tr>
        <td class="data-label">Mobile Number:</td>
        <td class="data-val"><a href="tel:${order.customer.phone}" style="color: #111111; text-decoration: none;">${order.customer.phone}</a></td>
      </tr>
      <tr>
        <td class="data-label">Email Address:</td>
        <td class="data-val"><a href="mailto:${order.customer.email}" style="color: #111111; text-decoration: none;">${order.customer.email}</a></td>
      </tr>
    </table>

    <div class="section-title">Shipping Address</div>
    <div style="font-size: 13px; line-height: 1.5; color: #374151; background: #F9FAFB; padding: 12px 14px; border-radius: 8px; border: 1px solid #E5E7EB;">
      <strong>${customerName}</strong><br>
      ${shipping.address}<br>
      ${shipping.landmark ? `Landmark: ${shipping.landmark}<br>` : ''}
      ${shipping.city}, ${shipping.state} – <strong>${shipping.pincode}</strong><br>
      Phone: ${order.customer.phone}
    </div>

    <div class="section-title">Order Items (${order.items.length})</div>
    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Item Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total-box">
      <table class="data-table" style="margin: 0;">
        <tr>
          <td class="data-label">Subtotal:</td>
          <td class="data-val">₹${order.pricing.subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${order.pricing.discount ? `
        <tr>
          <td class="data-label" style="color: #15803D;">Discount (${order.coupon?.code || 'Applied'}):</td>
          <td class="data-val" style="color: #15803D;">-₹${order.pricing.discount.toLocaleString('en-IN')}</td>
        </tr>` : ''}
        <tr>
          <td class="data-label">Shipping:</td>
          <td class="data-val">${order.pricing.shipping === 0 ? 'FREE' : `₹${order.pricing.shipping.toLocaleString('en-IN')}`}</td>
        </tr>
        <tr style="border-top: 2px solid #E5E7EB;">
          <td class="data-label" style="font-size: 16px; font-weight: 800; color: #111111; padding-top: 10px;">Final Total:</td>
          <td class="data-val" style="font-size: 18px; font-weight: 900; color: #D94700; padding-top: 10px;">₹${order.pricing.total.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>
  `

  return {
    subject,
    html: emailLayout(subject, body),
  }
}

/**
 * 3. CUSTOMER ORDER CONFIRMATION EMAIL (To Customer)
 */
export function renderCustomerOrderConfirmationEmail(
  order: IOrder,
  viewOrderUrl: string
): { subject: string; html: string } {
  const subject = `Your KALA Order is Confirmed (${order.orderId})`
  const customerName = order.customer.firstName || 'Customer'

  const itemsList = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #F3F4F6;">
      <td style="padding: 10px 0;">
        <strong>${item.name}</strong><br>
        <span style="font-size: 12px; color: #6B7280;">Size: ${item.size}${item.color ? ` • Color: ${item.color}` : ''}</span>
      </td>
      <td style="padding: 10px 0; text-align: center; color: #4B5563;">x${item.quantity}</td>
      <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #111111;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('')

  const body = `
    <div class="badge">Payment Verified</div>
    <h2 class="headline">Thank You for Your Order!</h2>
    <p class="subtext">
      Hi ${customerName},<br>
      Thank you for shopping with KALA. Your order has been successfully confirmed and is now being processed by our team.
    </p>

    <div class="section-title">Order Summary</div>
    <table class="data-table">
      <tr>
        <td class="data-label">Order ID:</td>
        <td class="data-val" style="font-family: monospace;">${order.orderId}</td>
      </tr>
      <tr>
        <td class="data-label">Order Date:</td>
        <td class="data-val">${formatIST(order.createdAt || new Date())}</td>
      </tr>
      <tr>
        <td class="data-label">Payment Status:</td>
        <td class="data-val" style="color: #15803D;">PAID</td>
      </tr>
      <tr>
        <td class="data-label">Order Status:</td>
        <td class="data-val" style="color: #15803D;">Order Confirmed</td>
      </tr>
    </table>

    <div class="section-title">Items Ordered</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      ${itemsList}
    </table>

    <div class="total-box">
      <table class="data-table" style="margin: 0;">
        <tr>
          <td class="data-label">Total Amount Paid:</td>
          <td class="data-val" style="font-size: 16px; font-weight: 900; color: #111111;">₹${order.pricing.total.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>

    <div class="section-title">Delivery Address</div>
    <p style="font-size: 13px; line-height: 1.5; color: #4B5563; margin: 0 0 16px 0;">
      ${order.customer.firstName} ${order.customer.lastName}<br>
      ${order.shippingAddress.address}<br>
      ${order.shippingAddress.landmark ? `${order.shippingAddress.landmark}<br>` : ''}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} – ${order.shippingAddress.pincode}
    </p>

    <p style="font-size: 13px; color: #4B5563; margin: 0 0 20px 0;">
      <strong>Expected Delivery:</strong> Standard courier delivery within 4–7 business days. You will receive tracking details once your order is shipped.
    </p>

    <div style="text-align: center;">
      <a href="${viewOrderUrl}" class="btn">View Order Status &rarr;</a>
    </div>
  `

  return {
    subject,
    html: emailLayout(subject, body),
  }
}

/**
 * 4. CUSTOMER ORDER STATUS UPDATE EMAIL (To Customer)
 */
export function renderCustomerOrderStatusUpdateEmail(
  order: IOrder,
  previousStatus: string,
  newStatus: string,
  viewOrderUrl: string
): { subject: string; html: string } {
  // Format readable status
  const formatStatus = (s: string): string => {
    switch (s.toLowerCase()) {
      case 'confirmed':
        return 'Order Confirmed'
      case 'processing':
        return 'Processing'
      case 'packed':
        return 'Packed'
      case 'shipped':
        return 'Shipped'
      case 'out_for_delivery':
      case 'out for delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      default:
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
  }

  const prevLabel = formatStatus(previousStatus)
  const currentLabel = formatStatus(newStatus)

  // Subject line corresponding to status
  let headline = `Your order status has been updated.`
  if (newStatus.toLowerCase() === 'shipped') {
    headline = `Your KALA order ${order.orderId} has been shipped.`
  } else if (newStatus.toLowerCase() === 'delivered') {
    headline = `Your KALA order ${order.orderId} has been delivered.`
  } else if (newStatus.toLowerCase() === 'cancelled') {
    headline = `Your KALA order ${order.orderId} has been cancelled.`
  } else if (newStatus.toLowerCase() === 'packed') {
    headline = `Your KALA order ${order.orderId} is packed and ready.`
  }

  const subject = `Update on Order ${order.orderId}: ${currentLabel}`

  const body = `
    <div class="badge">Status Update</div>
    <h2 class="headline">${headline}</h2>
    <p class="subtext">
      Hi ${order.customer.firstName || 'Customer'},<br>
      The fulfillment status for your order <strong>${order.orderId}</strong> has been updated.
    </p>

    <div class="section-title">Status Details</div>
    <table class="data-table">
      <tr>
        <td class="data-label">Order ID:</td>
        <td class="data-val" style="font-family: monospace;">${order.orderId}</td>
      </tr>
      <tr>
        <td class="data-label">Previous Status:</td>
        <td class="data-val" style="color: #6B7280;">${prevLabel}</td>
      </tr>
      <tr>
        <td class="data-label">Current Status:</td>
        <td class="data-val" style="color: #D94700; font-size: 14px;">${currentLabel}</td>
      </tr>
      <tr>
        <td class="data-label">Updated On:</td>
        <td class="data-val">${formatIST(new Date())}</td>
      </tr>
      ${order.tracking?.trackingNumber ? `
      <tr>
        <td class="data-label">Courier Carrier:</td>
        <td class="data-val">${order.tracking.carrier || 'Express Courier'}</td>
      </tr>
      <tr>
        <td class="data-label">Tracking Number:</td>
        <td class="data-val" style="font-family: monospace;">${order.tracking.trackingNumber}</td>
      </tr>` : ''}
    </table>

    <div style="text-align: center;">
      <a href="${viewOrderUrl}" class="btn">Track Your Order &rarr;</a>
    </div>

    <p style="font-size: 12px; color: #6B7280; text-align: center; margin-top: 16px;">
      Thank you for shopping with KALA.
    </p>
  `

  return {
    subject,
    html: emailLayout(subject, body),
  }
}
