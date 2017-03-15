/**
 * Created by fengyuanzemin on 2017/3/14.
 */
import Weight from '../models/weight';
import Action from '../models/action';
import User from '../models/user';
import Post from '../models/post';
import Similar from '../models/similar';

// export default function similar() {
//
// }

export async function calculateSimilar() {
    let action = [];
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
        // 找到所有的用户
        let user = await User.find({});
        // 将用户id放入数组里
        let userId = user.map(item => item._id);
        // 每次循环代表不同的用户
        for (let item of userId) {
            // 找到用户所有的行为
            // 将相同postID的生成一个weight
            action = await Action.find({user: item}).sort('post');
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
                        new Weight({
                            user: item,
                            post: postId,
                            maxSum: actionSum
                        }).save();
                    }
                }
            }
        }
        // 找到最大值
        let weight = await Weight.findOne({}).sort({'maxSum': -1});

        let weightArr = await Weight.find();

        if (weight) {
            let maxPoint = weight.maxSum;
            for (let i of weightArr) {
                await Weight.update({_id: i._id}, {point: i.maxSum / maxPoint})
            }
        }

        /*
         * 第二步：
         *
         * 计算InterAction
         *
         */
        // weightArr = await Weight.find({}).populate('post');
        // // console.log(weightArr)
        // for (let i = 0; i < weightArr.length; i += 1) {
        //     let tempA = '', tempB = '', flag = 1, tempSum = 0;
        //     for (let j = i; j < weightArr.length; j += 1) {
        //         // 计算A和B的直接交互度，A不能是B
        //         if (weightArr[j].post && weightArr[j] &&
        //             String(weightArr[j].user) !== String(weightArr[j].post.user)) {
        //             if (flag) {
        //                 tempA = weightArr[j].user;
        //                 tempB = weightArr[j].post.user;
        //                 flag = 0;
        //                 tempSum += weightArr[j].point;
        //                 // console.log(tempSum)
        //             } else if (String(weightArr[j].user) === String(tempA) &&
        //                 String(weightArr[j].post.user) == String(tempB)) {
        //                 tempSum += weightArr[j].point;
        //                 i = j;
        //                 // console.log(tempSum)
        //             }
        //         }
        //         // if (j === weightArr.length - 1) {
        //         //     // console.log(j)
        //         //     new Similar({
        //         //         userA: tempA,
        //         //         userB: tempB,
        //         //         interAction: tempSum
        //         //     }).save();
        //         // }
        //     }
        //     // console.log(tempSum)
        // }


        /*
         * 第三步：
         *
         * 计算Coupling
         *
         */

        /*
         * 第四步：
         *
         * 计算Similar
         *
         */

        return action;
    } catch (err) {
        console.log(err)
    }


}
