const csvParser = require('csv-parser')
const fs = require('fs');
const path = require('path');
const url = require('url');


const OUTPUT_DIR = 'outputs';
const INPUT_DIR = 'inputs';
const INPUT_FILE = 'rules';
const OUTPUT_FILE = `${OUTPUT_DIR}/${INPUT_FILE}-rewrite-rules.conf`;

!fs.existsSync(path.resolve(__dirname, 'inputs')) && fs.mkdirSync('inputs');
!fs.existsSync(path.resolve(__dirname, 'outputs')) && fs.mkdirSync('outputs');
fs.existsSync(path.resolve(__dirname, OUTPUT_FILE)) && fs.unlinkSync(OUTPUT_FILE);


const construnctRules = (rule) => {
	const ruleObj = url.parse(rule);
	let reqPath = ruleObj.path || rule;

	if(reqPath.indexOf("?") > -1){
		reqPath = reqPath.replace("?", '\\?');
	}

	if(reqPath.indexOf(".html") === -1 && reqPath.indexOf("?") === -1) {
		if(reqPath.endsWith('/')){
			reqPath =`${reqPath}?$`;
		} else {
			reqPath =`${reqPath}/?$`
		}
	}

	if (!ruleObj.query && reqPath.indexOf(".html") > -1) {
		reqPath = reqPath.replace(".html", `[\\.html]?$`);
	} else if(ruleObj.query && reqPath.indexOf(".html") > -1) {
		reqPath = reqPath.replace(".html", `[\\.html]\\?${ruleObj.query}`);
	}

	return reqPath;
};

const template = (oldRule, newRule) => {
	oldRule = construnctRules(oldRule);
	const flags = (newRule.indexOf('#') > -1) ? '[R=301,NC,NE,L]' : '[R=301,NC,L]';
	return `RewriteRule ^${oldRule} ${newRule} ${flags}\r\n`
};


const initialTemplate = `
RewriteEngine On

RewriteRule /dev$ /dev/ [R=301,NC,L]
RewriteRule ^/chart-attributes/ /dev/chart-attributes/ [R=301,NC,QSA]
`;


const endTemplate = `
## removing .html extensions
RewriteRule ^/dev/(.*)\.html /dev/$1 [R=301,NC,L]
`;


// fs.writeFileSync(`OUTPUT_FILE,  initialTemplate, 'utf8',);


fs.createReadStream(`${INPUT_DIR}/${INPUT_FILE}.csv`)
	.pipe(csvParser({
		headers: false,
	}))
	.on('data', function (data) {
		if(data['0'] && data['1'])
			fs.appendFileSync(OUTPUT_FILE, template(data[0], data[1]), 'utf8')
	})
	.on('end', function() {
		// fs.appendFileSync(OUTPUT_FILE,  endTemplate, 'utf-8');
	});

