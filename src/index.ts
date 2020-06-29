import invariant from 'ts-invariant'

type VireoPairFn<T0, T1, R> = (arg0: T0) => (arg1: T1) => R
type VireoPairHOF<T0, T1> = <R>(f: VireoPairFn<T0, T1, R>) => R
type VireoPair<T0, T1> = (arg0: T0) => (arg1: T1) => <R>(f: VireoPairFn<T0, T1, R>) => R

type VireoTriadFn<T0, T1, T2, R> = (arg0: T0) => (arg1: T1) => (arg2: T2) => R
type VireoTriadHOF<T0, T1, T2> = <R>(f: VireoTriadFn<T0, T1, T2, R>) => R
type VireoTriad<T0, T1, T2> = (arg0: T0) => (arg1: T1) => (arg2: T2) => <R>(f: VireoTriadFn<T0, T1, T2, R>) => R

type CurrencyApplication<R> = VireoTriadFn<bigint, string, bigint, R>
type Currency = VireoTriadHOF<bigint, string, bigint>
type CurrencyConstructor = VireoTriad<bigint, string, bigint>

type CurrencyPairApplication<R> = VireoPairFn<Currency, Currency, R>
type CurrencyPair = VireoPairHOF<Currency, Currency>
type CurrencyPairConstructor = VireoPair<Currency, Currency>

export const createCurrency: CurrencyConstructor = (unt) => (iso) => (amt) => (f) => f(unt)(iso)(amt)

type CurrencyApplicationConstructor = <R>(a: CurrencyApplication<R>) => (b: Currency) => R
export const createCurrencyApplication: CurrencyApplicationConstructor = (currencyApplication) => (currency) =>
  currency(currencyApplication)

const Ξ = createCurrencyApplication

export const getUnt = Ξ((unt) => () => () => unt)
export const getIso = Ξ(() => (iso) => () => iso)
export const getAmt = Ξ(() => () => (amt) => amt)

export const setUnt = (v: bigint) => Ξ(() => (iso) => (amt) => createCurrency(v)(iso)(amt))
export const setIso = (v: string) => Ξ((unt) => () => (amt) => createCurrency(unt)(v)(amt))
export const setAmt = (v: bigint) => Ξ((unt) => (iso) => () => createCurrency(unt)(iso)(v))

export const log = Ξ((unt) => (iso) => (amt) => console.log({ unt, iso, amt }))
export const getCurrency = Ξ((unt) => (iso) => (amt) => ({
  unt,
  iso,
  amt,
}))

export const prn = Ξ((unt) => (iso) => (amt) => {
  let isNeg = amt < 0n
  if (isNeg) {
    amt = amt * -1n
  }

  let displayString = ''
  let amtStr = amt.toString()
  const lessThanZeroStart = `0.`
  const position = amtStr.length - Number(unt)

  invariant(position > -10000, 'decimal is too long')
  if (position > 0) {
    displayString = `${amtStr.substring(0, position)}.${amtStr.substring(position)}`
  } else {
    displayString = `${lessThanZeroStart}${amtStr.padStart(Number(unt), '0')}`
  }
  let [left, right] = displayString.split('.')
  right = right.replace(/0+$/, '')
  left = isNeg ? `-${left}` : left
  if (!right.length) return `${left} ${iso}`
  return `${left}.${right} ${iso}`
})

type CurrencyPairApplicationConstructor = <R>(a: CurrencyPairApplication<R>) => (b: Currency) => (c: Currency) => R

export const createCurrencyPair: CurrencyPairConstructor = (a) => (b) => (f) => f(a)(b)
export const createCurrencyPairApplication: CurrencyPairApplicationConstructor = (currencyPairApplication) => (a) => (
  b,
) => currencyPairApplication(a)(b)

const $ = createCurrencyPairApplication

// type CurrencyPairReduction = (a: Currency) => (b: Currency) => (f: CurrencyPairApplication<bigint>) => Currency
// const currencyPairReduction: CurrencyPairReduction = (a) => (b) => (f) =>
//   $((a) => (b) => {
//     const { iso: aIso, unt: aUnt } = getCurrency(a)
//     const { iso: bIso, unt: bUnt } = getCurrency(b)

//     invariant(aIso === bIso, `Currencies ${aIso} and ${bIso} cannot operate on each other`)

//     const xunt = aUnt > bUnt ? aUnt : bUnt
//     return createCurrency(xunt)(aIso)(f(a1)(b1))
//   })

const add = $((a) => (b) => {
  const { iso: aIso, unt: aUnt, amt: aAmt } = getCurrency(a)
  const { iso: bIso, unt: bUnt, amt: bAmt } = getCurrency(b)

  invariant(aIso === bIso, `Currencies ${aIso} and ${bIso} cannot operate on each other`)

  const xunt = aUnt > bUnt ? aUnt : bUnt
  const xamt = aAmt + bAmt
  return createCurrency(xunt)(aIso)(xamt)
})

const EighteenDecimalsToken = createCurrency(18n)
const DAI = EighteenDecimalsToken('DAI')

const daiAmount1 = DAI(600n)
const oneDai = DAI(1n)

const addOneDai = add(oneDai)
console.log(prn(addOneDai(daiAmount1)))

// type CurrencyComposition = (arg0: Array<CurrencyTransformation>) => (arg2: Currency) => Currency
// const compose: CurrencyComposition = (f) => (a) => (f.length ? f.reduce((acc, fn) => acc(fn), a) : a)
