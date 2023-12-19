WALLET="/home/alex/Desktop/mystuff/chain/wallets/wallet1.pem"
ADDRESS_FILE="/home/alex/Desktop/Blockchain-Powered-Voting-App/addr"  # Specificați calea completă către fișierul de salvare a adresei
DEPLOY_TRANSACTION=$(mxpy data load --key=deployTransaction-testnet)
PROXY=https://testnet-api.multiversx.com
PROJECT=/home/alex/Desktop/Blockchain-Powered-Voting-App/smartContract/voting/output/voting.wasm

deploy() {
    DEPLOY_RESULT=$(mxpy --verbose contract deploy --bytecode=${PROJECT} --recall-nonce --pem=${WALLET} --gas-limit=50000000 --arguments 3 4 --metadata-payable --send --proxy=${PROXY} --chain=T || return)
    echo "DEPLOY_RESULT: ${DEPLOY_RESULT}"
    echo "${DEPLOY_RESULT}" | grep -oP '(?<="contractAddress": ")[^"]+' > "${ADDRESS_FILE}"
}

ADDRESS=$(cat "${ADDRESS_FILE}")



values() {
    mxpy --verbose contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="set_values"  --send --proxy=${PROXY} --chain=T
}

discount() {
    mxpy --verbose contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="register_discount" --value=1 --arguments 120 --send --proxy=${PROXY} --chain=T
}

query() {
    mxpy --verbose contract query ${ADDRESS} --function=$1 --proxy=${PROXY}
}
upgradeSC() {
    mxpy --verbose contract upgrade ${ADDRESS} --recall-nonce --metadata-payable \
        --bytecode=${PROJECT} \
        --pem=${WALLET} \
        --gas-limit=60000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --arguments $1 $2 $3 $4 \
        --send
}
