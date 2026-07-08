import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = Router()

const CREDIT_PACKAGES = [
  { id: 'starter_100', name: 'Starter Pack', credits: 100, priceIdr: 15000 },
  { id: 'pro_500', name: 'Pro Pack', credits: 500, priceIdr: 50000 },
  { id: 'unlimited_2000', name: 'Power Pack', credits: 2000, priceIdr: 150000 },
]

// GET /api/payment/packages
router.get('/packages', (req, res) => {
  res.json({ packages: CREDIT_PACKAGES })
})

// POST /api/payment/create — buat transaksi Midtrans
router.post('/create', requireAuth, async (req, res) => {
  try {
    if (!process.env.MIDTRANS_SERVER_KEY) {
      return res.status(503).json({ error: 'Payment gateway belum dikonfigurasi' })
    }

    const { packageId } = req.body
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)
    if (!pkg) return res.status(400).json({ error: 'Paket tidak ditemukan' })

    const orderId = `KKA-${req.user.id.slice(0, 8)}-${Date.now()}`

    // Buat record transaksi dulu (status PENDING)
    await prisma.creditTransaction.create({
      data: {
        userId: req.user.id,
        amount: pkg.credits,
        type: 'TOPUP',
        description: `Beli ${pkg.name} (${pkg.credits} kredit)`,
        midtransId: orderId,
        status: 'PENDING',
      },
    })

    // Panggil Midtrans API
    const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64')
    const baseUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })

    const mtRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: pkg.priceIdr },
        customer_details: { email: user.email, first_name: user.name || 'User' },
        item_details: [{ id: pkg.id, price: pkg.priceIdr, quantity: 1, name: pkg.name }],
      }),
    })

    const mtData = await mtRes.json()
    if (!mtRes.ok) return res.status(400).json({ error: 'Gagal membuat transaksi', detail: mtData })

    res.json({ token: mtData.token, redirectUrl: mtData.redirect_url, orderId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/payment/webhook — Midtrans kirim notifikasi ke sini
router.post('/webhook', async (req, res) => {
  try {
    const { order_id, transaction_status, fraud_status } = req.body
    if (!order_id) return res.status(400).json({ error: 'Invalid payload' })

    const txn = await prisma.creditTransaction.findFirst({ where: { midtransId: order_id } })
    if (!txn) return res.status(404).json({ error: 'Transaksi tidak ditemukan' })

    const isSuccess = (transaction_status === 'capture' && fraud_status === 'accept')
      || transaction_status === 'settlement'

    if (isSuccess && txn.status !== 'SUCCESS') {
      await prisma.$transaction([
        prisma.creditTransaction.update({ where: { id: txn.id }, data: { status: 'SUCCESS' } }),
        prisma.user.update({ where: { id: txn.userId }, data: { creditBalance: { increment: txn.amount } } }),
      ])
    } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
      await prisma.creditTransaction.update({ where: { id: txn.id }, data: { status: 'FAILED' } })
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/payment/status/:orderId
router.get('/status/:orderId', requireAuth, async (req, res) => {
  try {
    const txn = await prisma.creditTransaction.findFirst({
      where: { midtransId: req.params.orderId, userId: req.user.id },
    })
    if (!txn) return res.status(404).json({ error: 'Transaksi tidak ditemukan' })
    res.json({ status: txn.status, amount: txn.amount })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
