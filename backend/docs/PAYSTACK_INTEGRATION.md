# Paystack Payment Integration

This document explains the Paystack payment integration for the shop backend infrastructure.

## Overview

Paystack is a leading payment gateway in Africa, supporting multiple countries including Ghana, Nigeria, Kenya, and South Africa. It provides excellent support for local payment methods and currencies.

## Supported Features

- **Payment Initialization**: Create payment transactions
- **Payment Verification**: Verify completed payments
- **Webhook Handling**: Automatic order status updates
- **Multiple Currencies**: GHS (Ghana Cedis), NGN (Nigerian Naira), USD, etc.
- **Local Payment Methods**: Mobile money, bank transfers, cards

## Environment Variables

Add these to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here

# Frontend URL for payment callbacks
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### 1. Initialize Payment
**POST** `/api/payments/initialize`

Initialize a new payment transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 29.99,
  "currency": "GHS",
  "email": "customer@example.com",
  "orderId": "optional_order_id"
}
```

**Response:**
```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "access_code_here",
  "reference": "transaction_reference"
}
```

### 2. Verify Payment
**POST** `/api/payments/verify`

Verify a completed payment transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reference": "transaction_reference"
}
```

**Response:**
```json
{
  "success": true,
  "order": { /* order details */ },
  "paymentStatus": "success",
  "amount": 29.99,
  "currency": "GHS"
}
```

### 3. Get Transaction Status
**GET** `/api/payments/transaction/:reference`

Get the status of a payment transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "reference": "transaction_reference",
  "status": "success",
  "amount": 29.99,
  "currency": "GHS",
  "metadata": { /* transaction metadata */ },
  "paid_at": "2023-10-11T18:30:00.000Z"
}
```

### 4. Webhook Endpoint
**POST** `/api/payments/webhook`

Handles Paystack webhooks for automatic order updates.

**Note:** This endpoint is called by Paystack and doesn't require authentication.

## Payment Flow

1. **Frontend**: User initiates checkout
2. **Backend**: Call `/api/payments/initialize` to create transaction
3. **Frontend**: Redirect user to `authorizationUrl`
4. **User**: Completes payment on Paystack
5. **Paystack**: Redirects to callback URL
6. **Frontend**: Call `/api/payments/verify` to confirm payment
7. **Backend**: Updates order status to 'processing'

## Webhook Events

The webhook handler processes these Paystack events:

- `charge.success`: Payment completed successfully
- `charge.failed`: Payment failed

## Currency Support

### Ghana (GHS)
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Bank transfers
- Visa/Mastercard

### Nigeria (NGN)
- Bank transfers
- USSD
- Mobile money
- Cards

### International (USD)
- Visa/Mastercard
- Bank transfers

## Testing

### Test Cards
Use these test card numbers in test mode:

**Successful Payment:**
- Card: 4084084084084081
- CVV: 408
- Expiry: Any future date

**Failed Payment:**
- Card: 4084084084084081
- CVV: 001
- Expiry: Any future date

### Test Mobile Money
For Ghana Mobile Money testing:
- Use any valid phone number
- Use PIN: 1234

## Error Handling

Common error scenarios:

1. **Insufficient Funds**: User's account has insufficient balance
2. **Invalid Card**: Card details are incorrect
3. **Network Issues**: Payment gateway timeout
4. **Duplicate Transaction**: Same reference used twice

## Security

- All API keys are stored in environment variables
- Webhook signatures are verified using HMAC SHA512
- Payment amounts are validated server-side
- User authentication required for all payment operations

## Local Payment Methods in Ghana

Paystack supports these popular payment methods in Ghana:

1. **MTN Mobile Money**
2. **Vodafone Cash**
3. **AirtelTigo Money**
4. **Bank transfers** (All major Ghanaian banks)
5. **Visa/Mastercard**

## Next Steps

1. Sign up for Paystack account at https://paystack.com
2. Get your API keys from the dashboard
3. Configure webhook URL in Paystack dashboard
4. Test with the provided test credentials
5. Switch to live keys for production

## Support

- Paystack Documentation: https://paystack.com/docs
- Ghana Support: support@paystack.com
- Developer Community: https://github.com/PaystackHQ