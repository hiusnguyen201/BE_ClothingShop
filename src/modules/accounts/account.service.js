import { Account } from "#src/modules/accounts/schemas/account.schema"

async function getAccountByEmail(email) {
  const account = await Account.findOne({ email })
  return account
}

export { getAccountByEmail } 
