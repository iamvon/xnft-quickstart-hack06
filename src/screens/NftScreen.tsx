import { Text, FlatList, Image, Button } from "react-native";
import tw from "twrnc";

import { Screen } from "../components/Screen";
import { useEffect, useState } from "react";
import { usePublicKeys, useSolanaConnection } from "../hooks/xnft-hooks";
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Buffer } from "buffer";

export function NftScreen() {
    window.Buffer = Buffer;

    let connection = useSolanaConnection()

    async function getNftInfo() {
        const url = "https://api.shyft.to/sol/v1/nft/read?network=mainnet-beta&token_address=EX5vXEJDY3KzrrN81CZyAKXBELWUz5NzoU9EGxifdrmW"
        let resp = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": "pWKU1AHTPeN8Exco"
            }
        })
        return await resp.json()
    }

    function useNftData() {
        const [loading, setLoading] = useState(true)
        const [data, setData] = useState<any>({})

        useEffect(() => {
            async function fetch() {
                setLoading(true)
                const data = await getNftInfo()
                console.log("nftData:", data)
                setData(data)
                setLoading(false)
            }

            fetch()
        }, [])

        return { loading, data }
    }

    async function transferSol(from: any) {
        if (!connection) {
            console.log("no solana connection!")
            return
        }

        let tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(from),
                toPubkey: new PublicKey("7ZsXMgLFxb2diaU92zsrfvpoCeUBhiSZPG6tZ73LV7Zn"),
                lamports: LAMPORTS_PER_SOL
            })
        )

        let signature = await window.xnft.solana.send(tx)
        console.log("signature:", signature)
    }

    const { loading, data } = useNftData()
    let imageUri = data?.result?.image_uri
    console.log("imageUri:", imageUri)
    const pks: any = usePublicKeys()
    let pk = pks ? new PublicKey(pks?.solana) : undefined
    return (
        <Screen>
            <Image source={{ uri: imageUri }} style={tw`w-36 h-36 rounded m-4`} />
            <Text style={tw`mb-4`}>
                Your pubkeys: {pk?.toBase58()}
            </Text>
            <Button title="Transfer SOL" onPress={() => transferSol(pk)} />
        </Screen>
    );
}
