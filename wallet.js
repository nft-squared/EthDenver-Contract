const decrypt = (keystoreObj, password) => {
    const wallet = Wallet.fromEncryptedJsonSync(keystoreObj, password);
    return wallet.privateKey;
}

const encrypt = async(privateKey, password, save) => {
    if(password.length < 6) throw "passwd too short";
    const wallet = new Wallet(privateKey);
    const keystoreStr = await wallet.encrypt(password);
    save && fs.writeFileSync(`./${wallet.address.slice(2).toLowerCase()}.keystore.json`, keystoreStr)
    return JSON.parse(keystoreStr);
}

module.exports = {
    FromKeystore: (keystoreObj, password) => decrypt(keystoreObj, password),
    ToKeystore: (privateKey, password, save=true) => encrypt(privateKey, password, save)
}

