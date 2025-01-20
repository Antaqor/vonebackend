// routes/payment.js
const express = require("express");
const axios = require("axios");
const QRCode = require("qrcode");

const routerPayment = express.Router();

// =============================================
// 1) Token caching for QPay
// =============================================
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Helper: getQpayToken()
 * - Retrieves a cached token if it hasn't expired
 * - Otherwise requests a new token from QPay
 */
async function getQpayToken() {
    // If a token is cached and still valid, reuse it
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    // Otherwise, request a new token
    const clientId = process.env.QPAY_CLIENT_ID || "FORU";
    const clientSecret = process.env.QPAY_CLIENT_SECRET || "fMZxsPLj";
    const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const resp = await axios.post(
        "https://merchant.qpay.mn/v2/auth/token",
        {},
        {
            headers: {
                Authorization: `Basic ${base64}`,
                "Content-Type": "application/json",
            },
        }
    );

    const { access_token, expires_in } = resp.data;
    cachedToken = access_token;
    tokenExpiresAt = Date.now() + expires_in * 1000;
    return cachedToken;
}

// =============================================
// 2) POST /api/payments/create-invoice
//    Creates a QPay invoice for 500₮ deposit
// =============================================
routerPayment.post("/create-invoice", async (req, res) => {
    try {
        // If you want a variable deposit from the frontend, do:
        //   const { invoiceCode, amount } = req.body;
        //   const depositAmount = amount || 500;
        // But here we force 500₮:
        const { invoiceCode } = req.body;
        const depositAmount = 50; // <--- Hardcoded deposit

        const token = await getQpayToken();

        const payload = {
            invoice_code: invoiceCode || "FORU_INVOICE",
            sender_invoice_no: "123456", // could be any unique number/string
            invoice_receiver_code: "terminal",
            amount: depositAmount, // Force 500₮
            invoice_description: "Deposit invoice (50₮)",
            callback_url: "https://your-domain-or-ngrok/qpay-callback",
        };

        // Create invoice in QPay
        const response = await axios.post(
            "https://merchant.qpay.mn/v2/invoice",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const invoiceData = response.data;

        // Generate a QR code image data URL from QPay's "qr_text"
        let qrDataUrl = null;
        if (invoiceData.qr_text) {
            qrDataUrl = await QRCode.toDataURL(invoiceData.qr_text);
        }

        // Return success + invoice + the QR code data
        return res.json({ success: true, invoiceData, qrDataUrl });
    } catch (error) {
        console.error("Error creating invoice:", error?.response?.data || error);
        return res.status(500).json({
            success: false,
            error: error?.response?.data || error.toString(),
        });
    }
});

// =============================================
// 3) POST /api/payments/check-invoice
//    Checks whether an invoice is paid
// =============================================
routerPayment.post("/check-invoice", async (req, res) => {
    try {
        const { invoiceId } = req.body;
        if (!invoiceId) {
            return res.status(400).json({
                success: false,
                error: "Missing invoiceId",
            });
        }
        const token = await getQpayToken();

        // QPay wants object_type="INVOICE" + object_id= invoiceId
        const checkPayload = {
            object_type: "INVOICE",
            object_id: invoiceId,
            offset: { page_number: 1, page_limit: 100 },
        };

        const checkResp = await axios.post(
            "https://merchant.qpay.mn/v2/payment/check",
            checkPayload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return res.json({
            success: true,
            checkResult: checkResp.data, // e.g. { rows: [...] }
        });
    } catch (error) {
        console.error("Error checking invoice:", error?.response?.data || error);
        return res.status(500).json({
            success: false,
            error: error?.response?.data || error.toString(),
        });
    }
});

// =============================================
// 4) POST /api/payments/callback
//    QPay calls this URL to confirm payment
// =============================================
routerPayment.post("/callback", async (req, res) => {
    try {
        // QPay sends payment info in req.body
        // You can verify or update DB if you want
        // Usually you'd parse:
        //  const { object_id, payment_status, invoice_status } = req.body
        // Then mark invoice as PAID in your DB, etc.

        console.log("QPay callback data:", req.body);
        return res.sendStatus(200);
    } catch (error) {
        console.error("Error in QPay callback:", error);
        return res.sendStatus(500);
    }
});

module.exports = routerPayment;
