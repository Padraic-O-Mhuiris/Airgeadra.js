import { createCurrency, log } from '../src/index'

test.only('create currency', () => {
  const EighteenDecimalsToken = createCurrency(2n)
  const DAI = EighteenDecimalsToken('USD')
  const amount = DAI(1000000000000000000n)
})
