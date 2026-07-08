import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import prisma from '../lib/prisma.js'

const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email sudah terdaftar' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, name, passwordHash, creditBalance: 20 },
    })

    const token = signToken(user)
    setAuthCookie(res, token)
    res.json({ user: { id: user.id, email: user.email, name: user.name, creditBalance: user.creditBalance } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal register' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Email atau password salah' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Email atau password salah' })

    const token = signToken(user)
    setAuthCookie(res, token)
    res.json({ user: { id: user.id, email: user.email, name: user.name, creditBalance: user.creditBalance } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal login' })
  }
})

// POST /api/auth/google — verifikasi Google ID token dari frontend
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ error: 'Google OAuth belum dikonfigurasi' })

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const { sub: googleId, email, name, picture } = ticket.getPayload()

    let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } })
    if (user) {
      if (!user.googleId) await prisma.user.update({ where: { id: user.id }, data: { googleId } })
    } else {
      user = await prisma.user.create({
        data: { email, name, avatarUrl: picture, googleId, creditBalance: 20 },
      })
    }

    const token = signToken(user)
    setAuthCookie(res, token)
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, creditBalance: user.creditBalance } })
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Google token tidak valid' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Tidak login' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, avatarUrl: true, creditBalance: true, plan: true, freeUsed: true },
    })
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Token tidak valid' })
  }
})

export default router
