/**
 * Created by meathill on 2017/1/2.
 */

const fs = require('fs');
const Handlebars = require('handlebars');
const _ = require('underscore');
const { ncp } = require('ncp');
const mkdirp = require('mkdirp');
const del = require('del');
const helpers = require('./template/helpers');
const themeDefaults = require('../theme/defaults.json');
const EXIST = 'EEXIST';

class Publisher {
  /**
   * 构造函数
   *
   * @param {object} sender
   * @param {string} path 当前项目路径
   * @param {string} output [optional] 输出路径后缀
   */
  constructor(sender, path = __dirname, output = '') {
    let site = require('../site/site.json');
    site.articles = site.articles.filter( article => {
      return article && article.status === 0;
    }).sort( (a, b) => { // 按 id 倒序
      return b.id - a.id;
    });
    this.site = site;
    this.sender = sender;
    this.output = path + '/output/' + (output ? output + '/' : '');
    let theme = this.site.siteTheme;
    this.themePath = path + '/theme/' + theme + '/';
  }

  start() {
    return this.readThemeOptions()
      .then(this.generateOutputDirectory.bind(this))
      .then(this.getThemeHelpers.bind(this))
      .then(this.getThemeTemplates.bind(this))
      .then(this.readTemplates.bind(this))
      .then(this.readPartials.bind(this))
      .then(this.createIndex.bind(this))
      .then(this.createArchives.bind(this))
      .then(this.createArticles.bind(this))
      .then(this.copyAssets.bind(this))
      .then(this.logVersions.bind(this))
      .then(this.dispatchFinish.bind(this))
      .catch( err => {
        this.sender.send('/publish/error/', err);
        Publisher.catchAll(err);
      });
  }

  static catchAll(err) {
    console.log(err);
    fs.writeFile(this.output + 'log', JSON.stringify(err));
  }

  copyAssets() {
    this.sender.send('/publish/progress/', '复制静态资源', 90);
    return new Promise( resolve => {
      ncp(this.themePath + 'css', this.output + 'css', err => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });
  }

  createArchives(templates) {
    this.sender.send('/publish/progress/', '生成索引页', 40);
    let pageSize = this.themeOptions.pageSize;
    let total = Math.ceil(this.site.articles.length / pageSize);
    if (!total) {
      return templates;
    }
    let pages = _.range(total)
      .map( page => {
        let site = _.clone(this.site);
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
    return Promise.all(pages.map( (html, index) => {
      return new Promise( resolve => {
        let filename = this.output + 'archive' + (index ? '-' + index : '') + '.html';
        fs.writeFile(filename, html, 'utf8', err => {
          if (err) {
            throw err;
          }
          resolve();
        })
      })
    }))
      .then( () => {
        return templates;
      });
  }

  createArticles(templates) {
    let progress = 40 / this.site.articles.length;
    let count = 0;
    this.sender.send('/publish/progress/', '准备生成单个相册', 45);
    return Promise.all(this.site.articles.map( article => {
      article = _.extend(article, _.pick(this.site, 'siteTitle', 'siteDesc', 'siteIcon', 'siteTags'));
      let html = templates.article(article);
      return new Promise( resolve => {
        fs.writeFile(this.output + (article.url || article.id) + '.html', html, 'utf8', err => {
          if (err) {
            throw err;
          }
          this.sender.send('/publish/progress/', '生成相册', 25 + progress * (count + 1));
          count++;
          resolve();
        });
      })
    }));
  }

  createIndex(templates) {
    this.sender.send('/publish/progress/', '生成首页', 35);
    return new Promise( resolve => {
      fs.writeFile(this.output + 'index.html', templates.index(this.site), 'utf8', err => {
        if (err) {
          throw err;
        }
        resolve(templates);
      });
    });
  }

  dispatchFinish(time) {
    this.sender.send('/publish/finish/', time);
    return true;
  }

  generateOutputDirectory(options) {
    this.sender.send('/publish/progress/', '生成导出目录', 5);
    if (fs.existsSync(this.output)) {
      return del([this.output + 'css', this.output + '*.html' ]);
    }

    return new Promise( resolve => {
      mkdirp(this.output, (err) => {
        if (!err || err.code === EXIST) {
          return resolve(options);
        }
        throw err;
      })
    });
  }

  getThemeHelpers(options = {}) {
    if ('handlebars' in options) {
      _.each(options.handlebars, (filename, key) => {
        try {
          let func = require(this.themePath + filename);
          Handlebars.registerHelper(key, func);
        } catch (e) {
          console.log('declared helper not found: ', filename, key);
        }
      });
    }
    return options;
  }

  getThemeTemplates(options = {}) {
    this.sender.send('/publish/progress/', '读取模板文件列表', 10);
    let template = ['index', 'archive', 'article'];
    if (!options.templates) {
      return template;
    }
    return _.uniq(template.concat(options.templates));
  }

  logVersions() {
    this.sender.send('/publish/progress/', '记录生成细细', 95);
    let now = Date.now();
    let build = {
      publishTime: now
    };
    return new Promise( resolve => {
      fs.writeFile(this.output + 'build.json', JSON.stringify(build), 'utf8', err => {
        if (err) {
          throw err;
        }
        resolve(now);
      })
    });
  }

  readPartials(templates) {
    this.sender.send('/publish/progress/', '读取子模板', 25);
    let partial = this.themePath + 'partial/';
    if (!fs.existsSync(partial)) { // 没有子模版就不处理
      return templates;
    }
    return new Promise(resolve => {
      fs.readdir(partial, 'utf8', (err, files) => {
        if (err) {
          throw err;
        }
        resolve(files);
      })
    })
      .then( files => {
        return Promise.all(files.map( file => {
          return new Promise( resolve => {
            fs.readFile(partial + file, 'utf8', (err, content) => {
              if (err) {
                throw err;
              }
              let name = file.replace('.hbs', '');
              Handlebars.registerPartial(name, content);
              resolve();
            });
          });
        }));
      })
      .then( () => {
        return templates;
      });
  }

  readTemplates(templates) {
    this.sender.send('/publish/progress/', '读取模板文件', 15);
    templates = templates.map( template => {
      return new Promise( resolve => {
        fs.readFile(this.themePath + template + '.hbs', 'utf8', (err, content) => {
          if (err) {
            throw err;
          }
          resolve({
            name: template,
            template: Handlebars.compile(content)
          });
        });
      });
    });
    return Promise.all(templates)
      .then( templates => {
        let map = {};
        templates.forEach( (template) => {
          map[template.name] = template.template;
        });
        return map;
      });
  }

  readThemeOptions() {
    this.sender.send('/publish/progress/', '读取模板信息', 0);
    return new Promise( resolve => {
      fs.readFile(this.themePath + 'package.json', 'utf8', (err, content) => {
        if (err) {
          throw err;
        }
        let options = JSON.parse(content);
        options = this.themeOptions = _.defaults(options, themeDefaults);
          resolve(options);
      });
    });
  }
}

module.exports = Publisher;