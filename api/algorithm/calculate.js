/**
 * Created by fengyuanzemin on 2017/3/14.
 */
import Weight from '../models/weight';
import Action from '../models/action';
import User from '../models/user';
import Post from '../models/post';
import Similar from '../models/similar';
import RelationShip from '../models/relationship';

export default async function similar(token) {
    try {
        let recommend = [];
        // 查找是谁的推荐人
        let user = await User.findOne({token});
        if (user) {
            let recommendFollow = [];
            let sim = await Similar.find({$or: [{userA: user._id}, {userB: user._id}]})
                .sort('-similar');
            for (let s of sim) {
                let re = await RelationShip.findOne({
                    $or: [{
                        follower: user._id,
                        following: s.userA
                    }, {
                        follower: user._id,
                        following: s.userB
                    }]
                });
                // 没有关注过
                if (!re) {
                    recommendFollow.push(s);
                }
            }
            for (let i of recommendFollow) {
                let id = String(i.userA) === String(user._id) ? i.userB : i.userA;
                let follow = await User.findOne({_id: id},'name brief');
                let parseFollow = JSON.parse(JSON.stringify(follow));
                parseFollow.follow = false;
                recommend.push(parseFollow);
            }
        } else {
            new Error('没有这个用户');
        }
        return recommend;
    } catch (err) {
        console.log(err)
    }
}

