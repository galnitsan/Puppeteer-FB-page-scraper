const fs = require('fs');
const puppeteer = require('puppeteer');
const fs2 = require('fs-extra');

(async function main() {
    try {

        // *** login to facebook ***
        async function login() {
            console.log('=====In Login=====');
            const email = '#email';
            const pass = '#pass';
            const submit = '#loginbutton';
            await page.waitFor(3000);
            await page.click(email);
            await page.waitFor(2000);
            await page.keyboard.type('Type here your Email');
            await page.waitFor(2000);
            await page.click(pass);
            await page.waitFor(2000);
            await page.keyboard.type('Type here yor FB password');
            await page.waitFor(2000);
            await page.click(submit);
            return 0;
        }

        // *** infinity scroll untill the buttom end of fb group ***
        async function scrapeInfiniteScrollItems(
            page,
            extractItems,
            itemTargetCount,
            scrollDelay = 300,
        ) {
            let items = [];
            try {
                let previousHeight;
                while (items.length < itemTargetCount) {
                    items = await page.evaluate(extractItems);
                    previousHeight = await page.evaluate('document.body.scrollHeight');
                    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
                    await page.waitFor(scrollDelay);
                }
            } catch (e) { }
            return items;
        }

        // ** launch Puppeteer and browser **
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        page.setViewport({ width: 1280, height: 926 });
        await page.goto('https://www.facebook.com/login');
        await login();
        await page.waitForNavigation();
        await page.waitFor(2000);

        // start write to file
        await fs2.writeFile('out3.csv', 'Name,Email\n');

        for (let i = 0; i < 300; i++) {
            await page.goto('Type here the required FB page you want to scrape');
            // catch all profile of the group
            let profiles = await page.$$('._60ri')
            const profile = profiles[i];
            const button = await profile.$('a');
            await button.click();
            await page.waitFor(4000);

            //catch and click a [i] profile of group
            try {
                await page.evaluate(() => document.querySelector('._45la').querySelector('button._42ft._4jy0._4jy3._517h._51sy').click());
            }
            catch (e) {
                console.log(e.message);
            }
            await page.waitFor(2000);

            try {
                const about = ('[data-tab-key=about]');
                await page.click(about);
            }
            catch (e) {
                console.log(e.message);
            }

            await page.waitFor(3500);
            
            // catch a name and email of profile ( if its shown and not hidden)
            try {
                const profileEmail0 = await page.evaluate(() => document.querySelectorAll('._4bl9._2pis._2dbl')[1].querySelector('a').innerText);
                console.log(profileEmail0);
                const profileName0 = await page.evaluate(() => document.querySelector('._2t_q').querySelector('a').textContent);
                console.log(profileName0);

                // if there is name and email details - it will be written in a csv file
                await fs2.appendFile('out3.csv', `"${profileName0},"${profileEmail0}"\n`);
            }
            catch (e) {
                console.log(e.message);
            }
        }
        console.log('done');

    } catch (e) {
        console.log('our error', e);

    }
})();
