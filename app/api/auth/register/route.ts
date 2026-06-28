import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được đăng ký' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Get CUSTOMER role (id = 2)
    const customerRole = await prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    })

    if (!customerRole) {
      return NextResponse.json(
        { error: 'CUSTOMER role not found in database' },
        { status: 500 }
      )
    }

    // Create user and customer info in transaction
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        role_id: customerRole.id,
        status: 'ACTIVE',
        customer_info: {
          create: {
            fullname: name,
          },
        },
      },
      include: {
        customer_info: true,
        role: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          fullname: user.customer_info?.fullname,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
