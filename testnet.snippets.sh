WALLET="/home/alex/Desktop/mystuff/chain/wallets/wallet1.pem"
ADDRESS_FILE="/home/alex/Desktop/Blockchain-Powered-Voting-App/addr"  
DEPLOY_TRANSACTION=$(mxpy data load --key=deployTransaction-testnet)
PROXY=https://testnet-api.multiversx.com
PROJECT=/home/alex/Desktop/Blockchain-Powered-Voting-App/smartContract/voting/output/voting.wasm

deploy() {
    DEPLOY_RESULT=$(mxpy  contract deploy --bytecode=${PROJECT} --recall-nonce --pem=${WALLET} --gas-limit=50000000  --metadata-payable --send --proxy=${PROXY} --chain=T || return)
    echo "DEPLOY_RESULT: ${DEPLOY_RESULT}"
    echo "${DEPLOY_RESULT}" | grep -oP '(?<="contractAddress": ")[^"]+' > "${ADDRESS_FILE}"
}

ADDRESS=$(cat "${ADDRESS_FILE}")


create() {
    mxpy  contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=90000000 --function="create_vote" --arguments 0x0a 0x06 0x466163656d20637572733f  --send --proxy=${PROXY} --chain=T
}

values() {
    mxpy  contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="set_values" --arguments 0x466163656d20637572733f  --send --proxy=${PROXY} --chain=T
}

vote() {
    mxpy  contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="vote" --arguments $1 0x466163656d20637572733f --send --proxy=${PROXY} --chain=T
}

vote2() {
    mxpy  contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="vote" --arguments $1 0x466163656d20636163613f --send --proxy=${PROXY} --chain=T
}
result() {
    mxpy  contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="calculate_result"  --send --proxy=${PROXY} --chain=T
}

reset_sc() {
    mxpy  contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="reset_vote" --arguments 10 2  --send --proxy=${PROXY} --chain=T
}

add() {
    mxpy  contract call ${ADDRESS} --recall-nonce --pem=${WALLET} --gas-limit=5000000 --function="add_vip" --arguments erd1dyp83vhac9m0ketjcznhggy3xr0js0wy804f3v2p6wlcd5rpwvqs8xefvx 5 --send --proxy=${PROXY} --chain=T
}

query() {
    mxpy  contract query ${ADDRESS} --function=$1 --arguments 0x466163656d20637572733f  --proxy=${PROXY}
}
upgradeSC() {
    mxpy --verbose contract upgrade ${ADDRESS} --recall-nonce --metadata-payable \
        --bytecode=${PROJECT} \
        --pem=${WALLET} \
        --gas-limit=60000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --arguments $1 $2 \
        --send
}
