import { BadRequestException } from "#src/http-exception"
import { Account } from "#src/modules/accounts/schemas/account.schema"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import usersService from "#src/modules/users/users.service"
import { getAccountByEmail } from '#src/modules/accounts/account.service'


async function registerService(data) {
  const { email, password, name, phone } = data

  const isAccount = await Account.findOne({ email })

  if (isAccount) {
    throw new BadRequestException("Email already exist")
  }
  const user = await usersService.create({ name, phone })

  const hashedPassword = await bcrypt.hash(password, 10)

  const account = await Account.create({
    name,
    phone,
    email,
    password: hashedPassword,
    user: user._id,
  })


  const accessToken = jwt.sign(
    { AccountId: account._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h"
    }
  )
  return {
    account: { email: account.email, name: user.name, phone: user.phone },
    accessToken,
  }
}

async function loginService(data) {

  // const account = await Account.findOne({ email }).populate('user')

  // if (!account) {
  //   throw new BadRequestException("Invalid Credentials")
  // }
  const { email, password } = data
  const account = await getAccountByEmail(email)

  console.log('account1', account)
  if (!account) {
    throw new BadRequestException("User not found")
  }
  const isPasswordValid = await bcrypt.compare(password, account.password)
  if (!isPasswordValid) {
    throw new BadRequestException("Invalid Credentials")
  }

  const accessToken = jwt.sign(
    { accountId: account._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h"
    }
  )
  return {
    account: { name: account.user.name, email: account.email },
    accessToken
  }
}
export { registerService, loginService }
