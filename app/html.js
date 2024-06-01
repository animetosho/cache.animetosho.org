"use strict";

module.exports = {
	escape: (s) => {
		return (s+'').replace(/[<>&"]/g, (m) => {
			switch(m) {
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '&': return '&amp;';
				case '"': return '&quot;';
			}
		}).replace(/  /g, ' &nbsp;');
	},
	datefmt: (dt) => dt.toISOString().replace('T', ' ').replace(/\..+$/,'') + ' UTC',
	datetime: (dt) => `<time datetime="${dt.toISOString()}">${module.exports.datefmt(dt)}</time>`,
	size: (sz) => {
		const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
		let ss = Number(sz);
		let i;
		for(i=0; i<units.length; i++) {
			if(ss < 10000) break;
			ss /= 1024;
		}
		return `<span class="size" title="${sz.toLocaleString()} ${module.exports.tr('bytes')}"><span class="number">${(Math.round(ss*100)/100)}</span> ${units[i]}</span>`;
	},
	num: (n) => `<span class="number">${n.toLocaleString()}</span>`,
	tr: (s, ...args) => {
		if(!args.length) return s;
		let i = 0;
		return s.replace(/\{\}/g, m => args[i++]);
	}
};
