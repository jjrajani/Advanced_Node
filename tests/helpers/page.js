const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class Page {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const customPage = new Page(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);
  }

  async get(endpoint) {
    return await this.page.evaluate(
      (_endpoint) => {
        return fetch(_endpoint, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
        }).then(res => res.json());
      }, endpoint
    );
  }

  async post(enpoint, body) {
    return await this.page.evaluate(
      (_enpoint, _body) => {
        return fetch(_enpoint, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_body)
        }).then(res => res.json());
      }, enpoint, body
    );
  }

  execRequest(actions) {
    return Promise.all(
      actions.map(({method, endpoint, body}) => {
        return this[method](endpoint, body);
      })
    );
  }

}

module.exports = Page;
