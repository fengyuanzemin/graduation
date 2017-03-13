/**
 * Created by fengyuanzemin on 17/3/13.
 */
import Weight from '../models/weight';
import Action from '../models/action';
import Post from '../models/post';
import User from '../models/user';

// function getWeight() {
//
// }
//
// function getInterAction() {
//
// }
//
// function getCoupling() {
//
// }
//
// function getSimilar() {
//
// }

// export default function similar() {
//
// }

export async function calculateSimilar() {
    const result = {};

    // 计算Weight
    /*
     * 权值：
     * 点赞 0.2
     * 转发 0.8
     * 查看 0.1
     * 评论 0.7
     */
    // let user, weight, action;
    // 找到所有的用户
    try {
        result.user = await User.find({});
        result.weight = await Weight.findOne().sort('weight');
        result.action = await Action.find({});
    } catch (err) {
        console.log(err)
    }
    return result;
    // User.find().then(user => {
    //     result.user = user;
    //     // 找到最大值
    //     return Weight.findOne().sort('weight');
    // }).then(weight => {
    //     result.maxWeight = weight || 1;
    //     // 找到用户所有的行为
    //     return Action.find();
    // }).then(action => {
    //     result.action = action;
    //     // console.log(result)
    //     return Promise.resolve();
    // });
    // 计算InterAction

    // 计算Coupling

    // 计算Similar

}
