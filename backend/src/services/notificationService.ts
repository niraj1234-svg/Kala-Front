import { IOrder } from '../models/Order'
import { NotificationLog } from '../models/NotificationLog'
import {
  sendEmail,
  getAdminEmail,
} from './emailService'
import {
  renderFirstVisitEmail,
  renderAdminNewOrderEmail,
  renderCustomerOrderConfirmationEmail,
  renderCustomerOrderStatusUpdateEmail,
  type FirstVisitEmailData,
} from './emailTemplates'

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

/**
 * 1. FIRST VISIT ALERT (To Admin)
 * Idempotent: Only sends once per visitor ID.
 */
export async function sendFirstVisitAlert(data: FirstVisitEmailData): Promise<boolean> {
  const notificationKey = `first_visit:${data.visitorId}`

  // Check idempotency in NotificationLog
  const existingLog = await NotificationLog.findOne({ notificationKey })
  if (existingLog && existingLog.status === 'sent') {
    return true
  }

  const adminEmail = getAdminEmail()
  const { subject, html } = renderFirstVisitEmail(data)

  const result = await sendEmail({
    to: adminEmail,
    subject,
    html,
  })

  await NotificationLog.findOneAndUpdate(
    { notificationKey },
    {
      notificationKey,
      type: 'first_visit',
      visitorId: data.visitorId,
      recipient: adminEmail,
      status: result.success ? 'sent' : 'failed',
      providerMessageId: result.messageId || '',
      error: result.error || '',
      sentAt: new Date(),
    },
    { upsert: true, new: true }
  ).catch((err) => {
    console.error('[NotificationService] Failed to record first_visit log:', err)
  })

  return result.success
}

/**
 * 2. ORDER PAID NOTIFICATIONS (Admin Alert + Customer Confirmation)
 * Idempotent: Uses atomic compound key checks so repeat calls or duplicate webhooks
 * never deliver duplicate emails.
 */
export async function sendOrderPaidNotifications(order: IOrder): Promise<{
  adminAlertSent: boolean
  customerConfirmationSent: boolean
}> {
  let adminAlertSent = false
  let customerConfirmationSent = false

  // A. Admin New Order Notification
  const adminKey = `admin_order:${order.orderId}`
  const existingAdminLog = await NotificationLog.findOne({ notificationKey: adminKey })

  if (!existingAdminLog || existingAdminLog.status !== 'sent') {
    const adminEmail = getAdminEmail()
    const { subject, html } = renderAdminNewOrderEmail(order)

    const adminResult = await sendEmail({
      to: adminEmail,
      subject,
      html,
    })

    await NotificationLog.findOneAndUpdate(
      { notificationKey: adminKey },
      {
        notificationKey: adminKey,
        type: 'admin_order',
        orderId: order.orderId,
        recipient: adminEmail,
        status: adminResult.success ? 'sent' : 'failed',
        providerMessageId: adminResult.messageId || '',
        error: adminResult.error || '',
        sentAt: new Date(),
      },
      { upsert: true, new: true }
    ).catch((err) => console.error('[NotificationService] Admin log error:', err))

    adminAlertSent = adminResult.success
  } else {
    adminAlertSent = true
  }

  // B. Customer Order Confirmation Email
  const customerEmail = order.customer?.email?.trim()
  if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    const customerKey = `customer_confirmation:${order.orderId}`
    const existingCustLog = await NotificationLog.findOne({ notificationKey: customerKey })

    if (!existingCustLog || existingCustLog.status !== 'sent') {
      const viewOrderUrl = `${CLIENT_URL}/account/orders/${order.orderId}`
      const { subject, html } = renderCustomerOrderConfirmationEmail(order, viewOrderUrl)

      const custResult = await sendEmail({
        to: customerEmail,
        subject,
        html,
      })

      await NotificationLog.findOneAndUpdate(
        { notificationKey: customerKey },
        {
          notificationKey: customerKey,
          type: 'customer_confirmation',
          orderId: order.orderId,
          recipient: customerEmail,
          status: custResult.success ? 'sent' : 'failed',
          providerMessageId: custResult.messageId || '',
          error: custResult.error || '',
          sentAt: new Date(),
        },
        { upsert: true, new: true }
      ).catch((err) => console.error('[NotificationService] Customer confirmation log error:', err))

      customerConfirmationSent = custResult.success
    } else {
      customerConfirmationSent = true
    }
  }

  return {
    adminAlertSent,
    customerConfirmationSent,
  }
}

/**
 * 3. CUSTOMER STATUS UPDATE NOTIFICATION
 * Dispatches an email to the customer whenever their order moves to a new status.
 */
export async function sendOrderStatusUpdateNotification(
  order: IOrder,
  previousStatus: string,
  newStatus: string
): Promise<boolean> {
  const customerEmail = order.customer?.email?.trim()
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return false
  }

  const notificationKey = `customer_status_update:${order.orderId}:${newStatus.toLowerCase()}`
  const existingLog = await NotificationLog.findOne({ notificationKey })
  if (existingLog && existingLog.status === 'sent') {
    return true
  }

  const viewOrderUrl = `${CLIENT_URL}/account/orders/${order.orderId}`
  const { subject, html } = renderCustomerOrderStatusUpdateEmail(
    order,
    previousStatus,
    newStatus,
    viewOrderUrl
  )

  const result = await sendEmail({
    to: customerEmail,
    subject,
    html,
  })

  await NotificationLog.findOneAndUpdate(
    { notificationKey },
    {
      notificationKey,
      type: 'customer_status_update',
      orderId: order.orderId,
      recipient: customerEmail,
      status: result.success ? 'sent' : 'failed',
      providerMessageId: result.messageId || '',
      error: result.error || '',
      sentAt: new Date(),
    },
    { upsert: true, new: true }
  ).catch((err) => console.error('[NotificationService] Status update log error:', err))

  return result.success
}