export async function calculateSimilar() {
    try {
        /*
         * 第一步：
         *
         * 计算Weight
         * 权值：
         * 点赞 0.2
         * 转发 0.8
         * 查看 0.1
         * 评论 0.7
         */
        // 将Weight清空
        await Weight.remove({});
        // 将Similar清空
        await Similar.remove({});
        // 找到所有的用户
        let user = await User.find({});
        // 将用户id放入数组里
        let userId = user.map(item => item._id);
        // 每次循环代表不同的用户
        for (let item of userId) {
            // 找到用户所有的行为
            // 将相同postID的生成一个weight
            let action = await Action.find({user: item}).sort('post');
            // 每次循环代表不同的用户行为
            for (let j = 0; j < action.length; j += 1) {
                let flag = 0;
                let postId = '';
                let actionSum = 0;
                for (let i = j; i < action.length; i += 1) {
                    if (!flag) {
                        postId = action[i].post;
                        switch (action[i].action) {
                            case 'repost':
                                actionSum += 0.8;
                                break;
                            case 'comment':
                                actionSum += 0.7;
                                break;
                            case 'attitude':
                                actionSum += 0.2;
                                break;
                            case 'click':
                                actionSum += 0.1;
                                break;
                            default:
                                break;
                        }
                        flag += 1;
                    } else if (String(action[i].post) === String(postId)) {
                        switch (action[i].action) {
                            case 'repost':
                                actionSum += 0.8;
                                break;
                            case 'comment':
                                actionSum += 0.7;
                                break;
                            case 'attitude':
                                actionSum += 0.2;
                                break;
                            case 'click':
                                actionSum += 0.1;
                                break;
                            default:
                                break;
                        }
                        j = i;
                    }
                    // 循环到最后面就存进weight
                    if (i === action.length - 1) {
                        await new Weight({
                            user: item,
                            post: postId,
                            maxSum: actionSum
                        }).save();
                    }
                }
            }
        }
        // 找到最大值
        let weightMax = await Weight.findOne({}).sort('-maxSum');
        let weightArr = await Weight.find({});
        for (let i of weightArr) {
            await Weight.update({_id: i._id}, {point: i.maxSum / weightMax.maxSum})
        }

        /*
         * 第二步：
         *
         * 计算InterAction
         *
         */
        weightArr = await Weight.find({}).sort('user').populate('post');
        for (let i = 0; i < weightArr.length; i += 1) {
            // A -> B
            let tempA = '', tempB = '', tempSumA = 0, countA = 0;
            // B -> A
            let tempSumB = 0, countB = 0;
            for (let j = i; j < weightArr.length; j += 1) {
                // 计算A对B的直接交互度，A、B不能相等
                if (String(weightArr[j].user) !== String(weightArr[j].post.user)) {
                    if (!countA) {
                        tempA = weightArr[j].user;
                        tempB = weightArr[j].post.user;
                        tempSumA += weightArr[j].point;
                        countA += 1;
                        i = j;
                    } else if (String(weightArr[j].user) === String(tempA) &&
                        String(weightArr[j].post.user) === String(tempB)) {
                        tempSumA += weightArr[j].point;
                        i = j;
                        countA += 1;
                    }
                }
            }
            for (let k = i + 1; k < weightArr.length; k += 1) {
                // 计算B对A的直接交互度，A、B不能相等
                if (String(weightArr[k].user) !== String(weightArr[k].post.user) &&
                    String(weightArr[k].user) === String(tempB) &&
                    String(weightArr[k].post.user) === String(tempA)) {
                    tempSumB += weightArr[k].point;
                    countB += 1;
                    weightArr.splice(k--, 1)
                }
            }
            if (countA || countB) {
                await new Similar({
                    userA: tempA,
                    userB: tempB,
                    interAction: (tempSumA + tempSumB) / (countA + countB)
                }).save();
            }
        }

        /*
         * 第三步：
         *
         * 计算Coupling
         *
         */
        weightArr = await Weight.find({}).sort('user');
        let combination = [];
        let combinationUser = '';
        for (let i = 0; i < weightArr.length - 1; i += 1) {
            if (!i) {
                combinationUser = weightArr[i].user;
                if (String(weightArr[i].user) !== String(weightArr[i + 1].user)) {
                    combination.push(weightArr.splice(0, i + 1))
                    i = -1;
                }
            } else if (String(weightArr[i].user) !== String(weightArr[i + 1].user) &&
                String(weightArr[i].user) === String(weightArr[i - 1].user)) {
                combination.push(weightArr.splice(0, i + 1));
                i = -1;
            }
        }
        combination.push(weightArr);
        // 求交集
        for (let i = 0; i < combination.length; i += 1) {
            for (let j = i + 1; j < combination.length; j += 1) {
                let intersectionA = operation(combination[i], combination[j]);
                let intersectionB = operation(combination[j], combination[i]);
                if (intersectionA.length > 0) {
                    let interactionSum = 0;
                    let interactionSumA = 0;
                    let interactionSumB = 0;
                    let interactionMax = 0;
                    for (let m = 0; m < intersectionA.length; m += 1) {
                        interactionSum += intersectionA[m].point > intersectionB[m].point ? intersectionB[m].point : intersectionA[m].point;
                        interactionSumA += intersectionA[m].point;
                        interactionSumB += intersectionB[m].point;
                    }
                    interactionMax = interactionSumA > interactionSumB ? interactionSumA : interactionSumB;
                    // 查找是否存在Similar
                    const s = await Similar.findOne({
                        $or: [{
                            userA: intersectionA[0].user,
                            userB: intersectionB[0].user
                        }, {
                            userA: intersectionB[0].user,
                            userB: intersectionA[0].user
                        }]
                    });
                    if (s) {
                        await Similar.update({
                            $or: [{
                                userA: s.userA,
                                userB: s.userB
                            }, {
                                userA: s.userB,
                                userB: s.userA
                            }]
                        }, {
                            coupling: interactionSum / interactionMax
                        })
                    } else {
                        await new Similar({
                            userA: intersectionA[0].user,
                            userB: intersectionB[0].user,
                            coupling: interactionSum / interactionMax
                        })
                    }
                }
            }
        }

        /*
         * 第四步：
         *
         * 计算Similar
         *
         */
        let sim = await Similar.find({});
        for (let si of sim) {
            await Similar.update({
                userA: si.userA,
                userB: si.userB
            }, {
                similar: 0.7 * si.interAction + 0.3 * si.coupling
            })
        }
    } catch (err) {
        console.log(err)
    }
}

// 计算combination值的
function operation(list1, list2) {
    return list1.filter(a => true === list2.some(b => String(a.post) === String(b.post)));
}
