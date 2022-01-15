
const Web3 = require("web3")
const fs = require("fs")


const config = JSON.parse(fs.readFileSync("config.json"))
const eth_uri = config["url"];
const provider = new Web3.providers.HttpProvider(eth_uri)
const web3 = new Web3(provider)

const decodeABI = (data: String) => {
    let  buff = Buffer.from(data, 'base64');
    return JSON.parse(buff.toString('ascii'));

}
const createContract = (abi: JSON,address: String) => {
    return new web3.eth.Contract(abi,address)
}

const addressWETH = config["addressWETH"]
const addressUSDC = config["addressUSDC"]
const uniswapV2FactoryAddress = config["uniswapV2FactoryAddress"]

const tokenABI = decodeABI(config["tokenABI"])
const uniswapV2FactoryABI = decodeABI(config["uniswapV2FactoryABI"])

const getTokenName = async (address: String) => {
    let contractToken = createContract(tokenABI,address)
    let name = await contractToken.methods.name().call()   
    return name
}
const getTokenSymbol = async(address: String) => {
    let contractToken = createContract(tokenABI,address)
    let symbol = await contractToken.methods.symbol().call()   
    return symbol
}

const getTotalSupply = async(address: String) => {
    let contractToken = createContract(tokenABI,address)
    let totalSupply = await contractToken.methods.totalSupply().call()   
    return totalSupply
}
const getPriceEthV2 = async(address: String) => {

    let uinswapV2Factory = createContract(uniswapV2FactoryABI,uniswapV2FactoryAddress)
    let pool = await uinswapV2Factory.methods.getPair(address,addressWETH).call()
    let contractToken = createContract(tokenABI,address)
    let contractWETH = createContract(tokenABI,addressWETH)
    let balanceToken = await contractToken.methods.balanceOf(pool).call()
    let balanceWETH = await contractWETH.methods.balanceOf(pool).call()
    let tokenDecimal = await contractToken.methods.decimals().call()
    let wethDecimal = await contractWETH.methods.decimals().call()

    balanceToken = balanceToken / Math.pow(10, tokenDecimal)
    balanceWETH = balanceWETH / Math.pow(10, wethDecimal) 

    let price = 1/(balanceToken/balanceWETH)
    return price
}

const getPriceUsd = async(address: String) => {
    let priceUSDC = await getPriceEthV2(addressUSDC)
    let priceToken = await getPriceEthV2(address)
    let priceTokenInUSDC = priceToken / priceUSDC
    return priceTokenInUSDC
}


const main = async()=>{
    //let tokenAdress = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"
    let tokenAdress = "0x514910771AF9Ca656af840dff83E8264EcF986CA"
    console.log(await getTokenName(tokenAdress))
    console.log(await getTokenSymbol(tokenAdress))
    console.log(await getTotalSupply(tokenAdress))
    console.log(await getPriceEthV2(tokenAdress))
    console.log(await getPriceUsd(tokenAdress))
}   


main()