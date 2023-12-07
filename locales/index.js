/**
 * Languages Loader
 */

import * as fs from 'node:fs';
import * as yaml from 'js-yaml';

const merge = (...args) => args.reduce((a, c) => ({
	...a,
	...c,
	...Object.entries(a)
		.filter(([k]) => c && typeof c[k] === 'object')
		.reduce((a, [k, v]) => (a[k] = merge(v, c[k]), a), {})
}), {});

const languages = [
	'en-US',
	'ru-RU',
	'ug-CN',
	'uk-UA',
    // Добавление языков
];

const primaries = {
	'en': 'US',
	'ru': 'RU',
};

const clean = (text) => text.replace(new RegExp(String.fromCodePoint(0x08), 'g'), '');

const locales = languages.reduce((a, c) => (a[c] = yaml.load(clean(fs.readFileSync(new URL(`${c}.yml`, import.meta.url), 'utf-8'))) || {}, a), {});

const removeEmpty = (obj) => {
	for (const [k, v] of Object.entries(obj)) {
		if (v === '') {
			delete obj[k];
		} else if (typeof v === 'object') {
			removeEmpty(v);
		}
	}
	return obj;
};
removeEmpty(locales);

export default Object.entries(locales)
	.reduce((a, [k ,v]) => (a[k] = (() => {
		const [lang] = k.split('-');
		switch (k) {
			case 'ru-RU': return v;
			case 'en-US': return merge(locales['ru-RU'], v);
			default: return merge(
				locales['ru-RU'],
				locales['en-US'],
				locales[`${lang}-${primaries[lang]}`] ?? {},
				v
			);
		}
	})(), a), {});
