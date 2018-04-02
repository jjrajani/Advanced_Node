const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('Header', () => {
  test('Logo text is correct', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
  });

  test('clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
  });

  test('When signed out, shows login button', async () => {
    let text = await page.getContentsOf('a[href="/auth/google"]');
    expect(text).toEqual('Login With Google');
  })

  test('When signed in, shows logout button', async () => {
    let text = await page.getContentsOf('a[href="/auth/google"]');
    expect(text).toEqual('Login With Google');
    await page.login();
    text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
  });
});
