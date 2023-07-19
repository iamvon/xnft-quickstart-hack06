import { Text, Image, Button, View } from "react-native";
import tw from "twrnc";

import { Screen } from "../components/Screen";
import { useEffect, useState } from "react";
import { usePublicKeys, useSolanaConnection } from "../hooks/xnft-hooks";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Buffer } from "buffer";

export function NftScreen() {
    window.Buffer = Buffer;

    let connection = useSolanaConnection()

    async function getNftInfo() {
        const url = "https://api.shyft.to/sol/v1/nft/read?network=devnet&token_address=Ddq6ecXkGux7UrntjFtQVE6AS4Tki22a4z4C4nFZJYqp"
        let resp = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": "YOUR_SHYFT_API_KEY_HERE"
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
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Image source={{ uri: imageUri }} style={tw`w-80 h-80 alignItems: "center" rounded m-4`} />
            </View>
            <Text style={tw`mb-4`}>
                Your solana pubkey: {pk?.toBase58()}
            </Text>
            <Button title="Transfer SOL" onPress={() => transferSol(pk)} />
        </Screen>
    );
}
