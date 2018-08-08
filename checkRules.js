const CSV = require('csv-parser')
const request = require("request");
const fs = require('fs');
const ProgressBar = require("./ProgressBar");
const Bar = new ProgressBar();

function draw(obj) {
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(
		`Parsing ${obj.curr} of ${obj.total}: [ ${obj.url} ] | ${obj.status || "progress"}`
	);
};


function test(params, curr, total) {
	const p = new Promise((resolve, reject)=>{
		if(!params) reject("no parameter");

		// console.log("parsing [ %s ]", params);
		console.log();
		draw({
			url: params,
			curr,
			total
		});
		let data = {
			url: params,
			rediect: [],
			response: null,
			complete: null
		};
		request
		.get(params)
		.on('response', function (response) {
			// console.log("[response]", response.statusCode) // 200
			data.response = {
				statusCode: `${response.statusCode} RES`,
				url: response.request.uri.href
			};
			resolve(data);
		})
		// .on('complete', function (res, body) {
		// 	// console.log("[complete]", res.statusCode)
		// 	data.complete = {
		// 		statusCode: `${res.statusCode} COM`,
		// 		url: res.request.uri.href
		// 	};
		// 	resolve(data);
		// })
		// .on('redirect', function (res) {
		// 	//console.log("====================");
		// 	//console.log( this.response)
		// 	data.rediect.push({
		// 		url: this.response.request.uri.href,
		// 		statusCode: `${this.response.statusCode} RED`
		// 	});
		// })
	});

	return p;
}

/* (async function () {
	fs.createReadStream('checkredirections.csv')
		.pipe(CSV({
			raw: false,     // do not decode to utf-8 strings
			separator: ',', // specify optional cell separator
			quote: '"',     // specify optional quote character
			escape: '"',    // specify optional escape character (defaults to quote value)
			newline: '\n',  // specify a newline character
			headers: ["rules"]
		}))
		.on('data', async function (data) {
			if (data.rules){
				const parseData = await test(data.rules);
				let csvstr;
				csvstr = parseData.url;
				if (parseData.rediect.length > 0) {
					for (let key in parseData.rediect) {
						csvstr += `, ${parseData.rediect[key].url} [${parseData.rediect[key].statusCode}]`;
					}
				}
				csvstr += `, ${parseData.complete.url} [${parseData.complete.statusCode}]\r\n\n`;
				fs.appendFileSync("report.csv",csvstr, 'utf8');
			}
		})
})(); */

debugger;
(function () {
	fs.existsSync('report.csv') && fs.unlinkSync('report.csv');
	fs.readFile('./checkredirections.csv', 'utf-8', async (err, result) => {

		if(err) throw err;

		const lines = result.split("\n");
		let ind = 0;
		for(let url of lines) {
			ind ++;
			const parseData = await test(url, ind, lines.length );
			//console.log(parseData);
			let csvstr;
			csvstr = parseData.url;
			// if (parseData.rediect.length > 0) {
			// 	for (let key in parseData.rediect) {
			// 		csvstr += `, ${parseData.rediect[key].url} [${parseData.rediect[key].statusCode}]`;
			// 	}
			// }
			csvstr += `, ${parseData.response.url} , [${parseData.response.statusCode}]\r\n`;
			fs.appendFileSync("report.csv", csvstr, 'utf8');
			draw({
				url : parseData.response.url,
				status: parseData.response.statusCode,
				curr: ind,
				total: lines.length
			});
		}
	})
})();
