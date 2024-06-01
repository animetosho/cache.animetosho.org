"use strict";

const html = require('./html');
const markdown = require('markdown-it')({html:false,breaks:true,linkify:true,typographer:true});

// markdown rules copied from Nyaa [https://nyaa.si/static/js/main.js]
const mdDefaultRender = markdown.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
	tokens[idx].attrPush(['rel', 'noopener noreferrer']);
	return mdDefaultRender(tokens, idx, options, env, self);
};

// Override the image rule.
function getPhotonURL(inURL) {
	// Basic hash to distribute out to the Photon servers.
	let hash = 0;
	for (let i = 0; i < inURL.length; i++) {
		const char = inURL.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash &= hash;
	}

	const urlWhitelist = ['discord.com', 'discordapp.com', 'discordapp.net', 'google.com', 'googleusercontent.com', 'gstatic.com', 'imgur.com', 'naver.net', 'nocookie.net', 'redd.it', 'twimg.com', 'wordpress.com', 'weserv.nl', 'wp.com', 'wsrv.nl'];
	
	let urlObj;
	try {
		urlObj = new URL(inURL);
	} catch(ex) {
		return '';
	}

	// Get host.
	var urlHost = urlObj.hostname.split('.').slice(-2).join('.');

	let photonURL;
	// Check if host is on the WP whitelist, or is a data URI.
	if (urlWhitelist.includes(urlHost) || urlObj.protocol == 'data:') {
		// Whitelisted URLs get passed through.
		photonURL = inURL;
	} else if (urlObj.username || urlObj.password || urlObj.port || (urlObj.search && !urlObj.search.match(/^\?\d*$/))) {
		// URL would break with Photon. Use wsrv.nl instead.
		// The regex check above is to ignore "cachebuster" query strings.
		// The &n=-1 below is to enable support for animated images.
		photonURL = 'https://wsrv.nl/?url=' + encodeURIComponent(inURL) + '&n=-1';
	} else {
		// Get URL into format expected by Photon.
		photonURL = 'https://i' + (Math.abs(hash) % 3) + '.wp.com/' + urlObj.host + urlObj.pathname;

		// Set SSL where applicable.
		if (urlObj.protocol == 'https:') {
			photonURL += '?ssl=1';
		}
	}

	return photonURL;
}
const mdDefaultImageRender = markdown.renderer.rules.image || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
	// Get the current token.
	let token = tokens[idx];
	let aIndex = token.attrIndex('src');

	// Get the current image URL.
	const imageURL = (aIndex < 0) ? null : token.attrs[aIndex][1];

	// Replace image URL if found.
	if (imageURL) {
		token.attrs[aIndex][1] = getPhotonURL(imageURL);
	}

	// Pass token to default renderer.
	return mdDefaultImageRender(tokens, idx, options, env, self);
};

const cat_map = [null,
	['Anime',       'Anime Music Video', 'English-translated', 'Non-English-translated', 'Raw'],
	['Audio',       'Lossless', 'Lossy'],
	['Literature',  'English-translated', 'Non-English-translated', 'Raw'],
	['Live Action', 'English-translated', 'Idol/Promotional Video', 'Non-English-translated', 'Raw'],
	['Pictures',    'Graphics', 'Photos'],
	['Software',    'Applications', 'Games']
];
const cats_map = [null,
	['Art',         'Anime', 'Doujinshi', 'Games', 'Manga', 'Pictures'],
	['Real Life',   'Photobooks / Pictures', 'Videos']
];
const nyaasi_flags = {
	anonymous:      1<<0,
	hidden:         1<<1,
	trusted:        1<<2,
	remake:         1<<3,
	complete:       1<<4,
	deleted:        1<<5,
	banned:         1<<6,
	comment_locked: 1<<7
};


const assetStyleSlug = '?t=' + require('fs').statSync('./www/style.css').mtimeMs;
const page_html = (title, body, head, is_sukebei) => {
	const site_name = 'Nyaa.si ' + (is_sukebei?'Sukebei ':'') + 'Cache';
	return `<!doctype html><html lang="en-US">
	<head>
		<meta charset="utf-8"/>
		<meta name="viewport" content="width=device-width,initial-scale=1"/>
		<meta name="robots" content="noindex"/>
		<link rel="icon" type="image/png" href="/nyaasi-favicon.png"/>
		<link rel="stylesheet" type="text/css" href="/style.css${assetStyleSlug}"/>
		<title>${html.escape(title)} &mdash; ${site_name}</title>
		${head}
	</head><body>
		<header>
			<span id="header_left"><a href="https://animetosho.org/">Anime Tosho</a> &raquo; <a href="/nyaasi${is_sukebei ? '-sukebei':''}/">${site_name}</a></span>
			<a id="header_right" href="https://github.com/animetosho/cache.animetosho.org">
				<svg id="gh_icon" viewbox="0 0 98 96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>
			</a>
		</header>
		<main>${body}</main>
	</body>
	</html>`;
};
const user_level_to_class = (level) => {
	if(level === null) return 'user_anonymous';
	switch(level) {
		case 0: return 'user_regular';
		case 1: return 'user_trusted';
		case 2: return 'user_mod';
		case 3: return 'user_admin';
		case -1: return 'user_banned';
	}
	return '';
};


