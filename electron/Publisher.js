/**
 * Created by meathill on 2017/1/2.
 */

import path from 'path';
const {assign, clone, defaults, pick, range, uniq} = require('lodash');
const del = require('del');
const themeDefaults = require('../theme/defaults.json');
import {exists, mkdirp, ncp, readDir, readFile, readJSON, writeFile} from './util/fs';

const EXIST = 'EEXIST';
const basePath = process.cwd();
const siteData = path.resolve(basePath, './site.json');

export default class Publisher {
  /**
   * 构造函数
   *
   * @param {object} sender
   * @param {string} output [optional] 输出路径后缀
   */
  constructor(sender, output = '') {
    this.isReady = this.init(sender, output)
      .then(() => {
        console.log('Publisher created');
      });
  }

  async init(sender, output) {
    let site;
    if (exists(siteData)) {
      site = await readJSON(siteData);
    } else {
      site = {
        articles: [],
        siteTheme: 'default',
      };
    }
    site.articles = site.articles.filter( article => article && article.status === 0)
      .sort( (a, b) => b.id - a.id); // 按 id 倒序
    this.site = site;
    this.sender = sender;
    this.output = basePath + '/output/' + (output ? output + '/' : '');
    let theme = this.site.siteTheme;
    this.themePath = path + '/theme/' + theme + '/';
  }

  async start() {
    const option = await this.readThemeOptions();
    await this.generateOutputDirectory;
    const templates = await this.getThemeTemplates;
    await this.readTemplates(templates);
    await this.readPartials();
    await this.createIndex();
    this.createArchives(templates, option);
    this.createArticles(templates);
    this.copyAssets();
    this.logVersions();
    this.dispatchFinish();
  }

  copyAssets() {
    this.sender.send('/publish/progress/', '复制静态资源', 90);
    return ncp(this.themePath + 'css', this.output + 'css');
  }

  async createArchives(templates, options) {
    this.sender.send('/publish/progress/', '生成索引页', 40);
    const {pageSize} = options;
    const total = Math.ceil(this.site.articles.length / pageSize);
    if (!total) {
      return templates;
    }
    let pages = range(total)
      .map( page => {
        let site = clone(this.site);
        site.index = page;
        site.previous = page > 0 ? page - 1 : false;
        if (site.previous !== false) {
          site.hasPrevious = true;
          site.previous = site.previous > 0 ? '-' + site.previous : '';
        }
        site.next = page < total - 1 ? page + 1 : false;
        site.articles = site.articles.slice(page * pageSize, pageSize);
        return templates.archive(site);
      });
    await Promise.all(pages.map( (html, index) => {
      let filename = this.output + 'archive' + (index ? '-' + index : '') + '.html';
      return writeFile(filename, html, 'utf8');
    }));
  }

  async createArticles(templates) {
    let progress = 40 / this.site.articles.length;
    let count = 0;
    this.sender.send('/publish/progress/', '准备生成单个相册', 45);
    await Promise.all(this.site.articles.map(async article => {
      article = assign(article, pick(this.site, 'siteTitle', 'siteDesc', 'siteIcon', 'siteTags'));
      const html = templates.article(article);
      await writeFile(this.output + (article.url || article.id) + '.html', html, 'utf8');
      this.sender.send('/publish/progress/', '生成相册', 25 + progress * (count + 1));
    }));
  }

  createIndex(templates) {
    this.sender.send('/publish/progress/', '生成首页', 35);
    return writeFile(this.output + 'index.html', templates.index(this.site), 'utf8');
  }

  dispatchFinish(time) {
    this.sender.send('/publish/finish/', time);
  }

  async generateOutputDirectory(options) {
    this.sender.send('/publish/progress/', '生成导出目录', 5);
    if (exists(this.output)) {
      return del([this.output + 'css', this.output + '*.html' ]);
    }

    try {
      await mkdirp(this.output)
    } catch (err) {
      if (err.code === EXIST) {
        return options;
      }
      throw err;
    }
  }

  getThemeTemplates(options = {}) {
    this.sender.send('/publish/progress/', '读取模板文件列表', 10);
    const template = ['index', 'archive', 'article'];
    if (!options.templates) {
      return template;
    }
    return uniq(template.concat(options.templates));
  }

  async logVersions() {
    this.sender.send('/publish/progress/', '记录生成细细', 95);
    let now = Date.now();
    let build = {
      publishTime: now
    };
    await writeFile(this.output + 'build.json', JSON.stringify(build), 'utf8');
    return now;
  }

  async readPartials(templates) {
    this.sender.send('/publish/progress/', '读取子模板', 25);
    let partial = this.themePath + 'partial/';
    if (!exists(partial)) { // 没有子模版就不处理
      return templates;
    }
    const files = await readDir(partial, 'utf8');
    await Promise.all(files.map(file => readFile(partial + file, 'utf8')
      .then(content => {
        let name = file.replace('.hbs$', '');
        Handlebars.registerPartial(name, content);
      })
    ));
    return templates;
  }

  async readTemplates(templates) {
    this.sender.send('/publish/progress/', '读取模板文件', 15);
    const map = {};
    await Promise.all(templates.map( template =>
      readFile(this.themePath + template + '.hbs', 'utf8')
        .then(content => {
          map[template] = content;
        })
    ));
    return map;
  }

  async readThemeOptions() {
    this.sender.send('/publish/progress/', '读取模板信息', 0);
    const options = readJSON(this.themePath + 'package.json');
    return defaults(options, themeDefaults);
  }
}