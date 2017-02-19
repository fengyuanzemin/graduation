/**
 * Created by fengyuanzemin on 17/2/18.
 */


export function randomKey() {
    const charSet = '0123456789abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ';
    let token = '';
    for (let i = 0; i < 32; i += 1) {
        token += charSet.charAt(Math.floor(Math.random()*charSet.length));
    }
    return token;
}
