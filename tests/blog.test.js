const Page = require('./helpers/page');m

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('Blog', () => {
  describe('When logged in', () => {
    beforeEach(async () => {
      await page.login();
      await page.click('a.btn-floating');
    })
    test('can see blog create form', async () => {
      const label = await page.getContentsOf('form label');
      expect(label).toEqual('Blog Title');
    });
    
    describe('And using valid inputs', async () => {
      beforeEach(async () => {
        await page.type('.title input', 'My Title');
        await page.type('.content input', 'My Content');
        await page.click('form button');
      });
      test('submitting takes user to review screen', async () => {
        const text = await page.getContentsOf('h5');
        expect(text).toEqual('Please confirm your entries');
      });
      test('submitting then saving adds blog to index page', async () => {
        await page.click('button.green');
        await page.waitFor('.card');
        const blogTitle = await page.getContentsOf('.card-title');
        const blogContent = await page.getContentsOf('p');
        expect(blogTitle).toEqual('My Title');
        expect(blogContent).toEqual('My Content');
      });
    });
    describe('And using invalid inputs', async () => {
      beforeEach(async () => {
        await page.click('form button');
      });
      test('the form shows an error message', async () => {
        const titleError = await page.getContentsOf('.title .red-text');
        const contentError = await page.getContentsOf('.content .red-text');
        let expectedError = 'You must provide a value';

        expect(titleError).toEqual(expectedError);
        expect(contentError).toEqual(expectedError);
      });
    });
  });
  describe('When logged out', async () => {
    const actions = [
      {
        method: 'get',
        endpoint: '/api/blogs',
      },
      {
        method: 'post',
        endpoint: '/api/blogs',
        body: {title: 'T', content: 'C'}
      }
    ];
    test('Blog related actions are prohibited', async () => {
      const results = await page.execRequest(actions);
      for (let result of results) {
        expect(result).toEqual({error: 'You must log in!'});
      }
    });
  });
});
