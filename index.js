const CSV = require('csv-parser')
const fs = require('fs');
const path = require('path');
const URL = require('url');


const OUTPUT_DIR = 'outputs';
const INPUT_DIR = 'inputs';
const INPUT_FILE = 'devcenter';

!fs.existsSync(path.resolve(__dirname, 'inputs')) && fs.mkdirSync('inputs');
!fs.existsSync(path.resolve(__dirname, 'outputs')) && fs.mkdirSync('outputs');


const construnctRules = (rule, isExtension=false) => {
	const ruleObj = URL.parse(rule);
	let reqPath = ruleObj.path || rule;

	if (!isExtension && reqPath.indexOf(".html") > -1) {
		reqPath = reqPath.replace(".html", `[\\.html]?$`);
	}

	return reqPath;
};

const template = (oldRule, newRule) => {
	oldRule = construnctRules(oldRule);
	const flags = (newRule.indexOf('#') > -1) ? '[R=301,NC,NE,L]' : '[R=301,NC,L]';
	return `RewriteRule ^${oldRule} ${newRule} ${flags}\r\n`
};




fs.createReadStream(`${INPUT_DIR}/${INPUT_FILE}.csv`)
	.pipe(CSV())
	.on('data', function (data) {
		if(data.OldURL && data.NewURL)
			fs.appendFileSync(`${OUTPUT_DIR}/${INPUT_FILE}-rewrite-rules.conf`, template(data.OldURL, data.NewURL), 'utf8')
		else
			fs.appendFileSync(`${OUTPUT_DIR}/${INPUT_FILE}-rewrite-rules.conf`, `############ ${data.OldURL ? data.OldURL : "END of rules"} #############\n\n\n`, 'utf8')

	})
