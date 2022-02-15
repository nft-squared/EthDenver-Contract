const {Wallet} = require('ethers')
const decrypt = (keystoreObj, password) => {
    const wallet = Wallet.fromEncryptedJsonSync(keystoreObj, password);
    return wallet.privateKey;
}

const encrypt = async(privateKey, password) => {
    if(password.length < 6) throw "passwd too short";
    const wallet = new Wallet(privateKey);
    return wallet.encrypt(password); // json string
}

module.exports = {
    FromKeystore: (keystoreObj, password) => decrypt(keystoreObj, password),
    ToKeystore: (privateKey, password) => encrypt(privateKey, password)
}

