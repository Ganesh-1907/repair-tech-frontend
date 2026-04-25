const sleep = (duration = 300) => new Promise((resolve) => setTimeout(resolve, duration));

const generateRef = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

export const sendOutboundMessage = async ({ channel, recipientType, recipient, message, templateName, contextType }) => {
  await sleep();
  return {
    messageId: generateRef('MSG'),
    status: 'Queued',
    channel,
    recipientType,
    recipient,
    message,
    templateName: templateName || null,
    contextType: contextType || 'General',
    sentAt: new Date().toISOString(),
  };
};

export const sendQuoteNotification = async ({ quoteId, channel, phoneNumber, issue, estimate, approvalUrl }) => {
  await sleep();
  return {
    notificationId: generateRef('QTE'),
    quoteId,
    channel,
    phoneNumber,
    issue,
    estimate,
    approvalUrl,
    status: 'Queued',
    sentAt: new Date().toISOString(),
  };
};
