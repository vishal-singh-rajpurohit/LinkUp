export async function fetchEmoji() {
    const api_key = process.env.EMOJI_API_KEY
    try {
        const resp = await axios.get(`https://emoji-api.com/emojis?access_key=${api_key}`)
        console.log(resp);
    } catch (error) {
        console.log('error while getting emoji');
    }
    return ""
}