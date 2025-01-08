// /routes/payment.js
const express = require("express");
const axios = require("axios");
const QRCode = require("qrcode");
const routerPayment = express.Router();

let cachedToken = null;
let tokenExpiresAt = 0;

async function getQpayToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
    const clientId = "FORU"; // Replace with your qPay client_id
    const clientSecret = "fMZxsPLj"; // Replace with your qPay client_secret
    const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const resp = await axios.post("https://merchant.qpay.mn/v2/auth/token", {}, {
        headers: {
            Authorization: `Basic ${base64}`,
            "Content-Type": "application/json",
        },
    });
    const { access_token, expires_in } = resp.data;
    cachedToken = access_token;
    tokenExpiresAt = Date.now() + expires_in * 1000;
    return cachedToken;
}

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
            callback_url: "https://your-domain-or-ngrok/qpay-callback"
        };
        const response = await axios.post("https://merchant.qpay.mn/v2/invoice", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });
        const invoiceData = response.data;
        let qrDataUrl = null;
        if (invoiceData.qr_text) {
            qrDataUrl = await QRCode.toDataURL(invoiceData.qr_text);
        }
        res.json({ success: true, invoiceData, qrDataUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error?.response?.data || error.toString() });
    }
});

routerPayment.post("/check-invoice", async (req, res) => {
    try {
        const { invoiceId } = req.body;
        const token = await getQpayToken();
        const checkPayload = {
            object_type: "INVOICE",
            object_id: invoiceId,
            offset: { page_number: 1, page_limit: 100 }
        };
        const checkResp = await axios.post("https://merchant.qpay.mn/v2/payment/check", checkPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });
        res.json({ success: true, checkResult: checkResp.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error?.response?.data || error.toString() });
    }
});

routerPayment.post("/callback", async (req, res) => {
    try {
        // qPay will post payment status here
        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
});

module.exports = routerPayment;