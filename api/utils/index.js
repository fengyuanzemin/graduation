/**
 * Created by fengyuanzemin on 17/2/18.
 */


export function randomKey() {
    const charSet = '0123456789abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ';
    let token = '';
    for (let i = 0; i < 32; i += 1) {
        token += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return token;
}

export function pointComputed(action) {
    switch (action) {
        case 'repost':
            return 0.8;
        case 'comment':
            return 0.7;
        case 'attitude':
            return 0.2;
        case 'click':
            return 0.1;
        default:
            return 0;
    }
}