module.exports = {
	_index: async (m, req, resp) => {
		const is_sukebei = !!m[1];
		
		resp.setHeader('Content-Type', 'text/html; charset=utf-8');
		resp.setHeader('Cache-Control', 'max-age=86400, public, immutable');
		resp.setHeader('Content-Security-Policy', 'default-src \'none\'; style-src \'self\'');
		resp.writeHead(200);
		resp.end(page_html('About Nyaa.si Cache', `
			<h1>About Nyaa.si Cache</h1>
			<p>This is a browser for content cached from Nyaa.si. In most cases, you're better off <a href="https://${is_sukebei ? 'sukebei.':''}nyaa.si/">visiting the original website</a>, however this cache is provided should it be useful for special cases.</p>
			<form action="/nyaasi${is_sukebei ? '-sukebei':''}/view/">
				<p>You can view a cached entry by specifying an ID here:
					<input type="number" name="id" size="10"/> <input type="submit" value="Go"/>
				</p>
			</form>
			<p>Note: this cache only holds data since Nyaa.si's inception (2017-05-12); please use another archive if you wish to access data originally from the now defunct NyaaTorrents/Nyaa.se.</p>
		`, '', is_sukebei));
	},
	view: async (m, req, resp) => {
		try {
			const id = m[2]|0;
			const is_sukebei = !!m[1];
			const if_sukebei = is_sukebei ? (s => s) : (s => '');
			const prefix = 'nyaasi' + if_sukebei('s');
			
			resp.setHeader('Content-Type', 'text/html; charset=utf-8');
			resp.setHeader('Cache-Control', 'max-age=7200, public, immutable');
			resp.setHeader('Content-Security-Policy', 'default-src \'none\'; img-src https:; style-src \'self\'');
			resp.setHeader('Referrer-Policy', 'no-referrer');
			
			const htmlHead = '<link rel="canonical" href="https://cache.animetosho.org/nyaasi'+if_sukebei('-sukebei')+'/view/'+id+'"/>';
			
			if(id < (is_sukebei ? 2303964 : 923009)) {
				resp.writeHead(404);
				resp.end(page_html('[Not found]', '<h2>Specified ID not found</h2><p>This cache does not contain data before Nyaa.si\'s inception (2017-05-12). Please use another archive for data sourced from NyaaTorrents/Nyaa.se (defunct since 2017-05-02)</p>', htmlHead, is_sukebei));
				return;
			}
			
			// query DB for data
			let dbc, data;
			try {
				dbc = await db.getConnection();
				data = await Promise.all([
					[`SELECT t.*, u.level FROM ${prefix}_torrents t
						LEFT JOIN nyaasi_users u ON t.uploader_name=u.name
						WHERE t.id=?`, id],
					[`SELECT c.id, c.created_time, c.edited_time, c.text, c.username, u.level, u.ava_stamp FROM ${prefix}_torrent_comments c
						LEFT JOIN nyaasi_users u ON c.username=u.name
						WHERE c.torrent_id=? ORDER BY c.id ASC`, id]
				].map(q => dbc.execute(...q)));
			} finally {
				if(dbc) dbc.release();
				dbc = null;
			}
			
			if(!data[0].length) {
				resp.writeHead(404);
				resp.end(page_html('[Not found]', '<h2>Specified ID not found</h2>', htmlHead, is_sukebei));
				return;
			}
			
			const entry = data[0][0];
			
			// generate page output
			let cat_name = html.tr('Unknown ({})', entry.main_category_id),
				subcat_name = html.tr('Unknown ({})', entry.sub_category_id);
			const cmap = is_sukebei ? cats_map : cat_map;
			if(entry.main_category_id && entry.main_category_id < cmap.length) {
				const cat = cmap[entry.main_category_id];
				cat_name = html.tr(cat[0]);
				if(entry.sub_category_id && entry.sub_category_id < cat.length) {
					subcat_name = html.tr(cat[entry.sub_category_id]);
				}
			}
			const comments = data[1].map((cmt) => {
				let edit_text = '';
				if(cmt.edited_time) {
					const ed_dt = new Date(cmt.edited_time * 1000);
					edit_text = ` <span title="${html.tr('Last edited on {}', html.datefmt(ed_dt))}" class="comment_edit_tag">&#128393;</span>`;
				}
				let extra_class = ' ' + user_level_to_class(cmt.level);
				if(cmt.username == entry.uploader_name) extra_class += ' user_submitter';
				const cmt_date = `<span class="comment_date"><a href="#com-${cmt.id}">${html.datetime(new Date(cmt.created_time*1000))}</a>${edit_text}</span>`;
				const cmt_user = `<span class="comment_username">${html.escape(cmt.username)}</span>`;
				let cmt_ava = '';
				if(cmt.ava_stamp) {
					const ava_buf = Buffer.allocUnsafe(4);
					ava_buf.writeUint32BE(cmt.ava_stamp);
					const ava_slug = ava_buf.toString('base64').replace(/[+\/=]/g, m=>({'+':'-','/':'_','=':''}[m[0]]));
					cmt_ava = `<div class="user_avatar"><img src="${html.escape(getPhotonURL('https://nyaa.si/user/'+encodeURIComponent(cmt.username)+'/avatar-'+ava_slug))}" loading="lazy"/></div>`;
				}
				return `<tr id="com-${cmt.id}" class="comment_container${extra_class}">
					<th class="comment_info_wide">${cmt_date}${cmt_user}${cmt_ava}</th>
					<td class="comment_content">
						<div class="comment_info_narrow">${cmt_ava}${cmt_date} &mdash; ${cmt_user}</div>
						<div><div class="md_content">${markdown.render(cmt.text)}</div></div>
					</td>
				</tr>`;
			});
			const torrent_url = 'https://storage.animetosho.org/' + prefix + '_archive/' + id.toString(16).padStart(8, '0') + '/' + encodeURIComponent(entry.torrent_name) + '.torrent';
			const info_hash = entry.info_hash.toString('hex');
			let information = html.escape(entry.information);
			let info_match;
			if(/^https?:\/\//i.test(information)) {
				information = `<a href="${information}" rel="noopener noreferrer">${information}</a>`;
			} else if(info_match = information.match(/^#([a-zA-Z0-9-_]+)@([a-zA-Z0-9-_.:]+)$/)) {
				information = `<a href="irc://${info_match[1]}/${info_match[0]}">${information}</a>`;
			} else if(!information) {
				information = '&nbsp;';
			}
			const description = entry.description ? `<div id="entry_description" class="border md_content">${markdown.render(entry.description)}</div>` : '';
			const flags = ['deleted','hidden','trusted','remake']
				.map(f => ((entry.flags & nyaasi_flags[f]) ? `<span class="entry_flag_${f}">${html.tr(f)}</span>` : ''))
				.join('');
			const output = `
				<h1 id="entry_title">${html.escape(entry.display_name)}</h1>
				<div id="entry_flags">${flags}</div>
				<dl id="entry_properties">
					<div id="entry_properties_left">
						<dt class="entry_date">${html.tr('Date')}</dt>
						<dd class="entry_date">${html.datetime(new Date(entry.created_time * 1000))}</dd>
						
						<dt class="entry_submitter">${html.tr('Submitter')}</dt>
						<dd class="entry_submitter ${user_level_to_class(entry.level)}">${html.escape(entry.uploader_name+'') || 'Anonymous'}</dd>
						
						<dt class="entry_category">${html.tr('Category')}</dt>
						<dd class="entry_category">${cat_name} &ndash; ${subcat_name}</dd>
						
						<dt class="entry_size">${html.tr('Size')}</dt>
						<dd class="entry_size">${html.size(entry.filesize)}</dd>
					</div><div id="entry_properties_right">
						<dt class="entry_updated">${html.tr('Cached at')}</dt>
						<dd class="entry_updated">${html.datetime(new Date(entry.updated_time * 1000))}</dd>
						
						<dt class="entry_information">${html.tr('Information')}</dt>
						<dd class="entry_information">${information}</dd>
						
						<dt class="entry_id">${html.tr('ID')}</dt>
						<dd class="entry_id"><a href="https://${if_sukebei('sukebei.')}nyaa.si/view/${id}">${id}</a></dd>
						
						<dt class="entry_infohash" title="${html.tr('SHA1 info hash for BTv1, hex encoded')}">${html.tr('Info hash')}</dt>
						<dd class="entry_infohash"><code>${info_hash}</code></dd>
					</div>
				</dl>
				
				<ul id="entry_links">
					<li><a href="${torrent_url}">&#128196; ${html.tr('Download Torrent')}</a></li><li><a href="magnet:?xt=urn:btih:${info_hash}&dn=${encodeURIComponent(entry.torrent_name)}&tr=http%3A%2F%2F${is_sukebei?'sukebei':'nyaa'}.tracker.wf%3A7777%2Fannounce">&#129522; ${html.tr('Magnet')}</a></li>
				</ul>
				${description}
				
				<section id="entry_comments">
					<h2>Comments (${html.num(comments.length)})${entry.flags & nyaasi_flags.comment_locked ? ' <span title="'+html.tr('Comments are locked')+'">&#128274;</span>' : ''}</h2>
					${comments.length ? '<table>'+comments.join('')+'</table>' : ''}
				</section>
			`;
			
			
			resp.writeHead(200);
			resp.end(page_html(entry.display_name, output, htmlHead, is_sukebei)
				//+ '\r\n<!-- Page rendered in '+((Date.now()-req.time)/1000)+'s -->'
			);
		} catch(ex) {
			resp.writeHead(500);
			resp.end(page_html('[Server error]', '<h2>Server error occurred</h2>', '', is_sukebei));
			log.error(ex);
		}
	}
};
