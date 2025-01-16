const express = require("express");
const axios = require("axios");
const QRCode = require("qrcode");
const routerPayment = express.Router();

let cachedToken = null;
let tokenExpiresAt = 0;

// Helper: getQpayToken
async function getQpayToken() {
    // If we have a cached token and it hasn't expired, reuse it
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

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
    // tokenExpiresAt = currentTime + expires_in * 1000
    tokenExpiresAt = Date.now() + expires_in * 1000;
    return cachedToken;
}

/**
 * POST /api/payments/create-invoice
 */
routerPayment.post("/create-invoice", async (req, res) => {
    try {
        const { invoiceCode, amount } = req.body;
        const token = await getQpayToken();

        const payload = {
            invoice_code: invoiceCode || "FORU_INVOICE",
            sender_invoice_no: "123456",
            invoice_receiver_code: "terminal",
            amount: amount || 100,
            invoice_description: "Invoice with Social Pay link",
            callback_url: "https://your-domain-or-ngrok/qpay-callback",
        };

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
        let qrDataUrl = null;
        if (invoiceData.qr_text) {
            qrDataUrl = await QRCode.toDataURL(invoiceData.qr_text);
        }

        return res.json({ success: true, invoiceData, qrDataUrl });
    } catch (error) {
        console.error("Error creating invoice:", error?.response?.data || error);
        return res
            .status(500)
            .json({ success: false, error: error?.response?.data || error.toString() });
    }
});

/**
 * POST /api/payments/check-invoice
 */
routerPayment.post("/check-invoice", async (req, res) => {
    try {
        const { invoiceId } = req.body;
        const token = await getQpayToken();

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

        return res.json({ success: true, checkResult: checkResp.data });
    } catch (error) {
        console.error("Error checking invoice:", error?.response?.data || error);
        return res
            .status(500)
            .json({ success: false, error: error?.response?.data || error.toString() });
    }
});

/**
 * POST /api/payments/callback
 */
routerPayment.post("/callback", async (req, res) => {
    try {
        // qPay posts payment status here
        // You can verify or update your DB
        return res.sendStatus(200);
    } catch (error) {
        console.error("Error in callback:", error);
        return res.sendStatus(500);
    }
});

module.exports = routerPayment;
