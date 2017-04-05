/**
 * Created by fengyuanzemin on 17/2/22.
 */
import superAgent from 'superagent';
import {UA} from '../utils';
import Cookie from '../../config/cookie';
import request from 'request';
import fs from 'fs';
import path from 'path';
import Movie from '../../models/movie';
import cheerio from 'cheerio';

export async function douban() {
    try {
        let start = 0;
        while (start < 250) {
            await spider(start);
            start += 25;
        }
    } catch (err) {
        console.log(err);
    }
}

async function spider(start) {
    try {
        const res = await superAgent
            .get('https://movie.douban.com/top250')
            .set('User-Agent', UA[Math.floor(Math.random() % UA.length)])
            .query({start});
        const $ = cheerio.load(res.text);
        let nextArr = [];
        $('.info').each((i, elem) => {
            nextArr.push($(elem).find('.hd a').attr('href'));
        });
        for (let next of nextArr) {
            console.log(next)
            const response = await superAgent.get(next)
                .set('User-Agent', UA[Math.floor(Math.random() % UA.length)])
                .set('Cookie', Cookie)
                .set('Host', 'movie.douban.com')
                .set('Referer', 'https://movie.douban.com/top250?start=0');
            const $$ = cheerio.load(response.text);

            // 标题
            const title = $$('h1 span').not('.year').text();
            console.log(title);

            // 简介
            const hidden = $$('.all.hidden').text();
            let brief = '';
            if (hidden) {
                brief = hidden
            } else {
                brief = $$('[property="v:summary"]').text();
            }
            console.log(brief);

            // 导演
            let directors = [];

            $$('#info').children().first().find('.attrs').find('a').each((i, elem) => {
                directors.push($$(elem).text());
            });
            console.log(directors);

            // 演员
            let actors = [];
            $$('#info').find('.actor').find('.attrs').children().each((i, elem) => {
                actors.push($$(elem).text());
            });
            console.log(actors);

            // 图片
            const imgUrl = $$('#mainpic').find('img').attr('src');
            const imgName = imgUrl.split('/').pop();
            console.log(imgUrl);
            console.log(imgName);
            request(imgUrl)
                .pipe(fs.createWriteStream(path.resolve(process.cwd(), './temp/' + imgName)));

            // 标签
            let tags = [];
            $$('span[property="v:genre"]').each((i, elem) => {
                tags.push($$(elem).text());
            });
            console.log(tags);

            await new Movie({
                title,
                directors,
                actors,
                imgUrl: imgName,
                brief,
                tags
            }).save();
            // 线程挂起一会，免得被封ip
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve()
                }, Math.ceil(Math.random()) * 10 * 1000);
            });
        }
    } catch (err) {
        console.log(err);
    }
}

// 可能要写一个专门爬一般电影的
async function latest() {
    try {
        const res = await superAgent
            .get('https://movie.douban.com/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&sort=time&page_limit=100&page_start=0')
            .set('User-Agent', UA[Math.floor(Math.random() % UA.length)]);
    } catch (err) {
        console.log(err)
    }
}