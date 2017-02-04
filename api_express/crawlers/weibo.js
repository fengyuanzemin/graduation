const http = require("http");
const cheerio = require("cheerio");

// Utility function that downloads a URL and invokes
// callback with the data.
function download(url, callback) {
    http.get(url, (res) => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
            // console.log(chunk)
        });
        res.on("end", () => {
            callback(data);
        });
    }).on("error", function () {
        callback(new Error('ddd'));
    });
}
download('http://www.weibo.com/u/2616609787', (data) => {
    if (data) {
        console.log(data)
        // const $ = cheerio.load(data);
        // $("html").each((i, e) => {
        //     console.log(e);
        // });

        console.log("done");
    } else {
        console.log("no data");
    }
});