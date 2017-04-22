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

export function moviePointComputed(action, rating) {
    switch (action) {
        case 'click':
            return 0.1;
        case 'comment':
            if (rating <= 4) {
                return -rating / 10;
            }
            return rating / 10;
        default:
            return 0;
    }
}

export function deleteSameAction(action, model) {
    for (let i = 0; i < action.length - 1; i += 1) {
        if (String(action[i][model]['_id']) === String(action[i + 1][model]['_id'])) {
            action.splice(i, 1);
            i -= 1;
        }
    }
    return action;
}

export function operationCategory(list1, list2, model) {
    return addRecommendFeature(list1.filter(a => true === list2.some(b => String(a[model]._id) === String(b[model]._id))));
}

export function findIntersection(list, id) {
    return addRecommendFeature(list.filter(a => String(a.post.user._id) === String(id)), 'intersection');
}

export function operation(list1, list2, model) {
    return list1.filter(a => true === list2.some(b => String(a[model]) === String(b[model])));
}

export function addRecommendFeature(list, recommend = 'recommend') {
    const arr = JSON.parse(JSON.stringify(list));
    return arr.map(item => {
        item[recommend] = true;
        return item;
    });
}